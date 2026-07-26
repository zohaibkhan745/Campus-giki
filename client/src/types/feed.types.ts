export interface FeedSocietyCategory {
  id: string;
  name: string;
  slug: string;
}

export interface FeedSociety {
  id: string;
  name: string;
  logoUrl?: string | null;
  category?: FeedSocietyCategory | null;
}

export interface EventFeedItem {
  type: 'event';
  id: string;
  createdAt: string;
  society: FeedSociety;
  title: string;
  description: string;
  eventDate: string;
  startTime: string;
  endTime: string;
  venue: string;
  coverImageUrl?: string | null;
  registrationLink?: string | null;
}

export interface PostFeedItem {
  type: 'post';
  id: string;
  createdAt: string;
  society: FeedSociety;
  content: string;
  imageUrl?: string | null;
}

export type FeedItem = EventFeedItem | PostFeedItem;

export interface FeedMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginatedFeedResponse {
  items: FeedItem[];
  meta: FeedMeta;
}

export interface FeedQueryParams {
  page?: number;
  limit?: number;
}
