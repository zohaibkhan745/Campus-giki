import { useFeed } from '@/hooks/useFeed';
import { BannerHeader } from '@/components/layout/BannerHeader';
import { EventCard } from '@/components/feed/EventCard';
import { PostCard } from '@/components/feed/PostCard';
import { FeedCardSkeleton } from '@/components/feed/FeedCardSkeleton';
import { HomeSidebar } from '@/components/feed/HomeSidebar';
import { RefreshCw, AlertCircle } from 'lucide-react';

export const HomePage: React.FC = () => {
  const { items, meta, isLoading, isLoadingMore, error, loadMore, refetch } = useFeed(4);

  return (
    <div className="bg-transparent text-gray-200 min-h-screen font-inter">
      <BannerHeader title="Campus Feed" subtitle="Live announcements, events, and student society activities at GIKI." />
      <div className="max-w-7xl mx-auto px-4 flex justify-center gap-10 text-left pt-6">

        {/* Left Column: Main Feed */}
        <div className="flex-1 min-w-0 max-w-[850px] space-y-6">

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
            <div className="space-y-2">
              {items.map((item) =>
                item.type === 'event' ? (
                  <EventCard key={`event-${item.id}`} item={item} allowExpand />
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
                className="inline-flex items-center gap-3 bg-[#17181c] border border-white/10 rounded-xl px-8 py-3 text-[16px] font-semibold text-white hover:bg-white/10 disabled:opacity-50 transition-colors focus:outline-none"
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

        {/* Right Column: Sidebar */}
        <div className="hidden lg:block w-[350px] shrink-0">
          <HomeSidebar />
        </div>
      </div>
    </div>
  );
};
