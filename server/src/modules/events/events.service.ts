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
import { Society, Event, Prisma, EventApprovalStatus } from '@prisma/client';

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
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Public Events Query: Returns events filtered by date range [from, to] and category.
   * Leverages PostgreSQL @@index([eventDate]) and @@index([isPublished]).
   */
  async getAllPublicEvents(query: QueryEventsDto): Promise<PaginatedEventsResponseDto> {
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(200, Math.max(1, query.limit || 100));
    const skip = (page - 1) * limit;

    const whereClause: Prisma.EventWhereInput = {
      isPublished: true,
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
          OR: [{ slug: cat.toLowerCase() }, { name: { contains: cat } }],
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

    return {
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
      include: { society: true },
    });

    if (!event) {
      throw new NotFoundException(`Event with ID '${eventId}' was not found`);
    }

    const isSociety = event.society.userId === userId;
    const isAdvisor = userRole === 'ADVISOR' && event.society.advisorId === userId;
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
    const isPublished = !submitForApproval;
    const approvalStatus = submitForApproval ? 'PENDING_ADVISOR' : 'PUBLISHED';

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
  
  async requestEdit(id: string, reason: string): Promise<EventResponseDto> {
    const event = await this.prisma.event.update({
      where: { id },
      data: {
        editRequestStatus: 'PENDING',
        editRequestReason: reason
      },
      include: { society: true }
    });
    return event as any;
  }

  async resolveEditRequest(id: string, status: 'APPROVED' | 'REJECTED'): Promise<EventResponseDto> {
    const event = await this.prisma.event.update({
      where: { id },
      data: {
        editRequestStatus: status
      },
      include: { society: true }
    });
    return event as any;
  }

  async updateEvent(

    eventId: string,
    userId: string,
    dto: UpdateEventDto,
    userRole?: string,
  ): Promise<EventResponseDto> {
    const { event } = await this.validateEventOwnership(eventId, userId, userRole);

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
        ...(dto.submitForApproval === true && { approvalStatus: 'PENDING_ADVISOR', isPublished: false, lastChangeRequestBy: null }),
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

    return updated;
  }

  /**
   * Deletes an event after enforcing ownership validation.
   */
  async deleteEvent(eventId: string, userId: string): Promise<{ message: string; id: string }> {
    await this.validateEventOwnership(eventId, userId);

    await this.prisma.event.delete({
      where: { id: eventId },
    });

    return {
      message: 'Event deleted successfully',
      id: eventId,
    };
  }

  /**
   * Advisor reviews a pending event.
   */
  async reviewEventByAdvisor(eventId: string, userId: string, dto: ReviewEventDto): Promise<EventResponseDto> {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      include: { society: true },
    });

    if (!event) {
      throw new NotFoundException(`Event not found`);
    }

    if (event.society.advisorId !== userId) {
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

    return updated as any; // Typecasting for brevity here, normally you would map to EventResponseDto precisely
  }

  /**
   * DSA Admin reviews a pending event.
   */
  async reviewEventByDsa(eventId: string, userId: string, dto: ReviewEventDto): Promise<EventResponseDto> {
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
      },
      include: {
        society: {
          select: { id: true, name: true, logoUrl: true },
        },
      },
    });

    return updated as any;
  }
}
