import React from 'react';
import { useFeed } from '@/hooks/useFeed';
import { EventCard } from '@/components/feed/EventCard';
import { PostCard } from '@/components/feed/PostCard';
import { FeedCardSkeleton } from '@/components/feed/FeedCardSkeleton';
import { RefreshCw, AlertCircle } from 'lucide-react';

export const HomePage: React.FC = () => {
  const { items, meta, isLoading, isLoadingMore, error, loadMore, refetch } = useFeed(6);

  return (
    <div className="bg-lumen-cream text-vast-ink min-h-screen py-8 font-figtree">
      <div className="max-w-[1200px] mx-auto px-4 md:px-6 space-y-10 text-left">
        {/* Page Header */}
        <header className="space-y-3 border-b-2 border-vast-ink/10 pb-8">
          <h1 className="font-eb-garamond text-heading-lg text-vast-ink leading-tight">
            Campus Feed & Discovery
          </h1>
          <p className="text-body text-vast-ink/80 max-w-2xl">
            Live announcements, upcoming hackathons, sports tournaments, and student society activities at GIKI.
          </p>
        </header>

        {/* Error Callout State */}
        {error && (
          <div className="bg-lumen-cream border-2 border-vast-ink rounded-cards p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-ember-glow shrink-0" />
              <p className="text-[16px] font-medium text-vast-ink">{error}</p>
            </div>
            <button
              onClick={refetch}
              className="inline-flex items-center gap-2 bg-lavender-whisper border-2 border-vast-ink rounded-buttons px-4 py-2 text-sm font-semibold text-vast-ink hover:bg-lumen-stone transition-colors shrink-0"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Retry Feed</span>
            </button>
          </div>
        )}

        {/* Initial Loading State */}
        {isLoading ? (
          <div className="space-y-8">
            <FeedCardSkeleton />
            <FeedCardSkeleton />
            <FeedCardSkeleton />
          </div>
        ) : items.length === 0 ? (
          /* Empty State */
          <div className="bg-lumen-cream border-2 border-vast-ink rounded-cards p-16 text-center space-y-3">
            <h2 className="font-eb-garamond text-heading-sm text-vast-ink">
              Nothing here yet
            </h2>
            <p className="text-fog text-[16px] max-w-md mx-auto">
              Check back soon for new campus events, workshops, and society announcements.
            </p>
          </div>
        ) : (
          /* Feed Items Stack */
          <div className="space-y-8">
            {items.map((item) =>
              item.type === 'event' ? (
                <EventCard key={`event-${item.id}`} item={item} />
              ) : (
                <PostCard key={`post-${item.id}`} item={item} />
              ),
            )}
          </div>
        )}

        {/* Pagination / Load More Button */}
        {meta?.hasNextPage && (
          <div className="pt-6 text-center">
            <button
              onClick={loadMore}
              disabled={isLoadingMore}
              className="inline-flex items-center gap-3 bg-lumen-cream border-2 border-vast-ink rounded-buttons px-8 py-3 text-[16px] font-semibold text-vast-ink hover:bg-lumen-stone disabled:opacity-50 transition-colors focus:outline-none"
            >
              {isLoadingMore ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin text-vast-ink" />
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
  );
};
