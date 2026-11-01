import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateEventDto {
  @ApiPropertyOptional({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Host Society UUID (required when created by DSA Admin, optional for societies)',
  })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) =>
    !value || value === '' || value === null || value === 'undefined' ? undefined : value,
  )
  @IsUUID('all', { message: 'Society ID must be a valid UUID' })
  societyId?: string;

  @ApiProperty({ example: 'GIKI SoftDesk Hackathon 2026' })
  @IsString()
  @IsNotEmpty({ message: 'Event title is required' })
  @MinLength(3, { message: 'Event title must be at least 3 characters' })
  @MaxLength(150, { message: 'Event title cannot exceed 150 characters' })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : (value as string),
  )
  title: string;

  @ApiProperty({
    example:
      'Annual 48-hour competitive software development and hackathon event hosted by ACM GIKI Chapter.',
  })
  @IsString()
  @IsNotEmpty({ message: 'Event description is required' })
  @MinLength(10, { message: 'Event description must be at least 10 characters' })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : (value as string),
  )
  description: string;

  @ApiProperty({ example: '2026-11-15' })
  @IsDateString({}, { message: 'Event date must be a valid ISO date string' })
  @IsNotEmpty({ message: 'Event date is required' })
  eventDate: string;

  @ApiProperty({ example: '09:00', description: 'Start time in 24h HH:mm format' })
  @IsString()
  @IsNotEmpty({ message: 'Start time is required' })
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'Start time must be in HH:mm format (e.g. 09:00 or 14:30)',
  })
  startTime: string;

  @ApiProperty({ example: '17:00', description: 'End time in 24h HH:mm format' })
  @IsString()
  @IsNotEmpty({ message: 'End time is required' })
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'End time must be in HH:mm format (e.g. 17:00 or 18:30)',
  })
  endTime: string;

  @ApiProperty({ example: 'Agha Hasan Abedi Auditorium' })
  @IsString()
  @IsNotEmpty({ message: 'Venue location is required' })
  @MinLength(2, { message: 'Venue must be at least 2 characters' })
  @MaxLength(100, { message: 'Venue cannot exceed 100 characters' })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : (value as string),
  )
  venue: string;

  @ApiPropertyOptional({
    example: 'https://giki.edu.pk/events/softdesk-banner.png',
  })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) => (value === '' ? undefined : value))
  @IsString()
  coverImageUrl?: string;

  @ApiPropertyOptional({
    example: 'https://giki.edu.pk/events/promo-video.mp4',
  })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) => (value === '' ? undefined : value))
  @IsString()
  videoUrl?: string;

  @ApiPropertyOptional({
    example: 'https://forms.gle/sampleRegistrationFormId',
  })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) => (value === '' ? undefined : value))
  @IsUrl({}, { message: 'Registration Link must be a valid URL address' })
  registrationLink?: string;

  @ApiPropertyOptional({
    example: false,
    description: 'Submit event for advisor & DSA approval instead of direct publishing',
  })
  @IsOptional()
  @IsBoolean()
  submitForApproval?: boolean;

  @ApiPropertyOptional({ example: 'Lecture/Seminar' })
  @IsOptional()
  @IsString()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : (value as string),
  )
  eventType?: string;

  @ApiPropertyOptional({ example: 'Jane Doe' })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' && value.trim() === ''
      ? undefined
      : typeof value === 'string'
        ? value.trim()
        : (value as string),
  )
  @IsString()
  @Matches(/^[a-zA-Z\s.,-]+$/, {
    message: 'Name can only contain alphabets, spaces, dots, commas, and dashes',
  })
  inChargeName?: string;

  @ApiPropertyOptional({ example: '2022000' })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' && value.trim() === ''
      ? undefined
      : typeof value === 'string'
        ? value.trim()
        : (value as string),
  )
  @IsString()
  @Matches(/^\d{7}$/, { message: 'Registration number must be exactly 7 digits' })
  inChargeRegNum?: string;

  @ApiPropertyOptional({ example: '03001234567' })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' && value.trim() === ''
      ? undefined
      : typeof value === 'string'
        ? value.trim()
        : (value as string),
  )
  @IsString()
  @Matches(/^\d{11}$/, { message: 'Contact number must be exactly 11 digits' })
  inChargeContact?: string;
}
