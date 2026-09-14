import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import {
  MicVocal,
  Search,
  Filter,
  Plus,
  FilterX,
  ArrowLeft,
  Calendar,
} from 'lucide-react';
import { eventService } from '@/services/event.service';
import { Alert } from '@/components/ui/Alert';
import { CustomDropdown } from '@/components/ui/CustomDropdown';
import { EventCard } from '@/components/feed/EventCard';
import type { EventItem } from '@/types/event.types';

export const SocietyEventsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const rawType = searchParams.get('type');

  let defaultType: 'all' | 'this_week' | 'this_month' | 'upcoming' | 'past' = 'all';
  const now = new Date();
  
  if (rawType === 'this_week' || rawType === 'this_month' || rawType === 'upcoming' || rawType === 'past') {
    defaultType = rawType;
  }

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>(searchParams.get('status') || 'all');
  const [typeToggle, setTypeToggle] = useState<'all' | 'this_week' | 'this_month' | 'upcoming' | 'past'>(defaultType);

  // Query events
  const {
    data: allEvents,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['mySocietyEventsList'],
    queryFn: () => eventService.getMyEvents(),
    select: (data) => {
      // Flatten upcoming and past events into a single array
      return [...data.upcoming, ...data.past];
    },
    staleTime: 30000,
  });

  const handleClearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setTypeToggle('all');
  };

  // Client-side filtering
  const filteredEvents = React.useMemo(() => {
    if (!allEvents) return [];

    return allEvents.filter((event: EventItem) => {
      // 1. Search Query Filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = event.title.toLowerCase().includes(query);
        const matchesVenue = event.venue.toLowerCase().includes(query);
        if (!matchesTitle && !matchesVenue) return false;
      }

      // 2. Status Filter
      if (statusFilter && statusFilter !== 'all') {
        if (statusFilter === 'PENDING_REVIEW') {
          if (event.approvalStatus !== 'PENDING_ADMIN' && event.approvalStatus !== 'PENDING_ADVISOR') {
            return false;
          }
        } else if (statusFilter === 'PUBLISHED') {
          if (event.approvalStatus !== 'PUBLISHED' && event.approvalStatus !== 'APPROVED') {
            return false;
          }
        } else if (event.approvalStatus !== statusFilter) {
          return false;
        }
      }

      // 3. Time Window (Type) Filter
      const eventDate = new Date(event.eventDate);
      eventDate.setHours(0, 0, 0, 0);
      const today = new Date(now);
      today.setHours(0, 0, 0, 0);

      if (typeToggle === 'upcoming' && eventDate < today) return false;
      if (typeToggle === 'past' && eventDate >= today) return false;

      if (typeToggle === 'this_week') {
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        if (eventDate < startOfWeek || eventDate > endOfWeek) return false;
      }

      if (typeToggle === 'this_month') {
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        if (eventDate < startOfMonth || eventDate > endOfMonth) return false;
      }

      return true;
    });
  }, [allEvents, searchQuery, statusFilter, typeToggle, now]);

  return (
    <div className="w-full max-w-[1440px] mx-auto text-left relative pb-20">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center justify-center w-10 h-10 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white rounded-full transition-all cursor-pointer shadow-lg shrink-0"
          title="Go Back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <Link
          to="/events/create"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-gray-900 hover:bg-gray-200 border border-white/20 rounded-xl text-sm font-bold transition-all shadow-lg shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Event</span>
        </Link>
      </div>

      {/* Filter Toolbar */}
      <div className="relative z-[200] bg-white/[0.08] backdrop-blur-[20px] p-3 rounded-[18px] border border-white/20 shadow-[0_12px_40px_rgba(0,0,0,0.4)] w-full mb-8">
        <div className="flex flex-row items-center justify-between gap-3 overflow-x-auto custom-scrollbar">
          <div className="relative w-64 shrink-0">
            <div className="absolute left-3 text-gray-400 pointer-events-none flex items-center justify-center h-full">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder="Search event title or venue..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-white text-sm rounded-xl border border-white/20 px-3.5 py-2 pl-10 transition-all outline-none focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:border-indigo-500 font-medium"
            />
          </div>

          <div className="flex flex-row items-center gap-3 shrink-0">
            <div className="w-56 shrink-0">
              <CustomDropdown className="w-full" icon={<Calendar className="w-4 h-4" />} options={[{ value: 'all', label: 'All Event Timings' }, { value: 'this_week', label: 'This Week' }, { value: 'this_month', label: 'This Month' }, { value: 'upcoming', label: 'Upcoming' }, { value: 'past', label: 'Past Events' }]}
                value={typeToggle}
                onChange={(e: any) => { setTypeToggle(e.target.value); }}
                placeholder="Event Timeline"
              />
            </div>
            
            <div className="w-56 shrink-0">
              <CustomDropdown className="w-full" icon={<Filter className="w-4 h-4" />} options={[{ value: 'all', label: "All Statuses" }, { value: 'PENDING_REVIEW', label: 'Pending Review' }, { value: 'PUBLISHED', label: 'Published / Approved' }, { value: 'CHANGES_REQUESTED', label: 'Changes Requested' }]}
                value={statusFilter}
                onChange={(e: any) => { setStatusFilter(e.target.value); }}
                placeholder="All Statuses"
              />
            </div>

            {(searchQuery || statusFilter !== 'all' || typeToggle !== 'all') && (
              <button
                onClick={handleClearFilters}
                className="flex items-center justify-center p-2 text-red-400 hover:text-white bg-red-500/10 hover:bg-red-500/30 rounded-xl transition-all shrink-0"
                title="Clear Filters"
              >
                <FilterX className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {isError && (
        <Alert variant="error" message="Failed to load events. Please try again." className="mb-6 bg-red-500/10 border-red-500/20 text-red-400" />
      )}

      {isLoading ? (
        <div className="cards-container grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 w-full mx-auto">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse bg-white/5 rounded-[24px] border border-white/10 h-72 w-full backdrop-blur-md"></div>
          ))}
        </div>
      ) : (
        <div className="w-full">
          {filteredEvents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-4 bg-white/[0.05] border border-white/10 rounded-[24px] backdrop-blur-md text-center space-y-4">
              <div className="p-4 bg-white/10 rounded-full">
                <Calendar className="w-10 h-10 text-gray-400" />
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-white">No Events Found</h3>
                <p className="text-gray-400 mt-2 max-w-sm mx-auto">
                  {searchQuery || statusFilter !== 'all' || typeToggle !== 'all'
                    ? "We couldn't find any events matching your current filters."
                    : "Your society hasn't created any events yet."}
                </p>
              </div>
              {(searchQuery || statusFilter !== 'all' || typeToggle !== 'all') ? (
                <button
                  onClick={handleClearFilters}
                  className="px-6 py-2 mt-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl transition-all text-sm font-semibold"
                >
                  Clear all filters
                </button>
              ) : (
                <Link
                  to="/events/create"
                  className="px-6 py-2 mt-2 bg-white text-gray-900 hover:bg-gray-200 rounded-xl transition-all text-sm font-semibold inline-flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Create Your First Event
                </Link>
              )}
            </div>
          ) : (
            <div className="cards-container grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 w-full mx-auto">
              {filteredEvents.map((event: EventItem) => (
                <EventCard key={event.id} item={{ ...event, type: 'event' } as any} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};