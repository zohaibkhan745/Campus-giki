import { useState, useEffect, useCallback } from 'react';
import { feedService } from '@/services/feed.service';
import type { FeedItem, FeedMeta } from '@/types/feed.types';

export function useFeed(limit = 6) {
  const [items, setItems] = useState<FeedItem[]>([]);
  const [meta, setMeta] = useState<FeedMeta | null>(null);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFeed = useCallback(async (targetPage: number, isLoadMore = false) => {
    try {
      if (isLoadMore) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      const response = await feedService.getFeed({ page: targetPage, limit });

      const newItems = response?.items || [];
      const newMeta = response?.meta || null;

      setItems((prev) => (isLoadMore ? [...prev, ...newItems] : newItems));
      setMeta(newMeta);
      setPage(targetPage);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to fetch campus feed. Please try again.');
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchFeed(1, false);
  }, [fetchFeed]);

  const loadMore = () => {
    if (meta?.hasNextPage && !isLoadingMore) {
      fetchFeed(page + 1, true);
    }
  };

  const refetch = () => {
    fetchFeed(1, false);
  };

  return {
    items,
    meta,
    isLoading,
    isLoadingMore,
    error,
    loadMore,
    refetch,
  };
}
