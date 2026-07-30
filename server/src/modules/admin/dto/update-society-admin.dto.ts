import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';

export class UpdateSocietyAdminDto {
  @ApiPropertyOptional({ example: 'ACM GIKI Student Chapter' })
  @IsOptional()
  @IsString()
  @MinLength(3, { message: 'Society name must be at least 3 characters' })
  @MaxLength(100, { message: 'Society name cannot exceed 100 characters' })
  name?: string;

  @ApiPropertyOptional({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @IsOptional()
  @IsUUID('4', { message: 'Category ID must be a valid UUID' })
  categoryId?: string;

  @ApiPropertyOptional({ example: 'b2c3d4e5-f6a7-8901-bcde-f12345678901' })
  @IsOptional()
  @IsUUID('4', { message: 'Advisor ID must be a valid UUID' })
  advisorId?: string | null;
}
