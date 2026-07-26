import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Building2,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Clock,
  Lock,
  MessageSquare,
  Shield,
  UserCheck,
  Loader2,
  FileCheck,
} from 'lucide-react';
import { adminService } from '@/services/admin.service';
import type { PlanStatus } from '@/types/yearly-plan.types';
import { Alert } from '@/components/ui/Alert';

export const AdminYearlyPlanDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const {
    data: plan,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['adminYearlyPlanDetail', id],
    queryFn: () => adminService.getYearlyPlanDetailById(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex flex-col justify-center items-center text-fog gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        <p className="text-sm font-medium">Loading DSA audit record...</p>
      </div>
    );
  }

  if (isError || !plan) {
    return (
      <div className="max-w-md mx-auto py-12 space-y-4 text-center">
        <Alert variant="error" message="Yearly plan record not found or access denied." />
        <Link
          to="/admin/yearly-plans"
          className="inline-flex items-center gap-2 text-sm text-vast-ink hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to DSA Dashboard</span>
        </Link>
      </div>
    );
  }

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

  // Workflow Timeline State Calculation
  const isApproved = plan.status === 'APPROVED';
  const isChangesRequested = plan.status === 'CHANGES_REQUESTED';
  const isPending = plan.status === 'PENDING';
  const isDraft = plan.status === 'DRAFT';

  return (
    <div className="max-w-4xl mx-auto space-y-6 text-left py-4">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Link
          to="/admin/yearly-plans"
          className="inline-flex items-center gap-2 text-xs font-semibold text-fog hover:text-vast-ink transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to DSA Dashboard</span>
        </Link>

        {renderStatusBadge(plan.status)}
      </div>

      {/* Society & Advisor Header Banner */}
      <div className="bg-lumen-cream p-6 rounded-cards border-2 border-vast-ink flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          {plan.society?.logoUrl ? (
            <img
              src={plan.society.logoUrl}
              alt={plan.society.name}
              className="w-14 h-14 rounded-cards object-cover border-2 border-vast-ink"
            />
          ) : (
            <div className="p-3 bg-lavender-whisper border border-vast-ink text-vast-ink rounded-cards border border-indigo-500/20">
              <Building2 className="w-8 h-8" />
            </div>
          )}

          <div>
            <h1 className="text-2xl font-extrabold text-vast-ink">
              {plan.society?.name || 'Society Record'}
            </h1>
            <p className="text-sm text-fog">
              Annual Event Plan for Year <strong className="text-vast-ink">{plan.year}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3.5 py-1.5 bg-lumen-stone/90 rounded-inputs border-2 border-vast-ink text-vast-ink font-medium text-xs font-semibold">
          <Shield className="w-4 h-4 text-vast-ink" />
          <span>DSA Read-Only Record</span>
        </div>
      </div>

      {/* Assigned Advisor Info Card */}
      {plan.society?.advisor && (
        <div className="bg-lumen-cream p-4 rounded-cards border-2 border-vast-ink flex items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-lavender-whisper border border-vast-ink text-vast-ink rounded-inputs">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-fog">Assigned Faculty Advisor</p>
              <h4 className="font-bold text-vast-ink text-sm">
                {plan.society.advisor.user?.fullName} ({plan.society.advisor.designation})
              </h4>
            </div>
          </div>
          <span className="text-fog hidden sm:block">
            {plan.society.advisor.department}
          </span>
        </div>
      )}

      {/* Workflow Step Progress Timeline */}
      <div className="bg-lumen-cream p-6 rounded-cards border-2 border-vast-ink space-y-4">
        <h2 className="text-base font-bold text-vast-ink border-b-2 border-vast-ink pb-3 flex items-center gap-2">
          <FileCheck className="w-4 h-4 text-vast-ink" />
          <span>Workflow Progress &amp; Review Timeline</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-center">
          {/* Step 1: Draft Created */}
          <div className={`p-3 rounded-inputs border space-y-1 ${
            !isDraft ? 'bg-lavender-whisper border border-vast-ink border-indigo-500/30 text-fog' : 'bg-lumen-stone border-2 border-vast-ink text-fog'
          }`}>
            <p className="text-xs font-bold">1. Draft Created</p>
            <p className="text-[10px] opacity-80">Society Draft</p>
          </div>

          {/* Step 2: Submission */}
          <div className={`p-3 rounded-inputs border space-y-1 ${
            isPending || isChangesRequested || isApproved
              ? 'bg-lavender-whisper border border-vast-ink border-indigo-500/30 text-fog'
              : 'bg-lumen-stone border-2 border-vast-ink text-fog'
          }`}>
            <p className="text-xs font-bold">2. Submitted</p>
            <p className="text-[10px] opacity-80">Under Advisor Review</p>
          </div>

          {/* Step 3: Advisor Review Decision */}
          <div className={`p-3 rounded-inputs border space-y-1 ${
            isChangesRequested
              ? 'bg-pure-white border border-ember-glow border-amber-500/30 text-amber-300'
              : isApproved
              ? 'bg-pure-white border border-forest-ink border-emerald-500/30 text-emerald-300'
              : 'bg-lumen-stone border-2 border-vast-ink text-fog'
          }`}>
            <p className="text-xs font-bold">3. Advisor Review</p>
            <p className="text-[10px] opacity-80">
              {isChangesRequested ? 'Changes Requested' : isApproved ? 'Approved' : 'Awaiting Decision'}
            </p>
          </div>

          {/* Step 4: Final Record */}
          <div className={`p-3 rounded-inputs border space-y-1 ${
            isApproved
              ? 'bg-pure-white border border-forest-ink border-emerald-500/30 text-emerald-300'
              : 'bg-lumen-stone border-2 border-vast-ink text-fog'
          }`}>
            <p className="text-xs font-bold">4. Final Record</p>
            <p className="text-[10px] opacity-80">
              {isApproved ? 'Approved & Recorded' : 'In Progress'}
            </p>
          </div>
        </div>
      </div>

      {/* Advisor Comments & Review History Log */}
      <div className="bg-lumen-cream p-6 rounded-cards border-2 border-vast-ink space-y-3">
        <h2 className="text-base font-bold text-vast-ink border-b-2 border-vast-ink pb-3 flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-vast-ink" />
          <span>Advisor Review History &amp; Audit Comments</span>
        </h2>

        {plan.advisorComments ? (
          <div className="p-4 bg-pure-white rounded-inputs border-2 border-vast-ink space-y-1">
            <p className="text-xs font-semibold text-vast-ink">Advisor Feedback Log:</p>
            <p className="text-xs text-vast-ink font-medium whitespace-pre-line leading-relaxed">
              &quot;{plan.advisorComments}&quot;
            </p>
          </div>
        ) : (
          <p className="text-xs text-fog">No advisor feedback comments recorded for this plan.</p>
        )}
      </div>

      {/* Planned Events Grid */}
      <div className="bg-lumen-cream p-6 rounded-cards border-2 border-vast-ink space-y-4">
        <h2 className="text-base font-bold text-vast-ink border-b-2 border-vast-ink pb-3 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-vast-ink" />
          <span>Planned Calendar Events ({plan.plannedEvents?.length || 0})</span>
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
                <div className="space-y-1">
                  <span className="text-xs font-bold text-vast-ink">
                    Event #{idx + 1}: {evt.eventName}
                  </span>
                  {evt.notes && (
                    <p className="text-xs text-fog leading-relaxed">
                      Notes: {evt.notes}
                    </p>
                  )}
                </div>

                <div className="text-xs font-semibold text-vast-ink font-medium bg-lumen-stone px-3 py-1.5 rounded-inputs border-2 border-vast-ink shrink-0">
                  Planned Date:{' '}
                  {new Date(evt.plannedDate).toLocaleDateString(undefined, {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
