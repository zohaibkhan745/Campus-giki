import React, { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import type { SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import {
  CalendarDays,
  Plus,
  Trash2,
  Send,
  Save,
  ArrowLeft,
  MessageSquare,
  AlertCircle,
  CheckCircle2,
  Clock,
  Lock,
} from 'lucide-react';
import { yearlyPlanService } from '@/services/yearly-plan.service';
import {
  yearlyPlanFormSchema,
  type YearlyPlanFormData,
} from '@/lib/validations/yearly-plan.schema';
import type { PlanStatus } from '@/types/yearly-plan.types';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import type { AxiosError } from 'axios';

export const YearlyCalendarPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Query existing yearly plans for society
  const { data: plans = [] } = useQuery({
    queryKey: ['myYearlyPlans'],
    queryFn: yearlyPlanService.getMyPlans,
  });

  const currentYear = new Date().getFullYear();
  const existingPlan = plans.find((p) => p.year === currentYear) || plans[0];

  const isReadOnly =
    existingPlan?.status === 'PENDING' || existingPlan?.status === 'APPROVED';
  const isChangesRequested = existingPlan?.status === 'CHANGES_REQUESTED';

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<YearlyPlanFormData>({
    resolver: zodResolver(yearlyPlanFormSchema),
    defaultValues: {
      year: currentYear,
      events: [{ eventName: '', plannedDate: '', notes: '' }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'events',
  });

  // Pre-fill form when plan data is loaded
  useEffect(() => {
    if (existingPlan) {
      reset({
        year: existingPlan.year,
        events: existingPlan.plannedEvents.map((e) => ({
          eventName: e.eventName,
          plannedDate: e.plannedDate
            ? new Date(e.plannedDate).toISOString().split('T')[0]
            : '',
          notes: e.notes || '',
        })),
      });
    }
  }, [existingPlan, reset]);

  // Create plan mutation
  const createMutation = useMutation({
    mutationFn: (data: { payload: YearlyPlanFormData; status: PlanStatus }) =>
      yearlyPlanService.createPlan({
        year: data.payload.year,
        status: data.status,
        events: data.payload.events,
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['myYearlyPlans'] });
      queryClient.invalidateQueries({ queryKey: ['societyDashboard'] });
      if (variables.status === 'PENDING') {
        setSuccessMessage('Yearly calendar plan submitted for advisor review successfully!');
        setTimeout(() => navigate('/dashboard'), 1500);
      } else {
        setSuccessMessage('Draft saved successfully.');
      }
    },
    onError: (
      error: AxiosError<{ message?: string | string[]; error?: string }>,
    ) => {
      const respMessage = error.response?.data?.message;
      let errText = 'Failed to save yearly calendar plan.';
      if (Array.isArray(respMessage)) errText = respMessage.join(', ');
      else if (typeof respMessage === 'string') errText = respMessage;
      setServerError(errText);
    },
  });

  // Update plan mutation
  const updateMutation = useMutation({
    mutationFn: (data: { payload: YearlyPlanFormData; status?: PlanStatus }) =>
      yearlyPlanService.updatePlan(existingPlan.id, {
        status: data.status,
        events: data.payload.events,
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['myYearlyPlans'] });
      queryClient.invalidateQueries({ queryKey: ['societyDashboard'] });
      if (variables.status === 'PENDING') {
        setSuccessMessage('Revised yearly plan resubmitted for advisor review successfully!');
        setTimeout(() => navigate('/dashboard'), 1500);
      } else {
        setSuccessMessage('Draft updated successfully.');
      }
    },
    onError: (
      error: AxiosError<{ message?: string | string[]; error?: string }>,
    ) => {
      const respMessage = error.response?.data?.message;
      let errText = 'Failed to update yearly calendar plan.';
      if (Array.isArray(respMessage)) errText = respMessage.join(', ');
      else if (typeof respMessage === 'string') errText = respMessage;
      setServerError(errText);
    },
  });

  const handleSaveDraft: SubmitHandler<YearlyPlanFormData> = (data) => {
    setServerError(null);
    setSuccessMessage(null);
    if (existingPlan) {
      updateMutation.mutate({ payload: data, status: 'DRAFT' });
    } else {
      createMutation.mutate({ payload: data, status: 'DRAFT' });
    }
  };

  const handleSubmitForReview: SubmitHandler<YearlyPlanFormData> = (data) => {
    setServerError(null);
    setSuccessMessage(null);
    if (existingPlan) {
      updateMutation.mutate({ payload: data, status: 'PENDING' });
    } else {
      createMutation.mutate({ payload: data, status: 'PENDING' });
    }
  };

  const renderStatusBadge = (status?: PlanStatus) => {
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
            <span>UNDER REVIEW (PENDING)</span>
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

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="max-w-4xl mx-auto space-y-6 text-left py-4">
      <div className="flex items-center justify-between">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 text-xs font-semibold text-fog hover:text-vast-ink transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </Link>

        {existingPlan && renderStatusBadge(existingPlan.status)}
      </div>

      <div className="space-y-1 bg-pure-white p-6 rounded-cards border-2 border-vast-ink flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-vast-ink text-xs font-semibold uppercase tracking-wider mb-1">
            <CalendarDays className="w-4 h-4" />
            <span>Internal Planning Portal</span>
          </div>
          <h1 className="text-2xl font-extrabold text-vast-ink">
            Society Annual Calendar ({currentYear})
          </h1>
          <p className="text-sm text-fog">
            Draft and submit your society&apos;s annual event calendar for faculty advisor approval.
          </p>
        </div>

        {isReadOnly && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-lumen-stone/80 rounded-inputs border-2 border-vast-ink text-vast-ink font-medium text-xs font-semibold">
            <Lock className="w-3.5 h-3.5 text-ember-glow" />
            <span>Read-Only Mode</span>
          </div>
        )}
      </div>

      {/* Success Notification Alert */}
      {successMessage && <Alert variant="success" message={successMessage} />}

      {/* Advisor Feedback Callout Box if Changes Requested or Comments Available */}
      {existingPlan?.advisorComments && (
        <div className="bg-lumen-cream p-5 rounded-cards border border-amber-500/30 bg-amber-500/5 space-y-2">
          <div className="flex items-center gap-2 font-bold text-sm text-ember-glow">
            <MessageSquare className="w-4 h-4" />
            <span>Faculty Advisor Feedback:</span>
          </div>
          <p className="text-sm text-vast-ink leading-relaxed bg-lumen-cream/40 p-3 rounded-inputs border border-amber-500/20">
            &quot;{existingPlan.advisorComments}&quot;
          </p>
          {isChangesRequested && (
            <p className="text-xs text-amber-300/80">
              Please adjust your planned event dates or notes as requested above and click &quot;Resubmit for Approval&quot;.
            </p>
          )}
        </div>
      )}

      {serverError && <Alert variant="error" message={serverError} />}

      <form className="space-y-6" noValidate>
        {/* Planned Events Dynamic Table Section */}
        <div className="bg-lumen-cream p-6 rounded-cards border-2 border-vast-ink space-y-4">
          <div className="flex items-center justify-between border-b-2 border-vast-ink pb-3">
            <h2 className="text-base font-bold text-vast-ink">
              Planned Calendar Events ({fields.length})
            </h2>
            {!isReadOnly && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ eventName: '', plannedDate: '', notes: '' })}
                leftIcon={<Plus className="w-4 h-4" />}
              >
                Add Event Row
              </Button>
            )}
          </div>

          {errors.events?.root?.message && (
            <p className="text-xs text-red-400 font-medium">{errors.events.root.message}</p>
          )}

          <div className="space-y-4">
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="bg-pure-white p-4 rounded-inputs border-2 border-vast-ink space-y-3 relative group"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <Input
                    label={`Event Name #${index + 1} *`}
                    placeholder="e.g. SoftDesk Annual Hackathon"
                    disabled={isReadOnly || isSaving}
                    error={errors.events?.[index]?.eventName?.message}
                    {...register(`events.${index}.eventName`)}
                  />

                  <Input
                    label="Planned Date *"
                    type="date"
                    disabled={isReadOnly || isSaving}
                    error={errors.events?.[index]?.plannedDate?.message}
                    {...register(`events.${index}.plannedDate`)}
                  />

                  <Input
                    label="Planning Notes (Optional)"
                    placeholder="e.g. Venue requirement / Speaker invite"
                    disabled={isReadOnly || isSaving}
                    {...register(`events.${index}.notes`)}
                  />
                </div>

                {!isReadOnly && fields.length > 1 && (
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="absolute top-3 right-3 text-fog hover:text-red-400 p-1 transition-colors"
                    title="Remove event row"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Workflow Submission Controls */}
        {!isReadOnly && (
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="w-full sm:w-1/2"
              isLoading={isSaving}
              onClick={handleSubmit(handleSaveDraft)}
              leftIcon={<Save className="w-5 h-5" />}
            >
              Save as Draft
            </Button>

            <Button
              type="button"
              variant="primary"
              size="lg"
              className="w-full sm:w-1/2"
              isLoading={isSaving}
              onClick={handleSubmit(handleSubmitForReview)}
              leftIcon={<Send className="w-5 h-5" />}
            >
              {isChangesRequested ? 'Resubmit for Advisor Approval' : 'Submit for Advisor Approval'}
            </Button>
          </div>
        )}
      </form>
    </div>
  );
};
