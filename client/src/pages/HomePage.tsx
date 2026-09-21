import { useFeed } from '@/hooks/useFeed';
import { EventCard } from '@/components/feed/EventCard';
import { PostCard } from '@/components/feed/PostCard';
import { FeedCardSkeleton } from '@/components/feed/FeedCardSkeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';

import { RefreshCw, Sparkles } from 'lucide-react';
import React from 'react';

export const HomePage: React.FC = () => {
  const { items, meta, isLoading, isLoadingMore, isError, rawError, loadMore: fetchNextPage, refetch } = useFeed(12);

  const handleLoadMore = () => {
    fetchNextPage();
  };


  return (
    <div className="bg-transparent text-gray-200 min-h-screen font-inter">
      <div className="w-full max-w-full px-8 sm:px-10 flex justify-center text-left pt-6">

        {/* Left Column: Main Feed */}
        <div className="w-full">
          {/* Page Header */}
          <header className="space-y-2 pb-4 border-b border-white/10 mb-8">
            <h1 className="font-extrabold text-5xl sm:text-6xl text-white tracking-tight leading-tight">
              Campus Feed
            </h1>
            <p className="text-lg text-gray-400">
              Live announcements, events, and student society activities at GIKI.
            </p>
          </header>

          {/* Initial Loading State */}
          {isLoading ? (
            <div className="space-y-8">
              <FeedCardSkeleton />
              <FeedCardSkeleton />
              <FeedCardSkeleton />
            </div>
          ) : isError && items.length === 0 ? (
            /* Primary Connection Error State - Mutually exclusive from Empty State */
            <ErrorState
              error={rawError}
              onRetry={refetch}
              secondaryAction={{
                label: 'View Campus Calendar',
                to: '/events',
              }}
            />
          ) : items.length === 0 ? (
            /* True Empty State */
            <EmptyState
              icon={Sparkles}
              title="Campus Feed is Quiet"
              description="No announcements or society events have been published to the feed yet. Explore upcoming campus events or connect with student societies."
              action={{
                label: 'Upcoming Events',
                to: '/upcoming-events',
              }}
              secondaryAction={{
                label: 'Browse Societies',
                to: '/societies',
              }}
            />
          ) : (
            /* Feed Items Stack */
            <div className="space-y-6">
              {/* If there's an error while older items exist, show an unobtrusive notice */}
              {isError && (
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200 text-xs sm:text-sm flex items-center justify-between gap-3">
                  <span>Unable to refresh latest campus feed. Displaying cached stories.</span>
                  <button
                    onClick={refetch}
                    className="px-3 py-1 bg-amber-500/20 hover:bg-amber-500/30 rounded-lg font-bold text-amber-300 transition-colors cursor-pointer"
                  >
                    Retry
                  </button>
                </div>
              )}
              <div className="cards-container grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 w-full mx-auto">
                {items.map((item) =>
                  item.type === 'event' ? (
                    <EventCard key={`event-${item.id}`} item={item} />
                  ) : (
                    <PostCard key={`post-${item.id}`} item={item} />
                  ),
                )}
              </div>
            </div>
          )}

          {/* Pagination / Load More Button */}
          {meta?.hasNextPage && (
            <div className="pt-6 text-center pb-8">
              <button
                onClick={handleLoadMore}
                disabled={isLoadingMore}
                className="inline-flex items-center gap-3 bg-[rgba(255,255,255,0.08)] backdrop-blur-[12px] border border-[rgba(255,255,255,0.15)] rounded-[12px] px-8 py-3 text-[16px] font-semibold text-white hover:bg-[rgba(255,255,255,0.16)] hover:border-[rgba(255,255,255,0.25)] active:scale-[0.98] disabled:opacity-50 transition-all focus:outline-none cursor-pointer"
              >
                {isLoadingMore ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin text-white" />
                    <span>Loading stories...</span>
                  </>
                ) : (
                  <span>Load More Stories</span>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};









