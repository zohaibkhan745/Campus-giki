import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class MinimalSocietyDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id: string;

  @ApiProperty({ example: 'ACM GIKI Student Chapter' })
  name: string;

  @ApiPropertyOptional({ example: 'https://giki.edu.pk/societies/acm-logo.png' })
  logoUrl?: string | null;
}

export class EventResponseDto {
  @ApiProperty({ example: 'e1f2g3h4-i5j6-7890-abcd-ef1234567890' })
  id: string;

  @ApiProperty({ example: 'GIKI SoftDesk Hackathon 2026' })
  title: string;

  @ApiProperty({
    example:
      'Annual 48-hour competitive software development and hackathon event hosted by ACM GIKI Chapter.',
  })
  description: string;

  @ApiProperty({ example: '2026-11-15T00:00:00.000Z' })
  eventDate: Date;

  @ApiProperty({ example: '09:00' })
  startTime: string;

  @ApiProperty({ example: '17:00' })
  endTime: string;

  @ApiProperty({ example: 'Agha Hasan Abedi Auditorium' })
  venue: string;

  @ApiPropertyOptional({
    example: 'https://giki.edu.pk/events/softdesk-banner.png',
  })
  coverImageUrl?: string | null;

  @ApiPropertyOptional({
    example: 'https://forms.gle/sampleRegistrationFormId',
  })
  registrationLink?: string | null;

  @ApiProperty({ example: true })
  isPublished: boolean;

  @ApiPropertyOptional({ example: 'Lecture/Seminar' })
  eventType?: string | null;

  @ApiPropertyOptional({ example: 'Jane Doe' })
  inChargeName?: string | null;

  @ApiPropertyOptional({ example: '2022000' })
  inChargeRegNum?: string | null;

  @ApiPropertyOptional({ example: '+923001234567' })
  inChargeContact?: string | null;

  @ApiProperty({ example: 'PUBLISHED' })
  approvalStatus: string;

  @ApiPropertyOptional({ example: 'PENDING' })
  editRequestStatus?: string | null;

  @ApiPropertyOptional({ example: 'Society requested edit access' })
  editRequestReason?: string | null;

  @ApiPropertyOptional({ example: 'Approved by Advisor' })
  advisorComments?: string | null;

  @ApiPropertyOptional({ example: 'Approved by DSA' })
  dsaComments?: string | null;

  @ApiPropertyOptional({ example: 'ADVISOR' })
  lastChangeRequestBy?: string | null;

  @ApiPropertyOptional()
  advisorApprovedAt?: Date | null;

  @ApiPropertyOptional()
  dsaApprovedAt?: Date | null;

  @ApiPropertyOptional({ example: 'PENDING_UPLOAD' })
  venueClearanceStatus?: string | null;

  @ApiPropertyOptional({ example: '/uploads/venue-slips/signed-slip-123.webp' })
  signedVenueSlipUrl?: string | null;

  @ApiPropertyOptional()
  venueSlipUploadedAt?: Date | null;

  @ApiPropertyOptional()
  venueClearanceVerifiedAt?: Date | null;

  @ApiPropertyOptional({ example: 'PS to Dean signature verified.' })
  venueClearanceNotes?: string | null;

  @ApiProperty({ example: 'society-uuid-1234' })
  societyId: string;

  @ApiPropertyOptional({ type: MinimalSocietyDto })
  society?: MinimalSocietyDto;

  @ApiProperty({ example: '2026-07-26T00:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2026-07-26T00:00:00.000Z' })
  updatedAt: Date;
}
