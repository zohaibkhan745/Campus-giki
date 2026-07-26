import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SocietyResponseDto } from './society-response.dto';
import { EventResponseDto } from '../../events/dto/event-response.dto';

export class DashboardStatisticsDto {
  @ApiProperty({ example: 12 })
  totalEvents: number;

  @ApiProperty({ example: 4 })
  upcomingEvents: number;

  @ApiProperty({ example: 8 })
  pastEvents: number;
}

export class YearlyPlanSummaryDto {
  @ApiProperty({ example: 5 })
  totalEventsInPlan: number;

  @ApiProperty({ example: 'NOT_STARTED' })
  status: string;
}

export class SocietyDashboardResponseDto {
  @ApiPropertyOptional({ type: SocietyResponseDto })
  profile: SocietyResponseDto | null;

  @ApiProperty({ type: DashboardStatisticsDto })
  statistics: DashboardStatisticsDto;

  @ApiProperty({ type: [EventResponseDto] })
  upcomingEvents: EventResponseDto[];

  @ApiProperty({ type: [EventResponseDto] })
  recentEvents: EventResponseDto[];

  @ApiProperty({ type: YearlyPlanSummaryDto })
  yearlyPlanSummary: YearlyPlanSummaryDto;
}
