import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { EventApprovalStatus } from '@prisma/client';

export class UpdateAdvisorEventDto {
  @ApiProperty({
    enum: EventApprovalStatus,
    example: EventApprovalStatus.PUBLISHED,
  })
  @IsEnum(EventApprovalStatus)
  @IsNotEmpty()
  status: EventApprovalStatus;

  @ApiPropertyOptional({
    example: 'Please provide more details on the venue logistics.',
  })
  @IsOptional()
  @IsString()
  comments?: string;
}
