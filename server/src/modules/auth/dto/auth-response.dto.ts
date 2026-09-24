import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Role, DsaRole } from '@prisma/client';

export class UserProfileDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id: string;

  @ApiProperty({ example: 'john.doe@giki.edu.pk' })
  email: string;

  @ApiProperty({ example: 'John Doe' })
  fullName: string;

  @ApiPropertyOptional({ example: '/uploads/avatars/avatar-123.webp', nullable: true })
  avatarUrl?: string | null;

  @ApiProperty({ enum: Role, example: Role.STUDENT })
  role: Role;

  @ApiPropertyOptional({ enum: DsaRole, example: DsaRole.DIRECTOR })
  dsaRole?: DsaRole | null;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty({ example: '2026-07-25T23:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2026-07-25T23:00:00.000Z' })
  updatedAt: Date;
}

export class AuthResponseDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'JWT Bearer Access Token',
  })
  accessToken: string;

  @ApiProperty({ type: UserProfileDto })
  user: UserProfileDto;
}
