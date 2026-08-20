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

  const assignedSocietyName = profileData?.societies?.[0]?.name || 'Assigned Society';
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
        status: (statusFilter as PlanStatus) || undefined,
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
        status: statusFilter || undefined,
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
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-transparent border border-forest-ink text-forest-ink rounded-inputs text-xs font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{status === 'PUBLISHED' ? 'PUBLISHED' : 'APPROVED'}</span>
          </span>
        );
      case 'PENDING':
      case 'PENDING_ADVISOR':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-transparent border border-ember-glow text-ember-glow rounded-inputs text-xs font-semibold">
            <Clock className="w-3.5 h-3.5" />
            <span>PENDING</span>
          </span>
        );
      case 'CHANGES_REQUESTED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-transparent border border-red-400 text-red-400 rounded-inputs text-xs font-semibold">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>CHANGES REQ.</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-lumen-stone text-vast-ink rounded-inputs text-xs font-semibold">
            <span>{status}</span>
          </span>
        );
    }
  };

  return (
    <div className="w-full">
      <BannerHeader title={`Welcome back, ${user?.fullName || 'Advisor'}`} subtitle={`Faculty Advisor - ${assignedSocietyName}`} logoUrl={assignedSocietyLogo || user?.avatarUrl} />
      <div className="max-w-6xl mx-auto space-y-6 text-left py-4 px-4">
        {/* Actions Row */}
        <div className="flex justify-end mb-4">
          <div className="flex items-center gap-3 shrink-0 mt-4 md:mt-0">
          <Link
            to="/settings"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-transparent border border-vast-ink/20 hover:bg-lumen-stone rounded-inputs text-vast-ink text-sm font-bold transition-colors"
          >
            <Settings className="w-4 h-4" />
            <span className="hidden sm:inline">Settings</span>
          </Link>
          <button
            onClick={logout}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-transparent border border-vast-ink/20 hover:bg-red-500/10 rounded-inputs text-red-500 text-sm font-bold transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Log out</span>
          </button>
        </div>
      </div>

      {/* 2. Command Center — matching Society & Admin */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <div className="bg-lumen-cream p-6 rounded-cards border border-vast-ink/20 flex flex-col justify-center space-y-5">
          <h3 className="font-extrabold text-lg text-vast-ink flex items-center gap-2">
            Command Center
          </h3>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => { setActiveTab('events'); setPage(1); setStatusFilter(''); }}
              className={`flex flex-col items-center justify-center gap-2 p-4 rounded-inputs font-bold transition-all relative ${
                activeTab === 'events'
                  ? 'bg-vast-ink text-pure-white'
                  : 'bg-transparent text-vast-ink border border-vast-ink/20 hover:bg-lumen-stone'
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
              className={`flex flex-col items-center justify-center gap-2 p-4 rounded-inputs font-bold transition-all relative ${
                activeTab === 'plans'
                  ? 'bg-vast-ink text-pure-white'
                  : 'bg-transparent text-vast-ink border border-vast-ink/20 hover:bg-lumen-stone'
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
        <div className="bg-lumen-cream p-6 rounded-cards border border-vast-ink/20 flex flex-col justify-center space-y-5 relative overflow-hidden group">
          <h3 className="font-extrabold text-lg text-vast-ink flex items-center gap-2 z-10">
            Review Queue
          </h3>
          <p className="text-sm font-medium text-fog z-10 leading-snug">
            Review, evaluate, and provide official feedback on {assignedSocietyName}'s event proposals and annual calendar plans.
          </p>

          {/* Status Filter */}
          <div className="relative z-10">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-fog pointer-events-none">
              <Filter className="w-4 h-4" />
            </div>
            <select
              value={statusFilter}
              onChange={handleStatusChange}
              className="w-full bg-transparent text-vast-ink text-sm font-semibold rounded-inputs border border-vast-ink/20 px-3.5 py-2 pl-10 transition-all outline-none focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 cursor-pointer"
            >
              <option value="">All Statuses</option>
              {activeTab === 'plans' && <option value="PENDING">Pending Review</option>}
              {activeTab === 'events' && <option value="PENDING_ADVISOR">Pending Review</option>}
              <option value="CHANGES_REQUESTED">Changes Requested</option>
              <option value="APPROVED">Approved</option>
              {activeTab === 'plans' && <option value="DRAFT">Draft</option>}
              {activeTab === 'events' && <option value="PUBLISHED">Published</option>}
            </select>
          </div>

          {/* Decorative background */}
          <FileText className="absolute -right-4 -bottom-4 w-40 h-40 text-vast-ink opacity-[0.03] z-0 pointer-events-none group-hover:scale-110 transition-transform duration-500" />
        </div>
      </div>

      {/* Error State */}
      {isError && (
        <div className="space-y-3">
          <Alert
            variant="error"
            message="Failed to load review queue. Ensure you are an assigned faculty advisor."
          />
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
              className="bg-transparent p-5 rounded-cards border border-vast-ink/20 space-y-3 animate-pulse"
            >
              <div className="flex justify-between items-center">
                <div className="h-5 bg-lumen-stone rounded w-1/3" />
                <div className="h-6 bg-lumen-stone rounded w-24" />
              </div>
              <div className="h-4 bg-lumen-stone rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : activeTab === 'plans' && plans.length === 0 ? (
        <div className="bg-transparent p-12 rounded-cards border border-vast-ink/20 text-center space-y-3 flex flex-col items-center">
          <FileText className="w-12 h-12 text-fog opacity-30" />
          <h3 className="font-bold text-vast-ink text-base">No Yearly Plans Found</h3>
          <p className="text-xs text-fog max-w-sm">
            There are no yearly calendar submissions matching your current filter.
          </p>
        </div>
      ) : activeTab === 'events' && events.length === 0 ? (
        <div className="bg-transparent p-12 rounded-cards border border-vast-ink/20 text-center space-y-3 flex flex-col items-center">
          <Calendar className="w-12 h-12 text-fog opacity-30" />
          <h3 className="font-bold text-vast-ink text-base">No Events Found</h3>
          <p className="text-xs text-fog max-w-sm">
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
                className="bg-transparent p-5 rounded-cards border border-vast-ink/20 hover:bg-lavender-whisper transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 group cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  {plan.society?.logoUrl ? (
                    <img
                      src={plan.society.logoUrl}
                      alt={plan.society.name}
                      className="w-12 h-12 rounded-inputs object-cover border border-vast-ink/20 shrink-0"
                    />
                  ) : (
                    <div className="p-3 bg-lumen-stone border border-vast-ink/20 text-vast-ink rounded-inputs shrink-0">
                      <Building2 className="w-6 h-6" />
                    </div>
                  )}

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-bold text-vast-ink text-base group-hover:text-ember-glow transition-colors">
                        {plan.society?.name || 'Assigned Society'}
                      </h3>
                      <span className="text-xs font-semibold text-fog">
                        ({plan.year} Calendar)
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-fog">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-vast-ink" />
                        <span>{plan.totalPlannedEvents} Planned Events</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-fog" />
                        <span>
                          Updated:{' '}
                          {new Date(plan.updatedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end w-full md:w-auto gap-4 pt-3 md:pt-0 border-t md:border-t-0 border-vast-ink">
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
                className="bg-transparent p-5 rounded-cards border border-vast-ink/20 hover:bg-lavender-whisper transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 group cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  {event.society?.logoUrl ? (
                    <img
                      src={event.society.logoUrl}
                      alt={event.society.name}
                      className="w-12 h-12 rounded-inputs object-cover border border-vast-ink/20 shrink-0"
                    />
                  ) : (
                    <div className="p-3 bg-lumen-stone border border-vast-ink/20 text-vast-ink rounded-inputs shrink-0">
                      <Building2 className="w-6 h-6" />
                    </div>
                  )}

                  <div className="space-y-1">
                    <h3 className="font-bold text-vast-ink text-base group-hover:text-ember-glow transition-colors">
                      {event.title}
                    </h3>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-fog">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-vast-ink" />
                        <span>{new Date(event.eventDate).toLocaleDateString()}</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-vast-ink" />
                        <span>{event.startTime} - {event.endTime}</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-vast-ink" />
                        <span>{event.venue}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end w-full md:w-auto gap-4 pt-3 md:pt-0 border-t md:border-t-0 border-vast-ink">
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
        <nav aria-label="Pagination" className="flex items-center justify-between pt-4 border-t-2 border-vast-ink text-xs font-semibold text-fog">
          <span>
            Page {meta.page} of {meta.totalPages} ({meta.total} items)
          </span>

          <div className="flex items-center gap-2">
            <button
              disabled={!meta.hasPreviousPage}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-lumen-stone border border-vast-ink/20 rounded-inputs hover:bg-lavender-whisper disabled:opacity-40 transition-colors"
              aria-label="Previous page"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <button
              disabled={!meta.hasNextPage}
              onClick={() => setPage((p) => p + 1)}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-lumen-stone border border-vast-ink/20 rounded-inputs hover:bg-lavender-whisper disabled:opacity-40 transition-colors"
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
