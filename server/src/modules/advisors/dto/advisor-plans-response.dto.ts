import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PlanStatus } from '@prisma/client';

export class AdvisorSocietySummaryDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id: string;

  @ApiProperty({ example: 'ACM GIKI Student Chapter' })
  name: string;

  @ApiPropertyOptional({ example: 'https://giki.edu.pk/logo.png' })
  logoUrl?: string | null;
}

export class AdvisorPlanItemDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id: string;

  @ApiProperty({ example: 2026 })
  year: number;

  @ApiProperty({ enum: PlanStatus, example: PlanStatus.PENDING })
  status: PlanStatus;

  @ApiPropertyOptional({ example: 'Please revise event dates in November' })
  advisorComments?: string | null;

  @ApiProperty({ example: '2026-07-25T10:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2026-07-26T12:00:00.000Z' })
  updatedAt: Date;

  @ApiProperty({ example: 8 })
  totalPlannedEvents: number;

  @ApiProperty({ type: AdvisorSocietySummaryDto })
  society: AdvisorSocietySummaryDto;
}

export class PaginatedAdvisorPlansResponseDto {
  @ApiProperty({ type: [AdvisorPlanItemDto] })
  items: AdvisorPlanItemDto[];

  @ApiProperty({
    example: {
      total: 1,
      page: 1,
      limit: 10,
      totalPages: 1,
      hasNextPage: false,
      hasPreviousPage: false,
    },
  })
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}
