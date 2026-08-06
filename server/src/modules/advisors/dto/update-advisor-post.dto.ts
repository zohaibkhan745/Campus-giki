import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { PostApprovalStatus } from '@prisma/client';

export class UpdateAdvisorPostDto {
  @ApiProperty({
    enum: PostApprovalStatus,
    example: PostApprovalStatus.APPROVED,
  })
  @IsEnum(PostApprovalStatus)
  @IsNotEmpty()
  status: PostApprovalStatus;

  @ApiPropertyOptional({
    example: 'Approved for public announcement.',
  })
  @IsOptional()
  @IsString()
  comments?: string;
}
