import React, { useState } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { Loader2, Calendar } from 'lucide-react';
import { eventService } from '@/services/event.service';
import { EventCard } from '@/components/feed/EventCard';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';

export const UpcomingEventsPage: React.FC = () => {
  const [visibleEventsCount, setVisibleEventsCount] = useState(8);

  const { data: listEventsData, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['events', 'upcoming'],
    queryFn: () => eventService.getAllPublicEvents({ from: new Date().toISOString(), limit: 50, page: 1 }),
    placeholderData: keepPreviousData,
  });

  const eventsList = listEventsData?.items || [];
  const visibleEvents = eventsList.slice(0, visibleEventsCount);

  return (
    <div className="min-h-screen text-white flex justify-center py-6 px-8 sm:px-10 font-sans relative">
      <div className="w-full max-w-full flex flex-col gap-6 pb-20">
        
        {/* Page Header */}
        <div className="flex flex-col gap-2 mb-4">
          <h1 className="font-extrabold text-5xl sm:text-6xl text-white tracking-tight leading-tight flex items-center gap-4">
            Upcoming Events
          </h1>
          <p className="text-lg text-gray-400 font-medium max-w-2xl mt-2">
            Discover and track all the upcoming events, workshops, and activities happening around the campus.
          </p>
        </div>

        {/* Events Feed */}
        {isLoading ? (
          <div className="flex justify-center p-20">
            <Loader2 className="w-10 h-10 animate-spin text-white/50" />
          </div>
        ) : isError ? (
          <ErrorState
            error={error}
            onRetry={refetch}
            secondaryAction={{
              label: 'Browse Calendar',
              to: '/events',
            }}
          />
        ) : visibleEvents.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title="No Upcoming Events Scheduled"
            description="There are currently no public events scheduled for the near future. Check out the full calendar or explore student societies."
            action={{
              label: 'Explore Full Calendar',
              to: '/events',
            }}
            secondaryAction={{
              label: 'Campus Societies',
              to: '/societies',
            }}
          />
        ) : (
          <>
            <div className="cards-container grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 w-full mx-auto">
              {visibleEvents.map((event) => (
                <EventCard key={event.id} item={{ ...event, type: 'event' } as any} />
              ))}
            </div>
            
            {eventsList.length > visibleEventsCount && (
              <div className="mt-12 flex justify-center">
                <button 
                  onClick={() => setVisibleEventsCount(prev => prev + 4)}
                  className="px-8 py-3 rounded-xl bg-white/10 hover:bg-white/20 active:scale-[0.98] border border-white/20 text-white font-bold transition-all backdrop-blur-md cursor-pointer"
                >
                  Load More Events
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};



