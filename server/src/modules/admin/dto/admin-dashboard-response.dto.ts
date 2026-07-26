import { ApiProperty } from '@nestjs/swagger';

export class AdminDashboardStatisticsDto {
  @ApiProperty({ example: 12 })
  totalSocieties: number;

  @ApiProperty({ example: 10 })
  activeSocieties: number;

  @ApiProperty({ example: 1 })
  unconfiguredSocieties: number;

  @ApiProperty({ example: 1 })
  inactiveSocieties: number;

  @ApiProperty({ example: 3 })
  pendingYearlyPlans: number;

  @ApiProperty({ example: 8 })
  approvedPlans: number;

  @ApiProperty({ example: 5 })
  eventsThisMonth: number;

  @ApiProperty({ example: 14 })
  upcomingEvents: number;
}

export class AdminDashboardResponseDto {
  @ApiProperty({ type: AdminDashboardStatisticsDto })
  statistics: AdminDashboardStatisticsDto;

  @ApiProperty()
  pendingPlansPreview: any[];

  @ApiProperty()
  upcomingEventsPreview: any[];
}
