import { useInfiniteQuery } from '@tanstack/react-query';
import { feedService } from '@/services/feed.service';
import type { FeedItem, FeedMeta } from '@/types/feed.types';

export function useFeed(limit = 6) {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
    refetch,
  } = useInfiniteQuery({
    queryKey: ['campusFeed', limit],
    queryFn: ({ pageParam = 1 }) => feedService.getFeed({ page: pageParam, limit }),
    getNextPageParam: (lastPage) => (lastPage.meta.hasNextPage ? lastPage.meta.page + 1 : undefined),
    initialPageParam: 1,
  });

  const items = data ? data.pages.flatMap((page) => page.items) : [];
  const meta = data ? data.pages[data.pages.length - 1].meta : null;

  const errorMessage = isError
    ? (error as any)?.response?.data?.message || 'Failed to fetch campus feed. Please try again.'
    : null;

  return {
    items,
    meta,
    isLoading,
    isLoadingMore: isFetchingNextPage,
    error: errorMessage,
    loadMore: () => {
      if (hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    refetch: () => {
      refetch();
    },
  };
}
