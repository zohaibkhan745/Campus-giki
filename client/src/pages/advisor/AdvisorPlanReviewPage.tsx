import { getSocietyLogo } from '@/lib/utils';
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Building2,
  Calendar,
  CheckCircle2,
  Shield,
  Loader2,
  Send,
} from 'lucide-react';
import { yearlyPlanService } from '@/services/yearly-plan.service';
import { Button } from '@/components/ui/Button';
import { FeedbackHistory } from '@/components/shared/FeedbackHistory';
import { SmokeyCanvasBackground } from '@/components/ui/SmokeyCanvasBackground';
import type { AxiosError } from 'axios';

import { cn } from '@/lib/utils';
import { globalNotification } from '@/contexts/NotificationContext';
export const AdvisorPlanReviewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [comment, setComment] = useState<string>('');
  const [commentError, setCommentError] = useState<boolean>(false);

  const {
    data: plan,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['yearlyPlanDetail', id],
    queryFn: () => yearlyPlanService.getPlanById(id!),
    enabled: !!id,
  });

  const reviewMutation = useMutation({
    meta: { notify: true },
    mutationFn: (data: { decision: 'APPROVED' | 'CHANGES_REQUESTED'; comment?: string }) =>
      yearlyPlanService.reviewPlan(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['yearlyPlanDetail', id] });
      queryClient.invalidateQueries({ queryKey: ['advisorYearlyPlansQueue'] });
      queryClient.invalidateQueries({ queryKey: ['advisorPlans'] });
      setComment('');
    }
  });

  const handleApprove = () => {
    reviewMutation.mutate({ decision: 'APPROVED', comment: comment || undefined });
  };

  const handleRequestChanges = () => {
    if (!comment.trim()) {
      setCommentError(true);
      globalNotification.triggerFailed('Please add a comment detailing the requested changes.');
      return;
    }
    setCommentError(false);
    reviewMutation.mutate({ decision: 'CHANGES_REQUESTED', comment: comment.trim() });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen w-screen bg-gray-950 flex flex-col justify-center items-center text-white gap-3 m-0">
        <Loader2 className="w-8 h-8 animate-spin text-white" />
        <p className="text-sm font-medium text-gray-400">Loading plan details for review...</p>
      </div>
    );
  }

  if (isError || !plan) {
    return (
      <div className="min-h-screen w-screen bg-gray-950 flex flex-col justify-center items-center py-12 space-y-4 text-center m-0">
        <p className="text-red-500 font-bold">Failed to load plan</p>
        <button
          onClick={() => navigate('/advisor/yearly-plans')}
          className="inline-flex items-center gap-2 text-white bg-white/10 px-4 py-2 rounded-xl"
        >
          <ArrowLeft className="w-4 h-4" /> Go Back
        </button>
      </div>
    );
  }

  const isApproved = plan.status === 'APPROVED' || plan.status === 'PENDING_ADMIN';
  const isPendingAdvisor = plan.status === 'PENDING_ADVISOR' || plan.status === 'PENDING';

  return (
    <div className="relative min-h-screen w-full bg-gray-950 overflow-x-hidden overflow-y-auto m-0 flex justify-center py-10 px-4">
      <SmokeyCanvasBackground />
      
      <div className="relative z-10 w-full max-w-4xl mx-auto flex flex-col gap-6 text-left">
        <button
          onClick={() => navigate(-1)}
          className="fixed top-4 left-4 sm:top-6 sm:left-6 z-[100] inline-flex items-center justify-center w-10 h-10 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white rounded-full transition-all cursor-pointer shadow-lg"
          title="Go Back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="flex flex-col gap-3">
          <span className="inline-block w-fit px-3 py-1 rounded-md text-xs font-semibold bg-gray-800 text-gray-400">
            {plan.status.replace('_', ' ')}
          </span>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-[#007ebb] p-1 flex items-center justify-center border-2 border-white/80 shrink-0 shadow-lg overflow-hidden">
              {plan.society?.logoUrl ? (
                <img src={getSocietyLogo(plan.society.logoUrl)} className="w-full h-full rounded-full object-cover bg-white" alt="logo" onError={(e) => { e.currentTarget.src = '/default-society.jpg'; }} />
              ) : (
                <div className="w-full h-full rounded-full border border-white/70 flex flex-col items-center justify-center select-none bg-[#007ebb]">
                  <span className="text-white text-xs font-bold leading-none">{plan.society?.name?.substring(0,3).toLowerCase() || 'SOC'}</span>
                  <span className="text-white text-[7px] uppercase font-semibold mt-0.5">Chapter</span>
                </div>
              )}
            </div>
            <div className="flex flex-col">
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">{plan.society?.name}</h1>
              <p className="text-sm text-gray-400">Annual Calendar Plan for Year <span className="font-bold text-white">{plan.year}</span></p>
            </div>
          </div>
        </div>

        <div className="bg-gray-900/60 border border-white/10 rounded-2xl p-5 sm:p-7 backdrop-blur-md flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-white">Faculty Advisor Feedback &amp; Decision</h2>
            </div>
          </div>

          {plan.advisorComments && (
            <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-1">
              <h3 className="text-xs font-bold text-gray-300 uppercase">Advisor Feedback History</h3>
              <FeedbackHistory rawComments={plan.advisorComments} />
            </div>
          )}

          {isPendingAdvisor ? (
            <div className="space-y-4 pt-2">
              <div className="space-y-1 text-left">
                <label className="text-xs font-semibold text-gray-300 font-medium">
                  Advisor Comments / Revision Instructions
                </label>
                <textarea
                  rows={4}
                  value={comment}
                  onChange={(e) => {
                    setComment(e.target.value);
                    if (e.target.value.trim()) setCommentError(false);
                  }}
                  placeholder="Type revision comments or feedback notes for the society officers..."
                  className={cn(
                    "w-full bg-white/5 text-white placeholder:text-gray-500 text-sm rounded-xl border p-3.5 transition-all outline-none",
                    commentError 
                      ? "border-red-500/50 ring-2 ring-red-500/20 focus:border-red-500" 
                      : "border-white/10 focus:border-white/30 focus:ring-2 focus:ring-white/10"
                  )}
                />
                {commentError && (
                  <p className="text-red-400 text-xs mt-1">Comment is required to request changes.</p>
                )}
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-1/2 bg-white/5 hover:bg-white/10 text-white border-white/10"
                  isLoading={reviewMutation.isPending}
                  onClick={handleRequestChanges}
                  leftIcon={<Send className="w-4 h-4" />}
                >
                  Request Changes
                </Button>

                <Button
                  type="button"
                  variant="primary"
                  size="lg"
                  className="w-full sm:w-1/2 bg-emerald-500 text-white hover:bg-emerald-600 border-transparent shadow-md"
                  isLoading={reviewMutation.isPending}
                  onClick={handleApprove}
                >
                  Approve Plan (Forward to DSA)
                </Button>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-xs text-emerald-400 font-bold">
              {isApproved ? 'You have already approved this plan.' : 'This plan is not currently pending your review.'}
            </div>
          )}
        </div>

        <div className="bg-gray-900/60 border border-white/10 rounded-2xl p-5 sm:p-7 backdrop-blur-md flex flex-col">
          <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-4 mb-4">
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-bold text-white">Submitted Events</h2>
            </div>
            <span className="px-3 py-1.5 rounded-lg text-sm font-bold bg-white/10 text-white border border-white/10">{plan.plannedEvents?.length || 0} Events</span>
          </div>

          <div className="flex flex-col">
            {plan.plannedEvents?.map((event: any, idx: number) => (
              <div key={idx} className="py-5 first:pt-0 last:pb-0 border-b border-white/5 last:border-b-0 group">
                <div className="flex flex-col sm:flex-row gap-4 justify-between">
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Event {idx + 1}:</span>
                    <h3 className="text-base sm:text-lg font-bold text-white leading-tight">{event.eventName}</h3>
                    
                    <div className="flex flex-wrap gap-2 mt-3 mb-2">
                      <span className="inline-flex items-center gap-1.5 text-sm text-gray-300">
                        Venue: <span className="font-bold text-base text-white">{event.venue || 'N/A'}</span>
                      </span>
                    </div>

                    <div className="mt-2">
                      <span className="inline-flex items-center gap-1.5 text-sm text-gray-300 mb-1.5">
                        Description:
                      </span>
                      <div className="p-3 bg-white/5 border border-white/10 rounded-lg">
                        <p className="text-sm text-gray-300 leading-relaxed">{event.description}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col sm:items-end gap-1.5 shrink-0 sm:min-w-[140px]">
                    {event.startDate && event.endDate && new Date(event.startDate).getTime() === new Date(event.endDate).getTime() ? (
                      <>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 mb-1">1 Day Event</span>
                        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Event Date</span>
                        <span className="text-sm font-bold text-white">
                          {new Date(event.startDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20 mb-1">
                          {event.startDate && event.endDate ? 
                            (() => {
                              const diffTime = Math.abs(new Date(event.endDate).getTime() - new Date(event.startDate).getTime());
                              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
                              if (diffDays === 7) return "1 Week Event";
                              return `${diffDays} Day Event`;
                            })() 
                            : "Multi-Day Event"
                          }
                        </span>
                        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Start Date</span>
                        <span className="text-sm font-bold text-white">
                          {event.startDate ? new Date(event.startDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}
                        </span>
                        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider mt-2">End Date</span>
                        <span className="text-sm font-bold text-white">
                          {event.endDate ? new Date(event.endDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {(!plan.plannedEvents || plan.plannedEvents.length === 0) && (
              <p className="text-sm text-gray-400 py-4 text-center">No events in this annual plan.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
