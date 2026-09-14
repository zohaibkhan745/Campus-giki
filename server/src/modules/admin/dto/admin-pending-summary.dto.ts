import { ApiProperty } from '@nestjs/swagger';

export class AdminPendingSummaryDto {
  @ApiProperty({ example: 5, description: 'Total pending approvals across events and plans' })
  totalPending: number;

  @ApiProperty({ example: 3, description: 'Total pending events and event edit requests' })
  pendingEventsCount: number;

  @ApiProperty({ example: 2, description: 'Total pending yearly plans and plan edit requests' })
  pendingPlansCount: number;
}
