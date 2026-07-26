import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export enum EventTimeType {
  UPCOMING = 'upcoming',
  PAST = 'past',
}

export class QueryAdminEventsDto {
  @ApiPropertyOptional({ example: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Page must be an integer' })
  @Min(1, { message: 'Page must be at least 1' })
  page?: number = 1;

  @ApiPropertyOptional({ example: 10, default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Limit must be an integer' })
  @Min(1, { message: 'Limit must be at least 1' })
  @Max(50, { message: 'Limit cannot exceed 50' })
  limit?: number = 10;

  @ApiPropertyOptional({ example: 'SoftDesk' })
  @IsOptional()
  @IsString()
  society?: string;

  @ApiPropertyOptional({ example: 'technology' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ example: '2026-07-01' })
  @IsOptional()
  @IsString()
  from?: string;

  @ApiPropertyOptional({ example: '2026-07-31' })
  @IsOptional()
  @IsString()
  to?: string;

  @ApiPropertyOptional({ enum: EventTimeType, example: EventTimeType.UPCOMING })
  @IsOptional()
  @IsEnum(EventTimeType, { message: 'Type must be upcoming or past' })
  type?: EventTimeType;

  @ApiPropertyOptional({ example: 'Hackathon' })
  @IsOptional()
  @IsString()
  search?: string;
}
