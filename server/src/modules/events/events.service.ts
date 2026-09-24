import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { QueryEventsDto } from './dto/query-events.dto';
import { EventResponseDto } from './dto/event-response.dto';
import { ReviewEventDto } from './dto/review-event.dto';
import { Society, Event, Prisma, EventApprovalStatus, VenueClearanceStatus } from '@prisma/client';
import { UploadsService } from '../uploads/uploads.service';
import { validateExecutiveCouncil } from '../../common/utils/council.util';
import { FeedService } from '../feed/feed.service';
import { EmailService } from '../email/email.service';
import { RedisService } from '../../core/redis/redis.service';

export interface SocietyEventsGroupDto {
  upcoming: EventResponseDto[];
  past: EventResponseDto[];
}

export interface PaginatedEventsResponseDto {
  items: EventResponseDto[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

@Injectable()
export class EventsService {
  private static readonly REDIS_EVENTS_TTL = 60; // 60s cache for public event listings

  constructor(
    private readonly prisma: PrismaService,
    private readonly uploadsService: UploadsService,
    private readonly emailService: EmailService,
    private readonly redis: RedisService,
  ) {}

  /**
   * Invalidates public events and feed caches across all replicas.
   */
  private invalidateCache(): void {
    FeedService.invalidate();
    void this.redis.invalidatePattern('events:public:*');
  }

  /**
   * Public Events Query: Returns events filtered by date range [from, to] and category.
   * Cached in Redis for 60s. Leverages PostgreSQL indexes.
   */
  async getAllPublicEvents(query: QueryEventsDto): Promise<PaginatedEventsResponseDto> {
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(200, Math.max(1, query.limit || 20));
    const skip = (page - 1) * limit;

    const cacheKey = `events:public:${page}:${limit}:${query.from || ''}:${query.to || ''}:${query.category || ''}:${query.societyId || ''}`;

    // 1. Try Redis cache
    const cached = await this.redis.get<PaginatedEventsResponseDto>(cacheKey);
    if (cached) {
      return cached;
    }

    const whereClause: Prisma.EventWhereInput = {
      isPublished: true,
      approvalStatus: {
        in: ['APPROVED', 'PUBLISHED'],
      },
    };

    if (query.from || query.to) {
      const dateFilter: Prisma.DateTimeFilter = {};
      if (query.from) {
        let fromDate;
        if (query.from.includes('-')) {
          const [year, month, day] = query.from.split('-');
          fromDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), 0, 0, 0, 0);
        } else {
          fromDate = new Date(query.from);
          fromDate.setHours(0, 0, 0, 0);
        }
        dateFilter.gte = fromDate;
      }

      if (query.to) {
        let toDate;
        if (query.to.includes('-')) {
          const [year, month, day] = query.to.split('-');
          toDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), 23, 59, 59, 999);
        } else {
          toDate = new Date(query.to);
          toDate.setHours(23, 59, 59, 999);
        }
        dateFilter.lte = toDate;
      }
      whereClause.eventDate = dateFilter;
    }

    if (query.category) {
      const cat = query.category.trim();
      whereClause.society = {
        category: {
          OR: [{ slug: cat.toLowerCase() }, { name: { contains: cat, mode: 'insensitive' } }],
        },
      };
    }

    if (query.societyId) {
      whereClause.societyId = query.societyId;
    }

    const [total, items] = await Promise.all([
      this.prisma.event.count({ where: whereClause }),
      this.prisma.event.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: [{ eventDate: 'asc' }, { startTime: 'asc' }],
        include: {
          society: {
            select: {
              id: true,
              name: true,
              logoUrl: true,
              category: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                },
              },
            },
          },
        },
      }),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    const result: PaginatedEventsResponseDto = {
      items,
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };

    void this.redis.set(cacheKey, result, EventsService.REDIS_EVENTS_TTL);

    return result;
  }

  /**
   * Helper: Validates that the authenticated user owns an active, setup society profile.
   */
  public async validateSocietyOwnership(userId: string): Promise<Society> {
    const society = await this.prisma.society.findUnique({
      where: { userId },
    });

    if (!society || !society.isSetupComplete) {
      throw new ForbiddenException(
        'Access denied: You must complete your society profile setup before managing event resources',
      );
    }

    if (!validateExecutiveCouncil(society.executiveCouncil)) {
      throw new ForbiddenException(
        'Access denied: You must complete your Executive Council details (all 5 mandatory positions) before managing resources',
      );
    }

    return society;
  }

  /**
   * Helper: Validates that the authenticated user owns the target event.
   */
  public async validateEventOwnership(
    eventId: string,
    userId: string,
    userRole?: string,
  ): Promise<{ event: Event; society: Society }> {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      include: { society: { include: { advisor: true } } },
    });

    if (!event) {
      throw new NotFoundException(`Event with ID '${eventId}' was not found`);
    }

    const isSociety = event.society.userId === userId;
    const isAdvisor = userRole === 'ADVISOR' && event.society.advisor?.userId === userId;
    const isDsaAdmin = userRole === 'DSA_ADMIN';

    if (!isSociety && !isAdvisor && !isDsaAdmin) {
      throw new ForbiddenException(
        'Access denied: You do not have ownership rights to modify or delete this event resource',
      );
    }

    return { event, society: event.society };
  }

  /**
   * Helper: Validates event time order (endTime > startTime).
   */
  private validateTimeRange(startTime: string, endTime: string): void {
    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);

    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;

    if (endMinutes <= startMinutes) {
      throw new BadRequestException('Event end time must be strictly after the start time');
    }
  }

  /**
   * Helper: Validates event date (must be today or future date).
   */
  private validateFutureDate(dateStr: string): void {
    const eventDate = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (eventDate < today) {
      throw new BadRequestException(
        'Event date cannot be in the past. Please select today or a future date.',
      );
    }
  }

  /**
   * Helper: Sanitizes image URLs, automatically converting Unsplash webpage URLs into direct image URLs.
   */
  private sanitizeImageUrl(url?: string | null): string | null {
    if (!url || !url.trim()) return null;
    const trimmed = url.trim();
    if (trimmed.includes('unsplash.com/photos/')) {
      const parts = trimmed.split('/photos/')[1]?.split('?')[0]?.split('/');
      const rawId = parts ? parts[0] : null;
      if (rawId) {
        const idParts = rawId.split('-');
        const photoId = idParts[idParts.length - 1];
        if (photoId) {
          return `https://images.unsplash.com/photo-${photoId}?w=1200&auto=format&fit=crop&q=80`;
        }
      }
    }
    return trimmed;
  }

  /**
   * Creates a new campus event for the authenticated society.
   */
  async createEvent(userId: string, dto: CreateEventDto): Promise<EventResponseDto> {
    const society = await this.validateSocietyOwnership(userId);

    this.validateFutureDate(dto.eventDate);
    this.validateTimeRange(dto.startTime, dto.endTime);

    const submitForApproval = Boolean(dto.submitForApproval);
    const isPublished = false;
    const approvalStatus = submitForApproval
      ? EventApprovalStatus.PENDING_ADVISOR
      : EventApprovalStatus.DRAFT;

    const coverImageUrl = this.sanitizeImageUrl(dto.coverImageUrl);

    const event = await this.prisma.event.create({
      data: {
        title: dto.title,
        description: dto.description,
        eventDate: new Date(dto.eventDate),
        startTime: dto.startTime,
        endTime: dto.endTime,
        venue: dto.venue,
        coverImageUrl,
        videoUrl: dto.videoUrl || null,
        registrationLink: dto.registrationLink || null,
        eventType: dto.eventType || null,
        inChargeName: dto.inChargeName || null,
        inChargeRegNum: dto.inChargeRegNum || null,
        inChargeContact: dto.inChargeContact || null,
        isPublished,
        approvalStatus,
        societyId: society.id,
      },
      include: {
        society: {
          select: {
            id: true,
            name: true,
            logoUrl: true,
          },
        },
      },
    });

    this.invalidateCache();

    if (submitForApproval) {
      this.notifyAdvisorOfEventSubmission(event.id, society.id);
    }

    return event;
  }

  /**
   * Retrieves events owned by the authenticated society categorized into upcoming and past.
   */
  async getMySocietyEvents(userId: string): Promise<SocietyEventsGroupDto> {
    const society = await this.validateSocietyOwnership(userId);

    const events = await this.prisma.event.findMany({
      where: { societyId: society.id },
      orderBy: [{ eventDate: 'asc' }, { startTime: 'asc' }],
      include: {
        society: {
          select: {
            id: true,
            name: true,
            logoUrl: true,
          },
        },
      },
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcoming: EventResponseDto[] = [];
    const past: EventResponseDto[] = [];

    for (const item of events) {
      const eDate = new Date(item.eventDate);
      if (eDate >= today) {
        upcoming.push(item);
      } else {
        past.push(item);
      }
    }

    return { upcoming, past };
  }

  /**
   * Retrieves a single event by ID.
   */
  async getEventById(eventId: string): Promise<EventResponseDto> {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      include: {
        society: {
          select: {
            id: true,
            name: true,
            logoUrl: true,
            category: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        },
      },
    });

    if (!event) {
      throw new NotFoundException(`Event with ID '${eventId}' was not found`);
    }

    return event;
  }

  /**
   * Updates an existing event after enforcing ownership validation.
   */

  async requestEdit(
    id: string,
    userId: string,
    userRole: string,
    reason: string,
  ): Promise<EventResponseDto> {
    const { event } = await this.validateEventOwnership(id, userId, userRole);

    const isPublishedEvent =
      event.isPublished ||
      event.approvalStatus === EventApprovalStatus.APPROVED ||
      event.approvalStatus === EventApprovalStatus.PUBLISHED;

    if (userRole !== 'DSA_ADMIN' && isPublishedEvent) {
      throw new ForbiddenException(
        'Published events cannot be requested for edit. If changes are necessary, you may delete the event and submit a revised proposal.',
      );
    }

    const updated = await this.prisma.event.update({
      where: { id },
      data: {
        editRequestStatus: 'PENDING',
        editRequestReason: reason,
      },
      include: { society: true },
    });
    return updated;
  }

  async resolveEditRequest(id: string, status: 'APPROVED' | 'REJECTED'): Promise<EventResponseDto> {
    const event = await this.prisma.event.update({
      where: { id },
      data: {
        editRequestStatus: status,
      },
      include: { society: true },
    });
    return event;
  }

  async updateEvent(
    eventId: string,
    userId: string,
    dto: UpdateEventDto,
    userRole?: string,
  ): Promise<EventResponseDto> {
    const { event } = await this.validateEventOwnership(eventId, userId, userRole);

    const isPublishedEvent =
      event.isPublished ||
      event.approvalStatus === EventApprovalStatus.APPROVED ||
      event.approvalStatus === EventApprovalStatus.PUBLISHED;

    if (userRole !== 'DSA_ADMIN' && isPublishedEvent) {
      throw new ForbiddenException(
        'Published events cannot be edited by the society. If changes are necessary, you may delete the event and submit a revised proposal.',
      );
    }

    const targetStartTime = dto.startTime || event.startTime;
    const targetEndTime = dto.endTime || event.endTime;

    if (dto.eventDate) {
      this.validateFutureDate(dto.eventDate);
    }
    this.validateTimeRange(targetStartTime, targetEndTime);

    const updated = await this.prisma.event.update({
      where: { id: eventId },
      data: {
        ...(dto.title && { title: dto.title }),
        ...(dto.description && { description: dto.description }),
        ...(dto.eventDate && { eventDate: new Date(dto.eventDate) }),
        ...(dto.startTime && { startTime: dto.startTime }),
        ...(dto.endTime && { endTime: dto.endTime }),
        ...(dto.venue && { venue: dto.venue }),
        ...(dto.coverImageUrl !== undefined && {
          coverImageUrl: dto.coverImageUrl || null,
        }),
        ...(dto.videoUrl !== undefined && {
          videoUrl: dto.videoUrl || null,
        }),
        ...(dto.registrationLink !== undefined && {
          registrationLink: dto.registrationLink || null,
        }),
        ...(dto.eventType !== undefined && { eventType: dto.eventType || null }),
        ...(dto.inChargeName !== undefined && { inChargeName: dto.inChargeName || null }),
        ...(dto.inChargeRegNum !== undefined && { inChargeRegNum: dto.inChargeRegNum || null }),
        ...(dto.inChargeContact !== undefined && { inChargeContact: dto.inChargeContact || null }),
        ...(dto.submitForApproval === true && {
          approvalStatus:
            event.approvalStatus === 'CHANGES_REQUESTED' &&
            event.lastChangeRequestBy === 'DSA_ADMIN'
              ? 'PENDING_ADMIN'
              : 'PENDING_ADVISOR',
          isPublished: false,
          lastChangeRequestBy: null,
        }),
      },
      include: {
        society: {
          select: {
            id: true,
            name: true,
            logoUrl: true,
          },
        },
      },
    });

    this.invalidateCache();

    if (dto.submitForApproval === true) {
      if (updated.approvalStatus === 'PENDING_ADVISOR') {
        this.notifyAdvisorOfEventSubmission(updated.id, updated.society.id);
      } else if (updated.approvalStatus === 'PENDING_ADMIN') {
        this.notifyDsaOfEventForwarded(updated.id, updated.society.id, 'Faculty Advisor');
      }
    }

    return updated;
  }

  /**
   * Deletes an event after enforcing ownership validation.
   */
  async deleteEvent(
    eventId: string,
    userId: string,
    userRole: string,
  ): Promise<{ message: string; id: string }> {
    const { event } = await this.validateEventOwnership(eventId, userId, userRole);

    await this.prisma.event.delete({
      where: { id: eventId },
    });

    // Clean up associated uploaded files from disk (parallel, fire-and-forget)
    await Promise.allSettled([
      event.coverImageUrl ? this.uploadsService.deleteImage(event.coverImageUrl) : null,
      event.signedVenueSlipUrl ? this.uploadsService.deleteImage(event.signedVenueSlipUrl) : null,
      event.videoUrl ? this.uploadsService.deleteImage(event.videoUrl) : null,
    ].filter(Boolean) as Promise<boolean>[]);

    this.invalidateCache();
    return {
      message: 'Event deleted successfully',
      id: eventId,
    };
  }

  /**
   * Advisor reviews a pending event.
   */
  async reviewEventByAdvisor(
    eventId: string,
    userId: string,
    dto: ReviewEventDto,
  ): Promise<EventResponseDto> {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      include: {
        society: {
          include: {
            advisor: {
              include: { user: { select: { fullName: true } } },
            },
          },
        },
      },
    });

    if (!event) {
      throw new NotFoundException(`Event not found`);
    }

    if (!event.society.advisor || event.society.advisor.userId !== userId) {
      throw new ForbiddenException('You are not the advisor for this society');
    }

    const updated = await this.prisma.event.update({
      where: { id: eventId },
      data: {
        approvalStatus: dto.status,
        advisorComments: dto.comments || null,
        advisorApprovedAt: dto.status === EventApprovalStatus.PENDING_ADMIN ? new Date() : null,
      },
      include: {
        society: {
          select: { id: true, name: true, logoUrl: true },
        },
      },
    });

    if (dto.status === EventApprovalStatus.PENDING_ADMIN) {
      const advisorName = event.society.advisor.user.fullName || 'Faculty Advisor';
      this.notifyDsaOfEventForwarded(eventId, updated.society.id, advisorName);
      this.notifySocietyOfEventUpdate(
        updated.society.id,
        eventId,
        'FORWARDED_TO_DSA',
        'Faculty Advisor',
        dto.comments,
      );
    } else if (dto.status === EventApprovalStatus.CHANGES_REQUESTED) {
      this.notifySocietyOfEventUpdate(
        updated.society.id,
        eventId,
        'CHANGES_REQUESTED',
        'Faculty Advisor',
        dto.comments,
      );
    } else if (dto.status === EventApprovalStatus.REJECTED) {
      this.notifySocietyOfEventUpdate(
        updated.society.id,
        eventId,
        'REJECTED',
        'Faculty Advisor',
        dto.comments,
      );
    }

    return updated;
  }

  /**
   * DSA Admin reviews a pending event.
   */
  async reviewEventByDsa(
    eventId: string,
    userId: string,
    dto: ReviewEventDto,
  ): Promise<EventResponseDto> {
    const event = await this.prisma.event.findUnique({ where: { id: eventId } });

    if (!event) {
      throw new NotFoundException(`Event not found`);
    }

    const isApproved = dto.status === EventApprovalStatus.APPROVED;

    const updated = await this.prisma.event.update({
      where: { id: eventId },
      data: {
        approvalStatus: dto.status,
        dsaComments: dto.comments || null,
        dsaApprovedAt: isApproved ? new Date() : null,
        isPublished: isApproved, // Automatically publish if approved
        ...(isApproved && !event.venueClearanceStatus
          ? { venueClearanceStatus: VenueClearanceStatus.PENDING_UPLOAD }
          : {}),
      },
      include: {
        society: {
          select: { id: true, name: true, logoUrl: true },
        },
      },
    });

    if (isApproved) {
      this.notifySocietyOfEventUpdate(
        updated.society.id,
        eventId,
        'APPROVED',
        'DSA Directorate',
        dto.comments,
      );
    } else if (dto.status === EventApprovalStatus.CHANGES_REQUESTED) {
      this.notifySocietyOfEventUpdate(
        updated.society.id,
        eventId,
        'CHANGES_REQUESTED',
        'DSA Directorate',
        dto.comments,
      );
    } else if (dto.status === EventApprovalStatus.REJECTED) {
      this.notifySocietyOfEventUpdate(
        updated.society.id,
        eventId,
        'REJECTED',
        'DSA Directorate',
        dto.comments,
      );
    }

    this.invalidateCache();
    return updated;
  }

  /**
   * Society uploads physical signed venue clearance slip.
   */
  async uploadVenueClearanceSlip(
    eventId: string,
    userId: string,
    file: Express.Multer.File,
  ): Promise<EventResponseDto> {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      include: {
        society: true,
      },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    if (event.society.userId !== userId) {
      throw new ForbiddenException('You do not own this event resource');
    }

    if (
      event.approvalStatus !== EventApprovalStatus.APPROVED &&
      event.approvalStatus !== EventApprovalStatus.PUBLISHED
    ) {
      throw new BadRequestException(
        'Event must be approved by DSA before submitting physical venue clearance',
      );
    }

    const uploadResult = await this.uploadsService.uploadMedia(file, 'venue-slips');

    const updated = await this.prisma.event.update({
      where: { id: eventId },
      data: {
        signedVenueSlipUrl: uploadResult.url,
        venueSlipUploadedAt: new Date(),
        venueClearanceStatus: VenueClearanceStatus.SUBMITTED,
        venueClearanceNotes: null,
      },
      include: {
        society: {
          select: { id: true, name: true, logoUrl: true },
        },
      },
    });

    return updated;
  }

  /**
   * Retrieve venue slip printable data for an event.
   */
  async getVenueSlipData(eventId: string) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      include: {
        society: {
          include: {
            advisor: {
              include: {
                user: {
                  select: { fullName: true, email: true },
                },
              },
            },
            category: true,
          },
        },
      },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    return event;
  }

  /**
   * Helper: Dispatches notification to society's assigned Faculty Advisor.
   */
  private async notifyAdvisorOfEventSubmission(eventId: string, societyId: string) {
    try {
      const society = await this.prisma.society.findUnique({
        where: { id: societyId },
        include: {
          advisor: {
            include: {
              user: { select: { fullName: true, email: true } },
            },
          },
        },
      });

      const event = await this.prisma.event.findUnique({
        where: { id: eventId },
      });

      if (society?.advisor?.user?.email && event) {
        const dateStr = new Date(event.eventDate).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        });
        await this.emailService.sendEventSubmittedForAdvisorEmail({
          advisorEmail: society.advisor.user.email,
          advisorName: society.advisor.user.fullName,
          societyName: society.name,
          eventTitle: event.title,
          eventDate: `${dateStr} (${event.startTime} - ${event.endTime})`,
          venue: event.venue,
          eventId: event.id,
        });
      }
    } catch (err) {
      console.warn('Failed to notify advisor of event submission:', err);
    }
  }

  /**
   * Helper: Dispatches notification to DSA administration when an event is approved by Advisor.
   */
  private async notifyDsaOfEventForwarded(eventId: string, societyId: string, advisorName: string) {
    try {
      const [dsaUsers, society, event] = await Promise.all([
        this.prisma.user.findMany({
          where: { role: 'DSA_ADMIN', isActive: true },
          select: { email: true },
        }),
        this.prisma.society.findUnique({ where: { id: societyId } }),
        this.prisma.event.findUnique({ where: { id: eventId } }),
      ]);

      const dsaEmails = dsaUsers.map((u) => u.email).filter(Boolean);
      if (dsaEmails.length > 0 && society && event) {
        const dateStr = new Date(event.eventDate).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        });
        await this.emailService.sendEventForwardedToDsaEmail({
          dsaEmails,
          advisorName,
          societyName: society.name,
          eventTitle: event.title,
          eventDate: `${dateStr} (${event.startTime} - ${event.endTime})`,
          venue: event.venue,
          eventId: event.id,
        });
      }
    } catch (err) {
      console.warn('Failed to notify DSA of forwarded event:', err);
    }
  }

  /**
   * Helper: Dispatches status update notification to the Society email.
   */
  private async notifySocietyOfEventUpdate(
    societyId: string,
    eventId: string,
    status: 'APPROVED' | 'CHANGES_REQUESTED' | 'REJECTED' | 'FORWARDED_TO_DSA',
    reviewerRole: 'Faculty Advisor' | 'DSA Directorate',
    comments?: string | null,
  ) {
    try {
      const [society, event] = await Promise.all([
        this.prisma.society.findUnique({
          where: { id: societyId },
          include: { user: { select: { email: true } } },
        }),
        this.prisma.event.findUnique({ where: { id: eventId } }),
      ]);

      const targetEmail = society?.email || society?.user?.email;
      if (targetEmail && event && society) {
        await this.emailService.sendEventStatusUpdateToSocietyEmail({
          societyEmail: targetEmail,
          societyName: society.name,
          eventTitle: event.title,
          status,
          reviewerRole,
          comments,
          eventId: event.id,
        });
      }
    } catch (err) {
      console.warn('Failed to notify society of event status update:', err);
    }
  }
}
