import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { OrganizationType } from '@prisma/client';

export class QuerySocietiesDto {
  @ApiPropertyOptional({ example: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Page must be an integer' })
  @Min(1, { message: 'Page must be at least 1' })
  page?: number = 1;

  @ApiPropertyOptional({ example: 12, default: 12 })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Limit must be an integer' })
  @Min(1, { message: 'Limit must be at least 1' })
  @Max(200, { message: 'Limit cannot exceed 200' })
  limit?: number = 12;

  @ApiPropertyOptional({ example: 'technology' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ enum: OrganizationType, example: 'SOCIETY' })
  @IsOptional()
  @IsEnum(OrganizationType, { message: 'Invalid organization type' })
  type?: OrganizationType;

  @ApiPropertyOptional({ example: 'computing' })
  @IsOptional()
  @IsString()
  search?: string;
}
