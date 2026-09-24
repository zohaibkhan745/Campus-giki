import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { CreateYearlyPlanDto } from './dto/create-yearly-plan.dto';
import { UpdateYearlyPlanDto } from './dto/update-yearly-plan.dto';
import { ReviewYearlyPlanDto, ReviewDecision } from './dto/review-yearly-plan.dto';
import { YearlyPlanResponseDto } from './dto/yearly-plan-response.dto';
import { PlanStatus, Society, Role } from '@prisma/client';
import { validateExecutiveCouncil } from '../../common/utils/council.util';
import { EmailService } from '../email/email.service';

@Injectable()
export class YearlyPlansService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
  ) {}


  /**
   * Helper: Validates that the authenticated user owns an active setup society.
   */
  private async validateSocietyOwnership(userId: string): Promise<Society> {
    const society = await this.prisma.society.findUnique({
      where: { userId },
    });

    if (!society || !society.isSetupComplete) {
      throw new ForbiddenException(
        'Access denied: You must complete your society profile setup before managing resources',
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
   * Creates a new yearly calendar plan for the authenticated society.
   */
  async createYearlyPlan(userId: string, dto: CreateYearlyPlanDto): Promise<YearlyPlanResponseDto> {
    const society = await this.validateSocietyOwnership(userId);

    // Prevent duplicate plan for the same year
    const existing = await this.prisma.yearlyPlan.findUnique({
      where: {
        societyId_year: {
          societyId: society.id,
          year: dto.year,
        },
      },
    });

    if (existing) {
      throw new ConflictException(
        `A yearly calendar plan for the year ${dto.year} already exists for your society`,
      );
    }

    for (const e of dto.events) {
      const start = new Date(e.startDate);
      const end = new Date(e.endDate);
      if (end < start) {
        throw new BadRequestException(
          `Event '${e.eventName}' end date cannot be prior to its start date.`,
        );
      }
    }

    const plan = await this.prisma.$transaction(async (tx) => {
      const created = await tx.yearlyPlan.create({
        data: {
          year: dto.year,
          status: dto.status || PlanStatus.DRAFT,
          societyId: society.id,
          plannedEvents: {
            create: dto.events.map((e) => ({
              eventName: e.eventName,
              startDate: new Date(e.startDate),
              endDate: new Date(e.endDate),
              description: e.description,
              venue: e.venue,
              rules: e.rules,
              societyRules: e.societyRules,
              eventType: e.eventType,
              duration: e.duration,
            })),
          },
        },
        include: {
          society: {
            select: {
              id: true,
              name: true,
              logoUrl: true,
            },
          },
          plannedEvents: {
            orderBy: { startDate: 'asc' },
          },
        },
      });

      return created;
    });

    if (plan.status === PlanStatus.PENDING_ADVISOR) {
      this.notifyAdvisorOfYearlyPlanSubmission(plan.id, society.id, plan.year, plan.plannedEvents.length);
    }

    return plan;
  }

  /**
   * Retrieves all yearly plans for the authenticated society.
   */
  async getMyYearlyPlans(userId: string): Promise<YearlyPlanResponseDto[]> {
    const society = await this.validateSocietyOwnership(userId);

    const plans = await this.prisma.yearlyPlan.findMany({
      where: { societyId: society.id },
      orderBy: { year: 'desc' },
      include: {
        society: {
          select: {
            id: true,
            name: true,
            logoUrl: true,
          },
        },
        plannedEvents: {
          orderBy: { startDate: 'asc' },
        },
      },
    });

    return plans;
  }

  /**
   * Retrieves a single yearly plan by ID.
   */
  async getYearlyPlanById(planId: string): Promise<YearlyPlanResponseDto> {
    const plan = await this.prisma.yearlyPlan.findUnique({
      where: { id: planId },
      include: {
        society: {
          select: {
            id: true,
            name: true,
            logoUrl: true,
          },
        },
        plannedEvents: {
          orderBy: { startDate: 'asc' },
        },
      },
    });

    if (!plan) {
      throw new NotFoundException(`Yearly plan with ID '${planId}' was not found`);
    }

    return plan;
  }

  /**
   * Updates an existing yearly plan with state machine workflow guards.
   */
  async updateYearlyPlan(
    planId: string,
    userId: string,
    dto: UpdateYearlyPlanDto,
  ): Promise<YearlyPlanResponseDto> {
    const society = await this.validateSocietyOwnership(userId);

    const plan = await this.prisma.yearlyPlan.findUnique({
      where: { id: planId },
    });

    if (!plan) {
      throw new NotFoundException(`Yearly plan with ID '${planId}' was not found`);
    }

    if (plan.societyId !== society.id) {
      throw new ForbiddenException('Access denied: You do not own this yearly calendar plan');
    }

    if (
      (plan.status === PlanStatus.PENDING_ADVISOR || plan.status === PlanStatus.PENDING_ADMIN) &&
      !dto.status
    ) {
      throw new ForbiddenException('Cannot edit a plan that is currently pending review.');
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      // If events array is provided, replace old planned events
      if (dto.events) {
        for (const e of dto.events) {
          const start = new Date(e.startDate);
          const end = new Date(e.endDate);
          if (end < start) {
            throw new BadRequestException(
              `Event '${e.eventName}' end date cannot be prior to its start date.`,
            );
          }
        }
        await tx.plannedEvent.deleteMany({
          where: { yearlyPlanId: planId },
        });
      }

      const updated = await tx.yearlyPlan.update({
        where: { id: planId },
        data: {
          ...(dto.status && { status: dto.status }),
          editRequestStatus: null,
          editRequestReason: null,
          ...(dto.events && {
            plannedEvents: {
              create: dto.events.map((e) => ({
                eventName: e.eventName,
                startDate: new Date(e.startDate),
                endDate: new Date(e.endDate),
                description: e.description,
                venue: e.venue,
                rules: e.rules,
                societyRules: e.societyRules,
                eventType: e.eventType,
                duration: e.duration,
              })),
            },
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
          plannedEvents: {
            orderBy: { startDate: 'asc' },
          },
        },
      });

      return updated;
    });

    if (updated.status === PlanStatus.PENDING_ADVISOR) {
      this.notifyAdvisorOfYearlyPlanSubmission(updated.id, society.id, updated.year, updated.plannedEvents.length);
    }

    return updated;
  }

  /**
   * Advisor Review Workflow: Approves or requests changes for a submitted plan.
   */
  async reviewYearlyPlan(
    planId: string,
    userId: string,
    role: Role,
    dto: ReviewYearlyPlanDto,
  ): Promise<YearlyPlanResponseDto> {
    const plan = await this.prisma.yearlyPlan.findUnique({
      where: { id: planId },
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

    if (!plan) {
      throw new NotFoundException(`Yearly plan with ID '${planId}' was not found`);
    }

    if (role === Role.ADVISOR) {
      if (!plan.society.advisor || plan.society.advisor.userId !== userId) {
        throw new ForbiddenException(
          'Access denied: You are not the assigned faculty advisor for this society',
        );
      }
      if (plan.status !== PlanStatus.PENDING_ADVISOR) {
        throw new BadRequestException('Plan is not pending advisor review.');
      }
    } else if (role === Role.DSA_ADMIN) {
      if (plan.status !== PlanStatus.PENDING_ADMIN) {
        throw new BadRequestException('Plan is not pending DSA Admin review.');
      }
    } else {
      throw new ForbiddenException('Invalid role for review');
    }

    let newStatus: PlanStatus;
    if (role === Role.ADVISOR) {
      newStatus =
        dto.decision === ReviewDecision.APPROVED
          ? PlanStatus.PENDING_ADMIN
          : PlanStatus.CHANGES_REQUESTED;
    } else {
      newStatus =
        dto.decision === ReviewDecision.APPROVED
          ? PlanStatus.APPROVED
          : PlanStatus.CHANGES_REQUESTED;
    }

    let newAdvisorComments = plan.advisorComments;
    if (dto.comment && dto.comment.trim() !== '') {
      const dateStr = new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
      const roleStr = role === Role.ADVISOR ? 'Advisor' : 'DSA Admin';
      const formattedComment = `[${dateStr}] ${newStatus} - ${roleStr}:\n${dto.comment.trim()}`;
      newAdvisorComments = plan.advisorComments
        ? `${plan.advisorComments}\n\n---\n\n${formattedComment}`
        : formattedComment;
    }

    const updated = await this.prisma.yearlyPlan.update({
      where: { id: planId },
      data: {
        status: newStatus,
        advisorComments: newAdvisorComments,
      },
      include: {
        society: {
          select: {
            id: true,
            name: true,
            logoUrl: true,
          },
        },
        plannedEvents: {
          orderBy: { startDate: 'asc' },
        },
      },
    });

    if (role === Role.ADVISOR) {
      if (newStatus === PlanStatus.PENDING_ADMIN) {
        const advisorName = plan.society.advisor?.user?.fullName || 'Faculty Advisor';
        this.notifyDsaOfYearlyPlanForwarded(planId, updated.society.id, updated.year, advisorName);
        this.notifySocietyOfYearlyPlanUpdate(
          updated.society.id,
          updated.year,
          'FORWARDED_TO_DSA',
          'Faculty Advisor',
          dto.comment,
        );
      } else if (newStatus === PlanStatus.CHANGES_REQUESTED) {
        this.notifySocietyOfYearlyPlanUpdate(
          updated.society.id,
          updated.year,
          'CHANGES_REQUESTED',
          'Faculty Advisor',
          dto.comment,
        );
      }
    } else if (role === Role.DSA_ADMIN) {
      if (newStatus === PlanStatus.APPROVED) {
        this.notifySocietyOfYearlyPlanUpdate(
          updated.society.id,
          updated.year,
          'APPROVED',
          'DSA Directorate',
          dto.comment,
        );
      } else if (newStatus === PlanStatus.CHANGES_REQUESTED) {
        this.notifySocietyOfYearlyPlanUpdate(
          updated.society.id,
          updated.year,
          'CHANGES_REQUESTED',
          'DSA Directorate',
          dto.comment,
        );
      }
    }

    return updated;
  }

  async requestEdit(id: string, userId: string, userRole: string, reason: string) {
    const plan = await this.prisma.yearlyPlan.findUnique({
      where: { id },
      include: { society: true },
    });
    if (!plan) throw new NotFoundException('Plan not found');

    if (userRole !== Role.DSA_ADMIN && plan.society.userId !== userId) {
      throw new ForbiddenException('Access denied: You do not own this yearly plan resource');
    }

    const updated = await this.prisma.yearlyPlan.update({
      where: { id },
      data: {
        editRequestStatus: 'PENDING',
        editRequestReason: reason,
      },
      include: {
        society: {
          select: {
            id: true,
            name: true,
            logoUrl: true,
          },
        },
        plannedEvents: {
          orderBy: { startDate: 'asc' },
        },
      },
    });

    // Notify DSA administration of the incoming edit request
    this.notifyDsaOfYearlyPlanEditRequested(id, plan.society.name, plan.year, reason);

    return updated;
  }

  async resolveEditRequest(id: string, status: 'APPROVED' | 'REJECTED') {
    const plan = await this.prisma.yearlyPlan.findUnique({
      where: { id },
      include: { society: true },
    });
    if (!plan) throw new NotFoundException('Plan not found');

    const updateData: any = {
      editRequestStatus: status,
    };

    if (status === 'APPROVED') {
      updateData.status = 'DRAFT';
      updateData.editRequestStatus = 'APPROVED';
      updateData.editRequestReason = null;
    }

    const updated = await this.prisma.yearlyPlan.update({
      where: { id },
      data: updateData,
      include: {
        society: {
          select: {
            id: true,
            name: true,
            logoUrl: true,
          },
        },
        plannedEvents: {
          orderBy: { startDate: 'asc' },
        },
      },
    });

    // Notify Society of DSA's decision on the edit request
    this.notifySocietyOfYearlyPlanEditResolved(plan.societyId, plan.year, status);

    return updated;
  }

  /**
   * Helper: Dispatches notification to DSA when a Society requests edit access for a yearly plan.
   */
  private async notifyDsaOfYearlyPlanEditRequested(
    planId: string,
    societyName: string,
    year: number,
    reason: string,
  ) {
    try {
      const dsaUsers = await this.prisma.user.findMany({
        where: { role: Role.DSA_ADMIN, isActive: true },
        select: { email: true },
      });

      const dsaEmails = dsaUsers.map((u) => u.email).filter(Boolean);
      if (dsaEmails.length > 0) {
        await this.emailService.sendYearlyPlanEditRequestedToDsaEmail({
          dsaEmails,
          societyName,
          year,
          reason,
          planId,
        });
      }
    } catch (err) {
      console.warn('Failed to notify DSA of yearly plan edit request:', err);
    }
  }

  /**
   * Helper: Dispatches decision notification to the Society when their edit request is resolved.
   */
  private async notifySocietyOfYearlyPlanEditResolved(
    societyId: string,
    year: number,
    status: 'APPROVED' | 'REJECTED',
  ) {
    try {
      const society = await this.prisma.society.findUnique({
        where: { id: societyId },
        include: { user: { select: { email: true } } },
      });

      const targetEmail = society?.email || society?.user?.email;
      if (targetEmail && society) {
        await this.emailService.sendYearlyPlanEditRequestResolvedToSocietyEmail({
          societyEmail: targetEmail,
          societyName: society.name,
          year,
          status,
        });
      }
    } catch (err) {
      console.warn('Failed to notify society of yearly plan edit decision:', err);
    }
  }

  /**
   * Helper: Dispatches notification to society's assigned Faculty Advisor for yearly plan review.
   */
  private async notifyAdvisorOfYearlyPlanSubmission(
    planId: string,
    societyId: string,
    year: number,
    eventsCount: number,
  ) {
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

      if (society?.advisor?.user?.email) {
        await this.emailService.sendYearlyPlanSubmittedForAdvisorEmail({
          advisorEmail: society.advisor.user.email,
          advisorName: society.advisor.user.fullName,
          societyName: society.name,
          year,
          eventsCount,
          planId,
        });
      }
    } catch (err) {
      console.warn('Failed to notify advisor of yearly plan submission:', err);
    }
  }

  /**
   * Helper: Dispatches notification to DSA administration when an annual calendar is approved by Advisor.
   */
  private async notifyDsaOfYearlyPlanForwarded(
    planId: string,
    societyId: string,
    year: number,
    advisorName: string,
  ) {
    try {
      const [dsaUsers, society] = await Promise.all([
        this.prisma.user.findMany({
          where: { role: 'DSA_ADMIN', isActive: true },
          select: { email: true },
        }),
        this.prisma.society.findUnique({ where: { id: societyId } }),
      ]);

      const dsaEmails = dsaUsers.map((u) => u.email).filter(Boolean);
      if (dsaEmails.length > 0 && society) {
        await this.emailService.sendYearlyPlanForwardedToDsaEmail({
          dsaEmails,
          advisorName,
          societyName: society.name,
          year,
          planId,
        });
      }
    } catch (err) {
      console.warn('Failed to notify DSA of yearly plan forwarding:', err);
    }
  }

  /**
   * Helper: Dispatches decision notification to the Society email.
   */
  private async notifySocietyOfYearlyPlanUpdate(
    societyId: string,
    year: number,
    status: 'APPROVED' | 'CHANGES_REQUESTED' | 'FORWARDED_TO_DSA',
    reviewerRole: 'Faculty Advisor' | 'DSA Directorate',
    comments?: string | null,
  ) {
    try {
      const society = await this.prisma.society.findUnique({
        where: { id: societyId },
        include: { user: { select: { email: true } } },
      });

      const targetEmail = society?.email || society?.user?.email;
      if (targetEmail && society) {
        await this.emailService.sendYearlyPlanStatusUpdateToSocietyEmail({
          societyEmail: targetEmail,
          societyName: society.name,
          year,
          status,
          reviewerRole,
          comments,
        });
      }
    } catch (err) {
      console.warn('Failed to notify society of yearly plan update:', err);
    }
  }
}
