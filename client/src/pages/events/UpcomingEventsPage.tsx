import React, { useState } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { Loader2, ArrowRight } from 'lucide-react';
import { eventService } from '@/services/event.service';
import { EventCard } from '@/components/feed/EventCard';
import { Link } from 'react-router-dom';

export const UpcomingEventsPage: React.FC = () => {
  const [visibleEventsCount, setVisibleEventsCount] = useState(12);

  const { data: listEventsData, isLoading } = useQuery({
    queryKey: ['events', 'upcoming'],
    queryFn: () => eventService.getAllPublicEvents({ from: new Date().toISOString(), limit: 50, page: 1 }),
    placeholderData: keepPreviousData,
  });

  const eventsList = listEventsData?.items || [];
  const visibleEvents = eventsList.slice(0, visibleEventsCount);

  return (
    <div className="min-h-screen text-white flex justify-center py-6 px-3 font-sans relative">
      <div className="w-full max-w-[1100px] flex flex-col gap-6 mt-10 pb-20">
        
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
        ) : visibleEvents.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-20 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md text-center">
            <h3 className="text-xl font-bold text-white mb-2">No Upcoming Events</h3>
            <p className="text-gray-400">There are currently no events scheduled for the future.</p>
            <Link to="/events" className="mt-6 text-white font-bold hover:underline flex items-center gap-2">
              View past events on calendar <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {visibleEvents.map((event) => (
                <EventCard key={event.id} item={{ ...event, type: 'event' } as any} />
              ))}
            </div>
            
            {eventsList.length > visibleEventsCount && (
              <div className="mt-12 flex justify-center">
                <button 
                  onClick={() => setVisibleEventsCount(prev => prev + 12)}
                  className="px-8 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold transition-all backdrop-blur-md"
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
