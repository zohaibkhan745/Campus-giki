import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { QueryAdvisorPlansDto } from './dto/query-advisor-plans.dto';
import { PaginatedAdvisorPlansResponseDto } from './dto/advisor-plans-response.dto';
import { Society, Prisma } from '@prisma/client';

@Injectable()
export class AdvisorsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Helper: Resolves and verifies the advisor's assigned society.
   * Throws 403 Forbidden if user is not assigned to any society.
   */
  async getAdvisorAssignedSocieties(userId: string): Promise<Society[]> {
    const advisor = await this.prisma.advisor.findUnique({
      where: { userId },
      include: { societies: true },
    });

    if (!advisor || !advisor.societies || advisor.societies.length === 0) {
      throw new ForbiddenException(
        'Access denied: You are not currently assigned as faculty advisor to any active society profile',
      );
    }

    return advisor.societies;
  }

  /**
   * Retrieves yearly plans belonging ONLY to the advisor's assigned society.
   */
  async getMySocietyYearlyPlans(
    userId: string,
    query: QueryAdvisorPlansDto,
  ): Promise<PaginatedAdvisorPlansResponseDto> {
    const societies = await this.getAdvisorAssignedSocieties(userId);

    const page = Math.max(1, query.page || 1);
    const limit = Math.min(50, Math.max(1, query.limit || 10));
    const skip = (page - 1) * limit;

    const whereClause: Prisma.YearlyPlanWhereInput = {
      societyId: { in: societies.map(s => s.id) },
    };

    if (query.status) {
      whereClause.status = query.status;
    }

    const [total, plans] = await Promise.all([
      this.prisma.yearlyPlan.count({ where: whereClause }),
      this.prisma.yearlyPlan.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { updatedAt: 'desc' },
        include: {
          society: {
            select: {
              id: true,
              name: true,
              logoUrl: true,
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
}
