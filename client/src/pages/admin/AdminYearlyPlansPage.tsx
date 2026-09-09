import { getSocietyLogo } from '@/lib/utils';
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
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
  Building2,
  ArrowRight,
  UserCheck,
  FilterX,
  ArrowLeft,
} from 'lucide-react';
import { YearlyPlanCard } from '@/components/yearly-plan/YearlyPlanCard';
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
    refetchInterval: 10000,
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
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-transparent border border-forest-ink border border-emerald-500/20 text-forest-ink rounded-inputs text-xs font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>APPROVED</span>
          </span>
        );
      case 'PENDING_ADMIN':
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-transparent border border-ember-glow border border-orange-500/20 text-orange-400 rounded-inputs text-xs font-semibold">
            <Clock className="w-3.5 h-3.5" />
            <span>PENDING REVIEW</span>
          </span>
        );
      case 'CHANGES_REQUESTED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-transparent border border-white/10 border border-red-500/20 text-red-400 rounded-inputs text-xs font-semibold">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>CHANGES REQUESTED</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/5 text-white font-medium rounded-inputs text-xs font-semibold">
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
          className="fixed top-4 left-4 sm:top-6 sm:left-6 z-[100] inline-flex items-center justify-center w-10 h-10 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white rounded-full transition-all cursor-pointer shadow-lg"
          title="Go Back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
      </div>

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 py-6">
        <h1 className="font-extrabold text-5xl sm:text-6xl text-white tracking-tight leading-tight mb-8 drop-shadow-md">
          Campus Society Yearly Plan Records
        </h1>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row gap-2.5 mb-6">
        {/* Search Input */}
        <div className="relative w-full flex-1 flex items-center">
            <div className="absolute left-4 text-gray-400 pointer-events-none flex items-center justify-center z-10">
              <Search className="w-5 h-5 text-white" />
            </div>
            <input
              type="text"
              placeholder="Search by society name..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              className="w-full bg-white/[0.08] backdrop-blur-[20px] text-white placeholder:text-gray-300 text-sm rounded-xl border border-white/20 px-4 py-[12px] pl-12 h-[48px] transition-all outline-none focus:ring-2 focus:ring-white/40 shadow-[0_12px_40px_rgba(0,0,0,0.4)]"
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
              className="p-2 text-gray-400 hover:text-white bg-white/5 rounded-inputs transition-colors shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
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
          null /* Removed error alert */
          <button
            onClick={() => refetch()}
            className="text-xs text-white hover:underline font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded"
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
              className="bg-transparent p-5 rounded-cards border border-white/10 space-y-3 animate-pulse"
            >
              <div className="flex justify-between items-center">
                <div className="h-5 bg-white/5 rounded w-1/3" />
                <div className="h-6 bg-white/5 rounded w-24" />
              </div>
              <div className="h-4 bg-white/5 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : plans.length === 0 ? (
        <div className="bg-transparent p-12 rounded-cards border border-white/10 text-center space-y-3">
          <Shield className="w-12 h-12 text-gray-400 mx-auto" />
          <h3 className="font-bold text-white text-base">No Yearly Plan Records Found</h3>
          <p className="text-xs text-gray-400 max-w-sm mx-auto">
            No society yearly calendar records match the selected filters.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <YearlyPlanCard key={plan.id} plan={plan as any} baseUrl="/admin/yearly-plans" />
          ))}
        </div>
      )}

      {/* Pagination Bar */}
      {meta && meta.totalPages > 1 && (
        <nav aria-label="Pagination" className="flex items-center justify-between pt-4 border-t-2 border-white/10 text-xs font-semibold text-gray-400">
          <span>
            Page {meta.page} of {meta.totalPages} ({meta.total} plans)
          </span>

          <div className="flex items-center gap-2">
            <button
              disabled={!meta.hasPreviousPage}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-white/5 border border-white/10 rounded-inputs hover:bg-white/5 disabled:opacity-40 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              aria-label="Previous page"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <button
              disabled={!meta.hasNextPage}
              onClick={() => setPage((p) => p + 1)}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-white/5 border border-white/10 rounded-inputs hover:bg-white/5 disabled:opacity-40 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
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






