import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

/**
 * Allowed statuses for society-initiated plan creation.
 * APPROVED and CHANGES_REQUESTED are advisor-only transitions and must never
 * be accepted from a society request, even at the DTO validation layer.
 */
export enum SocietyAllowedPlanStatus {
  DRAFT = 'DRAFT',
  PENDING_ADVISOR = 'PENDING_ADVISOR',
}

export class PlannedEventItemDto {
  @ApiProperty({ example: 'Tech Conference 2026', description: 'Name of the planned event' })
  @IsString()
  @IsNotEmpty()
  eventName: string;

  @ApiProperty({ example: '2026-10-15T00:00:00.000Z', description: 'Start date of the event' })
  @IsDateString()
  @IsNotEmpty()
  startDate: string;

  @ApiProperty({ example: '2026-10-16T00:00:00.000Z', description: 'End date of the event' })
  @IsDateString()
  @IsNotEmpty()
  endDate: string;

  @ApiProperty({ example: 'A two day tech conference...', description: 'Description of the event' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: 'AHA Auditorium', description: 'Venue for the event' })
  @IsString()
  @IsNotEmpty()
  venue: string;

  @ApiProperty({
    description: 'DSA rules/directives for the event',
    required: false,
  })
  @IsString()
  @IsOptional()
  rules?: string;

  @ApiProperty({
    example: 'Bring laptop for workshop.',
    description: 'Society rules and internal guidelines',
    required: false,
  })
  @IsString()
  @IsOptional()
  societyRules?: string;

  @ApiProperty({ example: 'Technical', description: 'Type of event', required: false })
  @IsString()
  @IsOptional()
  eventType?: string;

  @ApiProperty({ example: 'One Day Event', description: 'Duration of the event', required: false })
  @IsString()
  @IsOptional()
  duration?: string;
}

export class CreateYearlyPlanDto {
  @ApiProperty({ example: 2026 })
  @IsInt({ message: 'Year must be a valid integer' })
  @Min(2024, { message: 'Year cannot be before 2024' })
  @Max(2100, { message: 'Invalid year' })
  year: number;

  @ApiPropertyOptional({ enum: SocietyAllowedPlanStatus, default: SocietyAllowedPlanStatus.DRAFT })
  @IsOptional()
  @IsEnum(SocietyAllowedPlanStatus, { message: 'Status must be DRAFT or PENDING_ADVISOR' })
  status?: SocietyAllowedPlanStatus;

  @ApiProperty({ type: [PlannedEventItemDto] })
  @IsArray({ message: 'Events must be an array' })
  @ArrayMinSize(1, { message: 'At least one planned event is required' })
  @ValidateNested({ each: true })
  @Type(() => PlannedEventItemDto)
  events: PlannedEventItemDto[];
}
