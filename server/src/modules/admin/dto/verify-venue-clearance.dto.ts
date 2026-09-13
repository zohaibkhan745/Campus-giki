import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export enum VenueClearanceDecision {
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED',
}

export class VerifyVenueClearanceDto {
  @ApiProperty({
    enum: VenueClearanceDecision,
    example: VenueClearanceDecision.VERIFIED,
    description: 'Decision on physical venue clearance: VERIFIED or REJECTED',
  })
  @IsEnum(VenueClearanceDecision, { message: 'Decision must be VERIFIED or REJECTED' })
  status: VenueClearanceDecision;

  @ApiPropertyOptional({
    example: 'PS to Dean signature verified. Lecture Hall allocated.',
    description: 'Optional DSA Admin notes or instructions for re-upload',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
