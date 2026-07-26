import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';

export class CreateSocietyAdminDto {
  @ApiProperty({ example: 'ACM GIKI Student Chapter' })
  @IsString()
  @MinLength(3, { message: 'Society name must be at least 3 characters' })
  @MaxLength(100, { message: 'Society name cannot exceed 100 characters' })
  name: string;

  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @IsUUID('4', { message: 'Category ID must be a valid UUID' })
  categoryId: string;

  @ApiProperty({ example: 'president.acm@giki.edu.pk' })
  @IsEmail({}, { message: 'President email must be a valid email address' })
  presidentEmail: string;

  @ApiProperty({ example: 'b2c3d4e5-f6a7-8901-bcde-f12345678901' })
  @IsUUID('4', { message: 'Advisor ID must be a valid UUID' })
  advisorId: string;
}
