import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OrganizationType } from '@prisma/client';

export class MinimalCategoryDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id: string;

  @ApiProperty({ example: 'Technology' })
  name: string;

  @ApiProperty({ example: 'technology' })
  slug: string;
}

export class PublicSocietyItemDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id: string;

  @ApiProperty({ example: 'ACM GIKI Student Chapter' })
  name: string;

  @ApiProperty({ enum: OrganizationType, example: 'SOCIETY' })
  type: OrganizationType;

  @ApiPropertyOptional({ example: 'Premier computing society' })
  shortDescription?: string | null;

  @ApiPropertyOptional({ example: 'https://giki.edu.pk/societies/acm-logo.png' })
  logoUrl?: string | null;

  @ApiPropertyOptional({ example: '[]' })
  executiveCouncil?: string | null;

  @ApiPropertyOptional({ example: 'John Doe' })
  presidentName?: string | null;

  @ApiPropertyOptional({ type: MinimalCategoryDto })
  category?: MinimalCategoryDto | null;
}

export class PaginationMetaDto {
  @ApiProperty({ example: 45 })
  total: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 12 })
  limit: number;

  @ApiProperty({ example: 4 })
  totalPages: number;

  @ApiProperty({ example: true })
  hasNextPage: boolean;

  @ApiProperty({ example: false })
  hasPreviousPage: boolean;
}

export class PaginatedSocietiesResponseDto {
  @ApiProperty({ type: [PublicSocietyItemDto] })
  items: PublicSocietyItemDto[];

  @ApiProperty({ type: PaginationMetaDto })
  meta: PaginationMetaDto;
}
