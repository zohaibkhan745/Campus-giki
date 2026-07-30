import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EventApprovalStatus } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ReviewEventDto {
  @ApiProperty({ enum: EventApprovalStatus })
  @IsEnum(EventApprovalStatus)
  @IsNotEmpty()
  status: EventApprovalStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  comments?: string;
}
