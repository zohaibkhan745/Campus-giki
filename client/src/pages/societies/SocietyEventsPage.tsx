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
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import { BackButton } from '@/components/ui';
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
    error,
    refetch,
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
        <BackButton variant="inline" className="shrink-0" />
        <Link
          to="/events/create"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-text-primary text-text-inverse hover:opacity-90 border border-border-medium rounded-xl text-sm font-bold transition-all shadow-elevation-1 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Event</span>
        </Link>
      </div>

      {/* Filter Toolbar */}
      <div className="relative z-[200] bg-surface-glass backdrop-blur-xl p-3 rounded-cards border border-border-medium shadow-elevation-1 w-full mb-8">
        <div className="flex flex-row items-center justify-between gap-3 overflow-x-auto custom-scrollbar">
          <div className="relative w-64 shrink-0">
            <div className="absolute left-3 text-text-muted pointer-events-none flex items-center justify-center h-full">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder="Search event title or venue..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface text-text-primary placeholder:text-text-muted text-sm rounded-xl border border-border-medium px-3.5 py-2 pl-10 transition-all outline-none focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:border-brand-primary font-medium"
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

      {isLoading ? (
        <div className="cards-container">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse bg-surface-elevated/40 rounded-3xl border border-border-subtle h-72 w-full backdrop-blur-md"></div>
          ))}
        </div>
      ) : isError ? (
        <ErrorState
          error={error}
          onRetry={refetch}
          secondaryAction={{
            label: 'Create New Event',
            to: '/events/create',
          }}
        />
      ) : (
        <div className="w-full">
          {filteredEvents.length === 0 ? (
            <EmptyState
              icon={Calendar}
              title="No Events Found"
              description={
                searchQuery || statusFilter !== 'all' || typeToggle !== 'all'
                  ? "We couldn't find any events matching your current filters."
                  : "Your society hasn't created any campus events yet."
              }
              onClearFilters={
                searchQuery || statusFilter !== 'all' || typeToggle !== 'all'
                  ? handleClearFilters
                  : undefined
              }
              action={
                !(searchQuery || statusFilter !== 'all' || typeToggle !== 'all')
                  ? {
                      label: 'Create Your First Event',
                      to: '/events/create',
                      icon: Plus,
                    }
                  : undefined
              }
            />
          ) : (
            <div className="cards-container">
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