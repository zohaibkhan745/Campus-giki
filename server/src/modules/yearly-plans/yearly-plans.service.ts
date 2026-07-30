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
import { PlanStatus, Society } from '@prisma/client';

@Injectable()
export class YearlyPlansService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Helper: Validates that the authenticated user owns an active setup society.
   */
  private async validateSocietyOwnership(userId: string): Promise<Society> {
    const society = await this.prisma.society.findUnique({
      where: { userId },
    });

    if (!society || !society.isSetupComplete) {
      throw new ForbiddenException(
        'Access denied: You must complete your society profile setup before managing yearly calendar plans',
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

    return this.prisma.$transaction(async (tx) => {
      const plan = await tx.yearlyPlan.create({
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

      return plan;
    });
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

    // State Machine Guards
    if (plan.status === PlanStatus.APPROVED) {
      throw new ForbiddenException(
        'Cannot modify an APPROVED yearly plan. Approved plans are permanently read-only.',
      );
    }

    if (plan.status === PlanStatus.PENDING && !dto.status) {
      throw new ForbiddenException(
        'Cannot edit a plan that is currently PENDING review by your faculty advisor.',
      );
    }

    return this.prisma.$transaction(async (tx) => {
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
  }

  /**
   * Advisor Review Workflow: Approves or requests changes for a submitted plan.
   */
  async reviewYearlyPlan(
    planId: string,
    userId: string,
    dto: ReviewYearlyPlanDto,
  ): Promise<YearlyPlanResponseDto> {
    const plan = await this.prisma.yearlyPlan.findUnique({
      where: { id: planId },
      include: {
        society: {
          include: {
            advisor: true,
          },
        },
      },
    });

    if (!plan) {
      throw new NotFoundException(`Yearly plan with ID '${planId}' was not found`);
    }

    // Ownership Guard: Advisor must be assigned to this society
    if (!plan.society.advisor || plan.society.advisor.userId !== userId) {
      throw new ForbiddenException(
        'Access denied: You are not the assigned faculty advisor for this society',
      );
    }

    // Workflow State Guards
    if (plan.status === PlanStatus.APPROVED) {
      throw new BadRequestException(
        'This yearly plan has already been approved and is locked against further review decisions.',
      );
    }

    if (plan.status === PlanStatus.DRAFT) {
      throw new BadRequestException(
        'Cannot review a DRAFT plan until it is formally submitted by the society.',
      );
    }

    const newStatus =
      dto.decision === ReviewDecision.APPROVED ? PlanStatus.APPROVED : PlanStatus.CHANGES_REQUESTED;

    let newAdvisorComments = plan.advisorComments;
    if (dto.comment && dto.comment.trim() !== '') {
      const dateStr = new Date().toLocaleDateString('en-US', { 
        month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' 
      });
      const formattedComment = `[${dateStr}] ${newStatus}:\n${dto.comment.trim()}`;
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

    return updated;
  }
}
