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
} from 'lucide-react';
import { adminService } from '@/services/admin.service';
import { societyService } from '@/services/society.service';
import { Alert } from '@/components/ui/Alert';

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
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [fromDate, setFromDate] = useState<string>(defaultFrom);
  const [toDate, setToDate] = useState<string>(defaultTo);
  const [typeToggle, setTypeToggle] = useState<'all' | 'this_week' | 'this_month' | 'upcoming' | 'past'>(defaultType);

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

  const setAllFilter = () => {
    setFromDate('');
    setToDate('');
    setTypeToggle('all');
    setPage(1);
  };

  const setUpcomingFilter = () => {
    setFromDate('');
    setToDate('');
    setTypeToggle('upcoming');
    setPage(1);
  };

  const setPastFilter = () => {
    setFromDate('');
    setToDate('');
    setTypeToggle('past');
    setPage(1);
  };

  // Query societies list for dropdown filter
  const { data: societiesData } = useQuery({
    queryKey: ['publicSocietiesList'],
    queryFn: () => societyService.getPublicSocieties({ limit: 100 }),
  });
  const societies = societiesData?.items || [];

  // Query events
  const {
    data: eventsData,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: [
      'adminEventsList',
      page,
      searchQuery,
      societyFilter,
      statusFilter,
      fromDate,
      toDate,
      typeToggle,
    ],
    queryFn: () =>
      adminService.getAllEvents({
        page,
        limit: 10,
        search: searchQuery || undefined,
        society: societyFilter || undefined,
        status: statusFilter || undefined,
        from: fromDate || undefined,
        to: toDate || undefined,
        type: typeToggle === 'upcoming' || typeToggle === 'past' ? typeToggle : undefined,
      }),
  });

  const events = eventsData?.items || [];
  const meta = eventsData?.meta;

  const handleClearFilters = () => {
    setSearchQuery('');
    setSocietyFilter('');
    setStatusFilter('');
    setFromDate('');
    setToDate('');
    setTypeToggle('all');
    setPage(1);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 text-left py-4">
      {/* Top Back Navigation Link */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 px-3.5 py-2 bg-transparent hover:bg-lumen-stone border border-vast-ink/20 text-vast-ink text-xs font-bold rounded-buttons transition-all cursor-pointer shadow-[2px_2px_0px_0px_#1B1B18]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
      </div>

      {/* Header Banner */}
      <div className="space-y-1 bg-transparent p-6 rounded-cards border border-vast-ink/20 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-vast-ink text-xs font-semibold uppercase tracking-wider mb-1">
            <Shield className="w-4 h-4" />
            <span>DSA Campus Directorate</span>
          </div>
          <h1 className="text-2xl font-extrabold text-vast-ink">
            Campus Events Overview
          </h1>
          <p className="text-sm text-fog">
            Read-only monitoring dashboard of all society events, venues, schedules, and registration links.
          </p>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-lumen-cream p-5 rounded-cards border border-vast-ink/20 space-y-4">
        {/* Top Row: Search + Upcoming/Past Toggle */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-80 flex items-center">
            <div className="absolute left-3 text-fog pointer-events-none flex items-center justify-center">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder="Search event title or venue..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              className="w-full bg-transparent text-vast-ink text-sm rounded-inputs border border-vast-ink/20 px-3.5 py-2 pl-10 transition-all outline-none focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:border-indigo-500"
            />
          </div>

          {/* Time Window Pills Toggle */}
          <div className="flex flex-wrap items-center bg-lumen-stone p-1 rounded-inputs border border-vast-ink/20 w-full md:w-auto gap-1">
            <button
              type="button"
              onClick={setAllFilter}
              className={`px-3 py-1.5 rounded-inputs text-xs font-bold transition-all ${
                typeToggle === 'all'
                  ? 'bg-vast-ink text-white shadow-sm'
                  : 'text-fog hover:text-vast-ink'
              }`}
            >
              All Events
            </button>
            <button
              type="button"
              onClick={setThisWeekFilter}
              className={`px-3 py-1.5 rounded-inputs text-xs font-bold transition-all ${
                typeToggle === 'this_week'
                  ? 'bg-vast-ink text-white shadow-sm'
                  : 'text-fog hover:text-vast-ink'
              }`}
            >
              This Week
            </button>
            <button
              type="button"
              onClick={setThisMonthFilter}
              className={`px-3 py-1.5 rounded-inputs text-xs font-bold transition-all ${
                typeToggle === 'this_month'
                  ? 'bg-vast-ink text-white shadow-sm'
                  : 'text-fog hover:text-vast-ink'
              }`}
            >
              This Month
            </button>
            <button
              type="button"
              onClick={setUpcomingFilter}
              className={`px-3 py-1.5 rounded-inputs text-xs font-bold transition-all ${
                typeToggle === 'upcoming'
                  ? 'bg-vast-ink text-white shadow-sm'
                  : 'text-fog hover:text-vast-ink'
              }`}
            >
              Upcoming
            </button>
            <button
              type="button"
              onClick={setPastFilter}
              className={`px-3 py-1.5 rounded-inputs text-xs font-bold transition-all ${
                typeToggle === 'past'
                  ? 'bg-vast-ink text-white shadow-sm'
                  : 'text-fog hover:text-vast-ink'
              }`}
            >
              Past
            </button>
          </div>
        </div>

        {/* Bottom Row: Society, Date Range Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2 border-t border-vast-ink">
          
          {/* Status Select Dropdown */}
          <div className="relative flex items-center">
            <div className="absolute left-3 text-fog pointer-events-none flex items-center justify-center z-10">
              <Filter className="w-4 h-4" />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="w-full bg-transparent text-vast-ink text-xs rounded-inputs border border-vast-ink/20 px-3 py-2 pl-9 outline-none focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 cursor-pointer"
            >
              <option value="">All Statuses</option>
              <option value="PENDING_ADMIN">Pending Review</option>
              <option value="PUBLISHED">Published / Approved</option>
              <option value="CHANGES_REQUESTED">Changes Requested</option>
            </select>
          </div>

          {/* Society Select Dropdown */}
          <div className="relative flex items-center">
            <div className="absolute left-3 text-fog pointer-events-none flex items-center justify-center z-10">
              <Building2 className="w-4 h-4" />
            </div>
            <select
              value={societyFilter}
              onChange={(e) => {
                setSocietyFilter(e.target.value);
                setPage(1);
              }}
              className="w-full bg-transparent text-vast-ink text-xs rounded-inputs border border-vast-ink/20 px-3 py-2 pl-9 outline-none focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 cursor-pointer"
            >
              <option value="">All Societies</option>
              {societies.map((soc) => (
                <option key={soc.id} value={soc.id}>
                  {soc.name}
                </option>
              ))}
            </select>
          </div>

          {/* From Date */}
          <div className="relative flex items-center">
            <div className="absolute left-3 text-fog pointer-events-none flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => {
                setFromDate(e.target.value);
                setPage(1);
              }}
              className="w-full bg-transparent text-vast-ink text-xs rounded-inputs border border-vast-ink/20 px-3 py-2 pl-9 outline-none focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            />
          </div>

          {/* To Date */}
          <div className="flex items-center gap-2">
            <div className="relative flex items-center w-full">
              <div className="absolute left-3 text-fog pointer-events-none flex items-center justify-center">
                <Calendar className="w-4 h-4" />
              </div>
              <input
                type="date"
                value={toDate}
                onChange={(e) => {
                  setToDate(e.target.value);
                  setPage(1);
                }}
                className="w-full bg-transparent text-vast-ink text-xs rounded-inputs border border-vast-ink/20 px-3 py-2 pl-9 outline-none focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              />
            </div>

            {(searchQuery || societyFilter || statusFilter || categoryFilter || fromDate || toDate || typeToggle !== 'all') && (
              <button
                onClick={handleClearFilters}
                className="p-2 text-fog hover:text-vast-ink bg-lumen-stone rounded-inputs transition-colors shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                title="Clear all filters"
                aria-label="Clear all filters"
              >
                <FilterX className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Error State */}
      {isError && (
        <div className="space-y-3">
          <Alert variant="error" message="Failed to load campus events overview. DSA_ADMIN role required." />
          <button
            onClick={() => refetch()}
            className="text-xs text-vast-ink hover:underline font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded"
          >
            Retry Loading Events
          </button>
        </div>
      )}

      {/* Events Table / Card List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-transparent p-5 rounded-cards border border-vast-ink/20 space-y-3 animate-pulse">
              <div className="flex justify-between">
                <div className="h-5 bg-lumen-stone rounded w-1/3" />
                <div className="h-5 bg-lumen-stone rounded w-20" />
              </div>
              <div className="h-4 bg-lumen-stone rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="bg-transparent p-12 rounded-cards border border-vast-ink/20 text-center space-y-3">
          <Calendar className="w-12 h-12 text-fog mx-auto" />
          <h3 className="font-bold text-vast-ink text-base">No Campus Events Found</h3>
          <p className="text-xs text-fog max-w-sm mx-auto">
            No society events match the selected search or date range filters.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {events.map((evt) => (
            <div
              key={evt.id}
              className="bg-transparent p-5 rounded-cards border border-vast-ink/20 hover:border border-vast-ink/20 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 group"
            >
              <div className="flex items-start md:items-center gap-4">
                {evt.society?.logoUrl ? (
                  <img
                    src={evt.society.logoUrl}
                    alt={evt.society.name}
                    className="w-12 h-12 rounded-inputs object-cover border border-vast-ink/20 shrink-0"
                  />
                ) : (
                  <div className="p-3 bg-lavender-whisper border border-vast-ink text-vast-ink rounded-inputs border border-indigo-500/20 shrink-0">
                    <Building2 className="w-6 h-6" />
                  </div>
                )}

                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      to={evt.approvalStatus === 'PENDING_ADMIN' ? `/admin/events/${evt.id}/review` : `/events/${evt.id}`}
                      className="font-bold text-vast-ink text-base group-hover:text-vast-ink transition-colors hover:underline"
                    >
                      {evt.title}
                    </Link>

                    {evt.isUpcoming ? (
                      <span className="text-[11px] font-semibold text-forest-ink bg-transparent border border-forest-ink px-2.5 py-0.5 rounded-inputs border border-emerald-500/20">
                        Upcoming
                      </span>
                    ) : (
                      <span className="text-[11px] font-semibold text-fog bg-lumen-stone px-2.5 py-0.5 rounded-inputs">
                        Past Event
                      </span>
                    )}

                    {evt.society?.category && (
                      <span className="text-[11px] font-semibold text-vast-ink bg-lavender-whisper border border-vast-ink px-2.5 py-0.5 rounded-inputs border border-indigo-500/20">
                        {evt.society.category.name}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-fog">
                    <span>Host: <strong className="text-vast-ink font-medium">{evt.society?.name}</strong></span>

                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-vast-ink" />
                      <span>
                        {new Date(evt.eventDate).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}{' '}
                        ({evt.startTime} - {evt.endTime})
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-fog" />
                      <span>{evt.venue}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Read-Only Details Link */}
              <div className="flex items-center gap-3 w-full md:w-auto justify-end pt-2 md:pt-0 border-t md:border-t-0 border-vast-ink">
                {evt.registrationLink && (
                  <a
                    href={evt.registrationLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-forest-ink hover:underline"
                  >
                    <span>Registration Link</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}

                <Link
                  to={evt.approvalStatus === 'PENDING_ADMIN' ? `/admin/events/${evt.id}/review` : `/events/${evt.id}`}
                  className={`inline-flex items-center gap-1 text-xs font-semibold group-hover:translate-x-1 transition-transform focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded p-0.5 ${
                    evt.approvalStatus === 'PENDING_ADMIN' ? 'text-amber-600 hover:text-amber-700' : 'text-vast-ink'
                  }`}
                  aria-label={`View details for ${evt.title}`}
                >
                  <span>{evt.approvalStatus === 'PENDING_ADMIN' ? 'Review Event' : 'View Details'}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Bar */}
      {meta && meta.totalPages > 1 && (
        <nav aria-label="Pagination" className="flex items-center justify-between pt-4 border-t-2 border-vast-ink text-xs font-semibold text-fog">
          <span>
            Page {meta.page} of {meta.totalPages} ({meta.total} events)
          </span>

          <div className="flex items-center gap-2">
            <button
              disabled={!meta.hasPreviousPage}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-lumen-stone border-2 border-vast-ink rounded-inputs hover:bg-lumen-stone disabled:opacity-40 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              aria-label="Previous page"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <button
              disabled={!meta.hasNextPage}
              onClick={() => setPage((p) => p + 1)}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-lumen-stone border-2 border-vast-ink rounded-inputs hover:bg-lumen-stone disabled:opacity-40 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              aria-label="Next page"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </nav>
      )}
    </div>
  );
};
