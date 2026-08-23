import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OrganizationType } from '@prisma/client';
import { MinimalCategoryDto } from './public-society-response.dto';

export class PublicSocietyDetailResponseDto {
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

  @ApiPropertyOptional({ example: 'Abdullah Zia' })
  presidentName?: string | null;

  @ApiPropertyOptional({ example: 'FCSE' })
  presidentFaculty?: string | null;

  @ApiPropertyOptional()
  advisor?: { department?: string | null; user?: { fullName?: string | null } } | null;

  @ApiPropertyOptional({ type: MinimalCategoryDto })
  category?: MinimalCategoryDto | null;
}


