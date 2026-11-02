import { getSocietyLogo } from '@/lib/utils';
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { invalidatePlanQueries } from '@/lib/queryInvalidations';
import { Button } from '@/components/ui/Button';
import {
  Calendar,
  CheckCircle2,
  ShieldCheck,
  Loader2,
  AlertCircle,
  Printer,
  Clock,
  MapPin,
} from 'lucide-react';
import { adminService } from '@/services/admin.service';
import { yearlyPlanService } from '@/services/yearly-plan.service';
import type { ReviewYearlyPlanPayload } from '@/services/yearly-plan.service';
import { FeedbackHistory } from '@/components/shared/FeedbackHistory';
import { ErrorState, BackButton, SmokeyCanvasBackground } from '@/components/ui';
import { RequestChangesModal } from '@/components/events/RequestChangesModal';
import { YearlyPlanPrintModal } from '@/components/calendar/YearlyPlanPrintModal';

const getBadgeStyles = (status: string) => {
  switch (status) {
    case 'APPROVED':
      return 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30';
    case 'PENDING_ADMIN':
      return 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30';
    case 'PENDING_ADVISOR':
    case 'PENDING':
      return 'bg-orange-500/20 text-orange-600 dark:text-orange-400 border-orange-500/30';
    case 'CHANGES_REQUESTED':
      return 'bg-rose-500/20 text-rose-600 dark:text-rose-400 border-rose-500/30';
    default:
      return 'bg-surface-hover text-text-muted border-border-subtle';
  }
};

export const AdminYearlyPlanDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [isRequestChangesOpen, setIsRequestChangesOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  const {
    data: plan,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['adminYearlyPlanDetail', id],
    queryFn: () => adminService.getYearlyPlanDetailById(id!),
    enabled: !!id,
  });

  const reviewMutation = useMutation({
    meta: { notify: true },
    mutationFn: (payload: ReviewYearlyPlanPayload) => yearlyPlanService.reviewPlan(id!, payload),
    onSuccess: (_, variables) => {
      void invalidatePlanQueries(queryClient, id);
      setIsRequestChangesOpen(false);
      if (variables.decision === 'APPROVED') {
        navigate('/admin/yearly-plans', { replace: true });
      }
    },
  });

  const resolveEditRequestMutation = useMutation({
    meta: { notify: true },
    mutationFn: (status: 'APPROVED' | 'REJECTED') => yearlyPlanService.resolveEditRequest(id!, status),
    onSuccess: () => {
      void invalidatePlanQueries(queryClient, id);
    },
  });

  const handleApprove = () => {
    reviewMutation.mutate({ decision: 'APPROVED' });
  };

  const handleConfirmRequestChanges = (comments?: string) => {
    reviewMutation.mutate({ decision: 'CHANGES_REQUESTED', comment: comments });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen w-full bg-canvas flex flex-col justify-center items-center text-text-primary gap-3 m-0">
        <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
        <p className="text-sm font-medium text-text-secondary">Loading DSA audit record...</p>
      </div>
    );
  }

  if (isError || !plan) {
    return (
      <div className="min-h-screen w-full bg-canvas flex flex-col justify-center items-center py-12 px-4 text-center m-0">
        <div className="w-full max-w-2xl">
          <ErrorState
            error={error}
            title={isError ? undefined : 'Yearly Plan Not Found'}
            message={
              isError
                ? undefined
                : 'The requested annual calendar plan could not be found or may have been deleted.'
            }
            badge={isError ? undefined : 'Plan Unavailable'}
            onRetry={isError ? () => refetch() : undefined}
            secondaryAction={{
              label: 'Back to Yearly Plans',
              to: '/admin/yearly-plans',
            }}
          />
        </div>
      </div>
    );
  }

  const isApproved = plan.status === 'APPROVED';
  const isPendingAdmin = plan.status === 'PENDING_ADMIN';

  return (
    <div className="relative min-h-screen w-full bg-canvas overflow-x-hidden overflow-y-auto m-0 flex justify-center py-8 px-4 pb-32">
      <SmokeyCanvasBackground />

      <div className="relative z-10 w-full max-w-4xl mx-auto flex flex-col gap-6 text-left">
        {/* Navigation */}
        <div className="flex items-center">
          <BackButton variant="inline" fallback="/admin/yearly-plans" />
        </div>

        {/* Header Summary */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-brand-primary p-1 flex items-center justify-center border-2 border-border-medium shrink-0 shadow-lg overflow-hidden">
              {plan.society?.logoUrl ? (
                <img
                  src={getSocietyLogo(plan.society.logoUrl)}
                  className="w-full h-full rounded-full object-cover bg-white"
                  alt="logo"
                  onError={(e) => {
                    e.currentTarget.src = '/default-society.jpg';
                  }}
                />
              ) : (
                <div className="w-full h-full rounded-full border border-white/70 flex flex-col items-center justify-center select-none bg-brand-primary">
                  <span className="text-white text-xs font-bold leading-none">
                    {plan.society?.name?.substring(0, 3).toLowerCase() || 'SOC'}
                  </span>
                  <span className="text-white text-[7px] uppercase font-semibold mt-0.5">Chapter</span>
                </div>
              )}
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2 mb-1">
                <span
                  className={`px-2.5 py-0.5 border backdrop-blur-md rounded-md text-[11px] uppercase tracking-wider font-bold ${getBadgeStyles(
                    plan.status,
                  )}`}
                >
                  {plan.status.replace('_', ' ')}
                </span>
                <span className="text-xs text-text-muted font-medium">Academic Year {plan.year}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-text-primary tracking-tight">
                {plan.society?.name}
              </h1>
              <p className="text-xs sm:text-sm text-text-secondary mt-0.5">
                DSA Official Audit Record • {plan.plannedEvents?.length || 0} Planned Events
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-center">
            <Button
              type="button"
              variant="outline"
              size="md"
              className="bg-surface hover:bg-surface-hover border-border-medium text-text-primary font-bold shadow-sm flex items-center gap-2 cursor-pointer"
              onClick={() => setIsPrintModalOpen(true)}
              leftIcon={<Printer className="w-4 h-4 text-blue-500" />}
            >
              Print / Save PDF
            </Button>
          </div>
        </div>

        {/* Edit Access Request Banner (If society requested changes to an approved calendar) */}
        {plan.editRequestStatus === 'PENDING' && (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-5 sm:p-6 backdrop-blur-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-base font-bold text-amber-600 dark:text-amber-400">Edit Access Requested</h3>
                <p className="text-xs sm:text-sm text-amber-700/80 dark:text-amber-300/80 mt-1">
                  The society has requested permission to modify this approved yearly plan.
                </p>
                {plan.editRequestReason && (
                  <p className="text-xs sm:text-sm text-text-primary font-medium mt-2 bg-surface-glass p-2.5 rounded-lg border border-amber-500/20">
                    <strong>Reason:</strong> {plan.editRequestReason}
                  </p>
                )}
              </div>
            </div>
            <div className="flex sm:flex-col gap-2 shrink-0 w-full sm:w-auto">
              <Button
                variant="primary"
                className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold border-none shadow-md flex-1 sm:flex-none"
                onClick={() => resolveEditRequestMutation.mutate('APPROVED')}
                isLoading={resolveEditRequestMutation.isPending}
              >
                Approve Edit Request
              </Button>
              <Button
                variant="outline"
                className="bg-surface hover:bg-surface-hover text-amber-600 dark:text-amber-400 border-amber-500/30 hover:border-amber-500/50 flex-1 sm:flex-none"
                onClick={() => resolveEditRequestMutation.mutate('REJECTED')}
                isLoading={resolveEditRequestMutation.isPending}
              >
                Reject Request
              </Button>
            </div>
          </div>
        )}

        {/* Previous Remarks / Feedback History (Shown only if DSA feedback exists) */}
        {plan.advisorComments && (
          <FeedbackHistory
            rawComments={plan.advisorComments}
            currentStatus={plan.status}
            filterRole="DSA Admin"
          />
        )}

        {/* Submitted Events (Content First) */}
        <div className="bg-surface border border-border-subtle rounded-2xl p-5 sm:p-7 backdrop-blur-md shadow-elevation-1 flex flex-col">
          <div className="flex items-center justify-between gap-4 border-b border-border-subtle pb-4 mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-brand-primary" />
              <h2 className="text-lg sm:text-xl font-bold text-text-primary">Planned Calendar Events</h2>
            </div>
            <span className="px-3 py-1 rounded-lg text-xs sm:text-sm font-bold bg-surface-glass text-text-primary border border-border-subtle">
              {plan.plannedEvents?.length || 0} Events
            </span>
          </div>

          <div className="flex flex-col">
            {plan.plannedEvents?.map((event: any, idx: number) => (
              <div key={idx} className="py-5 first:pt-0 last:pb-0 border-b border-border-subtle last:border-b-0 group">
                <div className="flex flex-col sm:flex-row gap-4 justify-between">
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1">
                      Event {idx + 1}:
                    </span>
                    <h3 className="text-base sm:text-lg font-bold text-text-primary leading-tight">
                      {event.eventName}
                    </h3>

                    <div className="flex flex-wrap items-center gap-3 mt-2.5 mb-2">
                      <span className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-text-secondary">
                        <MapPin className="w-3.5 h-3.5 text-text-muted shrink-0" />
                        Venue: <strong className="text-text-primary">{event.venue || 'Campus Venue TBD'}</strong>
                      </span>
                      {event.eventType && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                          {event.eventType}
                        </span>
                      )}
                    </div>

                    {event.description && (
                      <div className="mt-2">
                        <div className="p-3 bg-surface-glass border border-border-subtle rounded-xl">
                          <p className="text-xs sm:text-sm text-text-secondary leading-relaxed whitespace-pre-wrap">
                            {event.description}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col sm:items-end gap-1 shrink-0 sm:min-w-[150px]">
                    {event.startDate &&
                    event.endDate &&
                    new Date(event.startDate).getTime() === new Date(event.endDate).getTime() ? (
                      <>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 mb-1">
                          {event.duration || '1 Day Event'}
                        </span>
                        <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">Date</span>
                        <span className="text-sm font-bold text-text-primary">
                          {new Date(event.startDate).toLocaleDateString('en-GB', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 mb-1">
                          {event.duration || 'Multi-Day Event'}
                        </span>
                        <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">Start</span>
                        <span className="text-xs sm:text-sm font-bold text-text-primary">
                          {event.startDate
                            ? new Date(event.startDate).toLocaleDateString('en-GB', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                              })
                            : 'N/A'}
                        </span>
                        <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider mt-1">End</span>
                        <span className="text-xs sm:text-sm font-bold text-text-primary">
                          {event.endDate
                            ? new Date(event.endDate).toLocaleDateString('en-GB', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                              })
                            : 'N/A'}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {(!plan.plannedEvents || plan.plannedEvents.length === 0) && (
              <p className="text-sm text-text-muted py-6 text-center">No events listed in this annual plan.</p>
            )}
          </div>
        </div>

        {/* Decision & Actions Section (Bottom) */}
        <div className="bg-surface border border-border-subtle rounded-2xl p-5 sm:p-7 backdrop-blur-md shadow-elevation-1 space-y-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-brand-primary" />
            <h2 className="text-base sm:text-lg font-bold text-text-primary">
              DSA Decision
            </h2>
          </div>

          {isPendingAdmin ? (
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button
                type="button"
                variant="primary"
                onClick={handleApprove}
                isLoading={reviewMutation.isPending && reviewMutation.variables?.decision === 'APPROVED'}
                disabled={reviewMutation.isPending}
                leftIcon={<CheckCircle2 className="w-4 h-4 text-white" />}
                className="bg-emerald-600 text-white hover:bg-emerald-700 w-full sm:flex-1 py-3"
              >
                Approve &amp; Finalize Calendar
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsRequestChangesOpen(true)}
                disabled={reviewMutation.isPending}
                leftIcon={<AlertCircle className="w-4 h-4 text-amber-500" />}
                className="bg-surface hover:bg-surface-hover text-text-primary border border-border-medium w-full sm:flex-1 py-3"
              >
                Request Changes
              </Button>
            </div>
          ) : (
            <div className="p-3.5 rounded-xl bg-surface-glass border border-border-subtle text-xs sm:text-sm text-text-secondary flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>
                {isApproved
                  ? 'This annual calendar plan has been approved and officially finalized by the DSA.'
                  : `Plan status is currently ${plan.status.replace('_', ' ')}.`}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Request Changes Modal */}
      <RequestChangesModal
        isOpen={isRequestChangesOpen}
        onClose={() => setIsRequestChangesOpen(false)}
        onSubmit={handleConfirmRequestChanges}
        isLoading={reviewMutation.isPending && reviewMutation.variables?.decision === 'CHANGES_REQUESTED'}
        reviewerRole="DSA_ADMIN"
        title="Request Changes"
        eventTitle={`${plan.society?.name} • ${plan.year} Calendar`}
      />

      {/* Yearly Plan Print / PDF Modal */}
      <YearlyPlanPrintModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        plan={plan}
      />
    </div>
  );
};
