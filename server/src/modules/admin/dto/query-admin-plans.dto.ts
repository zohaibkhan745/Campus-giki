import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { PlanStatus } from '@prisma/client';

export class QueryAdminYearlyPlansDto {
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

  @ApiPropertyOptional({ enum: PlanStatus })
  @IsOptional()
  @IsEnum(PlanStatus, { message: 'Status must be a valid PlanStatus enum value' })
  status?: PlanStatus;

  @ApiPropertyOptional({ example: 'PENDING' })
  @IsOptional()
  @IsString()
  editRequestStatus?: string;

  @ApiPropertyOptional({ example: 2026 })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Year must be an integer' })
  year?: number;

  @ApiPropertyOptional({ example: 'SoftDesk' })
  @IsOptional()
  @IsString()
  society?: string;

  @ApiPropertyOptional({ example: 'computing' })
  @IsOptional()
  @IsString()
  search?: string;
}
