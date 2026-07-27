import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { EventApprovalStatus } from '@prisma/client';

export class QueryAdvisorEventsDto {
  @ApiPropertyOptional({ example: 1, description: 'Page number' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ example: 10, description: 'Items per page' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;

  @ApiPropertyOptional({
    enum: EventApprovalStatus,
    description: 'Filter events by approval status',
  })
  @IsOptional()
  @IsEnum(EventApprovalStatus)
  status?: EventApprovalStatus;
}
