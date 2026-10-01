import { getSocietyLogo } from '@/lib/utils';
import React, { useState } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useDebounce } from '@/hooks/useDebounce';
import { CustomDropdown } from '@/components/ui/CustomDropdown';
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
  XCircle,
  FileText,
  FilterX,
  ArrowLeft,
  CalendarDays,
  Sparkles,
} from 'lucide-react';
import { adminService } from '@/services/admin.service';
import { YearlyPlanCard } from '@/components/yearly-plan/YearlyPlanCard';
import type { PlanStatus } from '@/types/yearly-plan.types';
import { Alert } from '@/components/ui/Alert';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import { BackButton } from '@/components/ui';

export const AdminYearlyPlansPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialStatus = searchParams.get('status') || '';

  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>(initialStatus);
  const [yearFilter, setYearFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const debouncedSearch = useDebounce(searchQuery, 250);

  const {
    data: plansData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['adminYearlyPlans', page, statusFilter, yearFilter, debouncedSearch],
    queryFn: () =>
      adminService.getAllYearlyPlans({
        page,
        limit: 10,
        status: (statusFilter as PlanStatus) || undefined,
        year: yearFilter ? parseInt(yearFilter, 10) : undefined,
        search: debouncedSearch || undefined,
      }),
    placeholderData: keepPreviousData,
    staleTime: 30000,
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
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-success/10 border border-success/30 text-success rounded-inputs text-xs font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>APPROVED</span>
          </span>
        );
      case 'PENDING_ADMIN':
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-warning/10 border border-warning/30 text-warning rounded-inputs text-xs font-semibold">
            <Clock className="w-3.5 h-3.5" />
            <span>PENDING REVIEW</span>
          </span>
        );
      case 'CHANGES_REQUESTED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-danger/10 border border-danger/30 text-danger rounded-inputs text-xs font-semibold">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>CHANGES REQUESTED</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-surface-hover text-text-muted font-medium rounded-inputs text-xs font-semibold border border-border-subtle">
            <span>DRAFT</span>
          </span>
        );
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 text-left py-4">
      {/* Top Back Navigation Link */}
      <div className="flex items-center justify-between">
        <BackButton />
      </div>

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 py-6">
        <h1 className="font-extrabold text-5xl sm:text-6xl text-text-primary tracking-tight leading-tight mb-8">
          Campus Society Yearly Plan Records
        </h1>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row gap-2.5 mb-6">
        {/* Search Input */}
        <div className="relative w-full flex-1 flex items-center">
            <div className="absolute left-4 text-text-muted pointer-events-none flex items-center justify-center z-10">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              placeholder="Search by society name..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              className="w-full bg-surface text-text-primary placeholder:text-text-muted text-sm rounded-xl border border-border-medium px-4 py-[12px] pl-12 h-[48px] transition-all outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 shadow-elevation-1"
            />
        </div>

        {/* Dropdown Filters & Clear */}
        <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full sm:w-auto">
          {/* Status Filter */}
          <div className="w-full sm:w-[220px] shrink-0">
            <CustomDropdown
              className="w-full"
              icon={<Filter className="w-4 h-4" />}
              value={statusFilter}
              onChange={(e: any) => { setStatusFilter(e.target.value); setPage(1); }}
              placeholder="All Submitted Plans"
              options={[
                { value: '', label: 'All Submitted Plans' },
                { value: 'PENDING_ADMIN', label: 'Pending Review' },
                { value: 'APPROVED', label: 'Approved' },
                { value: 'CHANGES_REQUESTED', label: 'Changes Requested' }
              ]}
            />
          </div>

          {/* Year Select Filter */}
          <div className="w-full sm:w-[220px] shrink-0">
            <CustomDropdown
              className="w-full"
              icon={<Calendar className="w-4 h-4" />}
              value={yearFilter}
              onChange={(e: any) => { setYearFilter(e.target.value); setPage(1); }}
              placeholder="All Years"
              options={[
                { value: '', label: 'All Years' },
                { value: '2027', label: '2027' },
                { value: '2026', label: '2026' }
              ]}
            />
          </div>

          {(statusFilter || yearFilter || searchQuery) && (
            <button
              onClick={handleClearFilters}
              className="p-2 text-text-secondary hover:text-text-primary bg-surface hover:bg-surface-hover border border-border-medium rounded-inputs transition-colors shrink-0 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
              title="Clear all filters"
              aria-label="Clear all filters"
            >
              <FilterX className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Records Table View */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-surface-glass p-5 rounded-cards border border-border-subtle space-y-3 animate-pulse"
            >
              <div className="flex justify-between items-center">
                <div className="h-5 bg-border-subtle rounded w-1/3" />
                <div className="h-6 bg-border-subtle rounded w-24" />
              </div>
              <div className="h-4 bg-border-subtle rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : isError ? (
        <ErrorState
          error={error}
          onRetry={refetch}
          compact
        />
      ) : plans.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No Yearly Plan Records Found"
          description={
            statusFilter || yearFilter || searchQuery
              ? 'No society yearly calendar records match your active search filters.'
              : 'No society yearly calendar plans have been submitted yet.'
          }
          onClearFilters={
            statusFilter || yearFilter || searchQuery
              ? handleClearFilters
              : undefined
          }
          compact
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <YearlyPlanCard key={plan.id} plan={plan as any} baseUrl="/admin/yearly-plans" />
          ))}
        </div>
      )}

      {/* Pagination Bar */}
      {meta && meta.totalPages > 1 && (
        <nav aria-label="Pagination" className="flex items-center justify-between pt-4 border-t-2 border-border-subtle text-xs font-semibold text-text-secondary">
          <span>
            Page {meta.page} of {meta.totalPages} ({meta.total} plans)
          </span>

          <div className="flex items-center gap-2">
            <button
              disabled={!meta.hasPreviousPage}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-surface border border-border-medium rounded-inputs hover:bg-surface-hover text-text-secondary hover:text-text-primary disabled:opacity-40 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
              aria-label="Previous page"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <button
              disabled={!meta.hasNextPage}
              onClick={() => setPage((p) => p + 1)}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-surface border border-border-medium rounded-inputs hover:bg-surface-hover text-text-secondary hover:text-text-primary disabled:opacity-40 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
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






