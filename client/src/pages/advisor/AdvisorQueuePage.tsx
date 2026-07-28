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
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { advisorService } from '@/services/advisor.service';
import type { PlanStatus } from '@/types/yearly-plan.types';
import { Alert } from '@/components/ui/Alert';

export const AdvisorQueuePage: React.FC = () => {
  const { logout } = useAuth();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'plans' | 'events'>('plans');
  const [rejectingEventId, setRejectingEventId] = useState<string | null>(null);
  const [rejectComment, setRejectComment] = useState<string>('');

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

  const updateEventStatusMutation = useMutation({
    mutationFn: ({ eventId, status, comments }: { eventId: string; status: string; comments?: string }) =>
      advisorService.updateEventStatus(eventId, { status, comments }),
    onSuccess: () => {
      setRejectingEventId(null);
      setRejectComment('');
      queryClient.invalidateQueries({ queryKey: ['advisorEventsQueue'] });
    },
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
    <div className="max-w-5xl mx-auto space-y-6 text-left py-4">
      {/* Header Banner */}
      <div className="space-y-1 bg-pure-white p-6 rounded-cards border-2 border-vast-ink flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-ember-glow text-xs font-semibold uppercase tracking-wider mb-1">
            <FileText className="w-4 h-4" />
            <span>Faculty Advisor Portal</span>
          </div>
          <h1 className="text-2xl font-extrabold text-vast-ink">
            {activeTab === 'plans' ? 'Yearly Calendar Review Queue' : 'Individual Events Review Queue'}
          </h1>
          <p className="text-sm text-fog">
            Review, evaluate, and provide official feedback on society submissions.
          </p>
        </div>

        {/* Status Filter Selector */}
        <div className="relative flex items-center w-full md:w-56">
          <div className="absolute left-3 text-fog pointer-events-none flex items-center justify-center">
            <Filter className="w-4 h-4" />
          </div>
          <select
            value={statusFilter}
            onChange={handleStatusChange}
            className="w-full bg-pure-white text-vast-ink placeholder:text-fog text-sm rounded-inputs border-2 border-vast-ink px-3.5 py-2 pl-10 transition-all outline-none focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
          >
            <option value="">All Statuses</option>
            <option value="PENDING">Pending Review</option>
            <option value="CHANGES_REQUESTED">Changes Requested</option>
            <option value="APPROVED">Approved</option>
            {activeTab === 'plans' && <option value="DRAFT">Draft</option>}
            {activeTab === 'events' && <option value="PENDING_ADVISOR">Pending Advisor</option>}
            {activeTab === 'events' && <option value="PUBLISHED">Published</option>}
          </select>
          <button
            onClick={logout}
            className="ml-3 inline-flex items-center gap-2 px-4 py-2 bg-pure-white border border-vast-ink hover:bg-red-500/20 border border-red-500/20 rounded-inputs text-red-400 text-xs font-bold transition-colors shrink-0 h-[38px]"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Log out</span>
          </button>
        </div>
      </div>

      <div className="flex border-b-2 border-vast-ink mt-4">
        <button
          onClick={() => { setActiveTab('plans'); setPage(1); setStatusFilter(''); }}
          className={`px-4 py-2 font-bold text-sm transition-colors ${activeTab === 'plans' ? 'border-b-4 border-ember-glow text-vast-ink' : 'text-fog hover:text-vast-ink'}`}
        >
          Annual Plans
        </button>
        <button
          onClick={() => { setActiveTab('events'); setPage(1); setStatusFilter(''); }}
          className={`px-4 py-2 font-bold text-sm transition-colors ${activeTab === 'events' ? 'border-b-4 border-ember-glow text-vast-ink' : 'text-fog hover:text-vast-ink'}`}
        >
          Individual Events
        </button>
      </div>

      {/* Error Callout */}
      {isError && (
        <div className="space-y-3">
          <Alert
            variant="error"
            message="Failed to load review queue. Ensure you are an assigned faculty advisor."
          />
          <button
            onClick={() => refetch()}
            className="text-xs text-ember-glow hover:underline font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 rounded"
          >
            Retry Loading Queue
          </button>
        </div>
      )}

      {/* Loading Skeleton */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-pure-white p-6 rounded-cards border-2 border-vast-ink space-y-3 animate-pulse"
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
        <div className="bg-pure-white p-12 rounded-cards border-2 border-vast-ink text-center space-y-3">
          <FileText className="w-12 h-12 text-fog mx-auto" />
          <h3 className="font-bold text-vast-ink text-base">No Yearly Plans Found</h3>
          <p className="text-xs text-fog max-w-sm mx-auto">
            There are currently no yearly calendar submissions matching your status filter for your assigned society.
          </p>
        </div>
      ) : activeTab === 'events' && events.length === 0 ? (
        <div className="bg-pure-white p-12 rounded-cards border-2 border-vast-ink text-center space-y-3">
          <Calendar className="w-12 h-12 text-fog mx-auto" />
          <h3 className="font-bold text-vast-ink text-base">No Events Found</h3>
          <p className="text-xs text-fog max-w-sm mx-auto">
            There are currently no events matching your status filter for your assigned society.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {activeTab === 'plans' ? (
            plans.map((plan) => (
              <Link
                key={plan.id}
                to={`/advisor/yearly-plans/${plan.id}`}
                className="bg-pure-white p-5 rounded-cards border-2 border-vast-ink hover:border-2 border-vast-ink transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 group cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
              >
                <div className="flex items-center gap-4">
                  {plan.society?.logoUrl ? (
                    <img
                      src={plan.society.logoUrl}
                      alt={plan.society.name}
                      className="w-12 h-12 rounded-inputs object-cover border-2 border-vast-ink shrink-0"
                    />
                  ) : (
                    <div className="p-3 bg-pure-white border border-ember-glow text-ember-glow rounded-inputs border border-amber-500/20 shrink-0">
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
                    <span>Review Plan</span>
                    <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </Link>
            ))
          ) : (
            events.map((event: any) => (
              <div
                key={event.id}
                className="bg-pure-white p-5 rounded-cards border-2 border-vast-ink flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4">
                  {event.society?.logoUrl ? (
                    <img
                      src={event.society.logoUrl}
                      alt={event.society.name}
                      className="w-12 h-12 rounded-inputs object-cover border-2 border-vast-ink shrink-0"
                    />
                  ) : (
                    <div className="p-3 bg-pure-white border border-ember-glow text-ember-glow rounded-inputs border border-amber-500/20 shrink-0">
                      <Building2 className="w-6 h-6" />
                    </div>
                  )}

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-bold text-vast-ink text-base">
                        {event.title}
                      </h3>
                    </div>

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

                <div className="flex flex-col w-full md:w-auto gap-3 pt-3 md:pt-0">
                  <div className="flex flex-col md:flex-row items-end md:items-center justify-end gap-3 w-full">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-lumen-stone text-vast-ink font-medium rounded-inputs text-xs font-semibold">
                      {event.approvalStatus}
                    </span>
                    
                    {event.approvalStatus === 'PENDING_ADVISOR' && rejectingEventId !== event.id && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateEventStatusMutation.mutate({ eventId: event.id, status: 'PENDING_ADMIN' })}
                          disabled={updateEventStatusMutation.isPending}
                          className="px-3 py-1.5 bg-emerald-500 text-pure-white hover:bg-emerald-600 rounded-inputs text-xs font-bold transition-colors disabled:opacity-50"
                        >
                          Approve (Send to DSA)
                        </button>
                        <button
                          onClick={() => { setRejectingEventId(event.id); setRejectComment(''); }}
                          disabled={updateEventStatusMutation.isPending}
                          className="px-3 py-1.5 bg-pure-white border-2 border-vast-ink hover:bg-red-500/10 text-red-500 rounded-inputs text-xs font-bold transition-colors disabled:opacity-50"
                        >
                          Request Changes
                        </button>
                      </div>
                    )}
                  </div>

                  {rejectingEventId === event.id && (
                    <div className="w-full space-y-3 mt-2 bg-lumen-stone p-4 rounded-cards border-2 border-vast-ink animate-in slide-in-from-top-2">
                      <label className="block text-sm font-bold text-vast-ink">
                        Reason for requesting changes
                      </label>
                      <textarea
                        value={rejectComment}
                        onChange={(e) => setRejectComment(e.target.value)}
                        placeholder="Please provide details so the society can update their event..."
                        className="w-full p-3 rounded-inputs border-2 border-vast-ink bg-pure-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 min-h-[80px]"
                      />
                      <div className="flex items-center gap-2 justify-end">
                        <button
                          onClick={() => setRejectingEventId(null)}
                          className="px-3 py-1.5 text-xs font-bold text-fog hover:text-vast-ink transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => updateEventStatusMutation.mutate({ eventId: event.id, status: 'CHANGES_REQUESTED', comments: rejectComment })}
                          disabled={updateEventStatusMutation.isPending || !rejectComment.trim()}
                          className="px-4 py-1.5 bg-red-500 text-pure-white hover:bg-red-600 rounded-inputs text-xs font-bold transition-colors disabled:opacity-50 flex items-center gap-1.5"
                        >
                          {updateEventStatusMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                          Submit Feedback
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
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
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-lumen-stone border-2 border-vast-ink rounded-inputs hover:bg-lumen-stone disabled:opacity-40 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
              aria-label="Previous page"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <button
              disabled={!meta.hasNextPage}
              onClick={() => setPage((p) => p + 1)}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-lumen-stone border-2 border-vast-ink rounded-inputs hover:bg-lumen-stone disabled:opacity-40 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
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
