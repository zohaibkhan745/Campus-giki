import React, { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { FeedbackHistory } from '@/components/shared/FeedbackHistory';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
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
  Shield,
  ShieldAlert,
  ShieldCheck,
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
    getValues,
    setValue,
    watch,
    formState: { errors },
  } = useForm<YearlyPlanFormData>({
    resolver: zodResolver(yearlyPlanFormSchema),
    defaultValues: {
      year: currentYear,
      events: [{ eventName: '', startDate: '', endDate: '', description: '', venue: '', rules: '', societyRules: '' }],
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
          startDate: e.startDate ? new Date(e.startDate).toISOString().split('T')[0] : '',
          endDate: e.endDate ? new Date(e.endDate).toISOString().split('T')[0] : '',
          description: e.description || '',
          venue: e.venue || '',
          rules: e.rules || '',
          societyRules: e.societyRules || '',
        })),
      });
    }
  }, [existingPlan, reset]);

  // Create plan mutation
  const createMutation = useMutation({
    meta: { notify: true },
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
        setTimeout(() => navigate(-1), 1500);
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
      setServerError('');
    },
  });

  // Update plan mutation
  const updateMutation = useMutation({
    meta: { notify: true },
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
        setTimeout(() => navigate(-1), 1500);
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
      setServerError('');
    },
  });

  const handleSaveDraft = (data: YearlyPlanFormData) => {
    setServerError('');
    setSuccessMessage(null);
    if (existingPlan) {
      updateMutation.mutate({ payload: data, status: 'DRAFT' });
    } else {
      createMutation.mutate({ payload: data, status: 'DRAFT' });
    }
  };

  const handleSubmitForReview = (data: YearlyPlanFormData) => {
    setServerError('');
    setSuccessMessage(null);
    if (existingPlan) {
      updateMutation.mutate({ payload: data, status: 'PENDING' });
    } else {
      createMutation.mutate({ payload: data, status: 'PENDING' });
    }
  };

  const handleInvalid = (errors: any) => {
    setServerError('');
  };

  const renderStatusBadge = (status?: PlanStatus) => {
    switch (status) {
      case 'APPROVED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-transparent border border-forest-ink border border-emerald-500/20 text-forest-ink rounded-inputs text-xs font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>APPROVED</span>
          </span>
        );
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-transparent border border-ember-glow border border-amber-500/20 text-ember-glow rounded-inputs text-xs font-semibold">
            <Clock className="w-3.5 h-3.5" />
            <span>UNDER REVIEW (PENDING)</span>
          </span>
        );
      case 'CHANGES_REQUESTED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-transparent border border-vast-ink border border-red-500/20 text-red-400 rounded-inputs text-xs font-semibold">
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
        <button
          onClick={() => navigate(-1)}
          className="fixed top-4 left-4 sm:top-6 sm:left-6 z-[100] inline-flex items-center justify-center w-10 h-10 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white rounded-full transition-all cursor-pointer shadow-lg"
          title="Go Back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        {existingPlan && renderStatusBadge(existingPlan.status)}
      </div>

      <div className="space-y-1 bg-transparent p-6 rounded-cards border border-vast-ink/20 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
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
          <div className="flex items-center gap-2 px-3 py-1.5 bg-lumen-stone/80 rounded-inputs border border-vast-ink/20 text-vast-ink font-medium text-xs font-semibold">
            <Lock className="w-3.5 h-3.5 text-ember-glow" />
            <span>Read-Only Mode</span>
          </div>
        )}
      </div>

      {/* Success Notification Alert */}
      null /* Removed success alert */

      {/* Advisor Feedback Callout Box if Changes Requested or Comments Available */}
      {existingPlan?.advisorComments && (
        <div className="bg-lumen-cream p-5 rounded-cards border border-vast-ink/20 shadow-sm space-y-2">
          <FeedbackHistory rawComments={existingPlan.advisorComments} />
          {isChangesRequested && (
            <div className="p-3 bg-ember-glow text-pure-white rounded-inputs border border-amber-600/30 text-xs font-semibold shadow-sm animate-pulse flex items-center gap-2 mt-4">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>Please adjust your planned event dates or notes as requested above and click &quot;Resubmit for Approval&quot;.</span>
            </div>
          )}
        </div>
      )}

      {null}

      <form className="space-y-6" noValidate>
        {/* Planned Events Dynamic Table Section */}
        <div className="bg-lumen-cream p-6 rounded-cards border border-vast-ink/20 space-y-4">
          <div className="flex items-center justify-between border-b-2 border-vast-ink pb-3">
            <h2 className="text-base font-bold text-vast-ink">
              Planned Calendar Events ({fields.length})
            </h2>
            {!isReadOnly && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ eventName: '', startDate: '', endDate: '', description: '', venue: '', rules: '', societyRules: '' })}
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
                className="bg-transparent p-4 rounded-inputs border border-vast-ink/20 space-y-3 relative group"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Input
                    label={`Event Name #${index + 1} *`}
                    placeholder="e.g. SoftDesk Annual Hackathon"
                    disabled={isReadOnly || isSaving}
                    error={errors.events?.[index]?.eventName?.message}
                    {...register(`events.${index}.eventName`)}
                  />

                  <Input
                    label="Start Date *"
                    type="date"
                    disabled={isReadOnly || isSaving}
                    error={errors.events?.[index]?.startDate?.message}
                    {...register(`events.${index}.startDate`, {
                      onChange: (e) => {
                        const newStart = e.target.value;
                        const currentEnd = getValues(`events.${index}.endDate`);
                        if (!currentEnd || newStart > currentEnd) {
                          setValue(`events.${index}.endDate`, newStart, { shouldValidate: true });
                        }
                      },
                    })}
                  />

                  <Input
                    label="End Date *"
                    type="date"
                    min={watch(`events.${index}.startDate`)}
                    disabled={isReadOnly || isSaving}
                    error={errors.events?.[index]?.endDate?.message}
                    {...register(`events.${index}.endDate`)}
                  />

                  <Input
                    label="Venue *"
                    placeholder="e.g. AHA Auditorium"
                    disabled={isReadOnly || isSaving}
                    error={errors.events?.[index]?.venue?.message}
                    {...register(`events.${index}.venue`)}
                  />

                  <div className="col-span-1 md:col-span-2 lg:col-span-3 space-y-4">
                    <div className="flex flex-col space-y-1.5">
                      <label className="text-xs font-semibold text-vast-ink uppercase tracking-wider block">
                        Description *
                      </label>
                      <textarea
                        disabled={isReadOnly || isSaving}
                        rows={3}
                        className="w-full px-3.5 py-2.5 text-sm bg-transparent border border-vast-ink/20 rounded-inputs placeholder:text-fog focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        placeholder="Event description..."
                        {...register(`events.${index}.description`)}
                      />
                      {errors.events?.[index]?.description?.message && (
                        <p className="text-xs text-red-500 mt-1">{errors.events?.[index]?.description?.message}</p>
                      )}
                    </div>

                    {/* Official DSA / Admin Directives Display (Read-Only to Society) */}
                    {watch(`events.${index}.rules`) && (
                      <div className="p-4 bg-amber-50 border-2 border-amber-500/40 rounded-cards space-y-1 mt-2">
                        <div className="flex items-center gap-2 text-amber-900 font-extrabold text-xs uppercase tracking-wider">
                          <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                          <span>Official DSA / Admin Directives &amp; Regulations</span>
                        </div>
                        <p className="text-xs text-amber-950 font-semibold whitespace-pre-line leading-relaxed pl-6">
                          {watch(`events.${index}.rules`)}
                        </p>
                      </div>
                    )}
                  </div>
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
              onClick={handleSubmit(handleSaveDraft, handleInvalid)}
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
              onClick={handleSubmit(handleSubmitForReview, handleInvalid)}
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
