import { getSocietyLogo } from '@/lib/utils';
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import {
  ArrowLeft,
  Building2,
  Calendar,
  CheckCircle2,
  Shield,
  Loader2,
  Send,
} from 'lucide-react';
import { adminService } from '@/services/admin.service';
import { yearlyPlanService } from '@/services/yearly-plan.service';
import type { ReviewYearlyPlanPayload } from '@/services/yearly-plan.service';
import { FeedbackHistory } from '@/components/shared/FeedbackHistory';
import { SmokeyCanvasBackground } from '@/components/ui/SmokeyCanvasBackground';

export const AdminYearlyPlanDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [comment, setComment] = useState('');

  const {
    data: plan,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['adminYearlyPlanDetail', id],
    queryFn: () => adminService.getYearlyPlanDetailById(id!),
    enabled: !!id,
  });

  const reviewMutation = useMutation({
    meta: { notify: true },
    mutationFn: (payload: ReviewYearlyPlanPayload) => yearlyPlanService.reviewPlan(id!, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminYearlyPlanDetail', id] });
      queryClient.invalidateQueries({ queryKey: ['adminDashboard'] });
      setComment('');
    }
  });

  const handleApprove = () => {
    reviewMutation.mutate({ decision: 'APPROVED', comment });
  };

  const handleRequestChanges = () => {
    reviewMutation.mutate({ decision: 'CHANGES_REQUESTED', comment });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen w-screen bg-gray-950 flex flex-col justify-center items-center text-white gap-3 m-0">
        <Loader2 className="w-8 h-8 animate-spin text-white" />
        <p className="text-sm font-medium text-gray-400">Loading DSA audit record...</p>
      </div>
    );
  }

  if (isError || !plan) {
    return (
      <div className="min-h-screen w-screen bg-gray-950 flex flex-col justify-center items-center py-12 space-y-4 text-center m-0">
        <p className="text-red-500 font-bold">Failed to load plan</p>
        <button
          onClick={() => navigate('/admin/yearly-plans')}
          className="inline-flex items-center gap-2 text-white bg-white/10 px-4 py-2 rounded-xl"
        >
          <ArrowLeft className="w-4 h-4" /> Go Back
        </button>
      </div>
    );
  }

  const isApproved = plan.status === 'APPROVED';
  const isPendingAdmin = plan.status === 'PENDING_ADMIN' || plan.status === 'PENDING';

  return (
    <div className="relative min-h-screen w-screen bg-gray-950 overflow-x-hidden overflow-y-auto m-0 flex justify-center py-10 px-4">
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
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-white" />
            <h2 className="text-base sm:text-lg font-bold text-white">DSA Admin Feedback &amp; Decision</h2>
          </div>

          {plan.advisorComments && (
            <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-1">
              <h3 className="text-xs font-bold text-gray-300 uppercase">Advisor Feedback History</h3>
              <FeedbackHistory rawComments={plan.advisorComments} />
            </div>
          )}

          {!isApproved ? (
            <div className="space-y-4 pt-2">
              <div className="space-y-1 text-left">
                <label className="text-xs font-semibold text-gray-300 font-medium">
                  Admin Comments / Revision Instructions
                </label>
                <textarea
                  rows={4}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Type revision comments or feedback notes for the society officers..."
                  className="w-full bg-white/5 text-white placeholder:text-gray-500 text-sm rounded-xl border border-white/10 p-3.5 transition-all outline-none focus:border-white/30 focus:ring-2 focus:ring-white/10"
                  disabled={!isPendingAdmin}
                />
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
                  disabled={!isPendingAdmin}
                >
                  Request Changes
                </Button>

                <Button
                  type="button"
                  variant="primary"
                  size="lg"
                  className="w-full sm:w-1/2 bg-white text-gray-900 hover:bg-gray-200"
                  isLoading={reviewMutation.isPending}
                  onClick={handleApprove}
                  leftIcon={<CheckCircle2 className="w-5 h-5" />}
                  disabled={!isPendingAdmin}
                >
                  Approve Plan
                </Button>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-xs text-emerald-400 font-bold">
              This plan was approved and locked. No further review modifications are required.
            </div>
          )}
        </div>

        <div className="bg-gray-900/60 border border-white/10 rounded-2xl p-5 sm:p-7 backdrop-blur-md flex flex-col">
          <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-4 mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-white" />
              <h2 className="text-base sm:text-lg font-bold text-white">Submitted Events</h2>
            </div>
            <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-white/10 text-white">{plan.plannedEvents?.length || 0} Events</span>
          </div>

          <div className="flex flex-col">
            {plan.plannedEvents?.map((event: any, idx: number) => (
              <div key={idx} className="py-5 first:pt-0 last:pb-0 border-b border-white/5 last:border-b-0 group">
                <div className="flex flex-col sm:flex-row gap-4 justify-between">
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Event {idx + 1}:</span>
                    <h3 className="text-base sm:text-lg font-bold text-white leading-tight">{event.eventName}</h3>
                    
                    <div className="flex flex-wrap gap-2 mt-3 mb-2">
                      <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-white/5 border border-white/10 text-xs font-medium text-gray-300">
                        <Building2 className="w-3.5 h-3.5 text-blue-400" />
                        <span className="font-bold text-white">Venue:</span> {event.venue || 'N/A'}
                      </span>
                    </div>

                    <p className="text-sm text-gray-400 mt-1 leading-relaxed">{event.description}</p>
                  </div>
                  <div className="flex flex-col sm:items-end gap-1.5 shrink-0 sm:min-w-[140px]">
                    {event.startDate && event.endDate && new Date(event.startDate).getTime() === new Date(event.endDate).getTime() ? (
                      <>
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 mb-1">1 Day Event</span>
                        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Event Date</span>
                        <span className="text-sm font-bold text-white">
                          {new Date(event.startDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20 mb-1">
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
