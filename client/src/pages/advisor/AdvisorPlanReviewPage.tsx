import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Building2,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Clock,
  Lock,
  MessageSquare,
  Send,
  Loader2,
} from 'lucide-react';
import { yearlyPlanService } from '@/services/yearly-plan.service';
import type { PlanStatus } from '@/types/yearly-plan.types';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { useForm } from 'react-hook-form';
import { FeedbackHistory } from '@/components/shared/FeedbackHistory';
import type { AxiosError } from 'axios';

export const AdvisorPlanReviewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [comment, setComment] = useState<string>('');
  const [serverError, setServerError] = useState<string | null>(null);

  // Query yearly plan by ID
  const {
    data: plan,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['yearlyPlanDetail', id],
    queryFn: () => yearlyPlanService.getPlanById(id!),
    enabled: !!id,
  });

  // Review plan mutation
  const reviewMutation = useMutation({
    mutationFn: (data: { decision: 'APPROVED' | 'CHANGES_REQUESTED'; comment?: string }) =>
      yearlyPlanService.reviewPlan(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['yearlyPlanDetail', id] });
      queryClient.invalidateQueries({ queryKey: ['advisorYearlyPlansQueue'] });
      queryClient.invalidateQueries({ queryKey: ['advisorPlans'] });
      navigate('/advisor/yearly-plans');
    },
    onError: (
      error: AxiosError<{ message?: string | string[]; error?: string }>,
    ) => {
      const respMessage = error.response?.data?.message;
      let errText = 'Failed to submit review decision.';
      if (Array.isArray(respMessage)) errText = respMessage.join(', ');
      else if (typeof respMessage === 'string') errText = respMessage;
      setServerError(errText);
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex flex-col justify-center items-center text-fog gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
        <p className="text-sm font-medium">Loading plan details for review...</p>
      </div>
    );
  }

  if (isError || !plan) {
    return (
      <div className="max-w-md mx-auto py-12 space-y-4 text-center">
        <Alert variant="error" message="Yearly plan not found or access denied." />
        <Link
          to="/advisor/yearly-plans"
          className="inline-flex items-center gap-2 text-sm text-ember-glow hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Review Queue</span>
        </Link>
      </div>
    );
  }

  const isApproved = plan.status === 'APPROVED';
  const isSaving = reviewMutation.isPending;

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

  const handleApprove = () => {
    setServerError(null);
    reviewMutation.mutate({ decision: 'APPROVED', comment: comment || undefined });
  };

  const handleRequestChanges = () => {
    setServerError(null);
    if (!comment.trim()) {
      setServerError('Please provide feedback comments explaining what changes are requested.');
      return;
    }
    reviewMutation.mutate({ decision: 'CHANGES_REQUESTED', comment: comment.trim() });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 text-left py-4">
      {/* Back Link */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 px-3.5 py-2 bg-pure-white hover:bg-lumen-stone border-2 border-vast-ink text-vast-ink text-xs font-bold rounded-buttons transition-all cursor-pointer shadow-[2px_2px_0px_0px_#1B1B18]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        {renderStatusBadge(plan.status)}
      </div>

      {/* Society Header */}
      <div className="bg-lumen-cream p-6 rounded-cards border-2 border-vast-ink flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          {plan.society?.logoUrl ? (
            <img
              src={plan.society.logoUrl}
              alt={plan.society.name}
              className="w-14 h-14 rounded-cards object-cover border-2 border-vast-ink"
            />
          ) : (
            <div className="p-3 bg-pure-white border border-ember-glow text-ember-glow rounded-cards border border-amber-500/20">
              <Building2 className="w-8 h-8" />
            </div>
          )}

          <div>
            <h1 className="text-2xl font-extrabold text-vast-ink">
              {plan.society?.name || 'Assigned Society'}
            </h1>
            <p className="text-sm text-fog">
              Annual Calendar Plan for Year <strong className="text-vast-ink">{plan.year}</strong>
            </p>
          </div>
        </div>

        {isApproved && (
          <div className="flex items-center gap-2 px-3.5 py-1.5 bg-pure-white border border-forest-ink rounded-inputs border border-emerald-500/20 text-forest-ink text-xs font-semibold">
            <Lock className="w-4 h-4" />
            <span>Approved &amp; Permanently Locked</span>
          </div>
        )}
      </div>

      {/* Server Error Alert */}
      {serverError && <Alert variant="error" message={serverError} />}

      {/* Events Table */}
      <div className="bg-lumen-cream p-6 rounded-cards border-2 border-vast-ink space-y-4">
        <h2 className="text-base font-bold text-vast-ink border-b-2 border-vast-ink pb-3 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-ember-glow" />
          <span>Submitted Calendar Events ({plan.plannedEvents?.length || 0})</span>
        </h2>

        {(!plan.plannedEvents || plan.plannedEvents.length === 0) ? (
          <p className="text-xs text-fog py-4 text-center">No events in this plan.</p>
        ) : (
          <div className="space-y-3">
            {plan.plannedEvents.map((evt, idx) => (
              <div
                key={evt.id}
                className="bg-pure-white p-4 rounded-inputs border-2 border-vast-ink flex flex-col md:flex-row justify-between items-start md:items-center gap-3"
              >
                <div className="space-y-1 w-full">
                  <span className="text-xs font-bold text-ember-glow">
                    Event #{idx + 1}: {evt.eventName}
                  </span>
                  <div className="grid grid-cols-1 gap-2 mt-2">
                    <p className="text-xs text-fog"><strong className="text-vast-ink">Venue:</strong> {evt.venue}</p>
                  </div>
                  <p className="text-xs text-fog mt-2"><strong className="text-vast-ink">Description:</strong> {evt.description}</p>
                  {evt.societyRules && (
                    <p className="text-xs text-fog mt-1">
                      <strong className="text-vast-ink">Society Guidelines:</strong> {evt.societyRules}
                    </p>
                  )}
                  {evt.rules && (
                    <p className="text-xs text-fog mt-1">
                      <strong className="text-vast-ink">Rules:</strong> {evt.rules}
                    </p>
                  )}
                  <div className="flex gap-2 mt-2">
                    <div className="text-xs font-semibold text-vast-ink font-medium bg-lumen-stone px-3 py-1.5 rounded-inputs border-2 border-vast-ink shrink-0 inline-block">
                      Start:{' '}
                      {new Date(evt.startDate).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </div>
                    <div className="text-xs font-semibold text-vast-ink font-medium bg-lumen-stone px-3 py-1.5 rounded-inputs border-2 border-vast-ink shrink-0 inline-block">
                      End:{' '}
                      {new Date(evt.endDate).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Review Comments & Decision Controls */}
      <div className="bg-lumen-cream p-6 rounded-cards border-2 border-vast-ink space-y-4">
        <h2 className="text-base font-bold text-vast-ink border-b-2 border-vast-ink pb-3 flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-ember-glow" />
          <span>Faculty Advisor Feedback &amp; Decision</span>
        </h2>

        {/* Existing Comments Callout */}
        {plan.advisorComments && (
          <div className="p-4 bg-lumen-cream rounded-inputs border-2 border-vast-ink shadow-sm space-y-1">
            <FeedbackHistory rawComments={plan.advisorComments} />
          </div>
        )}

        {!isApproved ? (
          <div className="space-y-4 pt-2">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-vast-ink font-medium">
                Advisor Comments / Revision Instructions
              </label>
              <textarea
                rows={4}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Type revision comments or feedback notes for the society officers..."
                className="w-full bg-pure-white text-vast-ink placeholder:text-fog text-sm rounded-inputs border-2 border-vast-ink p-3.5 transition-all outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
              />
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                size="lg"
                className="w-full sm:w-1/2"
                isLoading={isSaving}
                onClick={handleRequestChanges}
                leftIcon={<Send className="w-4 h-4" />}
              >
                Request Changes
              </Button>

              <Button
                type="button"
                variant="primary"
                size="lg"
                className="w-full sm:w-1/2"
                isLoading={isSaving}
                onClick={handleApprove}
                leftIcon={<CheckCircle2 className="w-5 h-5" />}
              >
                Approve Plan
              </Button>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-emerald-500/5 rounded-inputs border border-emerald-500/20 text-xs text-emerald-300">
            This plan was approved and locked. No further review modifications are required.
          </div>
        )}
      </div>
    </div>
  );
};
