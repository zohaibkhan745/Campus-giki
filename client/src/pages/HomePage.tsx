import { useFeed } from '@/hooks/useFeed';
import { EventCard } from '@/components/feed/EventCard';
import { PostCard } from '@/components/feed/PostCard';
import { FeedCardSkeleton } from '@/components/feed/FeedCardSkeleton';

import { RefreshCw, AlertCircle } from 'lucide-react';

export const HomePage: React.FC = () => {
  const { items, meta, isLoading, isLoadingMore, error, loadMore, refetch } = useFeed(4);

  return (
    <div className="bg-transparent text-gray-200 min-h-screen font-inter">
      <div className="w-full max-w-full px-6 flex justify-center text-left pt-6">

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

          {/* Error Callout State */}
          {error && (
            <div className="bg-[#17181c]/80 backdrop-blur-md border border-white/10 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-6 h-6 text-red-400 shrink-0" />
                <p className="text-[16px] font-medium text-white">{error}</p>
              </div>
              <button
                onClick={refetch}
                className="inline-flex items-center gap-2 bg-[#2c2f38] border border-white/10 rounded-xl px-4 py-2 text-sm font-semibold text-white hover:bg-white/10 transition-colors shrink-0"
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
            <div className="bg-[#17181c]/80 backdrop-blur-md border border-white/10 rounded-2xl p-16 text-center space-y-3 shadow-xl">
              <h2 className="font-semibold text-2xl text-white">
                Nothing here yet
              </h2>
              <p className="text-gray-400 text-[16px] max-w-md mx-auto">
                Check back soon for new campus events, workshops, and society announcements.
              </p>
            </div>
          ) : (
            /* Feed Items Stack */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 justify-items-center">
              {items.map((item) =>
                item.type === 'event' ? (
                  <EventCard key={`event-${item.id}`} item={item}  />
                ) : (
                  <PostCard key={`post-${item.id}`} item={item} />
                ),
              )}
            </div>
          )}

          {/* Pagination / Load More Button */}
          {meta?.hasNextPage && (
            <div className="pt-6 text-center pb-8">
              <button
                onClick={loadMore}
                disabled={isLoadingMore}
                className="inline-flex items-center gap-3 bg-[rgba(255,255,255,0.08)] backdrop-blur-[12px] border border-[rgba(255,255,255,0.15)] rounded-[12px] px-8 py-3 text-[16px] font-semibold text-white hover:bg-[rgba(255,255,255,0.16)] hover:border-[rgba(255,255,255,0.25)] disabled:opacity-50 transition-all focus:outline-none"
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





