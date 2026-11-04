import { globalNotification } from '@/contexts/NotificationContext';
import React, { useEffect, useState } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { FeedbackHistory } from '@/components/shared/FeedbackHistory';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { invalidatePlanQueries } from '@/lib/queryInvalidations';
import {
  CalendarDays,
  Plus,
  Trash2,
  Send,
  Save,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  Clock,
  Lock,
  Edit3,
} from 'lucide-react';
import { yearlyPlanService } from '@/services/yearly-plan.service';
import {
  yearlyPlanFormSchema,
  type YearlyPlanFormData,
} from '@/lib/validations/yearly-plan.schema';
import type { PlanStatus } from '@/types/yearly-plan.types';
import { CustomDatePicker } from '@/components/ui/CustomDatePicker';
import { CustomDropdown } from '@/components/ui/CustomDropdown';
import { BackButton } from '@/components/ui';
import { cn } from '@/lib/utils';
import type { AxiosError } from 'axios';

const KNOWN_VENUES = [
  'TBD',
  'Auditorium',
  'Faculty',
  'Faculty Club',
  'Guest House',
  'Sports Complex',
  'Basket Ball Court',
  'Main Ground',
  'Cafe Lawn',
];

const formatIsoDateOnly = (dateStr?: string | Date | null): string => {
  if (!dateStr) return '';
  if (typeof dateStr === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return dateStr;
  }
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const YearlyCalendarPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [editReason, setEditReason] = useState('');
  const [editReasonError, setEditReasonError] = useState(false);

  // For custom venue input tracking
  const [customVenueRows, setCustomVenueRows] = useState<Record<number, boolean>>({});

  const loadedPlanIdRef = React.useRef<string | null>(null);

  const { data: plans = [], isLoading: isLoadingPlans } = useQuery({
    queryKey: ['myYearlyPlans'],
    queryFn: yearlyPlanService.getMyPlans,
  });

  const currentYear = new Date().getFullYear();
  const existingPlan = plans.find((p) => p.year === currentYear) || plans[0];

  const isChangesRequested = existingPlan?.status === 'CHANGES_REQUESTED';

  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    getValues,
    watch,
    formState: { errors },
  } = useForm<YearlyPlanFormData>({
    resolver: zodResolver(yearlyPlanFormSchema),
    defaultValues: {
      year: currentYear,
      events: [
        {
          eventName: '',
          startDate: '',
          endDate: '',
          description: '',
          venue: '',
          rules: '',
          societyRules: '',
          eventType: '',
          duration: 'One Day Event',
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'events',
  });

  useEffect(() => {
    if (existingPlan && loadedPlanIdRef.current !== existingPlan.id) {
      loadedPlanIdRef.current = existingPlan.id;

      const customVenues: Record<number, boolean> = {};

      const eventsToLoad =
        existingPlan.plannedEvents && existingPlan.plannedEvents.length > 0
          ? existingPlan.plannedEvents.map((e, idx) => {
              if (e.venue && !KNOWN_VENUES.includes(e.venue)) {
                customVenues[idx] = true;
              }
              return {
                eventName: e.eventName || '',
                startDate: formatIsoDateOnly(e.startDate),
                endDate: formatIsoDateOnly(e.endDate),
                description: e.description || '',
                venue: e.venue || '',
                rules: e.rules || '',
                societyRules: e.societyRules || '',
                eventType: e.eventType || '',
                duration: e.duration || 'One Day Event',
              };
            })
          : [
              {
                eventName: '',
                startDate: '',
                endDate: '',
                description: '',
                venue: '',
                rules: '',
                societyRules: '',
                eventType: '',
                duration: 'One Day Event',
              },
            ];

      setCustomVenueRows(customVenues);
      reset({
        year: existingPlan.year,
        events: eventsToLoad,
      });
    }
  }, [existingPlan, reset]);

  const createMutation = useMutation({
    meta: { notify: true },
    mutationFn: (data: { payload: YearlyPlanFormData; status: PlanStatus }) =>
      yearlyPlanService.createPlan({
        year: data.payload.year,
        status: data.status,
        events: data.payload.events,
      }),
    onSuccess: (_, variables) => {
      loadedPlanIdRef.current = null;
      void invalidatePlanQueries(queryClient, existingPlan?.id);
      if (variables.status === 'PENDING_ADVISOR' as PlanStatus) {
        setSuccessMessage('Yearly calendar plan submitted for advisor review successfully!');
        setTimeout(() => navigate(-1), 1500);
      } else {
        setSuccessMessage('Draft saved successfully.');
      }
    },
    onError: () => setServerError('Failed to save yearly calendar plan.'),
  });

  const updateMutation = useMutation({
    meta: { notify: true },
    mutationFn: (data: { payload: YearlyPlanFormData; status?: PlanStatus }) =>
      yearlyPlanService.updatePlan(existingPlan.id, {
        status: data.status,
        events: data.payload.events,
      }),
    onSuccess: (_, variables) => {
      loadedPlanIdRef.current = null;
      void invalidatePlanQueries(queryClient, existingPlan?.id);
      if (variables.status === 'PENDING_ADVISOR' as PlanStatus) {
        setSuccessMessage('Revised yearly plan resubmitted for advisor review successfully!');
        setTimeout(() => navigate(-1), 1500);
      } else {
        setSuccessMessage('Draft updated successfully.');
      }
    },
    onError: () => setServerError('Failed to update yearly calendar plan.'),
  });


  const cleanData = (data: YearlyPlanFormData) => {
    return {
      ...data,
      events: data.events
    };
  };

  const handleSaveDraft = (data: YearlyPlanFormData) => {

    setServerError('');
    setSuccessMessage(null);
    if (existingPlan) updateMutation.mutate({ payload: cleanData(data), status: 'DRAFT' });
    else createMutation.mutate({ payload: cleanData(data), status: 'DRAFT' });
  };

  const handleSubmitForReview = (data: YearlyPlanFormData) => {
    setServerError('');
    setSuccessMessage(null);
    if (existingPlan) updateMutation.mutate({ payload: cleanData(data), status: 'PENDING_ADVISOR' as PlanStatus });
    else createMutation.mutate({ payload: cleanData(data), status: 'PENDING_ADVISOR' as PlanStatus });
  };

  const requestEditMutation = useMutation({
    mutationFn: () => yearlyPlanService.requestEdit(existingPlan!.id, editReason),
    onSuccess: () => {
      void invalidatePlanQueries(queryClient, existingPlan?.id);
      setSuccessMessage('Edit access requested successfully. Waiting for admin approval.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    onError: (error: any) => {
      setServerError(error.response?.data?.message || 'Failed to request edit access.');
    }
  });

  const handleRequestEdit = () => {
    if (!editReason.trim()) {
      setEditReasonError(true);
      return;
    }
    requestEditMutation.mutate();
  };

  const isSaving = createMutation.isPending || updateMutation.isPending || requestEditMutation.isPending;

  const isEditRequestPending = existingPlan?.editRequestStatus === 'PENDING';
  const isReadOnly = existingPlan?.status === 'APPROVED' || existingPlan?.status === 'PENDING_ADVISOR' || existingPlan?.status === 'PENDING_ADMIN';

  if (isLoadingPlans) {
    return (
      <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <div className="w-8 h-8 border-3 border-brand-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-text-secondary font-medium">Loading annual calendar plan...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="mb-4">
            <BackButton variant="inline" />
          </div>
          <h1 className="text-4xl font-extrabold text-text-primary tracking-tight">
            Society Annual Calendar ({currentYear}-{currentYear + 1})
          </h1>
        </div>
        
        {existingPlan && (
          <div className="flex flex-col items-end gap-2">
            <span className={cn(
              "inline-flex items-center gap-1.5 px-3 py-1 backdrop-blur-md border rounded-inputs text-xs font-semibold",
              existingPlan.status === 'APPROVED' ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-400" :
              existingPlan.status === 'PENDING_ADVISOR' ? "bg-yellow-500/10 border-yellow-500/50 text-yellow-500 dark:text-yellow-400" :
              existingPlan.status === 'PENDING_ADMIN' ? "bg-orange-500/10 border-orange-500/50 text-orange-500 dark:text-orange-400" :
              existingPlan.status === 'CHANGES_REQUESTED' ? "bg-red-500/10 border-red-500/50 text-red-500 dark:text-red-400" :
              "bg-surface-glass border-border-medium text-text-primary"
            )}>
              {isEditRequestPending ? <Clock className="w-3.5 h-3.5" /> : existingPlan.status === 'APPROVED' && <CheckCircle2 className="w-3.5 h-3.5" />}
              {!isEditRequestPending && (existingPlan.status === 'PENDING_ADVISOR' || existingPlan.status === 'PENDING_ADMIN') && <Clock className="w-3.5 h-3.5" />}
              {!isEditRequestPending && existingPlan.status === 'CHANGES_REQUESTED' && <AlertCircle className="w-3.5 h-3.5" />}
              <span>
                {isEditRequestPending ? 'Edit Request Pending' :
                 existingPlan.status === 'PENDING_ADVISOR' ? 'Pending Advisor' :
                 existingPlan.status === 'PENDING_ADMIN' ? 'Pending Admin' :
                 existingPlan.status === 'CHANGES_REQUESTED' ? 'Changes Requested' :
                 existingPlan.status === 'APPROVED' ? 'Approved' :
                 existingPlan.status}
              </span>
            </span>
            
            {isReadOnly && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-surface-glass border border-border-subtle rounded-inputs text-text-secondary font-semibold text-xs">
                <Lock className="w-3.5 h-3.5 text-red-400" />
                <span>Read-Only Mode</span>
              </div>
            )}
          </div>
        )}
      </div>

      {serverError && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-cards text-red-400 text-sm">
          {serverError}
        </div>
      )}

      {successMessage && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-cards text-emerald-400 text-sm">
          {successMessage}
        </div>
      )}

      {existingPlan?.advisorComments && (
        <FeedbackHistory
          rawComments={existingPlan.advisorComments}
          currentStatus={existingPlan.status}
          filterRole="all"
        />
      )}

      {existingPlan?.editRequestStatus === 'APPROVED' && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" />
          <div>
            <h3 className="text-emerald-400 font-semibold">Edit Request Approved</h3>
            <p className="text-emerald-400/80 text-sm mt-1">Your request to edit the annual calendar has been approved by the DSA. You can now make changes and resubmit for approval.</p>
          </div>
        </div>
      )}

      {existingPlan?.editRequestStatus === 'REJECTED' && (
        <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-400 mt-0.5 shrink-0" />
          <div>
            <h3 className="text-rose-400 font-semibold">Edit Request Rejected</h3>
            <p className="text-rose-400/80 text-sm mt-1">Your request to edit the annual calendar was rejected by the DSA. If you still need to make changes, please contact the DSA directly or submit another request with more details.</p>
          </div>
        </div>
      )}

      {existingPlan?.editRequestStatus === 'PENDING' && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 flex items-start gap-3">
          <Clock className="w-5 h-5 text-yellow-400 mt-0.5 shrink-0" />
          <div>
            <h3 className="text-yellow-400 font-semibold">Edit Request Pending</h3>
            <p className="text-yellow-400/80 text-sm mt-1">Your request to edit the annual calendar is currently pending approval from the DSA.</p>
          </div>
        </div>
      )}

      <form className="glass-form-card" noValidate>
        <div className="form-section">
          <div className="section-header" style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 className="section-title">Planned Calendar Events ({fields.length})</h2>
          </div>
          <div className="section-divider"></div>

          {errors.events?.root?.message && (
            <p className="error-text mb-4">{errors.events.root.message}</p>
          )}

          <div className="flex flex-col gap-6">
            {fields.map((field, index) => (
              <div key={field.id} className="relative space-y-4">
                {index > 0 && <hr className="border-t border-border-medium my-8" />}
                
                <div className={watch(`events.${index}.duration`) === 'One Day Event' ? 'field-grid-3' : 'field-grid-2'}>
                  <div className="field-group">
                    <label className="field-label">EVENT NAME #{index + 1}</label>
                    <div className={cn("input-box", errors.events?.[index]?.eventName && "error")}>
                      <input type="text" placeholder="e.g. Annual Hackathon" disabled={isReadOnly || isSaving} {...register(`events.${index}.eventName`)} />
                    </div>
                    {errors.events?.[index]?.eventName?.message && <span className="error-text">{errors.events[index]?.eventName?.message}</span>}
                  </div>

                  <div className="field-group">
                    <label className="field-label">NUMBER OF DAYS</label>
                    <Controller
                      name={`events.${index}.duration`}
                      control={control}
                      render={({ field: dField }) => (
                        <CustomDropdown
                          value={dField.value || "One Day Event"}
                          onChange={(val: string) => {
                            dField.onChange(val);
                            const start = getValues(`events.${index}.startDate`);
                            if (start && val !== 'One Day Event') {
                              const date = new Date(start);
                              if (val === 'Two Day Event') date.setDate(date.getDate() + 1);
                              else if (val === 'Three Day Event') date.setDate(date.getDate() + 2);
                              else if (val === 'Weekly Event') date.setDate(date.getDate() + 7);
                              setValue(`events.${index}.endDate`, date.toISOString(), { shouldValidate: true });
                            } else if (start && val === 'One Day Event') {
                              setValue(`events.${index}.endDate`, start, { shouldValidate: true });
                            } else {
                              setValue(`events.${index}.endDate`, '', { shouldValidate: true });
                            }
                          }}
                          options={[
                            {label: "One Day Event", value: "One Day Event"},
                            {label: "Two Day Event", value: "Two Day Event"},
                            {label: "Three Day Event", value: "Three Day Event"},
                            {label: "Weekly Event", value: "Weekly Event"},
                          ]}
                          disabled={isReadOnly || isSaving}
                        />
                      )}
                    />
                  </div>

                  <div className={cn("field-group", watch(`events.${index}.duration`) !== 'One Day Event' && "md:col-span-2")}>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <div className="flex-1">
                        <label className="field-label">
                          {watch(`events.${index}.duration`) !== 'One Day Event' ? 'START DATE (Tentative)' : 'DATE (Tentative)'}
                        </label>
                        <Controller
                          name={`events.${index}.startDate`}
                          control={control}
                          render={({ field: rField }) => (
                            <CustomDatePicker 
                              value={rField.value} 
                              onChange={(val: string) => {
                                rField.onChange(val);
                                const dur = getValues(`events.${index}.duration`) || 'One Day Event';
                                if (dur !== 'One Day Event') {
                                  const date = new Date(val);
                                  if (dur === 'Two Day Event') date.setDate(date.getDate() + 1);
                                  else if (dur === 'Three Day Event') date.setDate(date.getDate() + 2);
                                  else if (dur === 'Weekly Event') date.setDate(date.getDate() + 7);
                                  setValue(`events.${index}.endDate`, date.toISOString(), { shouldValidate: true });
                                } else {
                                  setValue(`events.${index}.endDate`, val, { shouldValidate: true });
                                }
                              }} 
                              placeholder="mm/dd/yyyy"
                              disabled={isReadOnly || isSaving}
                            />
                          )}
                        />
                        {errors.events?.[index]?.startDate?.message && <span className="error-text">{errors.events[index]?.startDate?.message}</span>}
                      </div>

                      {watch(`events.${index}.duration`) !== 'One Day Event' && (
                        <div className="flex-1">
                          <label className="field-label">END DATE (Tentative)</label>
                          <Controller
                            name={`events.${index}.endDate`}
                            control={control}
                            render={({ field: eField }) => (
                              <CustomDatePicker 
                                value={eField.value} 
                                onChange={(val: string) => {
                                  eField.onChange(val);
                                }} 
                                placeholder="End Date"
                                disabled={true}
                              />
                            )}
                          />
                          {errors.events?.[index]?.endDate?.message && <span className="error-text">{errors.events[index]?.endDate?.message}</span>}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="field-grid-2">
                  <div className="field-group">
                    <label className="field-label">EVENT TYPE</label>
                    <Controller
                      name={`events.${index}.eventType`}
                      control={control}
                      render={({ field: tField }) => (
                        <CustomDropdown
                          value={tField.value || ""}
                          onChange={tField.onChange}
                          options={[
                            {label: "Select Type", value: ""},
                            {label: "Technical", value: "Technical"},
                            {label: "Non-Technical", value: "Non-Technical"},
                            {label: "Entertainment", value: "Entertainment"},
                            {label: "Sports", value: "Sports"},
                            {label: "Workshop", value: "Workshop"},
                          ]}
                          disabled={isReadOnly || isSaving}
                        />
                      )}
                    />
                  </div>

                  <div className="field-group">
                    <label className="field-label">VENUE (Tentative)</label>
                    <Controller
                      name={`events.${index}.venue`}
                      control={control}
                      render={({ field: rField }) => (
                        <CustomDropdown
                          value={customVenueRows[index] ? 'Custom (Add)' : rField.value}
                          onChange={(e: any) => {
                            const val = typeof e === "string" ? e : e?.target?.value || "";
                            if (val === 'Custom (Add)') {
                              setCustomVenueRows(prev => ({...prev, [index]: true}));
                              rField.onChange('');
                            } else {
                              setCustomVenueRows(prev => ({...prev, [index]: false}));
                              rField.onChange(val);
                            }
                          }}
                          options={[
                            {label: "TBD", value: "TBD"},
                            {label: "Auditorium", value: "Auditorium"},
                            {label: "Faculty Club", value: "Faculty Club"},
                            {label: "Guest House", value: "Guest House"},
                            {label: "Sports Complex", value: "Sports Complex"},
                            {label: "Basket Ball Court", value: "Basket Ball Court"},
                            {label: "Main Ground", value: "Main Ground"},
                            {label: "Cafe Lawn", value: "Cafe Lawn"},
                            {label: "Custom (Add)", value: "Custom (Add)"},
                          ]}
                          disabled={isReadOnly || isSaving}
                        />
                      )}
                    />
                    {errors.events?.[index]?.venue?.message && <span className="error-text">{errors.events[index]?.venue?.message}</span>}
                  </div>
                </div>

                {customVenueRows[index] && (
                  <div className="field-group">
                    <label className="field-label">CUSTOM VENUE DETAILS</label>
                    <div className="input-box">
                      <input type="text" placeholder="Enter custom venue" disabled={isReadOnly || isSaving} {...register(`events.${index}.venue`)} />
                    </div>
                  </div>
                )}

                <div className="field-group">
                  <label className="field-label">DESCRIPTION</label>
                  <div className={cn("input-box", errors.events?.[index]?.description && "error")}>
                    <textarea 
                       placeholder="Enter description..." 
                       disabled={isReadOnly || isSaving} 
                       {...register(`events.${index}.description`)} 
                       rows={2}
                       className="h-[60px]"
                    ></textarea>
                  </div>
                </div>

                {!isReadOnly && fields.length > 1 && (
                  <div className="flex justify-end pt-2">
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="flex items-center gap-2 px-4 py-2 bg-red-500/90 hover:bg-red-500 text-white font-bold rounded-lg transition-all shadow-md text-sm"
                    >
                      <Trash2 className="w-4 h-4" /> Delete Event
                    </button>
                  </div>
                )}
              </div>
            ))}

          </div>

          {!isReadOnly && (
            <div className="flex justify-center mt-8">
              <button
                type="button"
                className="w-full py-4 border-2 border-dashed border-border-medium rounded-xl text-text-muted hover:text-text-primary hover:border-border-strong hover:bg-surface-hover transition-all font-semibold flex items-center justify-center gap-2 cursor-pointer"
                onClick={() => append({ eventName: '', startDate: '', endDate: '', description: '', venue: '', rules: '', societyRules: '', duration: 'One Day Event', eventType: '' })}
                disabled={isReadOnly || isSaving}
              >+ Add Event Row</button>
            </div>
          )}
        </div>

        {!isReadOnly ? (
          <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-border-subtle">
            <button
              type="button"
              className="flex-1 inline-flex items-center justify-center font-semibold rounded-inputs px-5 py-3.5 bg-surface-glass border border-border-medium hover:bg-surface-hover text-text-primary transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleSubmit(handleSaveDraft)}
              disabled={isSaving}
            >
              <Save className="w-5 h-5 mr-2" />
              Save Draft
            </button>
            <button
              type="button"
              className="flex-1 btn-submit-review cursor-pointer"
              onClick={handleSubmit(handleSubmitForReview)}
              disabled={isSaving}
            >
              <Send className="w-5 h-5 mr-2" />
              {isChangesRequested ? 'Resubmit for Approval' : 'Submit for Advisor Approval'}
            </button>
          </div>
        ) : existingPlan && (
          <div className="flex flex-col gap-4 pt-4 border-t border-border-subtle">
            {/* 1. Submitted for Advisor Review notice */}
            {existingPlan.status === 'PENDING_ADVISOR' && (
              <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-600 dark:text-yellow-400 text-sm flex items-center gap-3">
                <Clock className="w-5 h-5 shrink-0" />
                <div>
                  <p className="font-semibold">Submitted for Advisor Review</p>
                  <p className="text-xs text-text-secondary mt-0.5">
                    Your annual calendar has been submitted and is currently locked while under review by your Faculty Advisor. You will be notified once they review it.
                  </p>
                </div>
              </div>
            )}

            {/* 2. Endorsed by Advisor and awaiting DSA clearance notice */}
            {existingPlan.status === 'PENDING_ADMIN' && (
              <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-600 dark:text-orange-400 text-sm flex items-center gap-3">
                <Clock className="w-5 h-5 shrink-0" />
                <div>
                  <p className="font-semibold">Awaiting Final DSA Clearance</p>
                  <p className="text-xs text-text-secondary mt-0.5">
                    Your annual calendar has been endorsed by your Faculty Advisor and is now awaiting final review and approval by the Directorate of Student Affairs (DSA).
                  </p>
                </div>
              </div>
            )}

            {/* 3. Approved annual calendar: Society can request edit access */}
            {existingPlan.status === 'APPROVED' && (
              <>
                {!isEditRequestPending && (
                  <div className="flex flex-col space-y-2">
                    <label className="text-sm font-medium text-text-secondary">
                      Reason for Edit Request <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={editReason}
                      onChange={(e) => {
                        setEditReason(e.target.value);
                        if (e.target.value.trim()) setEditReasonError(false);
                      }}
                      placeholder="Explain why you need edit access to this approved annual calendar..."
                      className={cn(
                        "w-full bg-surface-glass text-text-primary placeholder:text-text-muted text-sm rounded-xl border p-3.5 transition-all outline-none resize-none h-24",
                        editReasonError 
                          ? "border-red-500/50 ring-2 ring-red-500/20 focus:border-red-500" 
                          : "border-border-medium focus:border-border-strong focus:ring-2 focus:ring-brand-primary/20"
                      )}
                    />
                    {editReasonError && (
                      <p className="text-red-400 text-xs mt-1">Please provide a reason to request edit access.</p>
                    )}
                  </div>
                )}
                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    type="button"
                    className={`flex-1 inline-flex items-center justify-center font-semibold rounded-inputs px-5 py-3.5 text-white transition-all duration-200 ${isEditRequestPending ? 'opacity-50 cursor-not-allowed bg-warning/50 border border-warning/50' : 'hover:bg-warning-hover bg-warning border border-warning cursor-pointer'}`}
                    disabled={isEditRequestPending || isSaving}
                    onClick={handleRequestEdit}
                  >
                    {isEditRequestPending ? <Clock className="w-5 h-5 mr-2" /> : <Edit3 className="w-5 h-5 mr-2" />}
                    {isEditRequestPending ? 'Edit Request Pending Approval' : 'Request Edit Access'}
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </form>
    </div>
  );
};
