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
import { Society, Event, Prisma } from '@prisma/client';

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
        dateFilter.gte = new Date(query.from);
      }
      if (query.to) {
        dateFilter.lte = new Date(query.to);
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
  ): Promise<{ event: Event; society: Society }> {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      include: { society: true },
    });

    if (!event) {
      throw new NotFoundException(`Event with ID '${eventId}' was not found`);
    }

    if (event.society.userId !== userId) {
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
   * Creates and immediately publishes a new campus event for the authenticated society.
   */
  async createEvent(userId: string, dto: CreateEventDto): Promise<EventResponseDto> {
    const society = await this.validateSocietyOwnership(userId);

    this.validateFutureDate(dto.eventDate);
    this.validateTimeRange(dto.startTime, dto.endTime);

    const event = await this.prisma.event.create({
      data: {
        title: dto.title,
        description: dto.description,
        eventDate: new Date(dto.eventDate),
        startTime: dto.startTime,
        endTime: dto.endTime,
        venue: dto.venue,
        coverImageUrl: dto.coverImageUrl || null,
        registrationLink: dto.registrationLink || null,
        isPublished: true, // Events are published immediately per business rule
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
  async updateEvent(
    eventId: string,
    userId: string,
    dto: UpdateEventDto,
  ): Promise<EventResponseDto> {
    const { event } = await this.validateEventOwnership(eventId, userId);

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
        ...(dto.registrationLink !== undefined && {
          registrationLink: dto.registrationLink || null,
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
}
