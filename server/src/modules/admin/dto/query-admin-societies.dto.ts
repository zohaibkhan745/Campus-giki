import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export enum AdminSocietyStatus {
  ACTIVE = 'ACTIVE',
  UNCONFIGURED = 'UNCONFIGURED',
  INACTIVE = 'INACTIVE',
}

export class QueryAdminSocietiesDto {
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

  @ApiPropertyOptional({ example: 'technology' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ enum: AdminSocietyStatus })
  @IsOptional()
  @IsEnum(AdminSocietyStatus, { message: 'Status must be ACTIVE, UNCONFIGURED, or INACTIVE' })
  status?: AdminSocietyStatus;

  @ApiPropertyOptional({ example: 'SoftDesk' })
  @IsOptional()
  @IsString()
  search?: string;
}
