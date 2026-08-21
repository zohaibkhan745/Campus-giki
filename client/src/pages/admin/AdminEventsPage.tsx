import React, { useState } from 'react';
import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
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
} from 'lucide-react';
import { FlippableAdminEventCard, EventGrid } from '@/components/admin/FlippableAdminEventCard';
import { adminService } from '@/services/admin.service';
import { societyService } from '@/services/society.service';
import { Alert } from '@/components/ui/Alert';
import { CustomDropdown } from '@/components/ui/CustomDropdown';
import { CustomDatePicker } from '@/components/ui/date-picker';

export const AdminEventsPage: React.FC = () => {
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
  const [statusFilter, setStatusFilter] = useState<string>(searchParams.get('status') || '');
  const [societyFilter, setSocietyFilter] = useState<string>('');
  const [fromDate, setFromDate] = useState<string>(defaultFrom);
  const [toDate, setToDate] = useState<string>(defaultTo);
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
    setSearchQuery(''); setStatusFilter(''); setSocietyFilter('');
    setFromDate(''); setToDate(''); setTypeToggle('all'); /* reset handled by queryKey */
  };

  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useInfiniteQuery({
    queryKey: ['adminEventsList', statusFilter, societyFilter, searchQuery, fromDate, toDate, typeToggle],
    initialPageParam: 1,
    queryFn: ({ pageParam = 1 }) => adminService.getAllEvents({
      page: pageParam,
      limit: 9,
      status: statusFilter || undefined,
      society: societyFilter || undefined,
      search: searchQuery || undefined,
      from: fromDate || undefined,
      to: toDate || undefined,
      type: (typeToggle === 'upcoming' || typeToggle === 'past') ? typeToggle : undefined
    }),
    getNextPageParam: (lastPage) => {
      if (lastPage.meta.page < lastPage.meta.totalPages) {
        return lastPage.meta.page + 1;
      }
      return undefined;
    }
  });

  const { data: societiesData } = useQuery({
    queryKey: ['publicSocietiesList'],
    queryFn: () => societyService.getPublicSocieties({ limit: 100 }),
  });
  const societies = societiesData?.items || [];

  const events = (data as any)?.pages?.flatMap((page: any) => page.items) || [];
  const meta = (data as any)?.pages?.[(data as any).pages.length - 1]?.meta;

  const upcomingEvents = events.filter((e: any) => e.isUpcoming);
  const pastEvents = events.filter((e: any) => !e.isUpcoming);

  return (
    <div className="max-w-7xl mx-auto space-y-6 text-left py-4">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="fixed top-4 left-4 sm:top-6 sm:left-6 z-[100] inline-flex items-center justify-center w-10 h-10 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white rounded-full transition-all cursor-pointer shadow-lg"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-1 py-6 text-left">
        <h1 className="text-4xl font-extrabold text-white">Campus Events Overview</h1>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white/[0.08] backdrop-blur-[20px] p-5 rounded-[18px] border border-white/20 space-y-4 shadow-[0_12px_40px_rgba(0,0,0,0.4)] relative" style={{ zIndex: 100 }}>
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-80 flex items-center">
            <div className="absolute left-3 text-gray-400 pointer-events-none"><Search className="w-4 h-4" /></div>
            <input
              type="text"
              placeholder="Search event title or venue..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); /* reset handled by queryKey */ }}
              className="w-full bg-transparent text-white text-sm rounded-xl border border-white/20 px-3.5 py-2 pl-10 outline-none focus:border-white/40"
            />
          </div>
          <div className="flex flex-wrap items-center bg-white/5 p-1 rounded-xl border border-white/10 w-full md:w-auto gap-1">
            {['all', 'this_week', 'this_month', 'upcoming', 'past'].map(filterType => (
              <button key={filterType} onClick={() => {
                if (filterType === 'all') setAllFilter();
                else if (filterType === 'this_week') setThisWeekFilter();
                else if (filterType === 'this_month') setThisMonthFilter();
                else if (filterType === 'upcoming') setUpcomingFilter();
                else setPastFilter();
              }}
                className={`px-3 py-1.5 rounded-[10px] text-xs font-bold transition-all ${typeToggle === filterType ? 'bg-white text-black shadow-sm' : 'text-gray-400 hover:text-white'}`}
              >
                {filterType === 'this_week' ? 'This Week' : filterType === 'this_month' ? 'This Month' : filterType.charAt(0).toUpperCase() + filterType.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col md:flex-row flex-wrap items-center gap-4 pt-4 border-t border-white/10 mt-2">
          <CustomDropdown className="w-full md:flex-1 shrink-0" icon={<Filter className="w-4 h-4" />} options={[{ value: "", label: "All Statuses" },
              { value: 'PENDING_ADMIN', label: 'Pending Review' },
              { value: 'PUBLISHED', label: 'Published / Approved' },
              { value: 'CHANGES_REQUESTED', label: 'Changes Requested' }
            ]}
            value={statusFilter}
            onChange={(val) => { setStatusFilter(val); /* reset handled by queryKey */ }}
            placeholder="All Statuses"
          />
          <CustomDropdown className="w-full md:flex-1 shrink-0" icon={<Building2 className="w-4 h-4" />} options={[{ value: '', label: 'All Societies' }, ...societies.map((soc: any) => ({ value: soc.id, label: soc.name }))]}
            value={societyFilter}
            onChange={(val) => { setSocietyFilter(val); /* reset handled by queryKey */ }}
            placeholder="All Societies"
          />
          <div className="w-full md:flex-1 shrink-0"><CustomDatePicker value={fromDate} onChange={(val) => { setFromDate(val); setTypeToggle("all"); /* reset handled by queryKey */ }} placeholder="From Date" /></div>
          <div className="w-full md:flex-1 shrink-0"><CustomDatePicker value={toDate} onChange={(val) => { setToDate(val); setTypeToggle("all"); /* reset handled by queryKey */ }} placeholder="To Date" /></div>
            {(searchQuery || societyFilter || statusFilter || fromDate || toDate || typeToggle !== 'all') && (
              <button onClick={handleClearFilters} className="p-2 text-gray-400 hover:text-white bg-white/5 rounded-xl">
                <FilterX className="w-4 h-4" />
              </button>
            )}
        </div>
      </div>

      {null}

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
          <div className="space-y-4"><div className="h-6 w-48 bg-white/10 rounded animate-pulse"></div><div className="h-[380px] bg-white/5 rounded-[22px] animate-pulse border border-white/10"></div></div>
          <div className="space-y-4"><div className="h-6 w-48 bg-white/10 rounded animate-pulse"></div><div className="h-[380px] bg-white/5 rounded-[22px] animate-pulse border border-white/10"></div></div>
        </div>
      ) : events.length === 0 ? (
        <div className="bg-white/[0.08] backdrop-blur-[20px] p-12 rounded-[18px] border border-white/20 text-center space-y-3">
          <Calendar className="w-12 h-12 text-gray-400 mx-auto" />
          <h3 className="font-bold text-white text-base">No Campus Events Found</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 items-start">
          <div className="space-y-4" style={{ perspective: '1200px' }}>
            <h2 className="text-2xl font-bold text-white border-b-2 border-white/10 pb-3">Upcoming Events ({upcomingEvents.length})</h2>
            {upcomingEvents.length === 0 ? (
              <p className="text-sm text-gray-400 italic">No upcoming events match the filters.</p>
            ) : (
              <EventGrid events={upcomingEvents} />
            )}
          </div>
          <div className="space-y-4" style={{ perspective: '1200px' }}>
            <h2 className="text-2xl font-bold text-white border-b-2 border-white/10 pb-3">Past Events ({pastEvents.length})</h2>
            {pastEvents.length === 0 ? (
              <p className="text-sm text-gray-400 italic">No past events match the filters.</p>
            ) : (
              <EventGrid events={pastEvents} />
            )}
          </div>
        </div>
      )}

      
    </div>
  );
};
