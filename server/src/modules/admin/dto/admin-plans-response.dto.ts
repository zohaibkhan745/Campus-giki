import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PlanStatus } from '@prisma/client';

export class AdminAdvisorSummaryDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id: string;

  @ApiProperty({ example: 'Faculty Advisor' })
  designation: string;

  @ApiProperty({ example: 'Faculty of Computer Science and Engineering' })
  department: string;

  @ApiProperty({
    example: {
      fullName: 'Dr. Ahsan Ilyas',
      email: 'advisor.softdesk@giki.edu.pk',
    },
  })
  user: {
    fullName: string;
    email: string;
  };
}

export class AdminSocietySummaryDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id: string;

  @ApiProperty({ example: 'ACM GIKI Student Chapter' })
  name: string;

  @ApiPropertyOptional({ example: 'https://giki.edu.pk/logo.png' })
  logoUrl?: string | null;

  @ApiPropertyOptional({ type: AdminAdvisorSummaryDto })
  advisor?: AdminAdvisorSummaryDto | null;
}

export class AdminPlanSummaryItemDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id: string;

  @ApiProperty({ example: 2026 })
  year: number;

  @ApiProperty({ enum: PlanStatus, example: PlanStatus.APPROVED })
  status: PlanStatus;

  @ApiPropertyOptional({ example: 'Approved' })
  advisorComments?: string | null;

  @ApiProperty({ example: '2026-07-25T10:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2026-07-26T12:00:00.000Z' })
  updatedAt: Date;

  @ApiProperty({ example: 12 })
  totalPlannedEvents: number;

  @ApiProperty({ type: AdminSocietySummaryDto })
  society: AdminSocietySummaryDto;
}

export class PaginatedAdminPlansResponseDto {
  @ApiProperty({ type: [AdminPlanSummaryItemDto] })
  items: AdminPlanSummaryItemDto[];

  @ApiProperty({
    example: {
      total: 25,
      page: 1,
      limit: 10,
      totalPages: 3,
      hasNextPage: true,
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
