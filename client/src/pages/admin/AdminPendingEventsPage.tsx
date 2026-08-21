import React from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { adminService } from '@/services/admin.service';
import { BannerHeader } from '@/components/layout/BannerHeader';
import { Shield } from 'lucide-react';
import { EventGrid } from '@/components/admin/FlippableAdminEventCard';
import { Alert } from '@/components/ui/Alert';

export const AdminPendingEventsPage: React.FC = () => {
  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useInfiniteQuery({
    queryKey: ['adminPendingEvents'],
    initialPageParam: 1,
    queryFn: ({ pageParam = 1 }) => adminService.getAllEvents({
      page: pageParam,
      limit: 10,
      status: 'PENDING_ADMIN'
    }),
    getNextPageParam: (lastPage) => {
      if (lastPage.meta.page < lastPage.meta.totalPages) {
        return lastPage.meta.page + 1;
      }
      return undefined;
    }
  });

  const pendingEvents = (data as any)?.pages?.flatMap((page: any) => page.items) || [];

  return (
    <div className="flex flex-col min-h-screen bg-[#0f1115]">
      <BannerHeader title="Pending Reviews" subtitle="Manage and review all society events awaiting approval" />
      
      <main className="flex-1 w-full max-w-[1400px] mx-auto px-4 md:px-8 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Shield className="w-8 h-8 text-amber-500" />
          <h2 className="text-2xl font-bold text-white">Action Required</h2>
        </div>

        {isError && (
          <Alert variant="error" className="mb-6" message="Failed to load pending events. Please try again." />
        )}

        {isLoading && pendingEvents.length === 0 ? (
          <div className="flex justify-center items-center h-64">
            <div className="w-12 h-12 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin"></div>
          </div>
        ) : pendingEvents.length === 0 ? (
          <div className="bg-white/[0.05] border border-white/10 rounded-2xl p-12 text-center flex flex-col items-center">
            <Shield className="w-16 h-16 text-white/20 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">You're all caught up!</h3>
            <p className="text-gray-400 max-w-md mx-auto">There are no events currently waiting for your review.</p>
          </div>
        ) : (
          <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6">
            <EventGrid events={pendingEvents} />
            
            {hasNextPage && (
              <div className="mt-8 flex justify-center">
                <button
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                  className="px-8 py-3 bg-white/[0.08] hover:bg-white/[0.12] border border-white/20 rounded-xl text-white font-semibold transition-colors flex items-center gap-2"
                >
                  {isFetchingNextPage ? 'Loading...' : 'Load More Pending Events'}
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};
