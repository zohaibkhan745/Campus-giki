import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';

/**
 * Allowed statuses for society-initiated plan creation.
 * APPROVED and CHANGES_REQUESTED are advisor-only transitions and must never
 * be accepted from a society request, even at the DTO validation layer.
 */
export enum SocietyAllowedPlanStatus {
  DRAFT = 'DRAFT',
  PENDING = 'PENDING',
}

export class PlannedEventItemDto {
  @ApiProperty({ example: 'SoftDesk Annual Hackathon' })
  @IsString()
  @IsNotEmpty({ message: 'Event name is required' })
  @MinLength(2, { message: 'Event name must be at least 2 characters' })
  eventName: string;

  @ApiProperty({ example: '2026-11-15' })
  @IsDateString({}, { message: 'Planned date must be a valid ISO date' })
  @IsNotEmpty({ message: 'Planned date is required' })
  plannedDate: string;

  @ApiPropertyOptional({ example: 'Budget approval pending from DSA' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreateYearlyPlanDto {
  @ApiProperty({ example: 2026 })
  @IsInt({ message: 'Year must be a valid integer' })
  @Min(2024, { message: 'Year cannot be before 2024' })
  @Max(2100, { message: 'Invalid year' })
  year: number;

  @ApiPropertyOptional({ enum: SocietyAllowedPlanStatus, default: SocietyAllowedPlanStatus.DRAFT })
  @IsOptional()
  @IsEnum(SocietyAllowedPlanStatus, { message: 'Status must be DRAFT or PENDING' })
  status?: SocietyAllowedPlanStatus;

  @ApiProperty({ type: [PlannedEventItemDto] })
  @IsArray({ message: 'Events must be an array' })
  @ArrayMinSize(1, { message: 'At least one planned event is required' })
  @ValidateNested({ each: true })
  @Type(() => PlannedEventItemDto)
  events: PlannedEventItemDto[];
}
