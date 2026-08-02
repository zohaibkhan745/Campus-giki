import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { eventService } from '@/services/event.service';
import { Calendar, MapPin, ArrowRight } from 'lucide-react';

export const HomeSidebar: React.FC = () => {
  // Fetch upcoming events (next 30 days, limit 5)
  const today = new Date().toISOString().split('T')[0];
  const thirtyDaysLater = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const { data: eventsData, isLoading: isLoadingEvents } = useQuery({
    queryKey: ['upcomingEventsSidebar'],
    queryFn: () => eventService.getAllPublicEvents({ from: today, to: thirtyDaysLater, limit: 5 }),
    staleTime: 5 * 60 * 1000,
  });

  const upcomingEvents = eventsData?.items ?? [];

  // Hide sidebar entirely when no upcoming events
  if (!isLoadingEvents && upcomingEvents.length === 0) {
    return null;
  }

  return (
    <aside className="hidden xl:block w-80 shrink-0 sticky top-6 h-fit space-y-6 font-figtree select-none">
      {/* Upcoming Events Widget */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-extrabold text-vast-ink uppercase tracking-wider">
            Upcoming Events
          </h3>
          <Link
            to="/events?view=upcoming#events-list"
            className="text-xs font-bold text-vast-ink/60 hover:text-vast-ink transition-colors"
          >
            See all
          </Link>
        </div>

        {isLoadingEvents ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse space-y-2 p-3 rounded-xl bg-lumen-stone/30">
                <div className="h-3 bg-vast-ink/10 rounded w-3/4" />
                <div className="h-2.5 bg-vast-ink/10 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {upcomingEvents.map((event) => {
              const eventDate = new Date(event.eventDate);
              const monthShort = eventDate.toLocaleDateString('en-US', { month: 'short' });
              const dayNum = eventDate.getDate();

              return (
                <Link
                  key={event.id}
                  to={`/events/${event.id}`}
                  className="flex items-start gap-3 p-3 rounded-xl hover:bg-lumen-stone/50 transition-colors group"
                >
                  {/* Date Badge */}
                  <div className="w-11 h-12 rounded-lg bg-vast-ink text-pure-white flex flex-col items-center justify-center shrink-0 text-center leading-none">
                    <span className="text-[9px] font-extrabold uppercase tracking-wider opacity-80">
                      {monthShort}
                    </span>
                    <span className="text-lg font-extrabold -mt-0.5">
                      {dayNum}
                    </span>
                  </div>

                  {/* Event Info */}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-extrabold text-vast-ink truncate group-hover:text-vast-ink/80 transition-colors">
                      {event.title}
                    </p>
                    {event.society?.name && (
                      <p className="text-[11px] text-fog font-medium truncate mt-0.5">
                        {event.society.name}
                      </p>
                    )}
                    <div className="flex items-center gap-3 mt-1 text-[11px] text-vast-ink/50 font-medium">
                      {event.venue && (
                        <span className="flex items-center gap-1 truncate">
                          <MapPin className="w-3 h-3 shrink-0" />
                          {event.venue}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}

            <Link
              to="/events#calendar-view"
              className="flex items-center justify-center gap-2 py-2.5 text-xs font-bold text-vast-ink/60 hover:text-vast-ink rounded-xl hover:bg-lumen-stone/40 transition-all"
            >
              <span>View Full Calendar</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}
      </div>

    </aside>
  );
};
