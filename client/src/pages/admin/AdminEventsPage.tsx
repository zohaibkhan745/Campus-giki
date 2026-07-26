import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
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
} from 'lucide-react';
import { adminService } from '@/services/admin.service';
import { societyService } from '@/services/society.service';
import { Alert } from '@/components/ui/Alert';

export const AdminEventsPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [societyFilter, setSocietyFilter] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');
  const [typeToggle, setTypeToggle] = useState<'all' | 'upcoming' | 'past'>('all');

  // Query categories
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: societyService.getCategories,
  });

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
      categoryFilter,
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
        category: categoryFilter || undefined,
        from: fromDate || undefined,
        to: toDate || undefined,
        type: typeToggle === 'all' ? undefined : typeToggle,
      }),
  });

  const events = eventsData?.items || [];
  const meta = eventsData?.meta;

  const handleClearFilters = () => {
    setSearchQuery('');
    setSocietyFilter('');
    setCategoryFilter('');
    setFromDate('');
    setToDate('');
    setTypeToggle('all');
    setPage(1);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 text-left py-4">
      {/* Header Banner */}
      <div className="space-y-1 bg-pure-white p-6 rounded-cards border-2 border-vast-ink flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
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
      <div className="bg-lumen-cream p-5 rounded-cards border-2 border-vast-ink space-y-4">
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
              className="w-full bg-pure-white text-vast-ink text-sm rounded-inputs border-2 border-vast-ink px-3.5 py-2 pl-10 transition-all outline-none focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:border-indigo-500"
            />
          </div>

          {/* Time Window Pills Toggle */}
          <div className="flex items-center bg-lumen-stone p-1 rounded-inputs border-2 border-vast-ink w-full sm:w-auto">
            <button
              onClick={() => {
                setTypeToggle('all');
                setPage(1);
              }}
              className={`flex-1 sm:flex-initial px-4 py-1.5 rounded-inputs text-xs font-bold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                typeToggle === 'all'
                  ? 'bg-indigo-600 text-white'
                  : 'text-fog hover:text-vast-ink'
              }`}
            >
              All Events
            </button>
            <button
              onClick={() => {
                setTypeToggle('upcoming');
                setPage(1);
              }}
              className={`flex-1 sm:flex-initial px-4 py-1.5 rounded-inputs text-xs font-bold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                typeToggle === 'upcoming'
                  ? 'bg-indigo-600 text-white'
                  : 'text-fog hover:text-vast-ink'
              }`}
            >
              Upcoming
            </button>
            <button
              onClick={() => {
                setTypeToggle('past');
                setPage(1);
              }}
              className={`flex-1 sm:flex-initial px-4 py-1.5 rounded-inputs text-xs font-bold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                typeToggle === 'past'
                  ? 'bg-indigo-600 text-white'
                  : 'text-fog hover:text-vast-ink'
              }`}
            >
              Past
            </button>
          </div>
        </div>

        {/* Bottom Row: Society, Category, Date Range Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2 border-t border-vast-ink">
          {/* Society Input */}
          <div className="relative flex items-center">
            <div className="absolute left-3 text-fog pointer-events-none flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder="Filter by society..."
              value={societyFilter}
              onChange={(e) => {
                setSocietyFilter(e.target.value);
                setPage(1);
              }}
              className="w-full bg-pure-white text-vast-ink text-xs rounded-inputs border-2 border-vast-ink px-3 py-2 pl-9 outline-none focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            />
          </div>

          {/* Category Dropdown */}
          <div className="relative flex items-center">
            <div className="absolute left-3 text-fog pointer-events-none flex items-center justify-center">
              <Tag className="w-4 h-4" />
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setPage(1);
              }}
              className="w-full bg-pure-white text-vast-ink text-xs rounded-inputs border-2 border-vast-ink px-3 py-2 pl-9 outline-none focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.slug}>
                  {c.name}
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
              className="w-full bg-pure-white text-vast-ink text-xs rounded-inputs border-2 border-vast-ink px-3 py-2 pl-9 outline-none focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
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
                className="w-full bg-pure-white text-vast-ink text-xs rounded-inputs border-2 border-vast-ink px-3 py-2 pl-9 outline-none focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              />
            </div>

            {(searchQuery || societyFilter || categoryFilter || fromDate || toDate || typeToggle !== 'all') && (
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
            <div key={i} className="bg-pure-white p-5 rounded-cards border-2 border-vast-ink space-y-3 animate-pulse">
              <div className="flex justify-between">
                <div className="h-5 bg-lumen-stone rounded w-1/3" />
                <div className="h-5 bg-lumen-stone rounded w-20" />
              </div>
              <div className="h-4 bg-lumen-stone rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="bg-pure-white p-12 rounded-cards border-2 border-vast-ink text-center space-y-3">
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
              className="bg-pure-white p-5 rounded-cards border-2 border-vast-ink hover:border-2 border-vast-ink transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 group"
            >
              <div className="flex items-start md:items-center gap-4">
                {evt.society?.logoUrl ? (
                  <img
                    src={evt.society.logoUrl}
                    alt={evt.society.name}
                    className="w-12 h-12 rounded-inputs object-cover border-2 border-vast-ink shrink-0"
                  />
                ) : (
                  <div className="p-3 bg-lavender-whisper border border-vast-ink text-vast-ink rounded-inputs border border-indigo-500/20 shrink-0">
                    <Building2 className="w-6 h-6" />
                  </div>
                )}

                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      to={`/events/${evt.id}`}
                      className="font-bold text-vast-ink text-base group-hover:text-vast-ink transition-colors hover:underline"
                    >
                      {evt.title}
                    </Link>

                    {evt.isUpcoming ? (
                      <span className="text-[11px] font-semibold text-forest-ink bg-pure-white border border-forest-ink px-2.5 py-0.5 rounded-inputs border border-emerald-500/20">
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
                  to={`/events/${evt.id}`}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-vast-ink group-hover:translate-x-1 transition-transform focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded p-0.5"
                  aria-label={`View details for ${evt.title}`}
                >
                  <span>View Details</span>
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
