import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

export enum ReviewDecision {
  APPROVED = 'APPROVED',
  CHANGES_REQUESTED = 'CHANGES_REQUESTED',
}

export class ReviewYearlyPlanDto {
  @ApiProperty({
    enum: ReviewDecision,
    example: ReviewDecision.APPROVED,
    description: 'Review decision: APPROVED or CHANGES_REQUESTED',
  })
  @IsEnum(ReviewDecision, { message: 'Decision must be APPROVED or CHANGES_REQUESTED' })
  decision: ReviewDecision;

  @ApiPropertyOptional({
    example: 'Please adjust planned dates for November events.',
    description: 'Advisor review comments or change instructions',
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000, { message: 'Comments cannot exceed 1000 characters' })
  comment?: string;
}
