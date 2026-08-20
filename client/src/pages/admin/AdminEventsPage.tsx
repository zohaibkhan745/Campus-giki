import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
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
  Tag,
  ArrowRight,
  Shield,
  FilterX,
  ArrowLeft,
  X
} from 'lucide-react';
import { adminService } from '@/services/admin.service';
import { Alert } from '@/components/ui/Alert';
import { CustomDropdown } from '@/components/ui/CustomDropdown';

// Internal flipping card component
const FlippableAdminEventCard = ({ evt }: { evt: any }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div className="relative w-full h-[320px] perspective-[1200px] group">
      <div 
        className={`relative w-full h-full transition-transform duration-700 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}
      >
        {/* Front Face */}
        <div className="absolute inset-0 backface-hidden bg-white/[0.08] backdrop-blur-[20px] rounded-[18px] border border-white/20 p-5 shadow-[0_12px_40px_rgba(0,0,0,0.4)] flex flex-col gap-3">
          <div className="flex items-start justify-between">
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-xl ${evt.isUpcoming ? 'bg-forest-ink/20 text-forest-ink border border-forest-ink/30' : 'bg-white/10 text-gray-400 border border-white/20'}`}>
              {evt.isUpcoming ? 'Upcoming' : 'Past Event'}
            </span>
            {evt.society?.category && (
              <span className="text-[10px] font-bold uppercase tracking-wider bg-white/10 text-white border border-white/20 px-2.5 py-1 rounded-xl">
                {evt.society.category.name}
              </span>
            )}
          </div>
          
          <h3 className="text-lg font-bold text-white leading-tight line-clamp-2">
            {evt.title}
          </h3>

          <div className="flex flex-col gap-2.5 mt-auto text-xs text-gray-300">
            <div className="flex items-center gap-2">
               {evt.society?.logoUrl ? (
                  <img src={evt.society.logoUrl} className="w-5 h-5 rounded-full object-cover shrink-0" alt="logo" />
               ) : <Building2 className="w-4 h-4 shrink-0" />}
               <span className="font-semibold text-white truncate">{evt.society?.name}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 shrink-0 text-white" />
              <span>{new Date(evt.eventDate).toLocaleDateString()} ({evt.startTime} - {evt.endTime})</span>
            </div>

            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 shrink-0 text-white" />
              <span className="truncate">{evt.venue}</span>
            </div>
          </div>

          <button 
            onClick={() => setIsFlipped(true)}
            className="mt-3 w-full py-2.5 rounded-xl border border-white/30 bg-white/10 hover:bg-white/20 text-white text-sm font-bold transition-all flex items-center justify-center gap-2"
          >
            View Details <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Back Face */}
        <div className="absolute inset-0 backface-hidden rotate-y-180 bg-white/[0.08] backdrop-blur-[20px] rounded-[18px] border border-white/20 p-5 shadow-[0_12px_40px_rgba(0,0,0,0.4)] flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-white text-sm">Event Details</h4>
            <button onClick={() => setIsFlipped(false)} className="p-1 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-gray-300 line-clamp-5 leading-relaxed">
            {evt.description || 'No description provided.'}
          </p>

          <div className="mt-auto space-y-2">
            {evt.registrationLink && (
              <a 
                href={evt.registrationLink} 
                target="_blank" 
                rel="noreferrer"
                className="w-full py-2.5 rounded-xl bg-forest-ink hover:bg-emerald-500 text-[#0b0c0e] text-xs font-bold transition-all flex items-center justify-center gap-1.5"
              >
                Registration Link <ExternalLink className="w-3 h-3" />
              </a>
            )}
            
            <Link 
              to={evt.approvalStatus === 'PENDING_ADMIN' ? `/admin/events/${evt.id}/review` : `/events/${evt.id}`}
              className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${evt.approvalStatus === 'PENDING_ADMIN' ? 'bg-amber-500 hover:bg-amber-400 text-black' : 'bg-white/10 border border-white/20 hover:bg-white/20 text-white'}`}
            >
              {evt.approvalStatus === 'PENDING_ADMIN' ? 'Review Event' : 'Open Event Page'}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

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

  const setAllFilter = () => { setFromDate(''); setToDate(''); setTypeToggle('all'); setPage(1); };
  const setUpcomingFilter = () => { setFromDate(''); setToDate(''); setTypeToggle('upcoming'); setPage(1); };
  const setPastFilter = () => { setFromDate(''); setToDate(''); setTypeToggle('past'); setPage(1); };
  const setThisWeekFilter = () => {
    const n = new Date();
    const startOfWeek = new Date(n);
    startOfWeek.setDate(n.getDate() - n.getDay());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    setFromDate(startOfWeek.toISOString().split('T')[0]);
    setToDate(endOfWeek.toISOString().split('T')[0]);
    setTypeToggle('this_week');
    setPage(1);
  };
  const setThisMonthFilter = () => {
    const n = new Date();
    const startOfMonth = new Date(n.getFullYear(), n.getMonth(), 1);
    const endOfMonth = new Date(n.getFullYear(), n.getMonth() + 1, 0);
    setFromDate(startOfMonth.toISOString().split('T')[0]);
    setToDate(endOfMonth.toISOString().split('T')[0]);
    setTypeToggle('this_month');
    setPage(1);
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setStatusFilter('');
    setSocietyFilter('');
    setFromDate('');
    setToDate('');
    setTypeToggle('all');
    setPage(1);
  };

  const { data: eventsData, isLoading, isError, refetch } = useQuery({
    queryKey: ['adminEventsList', page, statusFilter, societyFilter, searchQuery, fromDate, toDate, typeToggle],
    queryFn: () => adminService.getAllEvents({
      page,
      limit: 20,
      status: statusFilter || undefined,
      society: societyFilter || undefined,
      search: searchQuery || undefined,
      from: fromDate || undefined,
      to: toDate || undefined,
      type: (typeToggle === 'upcoming' || typeToggle === 'past') ? typeToggle : undefined
    }),
  });

  const { data: societiesData } = useQuery({
    queryKey: ['adminSocietiesList-unpaginated'],
    queryFn: () => adminService.getAllSocieties({ limit: 100 }),
  });
  const societies = societiesData?.items || [];

  const events = eventsData?.items || [];
  const meta = eventsData?.meta;

  const upcomingEvents = events.filter((e: any) => e.isUpcoming);
  const pastEvents = events.filter((e: any) => !e.isUpcoming);

  return (
    <div className="max-w-7xl mx-auto space-y-6 text-left py-4">
      {/* Back Button */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="fixed top-4 left-4 sm:top-6 sm:left-6 z-[100] inline-flex items-center justify-center w-10 h-10 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white rounded-full transition-all cursor-pointer shadow-lg"
          title="Go Back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
      </div>

      {/* Header Banner - Moved OUT of the card */}
      <div className="space-y-1 py-6 text-left">
        <h1 className="text-4xl font-extrabold text-white">Campus Events Overview</h1>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-white/[0.08] backdrop-blur-[20px] p-5 rounded-[18px] border border-white/20 space-y-4 shadow-[0_12px_40px_rgba(0,0,0,0.4)]">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-80 flex items-center">
            <div className="absolute left-3 text-gray-400 pointer-events-none flex items-center justify-center">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder="Search event title or venue..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
              className="w-full bg-transparent text-white text-sm rounded-xl border border-white/20 px-3.5 py-2 pl-10 outline-none focus:border-white/40"
            />
          </div>

          <div className="flex flex-wrap items-center bg-white/5 p-1 rounded-xl border border-white/10 w-full md:w-auto gap-1">
            {['all', 'this_week', 'this_month', 'upcoming', 'past'].map(filterType => (
              <button
                key={filterType}
                onClick={() => {
                  if (filterType === 'all') setAllFilter();
                  else if (filterType === 'this_week') setThisWeekFilter();
                  else if (filterType === 'this_month') setThisMonthFilter();
                  else if (filterType === 'upcoming') setUpcomingFilter();
                  else if (filterType === 'past') setPastFilter();
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${typeToggle === filterType ? 'bg-white text-black shadow-sm' : 'text-gray-400 hover:text-white'}`}
              >
                {filterType === 'this_week' ? 'This Week' : filterType === 'this_month' ? 'This Month' : filterType.charAt(0).toUpperCase() + filterType.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2 border-t border-white/10">
          <CustomDropdown 
            icon={<Filter className="w-4 h-4" />}
            options={[
              { value: '', label: 'All Statuses' },
              { value: 'PENDING_ADMIN', label: 'Pending Review' },
              { value: 'PUBLISHED', label: 'Published / Approved' },
              { value: 'CHANGES_REQUESTED', label: 'Changes Requested' }
            ]}
            value={statusFilter}
            onChange={(val) => { setStatusFilter(val); setPage(1); }}
            placeholder="All Statuses"
          />

          <CustomDropdown 
            icon={<Building2 className="w-4 h-4" />}
            options={[
              { value: '', label: 'All Societies' },
              ...societies.map((soc: any) => ({ value: soc.id, label: soc.name }))
            ]}
            value={societyFilter}
            onChange={(val) => { setSocietyFilter(val); setPage(1); }}
            placeholder="All Societies"
          />

          <div className="relative flex items-center">
            <div className="absolute left-3 text-gray-400 pointer-events-none"><Calendar className="w-4 h-4" /></div>
            <input type="date" value={fromDate} onChange={(e) => { setFromDate(e.target.value); setPage(1); }} className="w-full bg-transparent text-white text-xs rounded-xl border border-white/20 px-3 py-2 pl-9 outline-none focus:border-white/40 [color-scheme:dark]" />
          </div>

          <div className="flex items-center gap-2">
            <div className="relative flex items-center w-full">
              <div className="absolute left-3 text-gray-400 pointer-events-none"><Calendar className="w-4 h-4" /></div>
              <input type="date" value={toDate} onChange={(e) => { setToDate(e.target.value); setPage(1); }} className="w-full bg-transparent text-white text-xs rounded-xl border border-white/20 px-3 py-2 pl-9 outline-none focus:border-white/40 [color-scheme:dark]" />
            </div>

            {(searchQuery || societyFilter || statusFilter || fromDate || toDate || typeToggle !== 'all') && (
              <button onClick={handleClearFilters} className="p-2 text-gray-400 hover:text-white bg-white/5 rounded-xl">
                <FilterX className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {isError && <Alert variant="error" message="Failed to load campus events overview." />}

      {/* Two-Column Grid Layout for Flippable Cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
          <div className="space-y-4">
             <div className="h-6 w-48 bg-white/10 rounded animate-pulse"></div>
             <div className="h-[280px] bg-white/5 rounded-[18px] animate-pulse border border-white/10"></div>
          </div>
          <div className="space-y-4">
             <div className="h-6 w-48 bg-white/10 rounded animate-pulse"></div>
             <div className="h-[280px] bg-white/5 rounded-[18px] animate-pulse border border-white/10"></div>
          </div>
        </div>
      ) : events.length === 0 ? (
        <div className="bg-white/[0.08] backdrop-blur-[20px] p-12 rounded-[18px] border border-white/20 text-center shadow-[0_12px_40px_rgba(0,0,0,0.4)] space-y-3">
          <Calendar className="w-12 h-12 text-gray-400 mx-auto" />
          <h3 className="font-bold text-white text-base">No Campus Events Found</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 items-start">
          
          {/* Upcoming Column */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white border-b-2 border-white/10 pb-3">Upcoming Events</h2>
            {upcomingEvents.length === 0 ? (
              <p className="text-sm text-gray-400 italic">No upcoming events match the filters.</p>
            ) : (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                {upcomingEvents.map((evt: any) => <FlippableAdminEventCard key={evt.id} evt={evt} />)}
              </div>
            )}
          </div>

          {/* Past Column */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white border-b-2 border-white/10 pb-3">Past Events</h2>
            {pastEvents.length === 0 ? (
              <p className="text-sm text-gray-400 italic">No past events match the filters.</p>
            ) : (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                {pastEvents.map((evt: any) => <FlippableAdminEventCard key={evt.id} evt={evt} />)}
              </div>
            )}
          </div>

        </div>
      )}

      {/* Pagination Bar */}
      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between p-4 bg-white/[0.08] backdrop-blur-md rounded-xl border border-white/20 shadow-sm mt-8">
          <p className="text-sm text-gray-400">
            Showing <span className="font-medium text-white">{((meta.page - 1) * meta.limit) + 1}</span> to{' '}
            <span className="font-medium text-white">{Math.min(meta.page * meta.limit, meta.total)}</span> of{' '}
            <span className="font-medium text-white">{meta.total}</span> events
          </p>
          <div className="flex items-center gap-2">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="p-2 border border-white/10 rounded-lg disabled:opacity-50 text-white hover:bg-white/10">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))} disabled={page === meta.totalPages} className="p-2 border border-white/10 rounded-lg disabled:opacity-50 text-white hover:bg-white/10">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
