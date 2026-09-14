import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { SetupSocietyDto } from './dto/setup-society.dto';
import { UpdateSocietyDto } from './dto/update-society.dto';
import { SocietyResponseDto } from './dto/society-response.dto';
import { SocietyDashboardResponseDto } from './dto/society-dashboard-response.dto';
import { QuerySocietiesDto } from './dto/query-societies.dto';
import { PaginatedSocietiesResponseDto } from './dto/public-society-response.dto';
import { PublicSocietyDetailResponseDto } from './dto/public-society-detail-response.dto';
import { EventResponseDto } from '../events/dto/event-response.dto';
import { Prisma } from '@prisma/client';

export interface PublicSocietyEventsGroupDto {
  upcoming: EventResponseDto[];
  past: EventResponseDto[];
}

@Injectable()
export class SocietiesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Public Directory Query: Returns paginated list of fully setup societies.
   * Strips out user credentials, email, and internal fields for privacy and security.
   */
  async getPublicSocieties(query: QuerySocietiesDto): Promise<PaginatedSocietiesResponseDto> {
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(200, Math.max(1, query.limit || 12));
    const skip = (page - 1) * limit;

    const whereClause: Prisma.SocietyWhereInput = {
      isSetupComplete: true,
      user: {
        isActive: true,
      },
    };

    if (query.category) {
      const catFilter = query.category.trim();
      whereClause.category = {
        OR: [
          { slug: catFilter.toLowerCase() },
          { name: { contains: catFilter, mode: 'insensitive' } },
        ],
      };
    }

    if (query.type) {
      whereClause.type = query.type;
    }

    if (query.search) {
      const searchFilter = query.search.trim();
      whereClause.OR = [
        { name: { contains: searchFilter, mode: 'insensitive' } },
        { shortDescription: { contains: searchFilter, mode: 'insensitive' } },
      ];
    }

    const [total, items] = await Promise.all([
      this.prisma.society.count({ where: whereClause }),
      this.prisma.society.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
        select: {
          id: true,
          name: true,
          type: true,
          shortDescription: true,
          logoUrl: true,
          executiveCouncil: true,
          presidentName: true,
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
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
   * Public Detail Query: Returns single public society profile by ID.
   * Throws 404 if missing or incomplete.
   */
  async getPublicSocietyById(id: string): Promise<PublicSocietyDetailResponseDto> {
    const society = await this.prisma.society.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        type: true,
        shortDescription: true,
        longDescription: true,
        logoUrl: true,
        bannerUrl: true,
        instagram: true,
        facebook: true,
        linkedin: true,
        website: true,
        email: true,
        presidentName: true,
        presidentFaculty: true,
        presidentEmail: true,
        presidentRegNum: true,
        executiveCouncil: true,
        advisor: {
          select: { department: true, user: { select: { fullName: true, email: true } } },
        },
        isSetupComplete: true,
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    if (!society || !society.isSetupComplete) {
      throw new NotFoundException(`Society with ID '${id}' was not found or is not published`);
    }

    if (society.executiveCouncil) {
      try {
        const parsed = JSON.parse(society.executiveCouncil);
        if (Array.isArray(parsed)) {
          const sanitized = parsed.map((m: any) => {
            const { contact, ...rest } = m;
            return rest;
          });
          society.executiveCouncil = JSON.stringify(sanitized);
        }
      } catch (e) {}
    }

    return society;
  }

  /**
   * Public Society Events Query: Returns upcoming (nearest first) and past (most recent first) events.
   */
  async getPublicSocietyEvents(societyId: string): Promise<PublicSocietyEventsGroupDto> {
    const society = await this.prisma.society.findUnique({
      where: { id: societyId },
      select: { id: true, isSetupComplete: true },
    });

    if (!society || !society.isSetupComplete) {
      throw new NotFoundException(`Society with ID '${societyId}' was not found`);
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [upcoming, past] = await Promise.all([
      this.prisma.event.findMany({
        where: {
          societyId,
          eventDate: { gte: today },
          isPublished: true,
          approvalStatus: { in: ['APPROVED', 'PUBLISHED'] },
        },
        take: 50,
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
      }),
      this.prisma.event.findMany({
        where: {
          societyId,
          eventDate: { lt: today },
          isPublished: true,
          approvalStatus: { in: ['APPROVED', 'PUBLISHED'] },
        },
        take: 50,
        orderBy: [{ eventDate: 'desc' }, { startTime: 'desc' }],
        include: {
          society: {
            select: {
              id: true,
              name: true,
              logoUrl: true,
            },
          },
        },
      }),
    ]);

    return { upcoming, past };
  }

  /**
   * Retrieves public announcements/posts published by a specific society.
   */
  async getPublicSocietyPosts(societyId: string) {
    const posts = await this.prisma.post.findMany({
      where: {
        author: {
          society: {
            id: societyId,
          },
        },
      },
      take: 50,
      include: {
        author: {
          select: {
            role: true,
            society: {
              select: {
                id: true,
                name: true,
                logoUrl: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return posts.map((post) => ({
      type: 'post' as const,
      id: post.id,
      content: post.content,
      imageUrl: post.imageUrl,
      videoUrl: post.videoUrl,
      createdAt: post.createdAt,
      society: post.author.society || { id: societyId, name: '', logoUrl: null },
      isAdminPost: post.author.role === 'DSA_ADMIN',
    }));
  }

  /**
   * Retrieves the society profile belonging to the authenticated user.
   */
  async getMySocietyProfile(userId: string): Promise<SocietyResponseDto | null> {
    const society = await this.prisma.society.findUnique({
      where: { userId },
      include: {
        category: true,
        advisor: {
          include: {
            user: {
              select: {
                fullName: true,
                email: true,
              },
            },
          },
        },
      },
    });

    return society;
  }

  /**
   * Aggregates all dashboard data (profile, statistics, upcoming/recent events, yearly plan summary)
   * in a single performant database query batch.
   */
  async getSocietyDashboard(userId: string): Promise<SocietyDashboardResponseDto> {
    const society = await this.prisma.society.findUnique({
      where: { userId },
      include: {
        category: true,
        advisor: {
          include: {
            user: {
              select: {
                fullName: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!society || !society.isSetupComplete) {
      return {
        profile: society,
        statistics: {
          totalEvents: 0,
          upcomingEvents: 0,
          pastEvents: 0,
        },
        pendingEvents: [],
        upcomingEvents: [],
        recentEvents: [],
        yearlyPlanSummary: {
          totalEventsInPlan: 0,
          status: 'SETUP_INCOMPLETE',
        },
      };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const societySelect = {
      id: true,
      name: true,
      logoUrl: true,
    };

    // Parallel bounded queries for dashboard widgets
    const [
      totalEvents,
      upcomingCount,
      pastCount,
      pendingEvents,
      upcomingEvents,
      recentEvents,
      yearlyPlan,
    ] = await Promise.all([
      this.prisma.event.count({ where: { societyId: society.id } }),
      this.prisma.event.count({
        where: {
          societyId: society.id,
          eventDate: { gte: today },
          isPublished: true,
          approvalStatus: { in: ['APPROVED', 'PUBLISHED'] },
        },
      }),
      this.prisma.event.count({
        where: {
          societyId: society.id,
          eventDate: { lt: today },
          isPublished: true,
          approvalStatus: { in: ['APPROVED', 'PUBLISHED'] },
        },
      }),
      this.prisma.event.findMany({
        where: {
          societyId: society.id,
          approvalStatus: {
            in: ['PENDING_ADVISOR', 'PENDING_ADMIN', 'CHANGES_REQUESTED'],
          },
        },
        take: 10,
        orderBy: [{ updatedAt: 'desc' }],
        include: { society: { select: societySelect } },
      }),
      this.prisma.event.findMany({
        where: {
          societyId: society.id,
          eventDate: { gte: today },
          isPublished: true,
          approvalStatus: { in: ['APPROVED', 'PUBLISHED'] },
        },
        take: 5,
        orderBy: [{ eventDate: 'asc' }, { startTime: 'asc' }],
        include: { society: { select: societySelect } },
      }),
      this.prisma.event.findMany({
        where: {
          societyId: society.id,
          eventDate: { lt: today },
          isPublished: true,
          approvalStatus: { in: ['APPROVED', 'PUBLISHED'] },
        },
        take: 5,
        orderBy: [{ eventDate: 'desc' }, { startTime: 'desc' }],
        include: { society: { select: societySelect } },
      }),
      this.prisma.yearlyPlan.findUnique({
        where: {
          societyId_year: {
            societyId: society.id,
            year: new Date().getFullYear(),
          },
        },
        include: {
          _count: {
            select: { plannedEvents: true },
          },
        },
      }),
    ]);

    const yearlyPlanSummary = yearlyPlan
      ? {
          totalEventsInPlan: yearlyPlan._count.plannedEvents,
          status: yearlyPlan.status,
          editRequestStatus: yearlyPlan.editRequestStatus,
        }
      : {
          totalEventsInPlan: 0,
          status: 'NOT_STARTED',
        };

    const statistics = {
      totalEvents,
      upcomingEvents: upcomingCount,
      pastEvents: pastCount,
    };

    return {
      profile: society,
      statistics,
      pendingEvents,
      upcomingEvents,
      recentEvents,
      yearlyPlanSummary,
    };
  }

  /**
   * Completes initial profile setup for a society (Can only be completed once).
   */
  async setupSocietyProfile(userId: string, dto: SetupSocietyDto): Promise<SocietyResponseDto> {
    // 1. Verify category exists
    const categoryExists = await this.prisma.category.findUnique({
      where: { id: dto.categoryId },
    });

    if (!categoryExists) {
      throw new NotFoundException('Selected society category does not exist');
    }

    // 2. Check existing society record for user
    const existingSociety = await this.prisma.society.findUnique({
      where: { userId },
    });

    if (existingSociety && existingSociety.isSetupComplete) {
      throw new ConflictException(
        'Society profile setup has already been completed. Use the update endpoint to modify your profile.',
      );
    }

    // 3. Verify name uniqueness
    const nameTaken = await this.prisma.society.findUnique({
      where: { name: dto.name },
    });

    if (nameTaken && nameTaken.userId !== userId) {
      throw new ConflictException(`A society with the name '${dto.name}' is already registered`);
    }

    // 4. Perform setup in Prisma transaction
    return this.prisma.$transaction(async (tx) => {
      const society = await tx.society.upsert({
        where: { userId },
        update: {
          name: dto.name,
          ...(dto.type && { type: dto.type }),
          shortDescription: dto.shortDescription,
          longDescription: dto.longDescription,
          categoryId: dto.categoryId,
          logoUrl: dto.logoUrl || null,
          bannerUrl: dto.bannerUrl || null,
          instagram: dto.instagram || null,
          facebook: dto.facebook || null,
          linkedin: dto.linkedin || null,
          website: dto.website || null,
          email: dto.email || null,
          ...(dto.presidentName !== undefined && { presidentName: dto.presidentName || null }),
          ...(dto.presidentRegNum !== undefined && {
            presidentRegNum: dto.presidentRegNum || null,
          }),
          ...(dto.presidentContact !== undefined && {
            presidentContact: dto.presidentContact || null,
          }),
          ...(dto.presidentEmail !== undefined && { presidentEmail: dto.presidentEmail || null }),
          ...(dto.presidentFaculty !== undefined && {
            presidentFaculty: dto.presidentFaculty || null,
          }),
          ...(dto.executiveCouncil !== undefined && {
            executiveCouncil: dto.executiveCouncil || null,
          }),
          isSetupComplete: true,
        },
        create: {
          userId,
          name: dto.name,
          type: dto.type || 'SOCIETY',
          shortDescription: dto.shortDescription,
          longDescription: dto.longDescription,
          categoryId: dto.categoryId,
          logoUrl: dto.logoUrl || null,
          bannerUrl: dto.bannerUrl || null,
          instagram: dto.instagram || null,
          facebook: dto.facebook || null,
          linkedin: dto.linkedin || null,
          website: dto.website || null,
          email: dto.email || null,
          presidentName: dto.presidentName || null,
          presidentRegNum: dto.presidentRegNum || null,
          presidentContact: dto.presidentContact || null,
          presidentEmail: dto.presidentEmail || null,
          presidentFaculty: dto.presidentFaculty || null,
          executiveCouncil: dto.executiveCouncil || null,
          isSetupComplete: true,
        },
        include: {
          category: true,
        },
      });

      return society;
    });
  }

  /**
   * Updates an existing setup society profile.
   */
  async updateSocietyProfile(userId: string, dto: UpdateSocietyDto): Promise<SocietyResponseDto> {
    const existing = await this.prisma.society.findUnique({
      where: { userId },
    });

    if (!existing || !existing.isSetupComplete) {
      throw new BadRequestException(
        'Please complete initial society profile setup before attempting updates',
      );
    }

    if (dto.categoryId) {
      const categoryExists = await this.prisma.category.findUnique({
        where: { id: dto.categoryId },
      });
      if (!categoryExists) {
        throw new NotFoundException('Selected category does not exist');
      }
    }

    if (dto.name && dto.name !== existing.name) {
      const nameTaken = await this.prisma.society.findUnique({
        where: { name: dto.name },
      });
      if (nameTaken && nameTaken.userId !== userId) {
        throw new ConflictException(`A society with the name '${dto.name}' is already registered`);
      }
    }

    const updated = await this.prisma.society.update({
      where: { userId },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.type && { type: dto.type }),
        ...(dto.shortDescription !== undefined && {
          shortDescription: dto.shortDescription,
        }),
        ...(dto.longDescription !== undefined && {
          longDescription: dto.longDescription,
        }),
        ...(dto.categoryId && { categoryId: dto.categoryId }),
        ...(dto.logoUrl !== undefined && { logoUrl: dto.logoUrl || null }),
        ...(dto.bannerUrl !== undefined && {
          bannerUrl: dto.bannerUrl || null,
        }),
        ...(dto.instagram !== undefined && {
          instagram: dto.instagram || null,
        }),
        ...(dto.facebook !== undefined && { facebook: dto.facebook || null }),
        ...(dto.linkedin !== undefined && { linkedin: dto.linkedin || null }),
        ...(dto.website !== undefined && { website: dto.website || null }),
        ...(dto.email !== undefined && { email: dto.email || null }),
        ...(dto.presidentName !== undefined && {
          presidentName: dto.presidentName || null,
        }),
        ...(dto.presidentRegNum !== undefined && {
          presidentRegNum: dto.presidentRegNum || null,
        }),
        ...(dto.presidentContact !== undefined && {
          presidentContact: dto.presidentContact || null,
        }),
        ...(dto.presidentEmail !== undefined && { presidentEmail: dto.presidentEmail || null }),
        ...(dto.executiveCouncil !== undefined && {
          executiveCouncil: dto.executiveCouncil || null,
        }),
        ...(dto.presidentFaculty !== undefined && {
          presidentFaculty: dto.presidentFaculty || null,
        }),
      },
      include: {
        category: true,
      },
    });

    return updated;
  }
}
