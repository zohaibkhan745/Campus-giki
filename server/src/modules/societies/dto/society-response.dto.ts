import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OrganizationType } from '@prisma/client';
import { CategoryResponseDto } from '../../categories/dto/category-response.dto';

export class SocietyResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id: string;

  @ApiProperty({ example: 'ACM GIKI Student Chapter' })
  name: string;

  @ApiProperty({ enum: OrganizationType, example: 'SOCIETY' })
  type: OrganizationType;

  @ApiPropertyOptional({ example: 'Premier computing society' })
  shortDescription?: string | null;

  @ApiPropertyOptional({ example: 'Association for Computing Machinery GIKI Chapter...' })
  longDescription?: string | null;

  @ApiPropertyOptional({ example: 'https://giki.edu.pk/societies/acm-logo.png' })
  logoUrl?: string | null;

  @ApiPropertyOptional({ example: 'https://giki.edu.pk/societies/acm-banner.png' })
  bannerUrl?: string | null;

  @ApiPropertyOptional({ example: 'https://instagram.com/acm_giki' })
  instagram?: string | null;

  @ApiPropertyOptional({ example: 'https://facebook.com/acmgiki' })
  facebook?: string | null;

  @ApiPropertyOptional({ example: 'https://linkedin.com/company/acmgiki' })
  linkedin?: string | null;

  @ApiPropertyOptional({ example: 'https://acm.giki.edu.pk' })
  website?: string | null;

  @ApiPropertyOptional({ example: 'acm@giki.edu.pk' })
  email?: string | null;

  @ApiProperty({ example: true })
  isSetupComplete: boolean;

  @ApiProperty({ example: 'user-uuid-1234' })
  userId: string;

  @ApiPropertyOptional({ example: 'advisor-uuid-5678' })
  advisorId?: string | null;

  @ApiPropertyOptional({ type: CategoryResponseDto })
  category?: CategoryResponseDto | null;

  @ApiPropertyOptional()
  advisor?: {
    id: string;
    designation: string;
    department: string;
    user?: {
      fullName: string;
      email: string;
    } | null;
  } | null;

  @ApiProperty({ example: '2026-07-26T00:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2026-07-26T00:00:00.000Z' })
  updatedAt: Date;
}
