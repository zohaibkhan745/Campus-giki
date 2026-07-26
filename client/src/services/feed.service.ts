import { api } from '@/lib/api';
import type { FeedQueryParams, PaginatedFeedResponse } from '@/types/feed.types';

export const feedService = {
  getFeed: async (params?: FeedQueryParams): Promise<PaginatedFeedResponse> => {
    return api.get('/feed', { params });
  },
};
