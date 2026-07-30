import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class FeedSocietyCategoryDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  slug: string;
}

export class FeedSocietyDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiPropertyOptional()
  logoUrl?: string | null;

  @ApiPropertyOptional({ type: () => FeedSocietyCategoryDto })
  category?: FeedSocietyCategoryDto | null;
}

export class FeedItemDto {
  @ApiProperty({ enum: ['event', 'post'] })
  type: 'event' | 'post';

  @ApiProperty()
  id: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty({ type: () => FeedSocietyDto })
  society: FeedSocietyDto;

  // Event specific fields
  @ApiPropertyOptional()
  title?: string;

  @ApiPropertyOptional()
  description?: string;

  @ApiPropertyOptional()
  eventDate?: Date;

  @ApiPropertyOptional()
  startTime?: string;

  @ApiPropertyOptional()
  endTime?: string;

  @ApiPropertyOptional()
  venue?: string;

  @ApiPropertyOptional()
  coverImageUrl?: string | null;

  @ApiPropertyOptional()
  registrationLink?: string | null;

  // Post specific fields
  @ApiPropertyOptional()
  content?: string;

  @ApiPropertyOptional()
  imageUrl?: string | null;

  @ApiPropertyOptional()
  isAdminPost?: boolean;
}

export class FeedMetaDto {
  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  totalPages: number;

  @ApiProperty()
  hasNextPage: boolean;

  @ApiProperty()
  hasPreviousPage: boolean;
}

export class PaginatedFeedResponseDto {
  @ApiProperty({ type: [FeedItemDto] })
  items: FeedItemDto[];

  @ApiProperty({ type: FeedMetaDto })
  meta: FeedMetaDto;
}
