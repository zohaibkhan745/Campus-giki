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
  const [statusFilter, setStatusFilter] = useState<string>(searchParams.get('status') || '');
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
  });

  const handleClearFilters = () => {
    setSearchQuery('');
    setStatusFilter('');
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
      if (statusFilter && event.approvalStatus !== statusFilter) {
        return false;
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
    <div className="max-w-6xl mx-auto space-y-6 text-left py-4">
      {/* Top Back Navigation Link */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="fixed top-4 left-4 sm:top-6 sm:left-6 z-[100] inline-flex items-center justify-center w-10 h-10 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white rounded-full transition-all cursor-pointer shadow-lg"
          title="Go Back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
      </div>

      {/* Header Banner */}
      <div className="bg-white/[0.08] backdrop-blur-[20px] shadow-[0_12px_40px_rgba(0,0,0,0.4)] p-6 md:p-8 rounded-[18px] border border-white/20 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3.5 bg-lumen-cream border border-vast-ink/20 rounded-full text-white hidden sm:block">
            <MicVocal className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-extrabold text-5xl sm:text-6xl text-white tracking-tight leading-tight mb-8">
              Manage Events
            </h1>
            <p className="text-sm font-medium text-gray-400 mt-1">
              View all your society events, track approvals, and update schedules.
            </p>
          </div>
        </div>
        
        <div className="flex items-center shrink-0">
          <Link
            to="/events/create"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-vast-ink hover:opacity-90 text-pure-white border border-vast-ink/20 rounded-inputs text-sm font-bold transition-all shadow-[4px_4px_0px_0px_#1B1B18]"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Event</span>
          </Link>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-lumen-cream p-5 rounded-cards border border-vast-ink/20 space-y-4">
        {/* Top Row: Search + Time Window Toggle */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
          
          <div className="relative w-full lg:w-80 flex items-center shrink-0">
            <div className="absolute left-3 text-gray-400 pointer-events-none flex items-center justify-center">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder="Search title or venue..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-white text-sm rounded-inputs border border-vast-ink/20 px-3.5 py-2 pl-10 transition-all outline-none focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:border-indigo-500 font-medium"
            />
          </div>

          <div className="flex flex-wrap items-center bg-lumen-stone p-1 rounded-inputs border border-vast-ink/20 w-full lg:w-auto gap-1">
            <button
              type="button"
              onClick={() => setTypeToggle('all')}
              className={`px-4 py-1.5 rounded-inputs text-xs font-bold transition-all ${
                typeToggle === 'all'
                  ? 'bg-white text-black shadow-lg shadow-white/10'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              All Time
            </button>
            <button
              type="button"
              onClick={() => setTypeToggle('this_week')}
              className={`px-4 py-1.5 rounded-inputs text-xs font-bold transition-all ${
                typeToggle === 'this_week'
                  ? 'bg-white text-black shadow-lg shadow-white/10'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              This Week
            </button>
            <button
              type="button"
              onClick={() => setTypeToggle('this_month')}
              className={`px-4 py-1.5 rounded-inputs text-xs font-bold transition-all ${
                typeToggle === 'this_month'
                  ? 'bg-white text-black shadow-lg shadow-white/10'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              This Month
            </button>
            <button
              type="button"
              onClick={() => setTypeToggle('upcoming')}
              className={`px-4 py-1.5 rounded-inputs text-xs font-bold transition-all ${
                typeToggle === 'upcoming'
                  ? 'bg-white text-black shadow-lg shadow-white/10'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Upcoming
            </button>
            <button
              type="button"
              onClick={() => setTypeToggle('past')}
              className={`px-4 py-1.5 rounded-inputs text-xs font-bold transition-all ${
                typeToggle === 'past'
                  ? 'bg-white text-black shadow-lg shadow-white/10'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Past
            </button>
          </div>
        </div>

        {/* Bottom Row: Status Filter & Clear */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 mt-6 border-t border-white/10 w-full">
          <div className="relative flex items-center w-full sm:w-64">
            
            <CustomDropdown value={statusFilter} onChange={(e: any) => setStatusFilter(e.target.value as any)} options={[{value:"ALL",label:"All Statuses"},{value:"PENDING_ADVISOR",label:"Pending Advisor"},{value:"CHANGES_REQUESTED",label:"Changes Requested"},{value:"PENDING_ADMIN",label:"Pending DSA"},{value:"APPROVED",label:"Approved"},{value:"REJECTED",label:"Rejected"},{value:"PUBLISHED",label:"Published"},{value:"CANCELLED",label:"Cancelled"}]} />
          </div>

          {(searchQuery || statusFilter || typeToggle !== 'all') && (
            <button
              onClick={handleClearFilters}
              className="flex items-center justify-center gap-2 px-4 py-2 text-red-400 hover:text-white bg-red-500/10 hover:bg-red-500/30 font-bold text-sm border border-red-500/20 rounded-xl transition-all focus:outline-none ml-auto"
            >
              <FilterX className="w-3.5 h-3.5" />
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      {isError && (
        null /* Removed error alert */
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 justify-items-center w-full mx-auto">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse bg-transparent rounded-cards border border-vast-ink/20 h-72 w-full"></div>
          ))}
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between text-sm font-bold text-white">
            <span>Showing {filteredEvents.length} events</span>
          </div>
          
          {filteredEvents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-4 bg-transparent border border-vast-ink/20 rounded-cards text-center space-y-4">
              <div className="p-4 bg-lumen-stone rounded-full">
                <Calendar className="w-10 h-10 text-gray-400" />
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-white mb-1">No Events Found</h3>
                <p className="text-gray-400 text-sm font-medium">
                  We couldn't find any events matching your current filters.
                </p>
              </div>
              <button
                onClick={handleClearFilters}
                className="mt-2 text-indigo-500 font-bold hover:underline"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 justify-items-center w-full mx-auto">
                {filteredEvents.map((event: EventItem) => (
                  <EventCard key={event.id} item={{ ...event, type: 'event' } as any} />
                ))}
              </div>
            )}
          </>
      )}
    </div>
  );
};

