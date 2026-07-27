import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class SetupSocietyDto {
  @ApiProperty({ example: 'ACM GIKI Student Chapter' })
  @IsString()
  @IsNotEmpty({ message: 'Society name is required' })
  @MinLength(2, { message: 'Society name must be at least 2 characters' })
  @MaxLength(100, { message: 'Society name cannot exceed 100 characters' })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : (value as string),
  )
  name: string;

  @ApiProperty({
    example: 'Premier computing and competitive programming society',
  })
  @IsString()
  @IsNotEmpty({ message: 'Short description is required' })
  @MinLength(10, {
    message: 'Short description must be at least 10 characters',
  })
  @MaxLength(250, {
    message: 'Short description cannot exceed 250 characters',
  })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : (value as string),
  )
  shortDescription: string;

  @ApiProperty({
    example:
      'Association for Computing Machinery GIKI Chapter promoting software innovation, competitive programming, and technical workshops.',
  })
  @IsString()
  @IsNotEmpty({ message: 'Long description is required' })
  @MinLength(20, {
    message: 'Long description must be at least 20 characters',
  })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : (value as string),
  )
  longDescription: string;

  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @IsUUID('4', { message: 'Invalid category selection' })
  @IsNotEmpty({ message: 'Category is required' })
  categoryId: string;

  @ApiPropertyOptional({
    example: 'https://giki.edu.pk/societies/acm-logo.png',
  })
  @Transform(({ value }: { value: unknown }) => (value === '' ? undefined : value))
  @IsOptional()
  @IsUrl({}, { message: 'Logo URL must be a valid URL address' })
  logoUrl?: string;

  @ApiPropertyOptional({
    example: 'https://giki.edu.pk/societies/acm-banner.png',
  })
  @Transform(({ value }: { value: unknown }) => (value === '' ? undefined : value))
  @IsOptional()
  @IsUrl({}, { message: 'Banner URL must be a valid URL address' })
  bannerUrl?: string;

  @ApiPropertyOptional({ example: 'https://instagram.com/acm_giki' })
  @Transform(({ value }: { value: unknown }) => (value === '' ? undefined : value))
  @IsOptional()
  @IsUrl({}, { message: 'Instagram link must be a valid URL address' })
  instagram?: string;

  @ApiPropertyOptional({ example: 'https://facebook.com/acmgiki' })
  @Transform(({ value }: { value: unknown }) => (value === '' ? undefined : value))
  @IsOptional()
  @IsUrl({}, { message: 'Facebook link must be a valid URL address' })
  facebook?: string;

  @ApiPropertyOptional({ example: 'https://linkedin.com/company/acmgiki' })
  @Transform(({ value }: { value: unknown }) => (value === '' ? undefined : value))
  @IsOptional()
  @IsUrl({}, { message: 'LinkedIn link must be a valid URL address' })
  linkedin?: string;

  @ApiPropertyOptional({ example: 'https://acm.giki.edu.pk' })
  @Transform(({ value }: { value: unknown }) => (value === '' ? undefined : value))
  @IsOptional()
  @IsUrl({}, { message: 'Website link must be a valid URL address' })
  website?: string;

  @ApiPropertyOptional({ example: 'acm@giki.edu.pk' })
  @Transform(({ value }: { value: unknown }) => (value === '' ? undefined : value))
  @IsOptional()
  @IsEmail({}, { message: 'Official society email must be a valid email format' })
  email?: string;
}
