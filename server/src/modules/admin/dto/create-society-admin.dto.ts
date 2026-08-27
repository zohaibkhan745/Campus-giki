import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, IsUUID, MaxLength, MinLength, Matches } from 'class-validator';

export class CreateSocietyAdminDto {
  @ApiProperty({ example: 'ACM GIKI Student Chapter' })
  @IsString()
  @MinLength(3, { message: 'Society name must be at least 3 characters' })
  @MaxLength(100, { message: 'Society name cannot exceed 100 characters' })
  @Matches(/^[a-zA-Z\s\-\.,]+$/, { message: 'Society name can only contain letters, spaces, dashes, commas, and dots' })
  name: string;

  @ApiProperty({ example: 'ACM' })
  @IsString()
  @MinLength(2, { message: 'Short form must be at least 2 characters' })
  @MaxLength(20, { message: 'Short form cannot exceed 20 characters' })
  shortform: string;

  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @MinLength(2, { message: 'President name must be at least 2 characters' })
  @MaxLength(100, { message: 'President name cannot exceed 100 characters' })
  @Matches(/^[a-zA-Z\s\-\.,]+$/, { message: 'President name can only contain letters, spaces, dashes, commas, and dots' })
  presidentName: string;

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
