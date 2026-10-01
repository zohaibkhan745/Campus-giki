import { getAdvisorLogo, getSocietyLogo } from '@/lib/utils';
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  FileText,
  Filter,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  Building2,
  ArrowRight,
  Calendar,
  Loader2,
  LogOut,
  MapPin,
  MicVocal,
  CalendarDays,
  Settings,
} from 'lucide-react';
import { YearlyPlanCard } from '@/components/yearly-plan/YearlyPlanCard';
import { useAuth } from '@/hooks/useAuth';
import { EventGrid } from '@/components/admin/FlippableAdminEventCard';
import { advisorService } from '@/services/advisor.service';
import type { PlanStatus } from '@/types/yearly-plan.types';
import { Alert } from '@/components/ui/Alert';
import { CustomDropdown } from '@/components/ui/CustomDropdown';
import { usePendingCounts } from '@/hooks/usePendingCounts';
import { BannerHeader } from '@/components/layout/BannerHeader';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';

export const AdvisorQueuePage: React.FC = () => {
  const { user, logout } = useAuth();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('PENDING_ADVISOR');
  const [activeTab, setActiveTab] = useState<'plans' | 'events'>('events');
  const { pendingEventsCount, pendingPlansCount } = usePendingCounts();

  const { data: profileData } = useQuery({
    queryKey: ['advisorProfile'],
    queryFn: advisorService.getMe,
  });

  const assignedSocietyName = profileData?.societies?.length ? profileData.societies.map(s => s.name).join(', ') : 'Unassigned';
  const assignedSocietyLogo = profileData?.societies?.[0]?.logoUrl;

  const {
    data: queueData,
    isLoading: isPlansLoading,
    isError: isPlansError,
    error: plansError,
    refetch: refetchPlans,
  } = useQuery({
    queryKey: ['advisorYearlyPlansQueue', page, statusFilter],
    queryFn: () =>
      advisorService.getMySocietyYearlyPlans({
        page,
        limit: 10,
        status: (statusFilter === 'ALL' || !statusFilter) ? undefined : (statusFilter as PlanStatus),
      }),
    enabled: activeTab === 'plans',
  });

  const {
    data: eventsData,
    isLoading: isEventsLoading,
    isError: isEventsError,
    error: eventsError,
    refetch: refetchEvents,
  } = useQuery({
    queryKey: ['advisorEventsQueue', page, statusFilter],
    queryFn: () =>
      advisorService.getMySocietyEvents({
        page,
        limit: 10,
        status: (statusFilter === 'ALL' || !statusFilter) ? undefined : statusFilter,
      }),
    enabled: activeTab === 'events',
  });

  const plans = queueData?.items || [];
  const events = eventsData?.items || [];
  const meta = activeTab === 'plans' ? queueData?.meta : eventsData?.meta;
  
  const isLoading = activeTab === 'plans' ? isPlansLoading : isEventsLoading;
  const isError = activeTab === 'plans' ? isPlansError : isEventsError;
  const error = activeTab === 'plans' ? plansError : eventsError;
  const refetch = activeTab === 'plans' ? refetchPlans : refetchEvents;

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value);
    setPage(1);
  };

  const renderStatusBadge = (status: PlanStatus | string) => {
    switch (status) {
      case 'APPROVED':
      case 'PUBLISHED':
        return (
          <span className="flex justify-center items-center gap-1.5 px-3 py-1 bg-transparent border border-success text-success rounded-xl text-xs font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{status === 'PUBLISHED' ? 'PUBLISHED' : 'APPROVED'}</span>
          </span>
        );
      case 'PENDING':
      case 'PENDING_ADVISOR':
        return (
          <span className="flex justify-center items-center gap-1.5 px-3 py-1 bg-transparent border border-ember-glow text-ember-glow rounded-xl text-xs font-semibold">
            <Clock className="w-3.5 h-3.5" />
            <span>PENDING</span>
          </span>
        );
      case 'CHANGES_REQUESTED':
        return (
          <span className="flex justify-center items-center gap-1.5 px-3 py-1 bg-transparent border border-red-400 text-red-400 rounded-xl text-xs font-semibold">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>CHANGES REQ.</span>
          </span>
        );
      default:
        return (
          <span className="flex justify-center items-center gap-1.5 px-3 py-1 bg-white/10 text-white rounded-xl text-xs font-semibold">
            <span>{status}</span>
          </span>
        );
    }
  };

  return (
    <div className="w-full">
      <BannerHeader title={user?.fullName || "Advisor"} subtitle={`Faculty Advisor - ${assignedSocietyName}`} logoUrl={getAdvisorLogo(user?.avatarUrl)} fallbackImage="/default-advisor.jpg" editUrl="/settings" />
      <div className="max-w-6xl mx-auto space-y-6 text-left py-4 px-4">
        {/* Actions Row */}
        <div className="flex justify-end mb-4">
          <div className="grid grid-cols-2 md:flex md:flex-wrap lg:flex-nowrap md:justify-end gap-2 md:gap-3 w-full md:w-auto shrink-0 mt-4 md:mt-0">
          <Link
            to="/settings"
            className="flex justify-center items-center gap-1.5 px-4 py-2.5 bg-white hover:bg-gray-100 text-gray-900 rounded-xl text-sm font-bold transition-colors"
          >
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </Link>
          <button
            onClick={logout}
            className="flex justify-center items-center gap-1.5 px-4 py-2.5 bg-red-500 hover:bg-red-600 border-none rounded-xl text-white text-sm font-bold transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Log out</span>
          </button>
        </div>
      </div>

      {/* 2. Command Center — matching Society & Admin */}
      <div className="flex flex-col md:flex-row bg-surface-glass backdrop-blur-xl border border-border-medium rounded-cards shadow-elevation-1 overflow-visible">
        {/* Quick Actions */}
        <div className="flex-1 p-6 flex flex-col justify-center space-y-5 border-b md:border-b-0 md:border-r border-border-subtle">
          <h3 className="font-extrabold text-lg text-text-primary flex items-center gap-2">Dashboard</h3>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => { setActiveTab('events'); setPage(1); setStatusFilter('PENDING_ADVISOR'); }}
              className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl font-bold transition-all relative cursor-pointer ${
                activeTab === 'events'
                  ? 'bg-surface-elevated text-text-primary shadow-sm border border-border-subtle'
                  : 'bg-transparent text-text-muted border border-border-subtle hover:bg-surface-hover hover:text-text-primary'
              }`}
            >
              {pendingEventsCount > 0 && (
                <span className="absolute top-2 right-2 flex items-center justify-center w-5 h-5 bg-brand-primary text-white text-[10px] font-bold rounded-full shadow-sm animate-pulse">
                  {pendingEventsCount > 9 ? '9+' : pendingEventsCount}
                </span>
              )}
              <MicVocal className="w-6 h-6 text-brand-primary" />
              <span>Events</span>
            </button>
            <button
              onClick={() => { setActiveTab('plans'); setPage(1); setStatusFilter('PENDING_ADVISOR'); }}
              className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl font-bold transition-all relative cursor-pointer ${
                activeTab === 'plans'
                  ? 'bg-surface-elevated text-text-primary shadow-sm border border-border-subtle'
                  : 'bg-transparent text-text-muted border border-border-subtle hover:bg-surface-hover hover:text-text-primary'
              }`}
            >
              {pendingPlansCount > 0 && (
                <span className="absolute top-2 right-2 flex items-center justify-center w-5 h-5 bg-brand-primary text-white text-[10px] font-bold rounded-full shadow-sm animate-pulse">
                  {pendingPlansCount > 9 ? '9+' : pendingPlansCount}
                </span>
              )}
              <CalendarDays className="w-6 h-6 text-brand-primary" />
              <span>Annual Plans</span>
            </button>
          </div>
        </div>

        {/* At a Glance */}
        <div className="flex-1 p-6 flex flex-col justify-center space-y-5 relative overflow-visible group">
          <h3 className="font-extrabold text-lg text-text-primary flex items-center gap-2 z-10">
            Review Queue
          </h3>
          <p className="text-sm font-medium text-text-secondary z-10 leading-snug">
            Review, evaluate, and provide official feedback on {assignedSocietyName}'s event proposals and annual calendar plans.
          </p>

          {/* Status Filter */}
          <div className="relative z-10">
            
            <CustomDropdown 
              value={statusFilter} 
              onChange={handleStatusChange} 
              options={activeTab === 'events' ? [
                {value:"ALL",label:"All Statuses"},
                {value:"PENDING_ADVISOR",label:"Pending Advisor"},
                {value:"CHANGES_REQUESTED",label:"Changes Requested"},
                {value:"PENDING_ADMIN",label:"Pending DSA"},
                {value:"APPROVED",label:"Approved"},
                {value:"REJECTED",label:"Rejected"},
                {value:"PUBLISHED",label:"Published"},
                {value:"CANCELLED",label:"Cancelled"}
              ] : [
                {value:"ALL",label:"All Statuses"},
                {value:"PENDING_ADVISOR",label:"Pending Advisor"},
                {value:"CHANGES_REQUESTED",label:"Changes Requested"},
                {value:"PENDING_ADMIN",label:"Pending DSA"},
                {value:"APPROVED",label:"Approved"},
                {value:"DRAFT",label:"Draft"}
              ]} 
            />
          </div>

          {/* Decorative background */}
          
        </div>
      </div>

      {/* 3. Queue Content */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-surface-glass backdrop-blur-md p-5 rounded-cards border border-border-subtle space-y-3 animate-pulse"
            >
              <div className="flex justify-between items-center">
                <div className="h-5 bg-surface-hover rounded w-1/3" />
                <div className="h-6 bg-surface-hover rounded w-24" />
              </div>
              <div className="h-4 bg-surface-hover rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : isError ? (
        <ErrorState
          error={error}
          onRetry={refetch}
          compact
        />
      ) : activeTab === 'plans' && plans.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No Yearly Plans Found"
          description="There are no yearly calendar submissions matching your current filter criteria."
          compact
        />
      ) : activeTab === 'events' && events.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="No Events Found"
          description={`There are no event proposals matching your current filter for ${assignedSocietyName}.`}
          compact
        />
      ) : (
        <div className="space-y-4">
          {activeTab === 'plans' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {plans.map((plan) => (
                <YearlyPlanCard key={plan.id} plan={plan as any} baseUrl="/advisor/yearly-plans" />
              ))}
            </div>
          ) : (
            <EventGrid events={events} reviewUrlBase="/advisor/events" />
          )}
        </div>
      )}

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <nav aria-label="Pagination" className="flex items-center justify-between pt-4 border-t border-border-subtle text-xs font-semibold text-text-secondary">
          <span>
            Page {meta.page} of {meta.totalPages} ({meta.total} items)
          </span>

          <div className="flex items-center gap-2">
            <button
              disabled={!meta.hasPreviousPage}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-surface-glass border border-border-medium rounded-xl hover:bg-surface-hover text-text-primary disabled:opacity-40 transition-colors cursor-pointer"
              aria-label="Previous page"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <button
              disabled={!meta.hasNextPage}
              onClick={() => setPage((p) => p + 1)}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-surface-glass border border-border-medium rounded-xl hover:bg-surface-hover text-text-primary disabled:opacity-40 transition-colors cursor-pointer"
              aria-label="Next page"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </nav>
      )}
    </div>
    </div>
  );
};











