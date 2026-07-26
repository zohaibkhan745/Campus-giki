import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PlanStatus } from '@prisma/client';

export class PlannedEventResponseDto {
  @ApiProperty({ example: 'plan-event-uuid-1234' })
  id: string;

  @ApiProperty({ example: 'SoftDesk Annual Hackathon' })
  eventName: string;

  @ApiProperty({ example: '2026-11-15T00:00:00.000Z' })
  plannedDate: Date;

  @ApiPropertyOptional({ example: 'Budget approval pending from DSA' })
  notes?: string | null;

  @ApiProperty({ example: 'plan-uuid-5678' })
  yearlyPlanId: string;

  @ApiProperty({ example: '2026-07-26T00:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2026-07-26T00:00:00.000Z' })
  updatedAt: Date;
}

export class YearlyPlanResponseDto {
  @ApiProperty({ example: 'plan-uuid-5678' })
  id: string;

  @ApiProperty({ example: 2026 })
  year: number;

  @ApiProperty({ enum: PlanStatus, example: PlanStatus.DRAFT })
  status: PlanStatus;

  @ApiPropertyOptional({ example: 'Please update event dates to avoid midterm exams.' })
  advisorComments?: string | null;

  @ApiProperty({ example: 'society-uuid-1234' })
  societyId: string;

  @ApiProperty({ type: [PlannedEventResponseDto] })
  plannedEvents: PlannedEventResponseDto[];

  @ApiProperty({ example: '2026-07-26T00:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2026-07-26T00:00:00.000Z' })
  updatedAt: Date;
}
