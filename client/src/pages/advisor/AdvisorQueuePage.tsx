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
import { useAuth } from '@/hooks/useAuth';
import { advisorService } from '@/services/advisor.service';
import type { PlanStatus } from '@/types/yearly-plan.types';
import { Alert } from '@/components/ui/Alert';
import { CustomDropdown } from '@/components/ui/CustomDropdown';
import { usePendingCounts } from '@/hooks/usePendingCounts';
import { BannerHeader } from '@/components/layout/BannerHeader';

export const AdvisorQueuePage: React.FC = () => {
  const { user, logout } = useAuth();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('');
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
          <span className="flex justify-center items-center gap-1.5 px-3 py-1 bg-transparent border border-forest-ink text-forest-ink rounded-xl text-xs font-semibold">
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
      <BannerHeader title={user?.fullName || "Advisor"} subtitle={`Faculty Advisor - ${assignedSocietyName}`} logoUrl={getAdvisorLogo(user?.avatarUrl)} fallbackImage="/default-advisor.jpg" />
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
      <div className="flex flex-col md:flex-row bg-white/[0.08] backdrop-blur-[20px] border border-white/20 rounded-[18px] shadow-[0_12px_40px_rgba(0,0,0,0.4)] overflow-visible">
        {/* Quick Actions */}
        <div className="flex-1 p-6 flex flex-col justify-center space-y-5 border-b md:border-b-0 md:border-r border-white/10">
          <h3 className="font-extrabold text-lg text-white flex items-center gap-2">Dashboard</h3>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => { setActiveTab('events'); setPage(1); setStatusFilter(''); }}
              className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl font-bold transition-all relative ${
                activeTab === 'events'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'bg-transparent text-gray-300 border border-white/20 hover:bg-white/10'
              }`}
            >
              {pendingEventsCount > 0 && (
                <span className="absolute top-2 right-2 flex items-center justify-center w-5 h-5 bg-ember-glow text-pure-white text-[10px] font-bold rounded-full shadow-sm animate-pulse">
                  {pendingEventsCount > 9 ? '9+' : pendingEventsCount}
                </span>
              )}
              <MicVocal className="w-6 h-6" />
              <span>Events</span>
            </button>
            <button
              onClick={() => { setActiveTab('plans'); setPage(1); setStatusFilter(''); }}
              className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl font-bold transition-all relative ${
                activeTab === 'plans'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'bg-transparent text-gray-300 border border-white/20 hover:bg-white/10'
              }`}
            >
              {pendingPlansCount > 0 && (
                <span className="absolute top-2 right-2 flex items-center justify-center w-5 h-5 bg-ember-glow text-pure-white text-[10px] font-bold rounded-full shadow-sm animate-pulse">
                  {pendingPlansCount > 9 ? '9+' : pendingPlansCount}
                </span>
              )}
              <CalendarDays className="w-6 h-6" />
              <span>Annual Plans</span>
            </button>
          </div>
        </div>

        {/* At a Glance */}
        <div className="flex-1 p-6 flex flex-col justify-center space-y-5 relative overflow-visible group">
          <h3 className="font-extrabold text-lg text-white flex items-center gap-2 z-10">
            Review Queue
          </h3>
          <p className="text-sm font-medium text-gray-400 z-10 leading-snug">
            Review, evaluate, and provide official feedback on {assignedSocietyName}'s event proposals and annual calendar plans.
          </p>

          {/* Status Filter */}
          <div className="relative z-10">
            
            <CustomDropdown value={statusFilter} onChange={handleStatusChange} options={[{value:"ALL",label:"All Statuses"},{value:"PENDING_ADVISOR",label:"Pending Advisor"},{value:"CHANGES_REQUESTED",label:"Changes Requested"},{value:"PENDING_ADMIN",label:"Pending DSA"},{value:"APPROVED",label:"Approved"},{value:"REJECTED",label:"Rejected"},{value:"PUBLISHED",label:"Published"},{value:"CANCELLED",label:"Cancelled"}]} />
          </div>

          {/* Decorative background */}
          
        </div>
      </div>

      {/* Error State */}
      {isError && (
        <div className="space-y-3">
          null /* Removed error alert */
          <button
            onClick={() => refetch()}
            className="text-xs text-ember-glow hover:underline font-semibold"
          >
            Retry
          </button>
        </div>
      )}

      {/* 3. Queue Content */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white/[0.05] hover:bg-white/[0.08] backdrop-blur-[12px] p-5 rounded-[18px] border border-white/10 hover:border-white/25 transition-all shadow-sm space-y-3 animate-pulse"
            >
              <div className="flex justify-between items-center">
                <div className="h-5 bg-white/10 rounded w-1/3" />
                <div className="h-6 bg-white/10 rounded w-24" />
              </div>
              <div className="h-4 bg-white/10 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : activeTab === 'plans' && plans.length === 0 ? (
        <div className="bg-white/[0.08] backdrop-blur-[20px] p-12 rounded-[18px] border border-white/20 shadow-[0_12px_40px_rgba(0,0,0,0.4)] text-center space-y-3 flex flex-col items-center">
          <FileText className="w-12 h-12 text-gray-400 opacity-30" />
          <h3 className="font-bold text-white text-base">No Yearly Plans Found</h3>
          <p className="text-xs text-gray-400 max-w-sm">
            There are no yearly calendar submissions matching your current filter.
          </p>
        </div>
      ) : activeTab === 'events' && events.length === 0 ? (
        <div className="bg-white/[0.08] backdrop-blur-[20px] p-12 rounded-[18px] border border-white/20 shadow-[0_12px_40px_rgba(0,0,0,0.4)] text-center space-y-3 flex flex-col items-center">
          <Calendar className="w-12 h-12 text-gray-400 opacity-30" />
          <h3 className="font-bold text-white text-base">No Events Found</h3>
          <p className="text-xs text-gray-400 max-w-sm">
            There are no events matching your current filter for {assignedSocietyName}.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {activeTab === 'plans' ? (
            plans.map((plan) => (
              <Link
                key={plan.id}
                to={`/advisor/yearly-plans/${plan.id}`}
                className="bg-white/[0.05] hover:bg-white/[0.08] backdrop-blur-[12px] p-5 rounded-[18px] border border-white/10 hover:border-white/25 transition-all shadow-sm hover:bg-lavender-whisper transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 group cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  {plan.society?.logoUrl ? (
                    <img
                      src={getSocietyLogo(plan.society.logoUrl)}
                      alt={plan.society.name}
                      className="w-12 h-12 rounded-xl object-cover border border-white/20 shrink-0"
                    onError={(e) => { e.currentTarget.src = '/default-society.jpg'; }} />
                  ) : (
                    <div className="p-3 bg-white/10 border border-white/20 text-white rounded-xl shrink-0">
                      <Building2 className="w-6 h-6" />
                    </div>
                  )}

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-bold text-white text-base group-hover:text-ember-glow transition-colors">
                        {plan.society?.name || 'Assigned Society'}
                      </h3>
                      <span className="text-xs font-semibold text-gray-400">
                        ({plan.year} Calendar)
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-white" />
                        <span>{plan.totalPlannedEvents} Planned Events</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                        <span>
                          Updated:{' '}
                          {new Date(plan.updatedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end w-full md:w-auto gap-4 pt-3 md:pt-0 border-t md:border-t-0 border-white/10">
                  {renderStatusBadge(plan.status as any)}

                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-ember-glow group-hover:translate-x-1 transition-transform">
                    <span>{plan.status === 'PENDING' ? 'Review Plan' : 'View Details'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </Link>
            ))
          ) : (
            events.map((event: any) => (
              <Link
                key={event.id}
                to={`/advisor/events/${event.id}`}
                className="bg-white/[0.05] hover:bg-white/[0.08] backdrop-blur-[12px] p-5 rounded-[18px] border border-white/10 hover:border-white/25 transition-all shadow-sm hover:bg-lavender-whisper transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 group cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  {event.society?.logoUrl ? (
                    <img
                      src={getSocietyLogo(event.society.logoUrl)}
                      alt={event.society.name}
                      className="w-12 h-12 rounded-xl object-cover border border-white/20 shrink-0"
                    onError={(e) => { e.currentTarget.src = '/default-society.jpg'; }} />
                  ) : (
                    <div className="p-3 bg-white/10 border border-white/20 text-white rounded-xl shrink-0">
                      <Building2 className="w-6 h-6" />
                    </div>
                  )}

                  <div className="space-y-1">
                    <h3 className="font-bold text-white text-base group-hover:text-ember-glow transition-colors">
                      {event.title}
                    </h3>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-white" />
                        <span>{new Date(event.eventDate).toLocaleDateString()}</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-white" />
                        <span>{event.startTime} - {event.endTime}</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-white" />
                        <span>{event.venue}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end w-full md:w-auto gap-4 pt-3 md:pt-0 border-t md:border-t-0 border-white/10">
                  {renderStatusBadge(event.approvalStatus)}

                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-ember-glow group-hover:translate-x-1 transition-transform">
                    <span>{event.approvalStatus === 'PENDING_ADVISOR' ? 'Review Event' : 'View Details'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </Link>
            ))
          )}
        </div>
      )}

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <nav aria-label="Pagination" className="flex items-center justify-between pt-4 border-t-2 border-white/10 text-xs font-semibold text-gray-400">
          <span>
            Page {meta.page} of {meta.totalPages} ({meta.total} items)
          </span>

          <div className="flex items-center gap-2">
            <button
              disabled={!meta.hasPreviousPage}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-white/10 border border-white/20 rounded-xl hover:bg-lavender-whisper disabled:opacity-40 transition-colors"
              aria-label="Previous page"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <button
              disabled={!meta.hasNextPage}
              onClick={() => setPage((p) => p + 1)}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-white/10 border border-white/20 rounded-xl hover:bg-lavender-whisper disabled:opacity-40 transition-colors"
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











