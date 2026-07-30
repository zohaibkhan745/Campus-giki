import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import {
  Shield,
  Search,
  Filter,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  Building2,
  ArrowRight,
  UserCheck,
  FilterX,
  ArrowLeft,
} from 'lucide-react';
import { adminService } from '@/services/admin.service';
import type { PlanStatus } from '@/types/yearly-plan.types';
import { Alert } from '@/components/ui/Alert';

export const AdminYearlyPlansPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialStatus = searchParams.get('status') || '';

  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>(initialStatus);
  const [yearFilter, setYearFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const {
    data: plansData,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['adminYearlyPlans', page, statusFilter, yearFilter, searchQuery],
    queryFn: () =>
      adminService.getAllYearlyPlans({
        page,
        limit: 10,
        status: (statusFilter as PlanStatus) || undefined,
        year: yearFilter ? parseInt(yearFilter, 10) : undefined,
        search: searchQuery || undefined,
      }),
  });

  const plans = plansData?.items || [];
  const meta = plansData?.meta;

  const handleClearFilters = () => {
    setStatusFilter('');
    setYearFilter('');
    setSearchQuery('');
    setPage(1);
  };

  const renderStatusBadge = (status: PlanStatus) => {
    switch (status) {
      case 'APPROVED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-pure-white border border-forest-ink border border-emerald-500/20 text-forest-ink rounded-inputs text-xs font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>APPROVED</span>
          </span>
        );
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-pure-white border border-ember-glow border border-amber-500/20 text-ember-glow rounded-inputs text-xs font-semibold">
            <Clock className="w-3.5 h-3.5" />
            <span>PENDING REVIEW</span>
          </span>
        );
      case 'CHANGES_REQUESTED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-pure-white border border-vast-ink border border-red-500/20 text-red-400 rounded-inputs text-xs font-semibold">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>CHANGES REQUESTED</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-lumen-stone text-vast-ink font-medium rounded-inputs text-xs font-semibold">
            <span>DRAFT</span>
          </span>
        );
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 text-left py-4">
      {/* Top Back Navigation Link */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 px-3.5 py-2 bg-pure-white hover:bg-lumen-stone border-2 border-vast-ink text-vast-ink text-xs font-bold rounded-buttons transition-all cursor-pointer shadow-[2px_2px_0px_0px_#1B1B18]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
      </div>

      {/* Header Banner */}
      <div className="space-y-1 bg-pure-white p-6 rounded-cards border-2 border-vast-ink">
        <div className="flex items-center gap-2 text-vast-ink text-xs font-semibold uppercase tracking-wider mb-1">
          <Shield className="w-4 h-4" />
          <span>DSA Records &amp; Monitoring Directorate</span>
        </div>
        <h1 className="text-2xl font-extrabold text-vast-ink">
          Campus Society Yearly Plan Records
        </h1>
        <p className="text-sm text-fog">
          Central audit log of annual society calendar plans, advisor reviews, and status tracking.
        </p>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-lumen-cream p-4 rounded-cards border-2 border-vast-ink flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full md:w-72 flex items-center">
          <div className="absolute left-3 text-fog pointer-events-none flex items-center justify-center">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Search by society name..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            className="w-full bg-pure-white text-vast-ink placeholder:text-fog text-sm rounded-inputs border-2 border-vast-ink px-3.5 py-2 pl-10 transition-all outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        {/* Dropdown Filters & Clear */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Status Filter */}
          <div className="relative flex items-center w-full sm:w-44">
            <div className="absolute left-3 text-fog pointer-events-none flex items-center justify-center">
              <Filter className="w-4 h-4" />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="w-full bg-pure-white text-vast-ink text-sm rounded-inputs border-2 border-vast-ink px-3.5 py-2 pl-10 transition-all outline-none focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              <option value="">All Submitted Plans</option>
              <option value="PENDING">Pending Review</option>
              <option value="APPROVED">Approved</option>
              <option value="CHANGES_REQUESTED">Changes Requested</option>
            </select>
          </div>

          {/* Year Select Filter */}
          <div className="relative flex items-center w-full sm:w-36">
            <div className="absolute left-3 text-fog pointer-events-none flex items-center justify-center z-10">
              <Calendar className="w-4 h-4" />
            </div>
            <select
              value={yearFilter}
              onChange={(e) => {
                setYearFilter(e.target.value);
                setPage(1);
              }}
              className="w-full bg-pure-white text-vast-ink text-sm rounded-inputs border-2 border-vast-ink px-3.5 py-2 pl-10 transition-all outline-none focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 cursor-pointer"
            >
              <option value="">All Years</option>
              <option value="2026">2026</option>
              <option value="2025">2025</option>
              <option value="2024">2024</option>
              <option value="2027">2027</option>
            </select>
          </div>

          {(statusFilter || yearFilter || searchQuery) && (
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

      {/* Error Callout */}
      {isError && (
        <div className="space-y-3">
          <Alert variant="error" message="Failed to load DSA plan records. DSA_ADMIN role required." />
          <button
            onClick={() => refetch()}
            className="text-xs text-vast-ink hover:underline font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded"
          >
            Retry Loading Records
          </button>
        </div>
      )}

      {/* Records Table View */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-pure-white p-5 rounded-cards border-2 border-vast-ink space-y-3 animate-pulse"
            >
              <div className="flex justify-between items-center">
                <div className="h-5 bg-lumen-stone rounded w-1/3" />
                <div className="h-6 bg-lumen-stone rounded w-24" />
              </div>
              <div className="h-4 bg-lumen-stone rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : plans.length === 0 ? (
        <div className="bg-pure-white p-12 rounded-cards border-2 border-vast-ink text-center space-y-3">
          <Shield className="w-12 h-12 text-fog mx-auto" />
          <h3 className="font-bold text-vast-ink text-base">No Yearly Plan Records Found</h3>
          <p className="text-xs text-fog max-w-sm mx-auto">
            No society yearly calendar records match the selected filters.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {plans.map((plan) => (
            <Link
              key={plan.id}
              to={`/admin/yearly-plans/${plan.id}`}
              className="bg-pure-white p-5 rounded-cards border-2 border-vast-ink hover:border-2 border-vast-ink transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 group cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              aria-label={`View ${plan.year} calendar plan for ${plan.society?.name}`}
            >
              <div className="flex items-start md:items-center gap-4">
                {plan.society?.logoUrl ? (
                  <img
                    src={plan.society.logoUrl}
                    alt={plan.society.name}
                    className="w-12 h-12 rounded-inputs object-cover border-2 border-vast-ink shrink-0"
                  />
                ) : (
                  <div className="p-3 bg-lavender-whisper border border-vast-ink text-vast-ink rounded-inputs border border-indigo-500/20 shrink-0">
                    <Building2 className="w-6 h-6" />
                  </div>
                )}

                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-bold text-vast-ink text-base group-hover:text-vast-ink transition-colors">
                      {plan.society?.name || 'Society Record'}
                    </h3>
                    <span className="text-xs font-semibold text-fog">
                      ({plan.year} Calendar)
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-fog">
                    {plan.society?.advisor && (
                      <div className="flex items-center gap-1.5">
                        <UserCheck className="w-3.5 h-3.5 text-vast-ink" />
                        <span>
                          Advisor: {plan.society.advisor.user.fullName} ({plan.society.advisor.department})
                        </span>
                      </div>
                    )}

                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-fog" />
                      <span>{plan.totalPlannedEvents} Events Planned</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between md:justify-end w-full md:w-auto gap-4 pt-3 md:pt-0 border-t md:border-t-0 border-vast-ink">
                {renderStatusBadge(plan.status)}

                <span className="inline-flex items-center gap-1 text-xs font-semibold text-vast-ink group-hover:translate-x-1 transition-transform">
                  <span>View Record Audit</span>
                  <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination Bar */}
      {meta && meta.totalPages > 1 && (
        <nav aria-label="Pagination" className="flex items-center justify-between pt-4 border-t-2 border-vast-ink text-xs font-semibold text-fog">
          <span>
            Page {meta.page} of {meta.totalPages} ({meta.total} plans)
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
