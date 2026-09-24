import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { QueryAdminYearlyPlansDto } from './dto/query-admin-plans.dto';
import { PaginatedAdminPlansResponseDto } from './dto/admin-plans-response.dto';
import { CreateSocietyAdminDto } from './dto/create-society-admin.dto';
import { OnboardSocietyResponseDto } from './dto/onboard-society-response.dto';
import { QueryAdminSocietiesDto, AdminSocietyStatus } from './dto/query-admin-societies.dto';
import { UpdateSocietyAdminDto } from './dto/update-society-admin.dto';
import { QueryAdminEventsDto, EventTimeType } from './dto/query-admin-events.dto';
import { AdminUpdateYearlyPlanDto } from './dto/admin-update-yearly-plan.dto';
import { AdminDashboardResponseDto } from './dto/admin-dashboard-response.dto';
import { AdminPendingSummaryDto } from './dto/admin-pending-summary.dto';
import { Prisma, Role, PlanStatus, DsaRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

import { ConfigService } from '@nestjs/config';
import { EmailService } from '../email/email.service';
import { CreateAdvisorDto } from './dto/create-advisor.dto';
import { CreateStaffDto } from './dto/create-staff.dto';

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Fast summary of pending items for admin navigation/layout badge counters.
   * Runs lightweight count queries instead of triggering the full 13-query dashboard.
   */
  async getPendingSummary(): Promise<AdminPendingSummaryDto> {
    const [pendingEvents, eventEditRequests, pendingPlans, planEditRequests] =
      await Promise.all([
        this.prisma.event.count({
          where: { approvalStatus: 'PENDING_ADMIN' },
        }),
        this.prisma.event.count({
          where: { editRequestStatus: 'PENDING' },
        }),
        this.prisma.yearlyPlan.count({
          where: { status: PlanStatus.PENDING_ADMIN },
        }),
        this.prisma.yearlyPlan.count({
          where: { editRequestStatus: 'PENDING' },
        }),
      ]);

    const pendingEventsCount = pendingEvents + eventEditRequests;
    const pendingPlansCount = pendingPlans + planEditRequests;

    return {
      totalPending: pendingEventsCount + pendingPlansCount,
      pendingEventsCount,
      pendingPlansCount,
    };
  }

  /**
   * DSA Aggregated Dashboard API: Returns system-wide metrics, active statistics, and pending action queues.
   */
  async getDashboardData(): Promise<AdminDashboardResponseDto> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    const [
      totalSocieties,
      activeSocieties,
      unconfiguredSocieties,
      inactiveSocieties,
      pendingYearlyPlans,
      approvedPlans,
      eventsThisWeek,
      eventsThisMonth,
      upcomingEvents,
      approvedPlansRaw,
      upcomingEventsRaw,
      pendingEventsRaw,
      recentlyApprovedEventsRaw,
    ] = await Promise.all([
      this.prisma.society.count(),
      this.prisma.society.count({
        where: { user: { isActive: true }, isSetupComplete: true },
      }),
      this.prisma.society.count({
        where: { user: { isActive: true }, isSetupComplete: false },
      }),
      this.prisma.society.count({ where: { user: { isActive: false } } }),
      this.prisma.yearlyPlan.count({
        where: { status: PlanStatus.PENDING_ADMIN },
      }),
      this.prisma.yearlyPlan.count({
        where: { status: PlanStatus.APPROVED },
      }),
      this.prisma.event.count({
        where: { eventDate: { gte: startOfWeek, lte: endOfWeek }, approvalStatus: 'PUBLISHED' },
      }),
      this.prisma.event.count({
        where: { eventDate: { gte: startOfMonth, lte: endOfMonth }, approvalStatus: 'PUBLISHED' },
      }),
      this.prisma.event.count({ where: { eventDate: { gte: now }, approvalStatus: 'PUBLISHED' } }),

      this.prisma.yearlyPlan.findMany({
        where: { status: PlanStatus.APPROVED },
        take: 5,
        orderBy: { updatedAt: 'desc' },
        include: {
          society: {
            select: {
              id: true,
              name: true,
              logoUrl: true,
              advisor: {
                select: {
                  id: true,
                  designation: true,
                  department: true,
                  user: {
                    select: {
                      fullName: true,
                    },
                  },
                },
              },
            },
          },
          _count: {
            select: {
              plannedEvents: true,
            },
          },
        },
      }),

      this.prisma.event.findMany({
        where: { eventDate: { gte: now }, approvalStatus: 'PUBLISHED' },
        take: 5,
        orderBy: { eventDate: 'asc' },
        include: {
          society: {
            select: {
              id: true,
              name: true,
              logoUrl: true,
              category: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      }),

      this.prisma.event.findMany({
        where: { approvalStatus: 'PENDING_ADMIN' },
        take: 5,
        orderBy: { updatedAt: 'desc' },
        include: {
          society: {
            select: {
              id: true,
              name: true,
              logoUrl: true,
              category: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      }),

      this.prisma.event.findMany({
        where: { approvalStatus: 'PUBLISHED' },
        take: 5,
        orderBy: { dsaApprovedAt: 'desc' },
        include: {
          society: {
            select: {
              id: true,
              name: true,
              logoUrl: true,
              category: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      }),
    ]);

    const approvedPlansPreview = approvedPlansRaw.map((plan) => ({
      id: plan.id,
      year: plan.year,
      status: plan.status,
      advisorComments: plan.advisorComments,
      updatedAt: plan.updatedAt,
      totalPlannedEvents: plan._count.plannedEvents,
      society: plan.society,
    }));

    const upcomingEventsPreview = upcomingEventsRaw.map((evt) => ({
      id: evt.id,
      title: evt.title,
      eventDate: evt.eventDate,
      startTime: evt.startTime,
      endTime: evt.endTime,
      venue: evt.venue,
      society: evt.society,
      createdAt: evt.createdAt,
      approvalStatus: evt.approvalStatus,
    }));

    const pendingEventsPreview = pendingEventsRaw.map((evt) => ({
      id: evt.id,
      title: evt.title,
      eventDate: evt.eventDate,
      startTime: evt.startTime,
      endTime: evt.endTime,
      venue: evt.venue,
      society: evt.society,
      createdAt: evt.createdAt,
      approvalStatus: evt.approvalStatus,
    }));

    const recentlyApprovedEventsPreview = recentlyApprovedEventsRaw.map((evt) => ({
      id: evt.id,
      title: evt.title,
      eventDate: evt.eventDate,
      startTime: evt.startTime,
      endTime: evt.endTime,
      venue: evt.venue,
      society: evt.society,
      createdAt: evt.createdAt,
      dsaApprovedAt: evt.dsaApprovedAt,
      approvalStatus: evt.approvalStatus,
    }));

    return {
      statistics: {
        totalSocieties,
        activeSocieties,
        unconfiguredSocieties,
        inactiveSocieties,
        pendingYearlyPlans,
        approvedPlans,
        eventsThisWeek,
        eventsThisMonth,
        upcomingEvents,
      },
      approvedPlansPreview,
      pendingEventsPreview,
      upcomingEventsPreview,
      recentlyApprovedEventsPreview,
    };
  }

  /**
   * Retrieves list of available faculty advisors for society onboarding forms.
   */

  async deleteAdvisor(advisorId: string) {
    const advisor = await this.prisma.advisor.findUnique({
      where: { id: advisorId },
    });
    if (!advisor) {
      throw new NotFoundException('Advisor not found');
    }
    await this.prisma.user.delete({
      where: { id: advisor.userId },
    });
    return { success: true, message: 'Advisor deleted successfully' };
  }

  async getAvailableAdvisors() {
    return this.prisma.advisor.findMany({
      select: {
        id: true,
        designation: true,
        department: true,
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        societies: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        user: {
          fullName: 'asc',
        },
      },
    });
  }

  /**
   * DSA creates a new faculty advisor via secure email activation invitation.
   */
  async createAdvisor(dto: CreateAdvisorDto) {
    const email = dto.email.toLowerCase().trim();
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException(`User with email ${email} already exists`);
    }

    const rawToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
    const tokenExpires = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48 hours
    const initialPlaceholderPass = await bcrypt.hash(crypto.randomBytes(16).toString('hex'), 10);

    const advisor = await this.prisma.$transaction(async (prisma) => {
      const user = await prisma.user.create({
        data: {
          fullName: dto.fullName.trim(),
          email,
          password: initialPlaceholderPass,
          role: Role.ADVISOR,
          isActive: true,
          isEmailVerified: false,
          verificationToken: hashedToken,
          verificationExpires: tokenExpires,
        },
      });

      return prisma.advisor.create({
        data: {
          department: dto.department.trim(),
          designation: dto.designation.trim(),
          userId: user.id,
        },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
            },
          },
        },
      });
    });

    const clientUrl = this.configService.get<string>('CLIENT_URL') || 'http://localhost:5173';
    const activationUrl = `${clientUrl}/activate-advisor?token=${rawToken}&email=${encodeURIComponent(email)}`;

    this.emailService
      .sendAdvisorActivationEmail(email, dto.fullName.trim(), activationUrl)
      .catch((err) => console.error('Failed to send advisor activation email:', err));

    return {
      ...advisor,
      activationEmailSent: true,
    };
  }

  /**
   * DSA Staff Management: Returns list of all DSA and DDSA administrative accounts.
   */
  async getStaffList(currentUserId: string) {
    const caller = await this.prisma.user.findUnique({ where: { id: currentUserId } });
    if (!caller || caller.dsaRole !== DsaRole.DIRECTOR) {
      throw new ForbiddenException(
        'Access denied: Only the Director of Student Affairs (DSA) can view DDSA staff accounts.',
      );
    }

    const staff = await this.prisma.user.findMany({
      where: { role: Role.DSA_ADMIN },
      select: {
        id: true,
        fullName: true,
        email: true,
        dsaRole: true,
        role: true,
        isActive: true,
        isEmailVerified: true,
        createdAt: true,
      },
      orderBy: [{ dsaRole: 'asc' }, { fullName: 'asc' }],
    });

    return staff;
  }

  /**
   * DSA Staff Management: Director creates a new DDSA staff member with an invitation link.
   */
  async createStaff(dto: CreateStaffDto, currentUserId: string) {
    const caller = await this.prisma.user.findUnique({ where: { id: currentUserId } });
    if (!caller || caller.dsaRole !== DsaRole.DIRECTOR) {
      throw new ForbiddenException(
        'Access denied: Only the Director of Student Affairs (DSA) can invite DDSA staff accounts.',
      );
    }

    const email = dto.email.toLowerCase().trim();
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new ConflictException(`An account with email '${email}' already exists.`);
    }

    const rawToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
    const tokenExpires = new Date(Date.now() + 48 * 60 * 60 * 1000);
    const initialPlaceholderPass = await bcrypt.hash(crypto.randomBytes(16).toString('hex'), 10);

    const user = await this.prisma.user.create({
      data: {
        fullName: dto.fullName.trim(),
        email,
        password: initialPlaceholderPass,
        role: Role.DSA_ADMIN,
        dsaRole: DsaRole.DEPUTY_DIRECTOR,
        isActive: true,
        isEmailVerified: false,
        verificationToken: hashedToken,
        verificationExpires: tokenExpires,
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        dsaRole: true,
        isActive: true,
        createdAt: true,
      },
    });

    const clientUrl = this.configService.get<string>('CLIENT_URL') || 'http://localhost:5173';
    const activationUrl = `${clientUrl}/activate-advisor?token=${rawToken}&email=${encodeURIComponent(email)}`;

    this.emailService
      .sendDdsaInvitationEmail(email, dto.fullName.trim(), activationUrl)
      .catch((err) => console.error('Failed to dispatch DDSA invitation email:', err));

    return {
      ...user,
      invitationEmailSent: true,
    };
  }

  /**
   * DSA Staff Management: Director deactivates/deletes a DDSA staff account.
   */
  async deleteStaff(staffId: string, currentUserId: string) {
    const caller = await this.prisma.user.findUnique({ where: { id: currentUserId } });
    if (!caller || caller.dsaRole !== DsaRole.DIRECTOR) {
      throw new ForbiddenException(
        'Access denied: Only the Director of Student Affairs (DSA) can delete DDSA staff accounts.',
      );
    }

    if (staffId === currentUserId) {
      throw new BadRequestException('You cannot delete your own administrative account.');
    }

    const target = await this.prisma.user.findUnique({ where: { id: staffId } });
    if (!target || target.role !== Role.DSA_ADMIN) {
      throw new NotFoundException('Administrative staff account not found.');
    }

    if (target.dsaRole === DsaRole.DIRECTOR) {
      throw new BadRequestException('Primary Director accounts cannot be deleted.');
    }

    await this.prisma.user.delete({ where: { id: staffId } });

    return { message: 'DDSA staff account deleted successfully', id: staffId };
  }

  /**
   * DSA Events Overview Query: Paginated list of all campus events across all societies.
   */
  async getAllEventsAdmin(query: QueryAdminEventsDto) {
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(50, Math.max(1, query.limit || 10));
    const skip = (page - 1) * limit;

    const whereClause: Prisma.EventWhereInput = {};

    // Date range filtering
    const dateConditions: Prisma.DateTimeFilter = {};
    let hasDateFilter = false;

    if (query.from) {
      dateConditions.gte = new Date(query.from);
      hasDateFilter = true;
    }

    if (query.to) {
      const toDate = new Date(query.to);
      toDate.setHours(23, 59, 59, 999);
      dateConditions.lte = toDate;
      hasDateFilter = true;
    }

    const now = new Date();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (query.type === EventTimeType.UPCOMING && !query.from) {
      dateConditions.gte = today;
      hasDateFilter = true;
    } else if (query.type === EventTimeType.PAST && !query.to) {
      dateConditions.lt = today;
      hasDateFilter = true;
    }

    if (hasDateFilter) {
      whereClause.eventDate = dateConditions;
    }

    // Category & Society filtering
    const societyWhere: Prisma.SocietyWhereInput = {};
    let hasSocietyFilter = false;

    if (query.category) {
      const cat = query.category.trim();
      societyWhere.category = {
        OR: [
          { id: cat },
          { slug: cat.toLowerCase() },
          { name: { contains: cat, mode: 'insensitive' } },
        ],
      };
      hasSocietyFilter = true;
    }

    if (query.society) {
      const soc = query.society.trim();
      societyWhere.OR = [{ id: soc }, { name: { contains: soc, mode: 'insensitive' } }];
      hasSocietyFilter = true;
    }

    if (hasSocietyFilter) {
      whereClause.society = societyWhere;
    }

    // Search query
    if (query.search) {
      const term = query.search.trim();
      whereClause.OR = [
        { title: { contains: term, mode: 'insensitive' } },
        { description: { contains: term, mode: 'insensitive' } },
        { venue: { contains: term, mode: 'insensitive' } },
      ];
    }

    if (query.status) {
      whereClause.approvalStatus = query.status;
    } else {
      whereClause.approvalStatus = { notIn: ['DRAFT', 'PENDING_ADVISOR'] };
    }

    const sortOrder: Prisma.SortOrder = query.type === EventTimeType.PAST ? 'desc' : 'asc';

    const [total, events] = await Promise.all([
      this.prisma.event.count({ where: whereClause }),
      this.prisma.event.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { eventDate: sortOrder },
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

    const formattedItems = events.map((evt) => ({
      id: evt.id,
      title: evt.title,
      description: evt.description,
      eventDate: evt.eventDate,
      startTime: evt.startTime,
      endTime: evt.endTime,
      venue: evt.venue,
      coverImageUrl: evt.coverImageUrl,
      registrationLink: evt.registrationLink,
      createdAt: evt.createdAt,
      updatedAt: evt.updatedAt,
      society: evt.society,
      approvalStatus: evt.approvalStatus,
      isUpcoming: new Date(evt.eventDate) >= today,
    }));

    return {
      items: formattedItems,
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
   * DSA Society Directory Query: Paginated list of all campus societies with status, category, and search filters.
   */
  async getAllSocietiesAdmin(query: QueryAdminSocietiesDto) {
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(50, Math.max(1, query.limit || 10));
    const skip = (page - 1) * limit;

    const whereClause: Prisma.SocietyWhereInput = {};

    if (query.status) {
      if (query.status === AdminSocietyStatus.INACTIVE) {
        whereClause.user = { isActive: false };
      } else if (query.status === AdminSocietyStatus.UNCONFIGURED) {
        whereClause.user = { isActive: true };
        whereClause.isSetupComplete = false;
      } else if (query.status === AdminSocietyStatus.ACTIVE) {
        whereClause.user = { isActive: true };
        whereClause.isSetupComplete = true;
      }
    }

    if (query.category) {
      const cat = query.category.trim();
      whereClause.category = {
        OR: [{ slug: cat.toLowerCase() }, { name: { contains: cat, mode: 'insensitive' } }],
      };
    }

    if (query.search) {
      const searchTerm = query.search.trim();
      whereClause.name = { contains: searchTerm, mode: 'insensitive' };
    }

    const [total, items] = await Promise.all([
      this.prisma.society.count({ where: whereClause }),
      this.prisma.society.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
        include: {
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          advisor: {
            select: {
              id: true,
              designation: true,
              department: true,
              user: {
                select: {
                  fullName: true,
                  email: true,
                },
              },
            },
          },
          user: {
            select: {
              id: true,
              email: true,
              isActive: true,
            },
          },
        },
      }),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    const formattedItems = items.map((soc) => {
      let status = AdminSocietyStatus.ACTIVE;
      if (!soc.user.isActive) {
        status = AdminSocietyStatus.INACTIVE;
      } else if (!soc.isSetupComplete) {
        status = AdminSocietyStatus.UNCONFIGURED;
      }

      return {
        id: soc.id,
        name: soc.name,
        shortDescription: soc.shortDescription,
        logoUrl: soc.logoUrl,
        isSetupComplete: soc.isSetupComplete,
        status,
        presidentEmail: soc.user.email,
        category: soc.category,
        advisor: soc.advisor,
        createdAt: soc.createdAt,
        updatedAt: soc.updatedAt,
      };
    });

    return {
      items: formattedItems,
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
   * DSA Society Details Query: Full society profile details including EC members, advisor, and contact info.
   */
  async getSocietyByIdAdmin(id: string) {
    const society = await this.prisma.society.findUnique({
      where: { id },
      include: {
        category: true,
        advisor: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                email: true,
                avatarUrl: true,
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            email: true,
            fullName: true,
            isActive: true,
            avatarUrl: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        events: {
          select: {
            id: true,
            title: true,
            eventDate: true,
            startTime: true,
            endTime: true,
            venue: true,
            approvalStatus: true,
            isPublished: true,
            coverImageUrl: true,
          },
          orderBy: { eventDate: 'desc' },
          take: 6,
        },
        yearlyPlans: {
          select: {
            id: true,
            year: true,
            status: true,
            createdAt: true,
            updatedAt: true,
          },
          orderBy: { year: 'desc' },
          take: 3,
        },
        _count: {
          select: {
            events: true,
            yearlyPlans: true,
          },
        },
      },
    });

    if (!society) {
      throw new NotFoundException(`Society with ID '${id}' was not found`);
    }

    let status = AdminSocietyStatus.ACTIVE;
    if (!society.user.isActive) {
      status = AdminSocietyStatus.INACTIVE;
    } else if (!society.isSetupComplete) {
      status = AdminSocietyStatus.UNCONFIGURED;
    }

    return {
      ...society,
      status,
      presidentEmail: society.presidentEmail || society.user.email,
    };
  }

  /**
   * DSA Updates society information or reassigns faculty advisor.
   */
  async updateSocietyAdmin(id: string, dto: UpdateSocietyAdminDto) {
    const existing = await this.prisma.society.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(`Society with ID '${id}' was not found`);
    }

    // Parallel validation checks
    const [categoryExists, advisorExists, existingAssignment, nameTaken] = await Promise.all([
      dto.categoryId ? this.prisma.category.findUnique({ where: { id: dto.categoryId } }) : null,
      dto.advisorId ? this.prisma.advisor.findUnique({ where: { id: dto.advisorId } }) : null,
      dto.advisorId
        ? this.prisma.society.findFirst({ where: { advisorId: dto.advisorId, id: { not: id } } })
        : null,
      dto.name && dto.name !== existing.name
        ? this.prisma.society.findUnique({ where: { name: dto.name } })
        : null,
    ]);

    if (dto.categoryId && !categoryExists) {
      throw new NotFoundException('Selected category does not exist');
    }
    if (dto.advisorId && !advisorExists) {
      throw new NotFoundException('Selected faculty advisor does not exist');
    }
    if (dto.advisorId && existingAssignment) {
      throw new BadRequestException('Only one society can be alloted to an advisor.');
    }
    if (dto.name && dto.name !== existing.name && nameTaken) {
      throw new ConflictException(`A society with the name '${dto.name}' is already registered`);
    }

    const updated = await this.prisma.society.update({
      where: { id },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.categoryId && { categoryId: dto.categoryId }),
        ...(dto.advisorId !== undefined && { advisorId: dto.advisorId }),
      },
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

    return updated;
  }

  /**
   * DSA Hard Delete: Deletes society account and all associated records permanently.
   */
  async deleteSociety(id: string) {
    const society = await this.prisma.society.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!society) {
      throw new NotFoundException(`Society with ID '${id}' was not found`);
    }

    await this.prisma.user.delete({
      where: { id: society.userId },
    });

    return {
      message: 'Society account deleted successfully',
      id: society.id,
      name: society.name,
    };
  }

  /**
   * DSA Soft Deactivation: Deactivates society account without deleting historical records.
   */
  async deactivateSociety(id: string) {
    const society = await this.prisma.society.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!society) {
      throw new NotFoundException(`Society with ID '${id}' was not found`);
    }

    if (!society.user.isActive) {
      throw new BadRequestException('Society account is already inactive');
    }

    await this.prisma.user.update({
      where: { id: society.userId },
      data: { isActive: false },
    });

    return {
      message: 'Society account deactivated successfully',
      societyId: society.id,
    };
  }

  async reactivateSociety(id: string) {
    const society = await this.prisma.society.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!society) {
      throw new NotFoundException(`Society with ID '${id}' was not found`);
    }

    if (society.user.isActive) {
      throw new BadRequestException('Society account is already active');
    }

    await this.prisma.user.update({
      where: { id: society.userId },
      data: { isActive: true },
    });

    return {
      message: 'Society account reactivated successfully',
      societyId: society.id,
    };
  }

  async toggleWarning(id: string, hasWarning: boolean) {
    const society = await this.prisma.society.findUnique({ where: { id } });
    if (!society) {
      throw new NotFoundException(`Society with ID '${id}' was not found`);
    }

    await this.prisma.society.update({
      where: { id },
      data: { hasWarning },
    });

    return {
      message: `Society warning status updated to ${hasWarning}`,
      societyId: society.id,
      hasWarning,
    };
  }

  /**
   * DSA Society Onboarding Workflow:
   * 1. Validates uniqueness of president email and society name.
   * 2. Verifies existence of Category and Advisor.
   * 3. Generates a secure temporary password.
   * 4. Provisions User (SOCIETY role) and unconfigured Society profile inside a Prisma transaction.
   * 5. Returns created society details with unhashed temporary credentials for manual administrator delivery.
   */
  async onboardSociety(dto: CreateSocietyAdminDto): Promise<OnboardSocietyResponseDto> {
    const email = dto.presidentEmail.toLowerCase().trim();
    const name = dto.name.trim();

    // Parallel validation checks (P11)
    const [emailExists, nameExists, category, advisor, existingAssignment] = await Promise.all([
      this.prisma.user.findUnique({ where: { email } }),
      this.prisma.society.findUnique({ where: { name } }),
      this.prisma.category.findUnique({ where: { id: dto.categoryId } }),
      this.prisma.advisor.findUnique({
        where: { id: dto.advisorId },
        include: {
          user: {
            select: {
              fullName: true,
            },
          },
        },
      }),
      this.prisma.society.findFirst({
        where: { advisorId: dto.advisorId },
      }),
    ]);

    if (emailExists) {
      throw new ConflictException(
        `A user account with the email '${email}' already exists in the system`,
      );
    }
    if (nameExists) {
      throw new ConflictException(`A society with the name '${name}' is already registered`);
    }
    if (!category) {
      throw new NotFoundException('Selected society category does not exist');
    }
    if (!advisor) {
      throw new NotFoundException('Selected faculty advisor does not exist');
    }
    if (existingAssignment) {
      throw new BadRequestException('Only one society can be alloted to an advisor.');
    }

    // 5. Generate secure activation token (48 hours expiration)
    const rawToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
    const tokenExpires = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48 hours

    // Generate temporary locked password hash
    const initialPlaceholderPass = await bcrypt.hash(crypto.randomBytes(16).toString('hex'), 10);

    // 6. Perform provisioning inside a Prisma transaction
    const result = await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          password: initialPlaceholderPass,
          fullName: `${name} President`,
          role: Role.SOCIETY,
          isActive: true,
          isEmailVerified: false,
          verificationToken: hashedToken,
          verificationExpires: tokenExpires,
        },
      });

      const society = await tx.society.create({
        data: {
          name,
          categoryId: dto.categoryId,
          advisorId: dto.advisorId,
          userId: user.id,
          isSetupComplete: false,
        },
      });

      return { society, user };
    });

    // 7. Dispatch activation email asynchronously (P07 fire-and-forget to avoid SMTP blocking latency)
    const clientUrl = this.configService.get<string>('CLIENT_URL') || 'http://localhost:5173';
    const activationUrl = `${clientUrl}/activate-society?token=${rawToken}&email=${encodeURIComponent(email)}`;

    this.emailService
      .sendSocietyActivationEmail(email, name, activationUrl)
      .catch((err) => console.error('Failed to send activation email:', err));

    return {
      id: result.society.id,
      name: result.society.name,
      presidentEmail: result.user.email,
      activationEmailSent: true,
      emailPreviewUrl: undefined,
      isSetupComplete: false,
      category: {
        id: category.id,
        name: category.name,
      },
      advisor: {
        id: advisor.id,
        designation: advisor.designation,
        user: {
          fullName: advisor.user.fullName,
        },
      },
      createdAt: result.society.createdAt,
    };
  }

  /**
   * DSA Internal Record Query: Paginated yearly plans across all campus societies.
   */
  async getAllYearlyPlans(
    query: QueryAdminYearlyPlansDto,
  ): Promise<PaginatedAdminPlansResponseDto> {
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(50, Math.max(1, query.limit || 10));
    const skip = (page - 1) * limit;

    const whereClause: Prisma.YearlyPlanWhereInput = {
      status: query.status ? query.status : { not: PlanStatus.DRAFT },
    };

    if (query.editRequestStatus) {
      whereClause.editRequestStatus = query.editRequestStatus;
    }

    if (query.year) {
      whereClause.year = Number(query.year);
    }

    const searchTerm = query.search || query.society;
    if (searchTerm) {
      const term = searchTerm.trim();
      whereClause.society = {
        name: { contains: term, mode: 'insensitive' },
      };
    }

    const [total, plans] = await Promise.all([
      this.prisma.yearlyPlan.count({ where: whereClause }),
      this.prisma.yearlyPlan.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: [{ year: 'desc' }, { updatedAt: 'desc' }],
        include: {
          society: {
            select: {
              id: true,
              name: true,
              logoUrl: true,
              advisor: {
                select: {
                  id: true,
                  designation: true,
                  department: true,
                  user: {
                    select: {
                      fullName: true,
                      email: true,
                    },
                  },
                },
              },
            },
          },
          _count: {
            select: {
              plannedEvents: true,
            },
          },
        },
      }),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    const items = plans.map((plan) => ({
      id: plan.id,
      year: plan.year,
      status: plan.status,
      advisorComments: plan.advisorComments,
      createdAt: plan.createdAt,
      updatedAt: plan.updatedAt,
      editRequestStatus: plan.editRequestStatus,
      editRequestReason: plan.editRequestReason,
      totalPlannedEvents: plan._count.plannedEvents,
      society: plan.society,
    }));

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
   * DSA Internal Record Detail: Full record view with complete review history & planned events.
   */
  async getYearlyPlanDetailById(id: string) {
    const plan = await this.prisma.yearlyPlan.findUnique({
      where: { id },
      include: {
        society: {
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
        },
        plannedEvents: {
          orderBy: { startDate: 'asc' },
        },
      },
    });

    if (!plan) {
      throw new NotFoundException(`Yearly plan record with ID '${id}' was not found`);
    }
    return plan;
  }

  async updateYearlyPlan(id: string, dto: AdminUpdateYearlyPlanDto) {
    const plan = await this.prisma.yearlyPlan.findUnique({ where: { id } });
    if (!plan) {
      throw new NotFoundException(`Yearly plan record with ID '${id}' was not found`);
    }

    return this.prisma.$transaction(async (tx) => {
      if (dto.events) {
        await tx.plannedEvent.deleteMany({
          where: { yearlyPlanId: id },
        });

        if (dto.events.length > 0) {
          await tx.plannedEvent.createMany({
            data: dto.events.map((e) => ({
              eventName: e.eventName,
              startDate: new Date(e.startDate),
              endDate: new Date(e.endDate),
              description: e.description,
              venue: e.venue,
              rules: e.rules,
              societyRules: e.societyRules,
              eventType: e.eventType,
              duration: e.duration,
              yearlyPlanId: id,
            })),
          });
        }
      }

      return tx.yearlyPlan.findUnique({
        where: { id },
        include: {
          society: {
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
          },
          plannedEvents: {
            orderBy: { startDate: 'asc' },
          },
        },
      });
    });
  }

  async updateEventStatus(
    eventId: string,
    dto: { status: string; comments?: string; rules?: string },
  ) {
    const event = await this.prisma.event.findUnique({ where: { id: eventId } });
    if (!event) {
      throw new NotFoundException('Event not found');
    }

    const data: any = {
      approvalStatus: dto.status as any,
      dsaComments: dto.comments || null,
      rules: dto.rules !== undefined ? dto.rules : undefined,
      isPublished: dto.status === 'PUBLISHED' || dto.status === 'APPROVED',
      ...(dto.status === 'CHANGES_REQUESTED' ? { lastChangeRequestBy: 'DSA_ADMIN' } : {}),
      ...(dto.status === 'PUBLISHED' || dto.status === 'APPROVED'
        ? { lastChangeRequestBy: null }
        : {}),
    };

    if (dto.status === 'PUBLISHED' || dto.status === 'APPROVED') {
      data.dsaApprovedAt = new Date();
      if (!event.venueClearanceStatus) {
        data.venueClearanceStatus = 'PENDING_UPLOAD';
      }
    }

    return this.prisma.event.update({
      where: { id: eventId },
      data,
    });
  }

  async verifyVenueClearance(
    eventId: string,
    dto: { status: 'VERIFIED' | 'REJECTED'; notes?: string },
  ) {
    const event = await this.prisma.event.findUnique({ where: { id: eventId } });
    if (!event) {
      throw new NotFoundException('Event not found');
    }

    if (!event.signedVenueSlipUrl) {
      throw new BadRequestException('Society has not uploaded a signed venue slip yet.');
    }

    const data: any = {
      venueClearanceStatus: dto.status,
      venueClearanceNotes: dto.notes || null,
      venueClearanceVerifiedAt: dto.status === 'VERIFIED' ? new Date() : null,
    };

    return this.prisma.event.update({
      where: { id: eventId },
      data,
      include: {
        society: {
          select: { id: true, name: true, logoUrl: true },
        },
      },
    });
  }
}
