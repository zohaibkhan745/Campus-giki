import React, { useState } from 'react';
import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useDebounce } from '@/hooks/useDebounce';
import {
  Calendar,
  Search,
  Filter,
  MapPin,
  Clock,
  ChevronLeft,
  ChevronRight,
  Building2,
  ExternalLink,
  FilterX,
  ArrowLeft,
  X,
  ArrowRight,
  CalendarDays,
  Sparkles,
} from 'lucide-react';
import { FlippableAdminEventCard, EventGrid } from '@/components/admin/FlippableAdminEventCard';
import { adminService } from '@/services/admin.service';
import { societyService } from '@/services/society.service';
import { Alert } from '@/components/ui/Alert';
import { CustomDropdown } from '@/components/ui/CustomDropdown';
import { BackButton } from '@/components/ui';
import { CustomDatePicker } from '@/components/ui/date-picker';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import type { EventItem } from '@/types/event.types';

export const AdminPendingEventsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const rawType = searchParams.get('type');

  let defaultType: 'all' | 'this_week' | 'this_month' | 'upcoming' | 'past' = 'all';
  let defaultFrom = '';
  let defaultTo = '';

  const now = new Date();
  if (rawType === 'this_week') {
    defaultType = 'this_week';
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    defaultFrom = startOfWeek.toISOString().split('T')[0];
    defaultTo = endOfWeek.toISOString().split('T')[0];
  } else if (rawType === 'this_month') {
    defaultType = 'this_month';
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    defaultFrom = startOfMonth.toISOString().split('T')[0];
    defaultTo = endOfMonth.toISOString().split('T')[0];
  } else if (rawType === 'upcoming' || rawType === 'past') {
    defaultType = rawType;
  }

  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const debouncedSearch = useDebounce(searchQuery, 250);
  
  const [societyFilter, setSocietyFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>("PENDING_ADMIN");
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");
  
  const [typeToggle, setTypeToggle] = useState(defaultType);

  const setAllFilter = () => { setFromDate(''); setToDate(''); setTypeToggle('all'); /* reset handled by queryKey */ };
  const setUpcomingFilter = () => { setFromDate(''); setToDate(''); setTypeToggle('upcoming'); /* reset handled by queryKey */ };
  const setPastFilter = () => { setFromDate(''); setToDate(''); setTypeToggle('past'); /* reset handled by queryKey */ };
  const setThisWeekFilter = () => {
    const n = new Date();
    const startOfWeek = new Date(n);
    startOfWeek.setDate(n.getDate() - n.getDay());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    setFromDate(startOfWeek.toISOString().split('T')[0]);
    setToDate(endOfWeek.toISOString().split('T')[0]);
    setTypeToggle('this_week');
    /* reset handled by queryKey */
  };
  const setThisMonthFilter = () => {
    const n = new Date();
    const startOfMonth = new Date(n.getFullYear(), n.getMonth(), 1);
    const endOfMonth = new Date(n.getFullYear(), n.getMonth() + 1, 0);
    setFromDate(startOfMonth.toISOString().split('T')[0]);
    setToDate(endOfMonth.toISOString().split('T')[0]);
    setTypeToggle('this_month');
    /* reset handled by queryKey */
  };

  const handleClearFilters = () => {
    setSearchQuery('');  setSocietyFilter('');
    setFromDate(''); setToDate(''); setTypeToggle('all'); /* reset handled by queryKey */
  };

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useInfiniteQuery({
    queryKey: ['adminEventsList', statusFilter, societyFilter, debouncedSearch, fromDate, toDate, typeToggle],
    initialPageParam: 1,
    queryFn: ({ pageParam = 1 }) => adminService.getAllEvents({
      page: pageParam,
      limit: 9,
      status: statusFilter,
      society: societyFilter || undefined,
      search: debouncedSearch || undefined,
        from: fromDate || undefined,
        to: toDate || undefined,
      
      type: (typeToggle === 'upcoming' || typeToggle === 'past') ? typeToggle : undefined
    }),
    getNextPageParam: (lastPage) => {
      if (lastPage.meta.page < lastPage.meta.totalPages) {
        return lastPage.meta.page + 1;
      }
      return undefined;
    },
  });

  const { data: societiesData } = useQuery({
    queryKey: ['publicSocietiesList'],
    queryFn: () => societyService.getPublicSocieties({ limit: 100 }),
  });
  const societies = societiesData?.items || [];

  const events = (data as any)?.pages?.flatMap((page: any) => page.items) || [];
  const meta = (data as any)?.pages?.[(data as any).pages.length - 1]?.meta;

  
  

  return (
    <div className="max-w-7xl mx-auto space-y-6 text-left py-4">
      <div className="flex items-center justify-between mb-4">
        <BackButton variant="inline" />
      </div>

      <div className="space-y-1 py-6 text-left">
        <h1 className="font-extrabold text-5xl sm:text-6xl text-text-primary tracking-tight leading-tight mb-8">Pending Reviews</h1>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-surface-glass backdrop-blur-xl p-5 rounded-cards border border-border-medium space-y-4 shadow-elevation-1 relative z-[100]">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-80 flex items-center">
            <div className="absolute left-3 text-text-muted pointer-events-none"><Search className="w-4 h-4" /></div>
            <input
              type="text"
              placeholder="Search event title or venue..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); /* reset handled by queryKey */ }}
              className="w-full bg-surface text-text-primary placeholder:text-text-muted text-sm rounded-xl border border-border-medium px-3.5 py-2 pl-10 outline-none focus:border-brand-primary"
            />
          </div>
          <div className="flex flex-wrap items-center bg-surface-glass p-1 rounded-xl border border-border-subtle w-full md:w-auto gap-1">
            {['all', 'this_week', 'this_month', 'upcoming', 'past'].map(filterType => (
              <button key={filterType} onClick={() => {
                if (filterType === 'all') setAllFilter();
                else if (filterType === 'this_week') setThisWeekFilter();
                else if (filterType === 'this_month') setThisMonthFilter();
                else if (filterType === 'upcoming') setUpcomingFilter();
                else setPastFilter();
              }}
                className={`px-3 py-1.5 rounded-[10px] text-xs font-bold transition-all cursor-pointer ${typeToggle === filterType ? 'bg-text-primary text-text-inverse shadow-sm' : 'text-text-secondary hover:text-text-primary'}`}
              >
                {filterType === 'this_week' ? 'This Week' : filterType === 'this_month' ? 'This Month' : filterType.charAt(0).toUpperCase() + filterType.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col md:flex-row flex-wrap items-center gap-4 pt-4 border-t border-border-subtle mt-2">
          
          <CustomDropdown className="w-full md:flex-1 shrink-0" icon={<Building2 className="w-4 h-4" />} options={[{ value: '', label: 'All Societies' }, ...societies.map((soc: any) => ({ value: soc.id, label: soc.name }))]}
            value={societyFilter}
            onChange={(e: any) => { setSocietyFilter(e.target.value); /* reset handled by queryKey */ }}
            placeholder="All Societies"
          />
          <div className="w-full md:w-auto shrink-0 min-w-[200px]">
          <CustomDropdown 
            value={statusFilter} 
            onChange={(e: any) => setStatusFilter(e.target.value)} 
            options={[
              { value: 'PENDING_ADMIN', label: 'Pending DSA Approval' },
              { value: 'CHANGES_REQUESTED', label: 'Changes Requested' }
            ]}
          />
        </div>
            {(searchQuery || societyFilter || statusFilter !== 'PENDING_ADMIN' || typeToggle !== 'all') && (
              <button onClick={handleClearFilters} className="p-2 text-text-secondary hover:text-text-primary bg-surface hover:bg-surface-hover border border-border-medium rounded-xl transition-colors cursor-pointer">
                <FilterX className="w-4 h-4" />
              </button>
            )}
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
          <div className="space-y-4"><div className="h-6 w-48 bg-border-subtle rounded animate-pulse"></div><div className="h-[380px] bg-surface-glass rounded-cards animate-pulse border border-border-subtle"></div></div>
          <div className="space-y-4"><div className="h-6 w-48 bg-border-subtle rounded animate-pulse"></div><div className="h-[380px] bg-surface-glass rounded-cards animate-pulse border border-border-subtle"></div></div>
        </div>
      ) : isError ? (
        <ErrorState
          error={error}
          onRetry={refetch}
          compact
        />
      ) : events.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="No Pending Events Found"
          description={
            searchQuery || societyFilter || fromDate || toDate || typeToggle !== 'all'
              ? 'No pending event proposals match your current filters.'
              : 'There are currently no events pending review.'
          }
          onClearFilters={
            searchQuery || societyFilter || fromDate || toDate || typeToggle !== 'all'
              ? handleClearFilters
              : undefined
          }
          compact
        />
      ) : (
        <div className="space-y-4 pt-4">
          <h2 className="text-2xl font-bold text-text-primary border-b-2 border-border-subtle pb-3">Pending Events ({events.length})</h2>
          <EventGrid events={events} reviewUrlBase="/admin/events" />
        </div>
      )}

      
    </div>
  );
};

