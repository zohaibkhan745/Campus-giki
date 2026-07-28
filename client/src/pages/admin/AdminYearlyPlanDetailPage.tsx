import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
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
  ShieldCheck,
  UserCheck,
  Loader2,
  FileCheck,
  FileText,
  Edit,
  Save,
  Trash2,
  Plus,
  X,
} from 'lucide-react';
import { adminService } from '@/services/admin.service';
import type { PlanStatus } from '@/types/yearly-plan.types';
import { Alert } from '@/components/ui/Alert';

export const AdminYearlyPlanDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    data: plan,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['adminYearlyPlanDetail', id],
    queryFn: () => adminService.getYearlyPlanDetailById(id!),
    enabled: !!id,
  });

  const {
    register,
    control,
    handleSubmit,
    reset,
    getValues,
    setValue,
    watch,
  } = useForm({
    defaultValues: {
      events: [{ eventName: '', startDate: '', endDate: '', description: '', venue: '', hasOutsideParticipants: false, hasOutsideSpeaker: false, rules: '', societyRules: '' }],
    },
  });

  const { fields, append } = useFieldArray({
    control,
    name: 'events',
  });

  useEffect(() => {
    if (plan && plan.plannedEvents) {
      reset({
        events: plan.plannedEvents.map((e) => ({
          eventName: e.eventName,
          startDate: e.startDate ? new Date(e.startDate).toISOString().split('T')[0] : '',
          endDate: e.endDate ? new Date(e.endDate).toISOString().split('T')[0] : '',
          description: e.description || '',
          venue: e.venue || '',
          hasOutsideParticipants: e.hasOutsideParticipants || false,
          hasOutsideSpeaker: e.hasOutsideSpeaker || false,
          rules: e.rules || '',
          societyRules: e.societyRules || '',
        })),
      });
    }
  }, [plan, reset]);

  const updateMutation = useMutation({
    mutationFn: (eventsList: any[]) => adminService.updateYearlyPlan(id!, { events: eventsList }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminYearlyPlanDetail', id] });
      queryClient.invalidateQueries({ queryKey: ['adminDashboard'] });
      setEditingIndex(null);
      setServerError(null);
    },
    onError: (err: any) => {
      setServerError(err?.response?.data?.message || 'Failed to update plan event.');
    },
  });

  const handleSaveAll = (data: any) => {
    updateMutation.mutate(data.events);
  };

  const handleDeleteEvent = (index: number) => {
    if (window.confirm('Are you sure you want to remove this event from the annual plan?')) {
      const currentEvents = getValues('events');
      const updatedEvents = currentEvents.filter((_, idx) => idx !== index);
      updateMutation.mutate(updatedEvents);
    }
  };

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
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-pure-white border border-emerald-500/20 text-forest-ink rounded-inputs text-xs font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>APPROVED</span>
          </span>
        );
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-pure-white border border-amber-500/20 text-ember-glow rounded-inputs text-xs font-semibold">
            <Clock className="w-3.5 h-3.5" />
            <span>PENDING REVIEW</span>
          </span>
        );
      case 'CHANGES_REQUESTED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-pure-white border border-red-500/20 text-red-400 rounded-inputs text-xs font-semibold">
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

  const isApproved = plan.status === 'APPROVED';
  const isChangesRequested = plan.status === 'CHANGES_REQUESTED';
  const isPending = plan.status === 'PENDING';
  const isDraft = plan.status === 'DRAFT';

  return (
    <div className="max-w-4xl mx-auto space-y-6 text-left py-4">
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
            <h1 className="text-2xl font-extrabold text-vast-ink font-eb-garamond">
              {plan.society?.name || 'Society Record'}
            </h1>
            <p className="text-sm text-fog font-medium">
              Annual Event Plan for Year <strong className="text-vast-ink">{plan.year}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3.5 py-1.5 bg-lumen-stone/90 rounded-inputs border-2 border-vast-ink text-vast-ink font-medium text-xs font-semibold">
          <Shield className="w-4 h-4 text-vast-ink" />
          <span>DSA Administrative Control</span>
        </div>
      </div>

      {plan.society?.advisor && (
        <div className="bg-lumen-cream p-4 rounded-cards border-2 border-vast-ink flex items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-lavender-whisper border border-vast-ink text-vast-ink rounded-inputs">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-fog font-medium">Assigned Faculty Advisor</p>
              <h4 className="font-bold text-vast-ink text-sm">
                {plan.society.advisor.user?.fullName} ({plan.society.advisor.designation})
              </h4>
            </div>
          </div>
          <span className="text-fog font-medium hidden sm:block">
            {plan.society.advisor.department}
          </span>
        </div>
      )}

      {isPending && (
        <div className="p-4 bg-amber-50 border-2 border-amber-500/40 rounded-cards flex items-center gap-3">
          <Clock className="w-5 h-5 text-ember-glow shrink-0" />
          <div>
            <h4 className="font-bold text-vast-ink text-sm">Plan Under Faculty Advisor Review</h4>
            <p className="text-xs text-fog font-medium">
              This annual plan is currently pending review by the assigned faculty advisor. Events cannot be edited while pending advisor evaluation.
            </p>
          </div>
        </div>
      )}

      <div className="bg-lumen-cream p-6 rounded-cards border-2 border-vast-ink space-y-4">
        <h2 className="text-base font-bold text-vast-ink border-b-2 border-vast-ink pb-3 flex items-center gap-2">
          <FileCheck className="w-4 h-4 text-vast-ink" />
          <span>Workflow Progress &amp; Review Timeline</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
          <div className={`p-3 rounded-inputs border-2 border-vast-ink space-y-1 ${
            isPending || isChangesRequested || isApproved
              ? 'bg-lavender-whisper text-vast-ink font-bold'
              : 'bg-lumen-stone text-fog'
          }`}>
            <p className="text-xs font-bold">1. Plan Submitted</p>
            <p className="text-[10px] opacity-80">Submitted by Society</p>
          </div>

          <div className={`p-3 rounded-inputs border-2 space-y-1 ${
            isChangesRequested
              ? 'bg-pure-white border-vast-ink text-red-500 font-bold'
              : isApproved
              ? 'bg-pure-white border-forest-ink text-forest-ink font-bold'
              : 'bg-amber-50 border-amber-300 text-ember-glow font-bold'
          }`}>
            <p className="text-xs font-bold">2. Advisor Evaluation</p>
            <p className="text-[10px] opacity-80">
              {isChangesRequested ? 'Changes Requested' : isApproved ? 'Advisor Approved' : 'Under Advisor Review'}
            </p>
          </div>

          <div className={`p-3 rounded-inputs border-2 space-y-1 ${
            isApproved
              ? 'bg-pure-white border-forest-ink text-forest-ink font-bold'
              : 'bg-lumen-stone border-vast-ink text-fog'
          }`}>
            <p className="text-xs font-bold">3. Official Record</p>
            <p className="text-[10px] opacity-80">
              {isApproved ? 'Approved & Recorded' : 'Awaiting Final Record'}
            </p>
          </div>
        </div>
      </div>

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

      <div className="bg-lumen-cream p-6 rounded-cards border-2 border-vast-ink space-y-4">
        <div className="flex items-center justify-between border-b-2 border-vast-ink pb-3">
          <h2 className="text-base font-bold text-vast-ink flex items-center gap-2">
            <Calendar className="w-4 h-4 text-vast-ink" />
            <span>Planned Calendar Events ({fields.length})</span>
          </h2>
        </div>

        {serverError && <Alert variant="error" message={serverError} />}

        {fields.length === 0 ? (
          <p className="text-xs text-fog py-4 text-center">No events in this annual plan.</p>
        ) : (
          <form onSubmit={handleSubmit(handleSaveAll)} className="space-y-4">
            {fields.map((field, index) => {
              const isCardEditing = editingIndex === index;

              return (
                <div
                  key={field.id}
                  className="bg-pure-white p-5 rounded-cards border-2 border-vast-ink space-y-4 relative"
                >
                  <div className="flex items-center justify-between border-b-2 border-vast-ink/10 pb-2">
                    <span className="text-xs font-extrabold text-vast-ink uppercase tracking-wider">
                      Event #{index + 1}
                    </span>

                    <div className="flex items-center gap-2">
                      {!isPending && !isCardEditing ? (
                        <>
                          <button
                            type="button"
                            onClick={() => setEditingIndex(index)}
                            className="flex items-center gap-1.5 px-3 py-1 bg-lumen-stone hover:bg-lavender-whisper border-2 border-vast-ink text-vast-ink text-xs font-bold rounded-inputs transition-colors"
                          >
                            <Edit className="w-3.5 h-3.5" />
                            <span>Edit Event</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteEvent(index)}
                            className="p-1 bg-pure-white hover:bg-red-50 text-red-500 border border-vast-ink rounded-inputs transition-colors"
                            title="Delete Event"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      ) : isPending ? (
                        <span className="text-[11px] font-bold text-ember-glow bg-amber-50 px-2.5 py-1 rounded-inputs border border-amber-300">
                          Pending Advisor Review (Read-Only)
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setEditingIndex(null)}
                          className="flex items-center gap-1 px-2.5 py-1 bg-lumen-stone hover:bg-pure-white border-2 border-vast-ink text-vast-ink text-xs font-bold rounded-inputs transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Cancel</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {!isCardEditing ? (
                    <div className="space-y-2">
                      <h4 className="font-extrabold text-base text-vast-ink">
                        {getValues(`events.${index}.eventName`) || 'Untitled Event'}
                      </h4>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
                        <p className="text-fog">
                          <strong className="text-vast-ink">Venue:</strong>{' '}
                          {getValues(`events.${index}.venue`) || 'N/A'}
                        </p>
                        <p className="text-fog">
                          <strong className="text-vast-ink">Outside Participants:</strong>{' '}
                          {getValues(`events.${index}.hasOutsideParticipants`) ? 'Yes' : 'No'}
                        </p>
                        <p className="text-fog">
                          <strong className="text-vast-ink">Outside Speaker:</strong>{' '}
                          {getValues(`events.${index}.hasOutsideSpeaker`) ? 'Yes' : 'No'}
                        </p>
                      </div>

                      <p className="text-xs text-fog leading-relaxed">
                        <strong className="text-vast-ink">Description:</strong>{' '}
                        {getValues(`events.${index}.description`) || 'No description provided.'}
                      </p>

                      {getValues(`events.${index}.rules`) ? (
                        <div className="p-3 bg-lavender-whisper border-2 border-vast-ink rounded-inputs text-xs">
                          <div className="flex items-center gap-1.5 font-bold text-vast-ink uppercase tracking-wider text-[11px] mb-1">
                            <FileText className="w-3.5 h-3.5 text-forest-ink" />
                            <span>Rules &amp; Regulations:</span>
                          </div>
                          <p className="text-vast-ink font-medium whitespace-pre-line leading-relaxed">
                            {getValues(`events.${index}.rules`)}
                          </p>
                        </div>
                      ) : (
                        <p className="text-xs text-fog italic pt-1">
                          No specific rules added for this event. Click &quot;Edit Event&quot; to add rules.
                        </p>
                      )}

                      <div className="flex gap-2 pt-2">
                        <span className="text-xs font-bold text-vast-ink bg-lumen-stone px-3 py-1 rounded-inputs border border-vast-ink">
                          Start: {getValues(`events.${index}.startDate`) || 'N/A'}
                        </span>
                        <span className="text-xs font-bold text-vast-ink bg-lumen-stone px-3 py-1 rounded-inputs border border-vast-ink">
                          End: {getValues(`events.${index}.endDate`) || 'N/A'}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4 pt-1">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <Input
                          label="Event Name *"
                          placeholder="e.g. Annual Hackathon"
                          {...register(`events.${index}.eventName`)}
                        />

                        <Input
                          label="Start Date *"
                          type="date"
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
                          {...register(`events.${index}.endDate`)}
                        />

                        <Input
                          label="Venue *"
                          placeholder="e.g. AHA Auditorium"
                          {...register(`events.${index}.venue`)}
                        />

                        <div className="flex flex-col justify-center space-y-2">
                          <label className="text-xs font-bold text-vast-ink uppercase tracking-wider">
                            Outside Participants?
                          </label>
                          <div className="flex items-center gap-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="radio"
                                value="true"
                                {...register(`events.${index}.hasOutsideParticipants`, {
                                  setValueAs: (v) => v === 'true' || v === true,
                                })}
                                className="w-4 h-4 text-forest-ink"
                              />
                              <span className="text-xs font-bold text-vast-ink">Yes</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="radio"
                                value="false"
                                {...register(`events.${index}.hasOutsideParticipants`, {
                                  setValueAs: (v) => v === 'true' || v === true,
                                })}
                                className="w-4 h-4 text-forest-ink"
                              />
                              <span className="text-xs font-bold text-vast-ink">No</span>
                            </label>
                          </div>
                        </div>

                        <div className="flex flex-col justify-center space-y-2">
                          <label className="text-xs font-bold text-vast-ink uppercase tracking-wider">
                            Outside Speaker?
                          </label>
                          <div className="flex items-center gap-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="radio"
                                value="true"
                                {...register(`events.${index}.hasOutsideSpeaker`, {
                                  setValueAs: (v) => v === 'true' || v === true,
                                })}
                                className="w-4 h-4 text-forest-ink"
                              />
                              <span className="text-xs font-bold text-vast-ink">Yes</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="radio"
                                value="false"
                                {...register(`events.${index}.hasOutsideSpeaker`, {
                                  setValueAs: (v) => v === 'true' || v === true,
                                })}
                                className="w-4 h-4 text-forest-ink"
                              />
                              <span className="text-xs font-bold text-vast-ink">No</span>
                            </label>
                          </div>
                        </div>

                        <div className="col-span-1 md:col-span-2 lg:col-span-3 space-y-3">
                          <div className="flex flex-col space-y-1">
                            <label className="text-xs font-bold text-vast-ink uppercase tracking-wider block">
                              Description *
                            </label>
                            <textarea
                              rows={3}
                              className="w-full px-3.5 py-2 bg-pure-white border-2 border-vast-ink rounded-inputs text-xs text-vast-ink focus:outline-none"
                              placeholder="Event description..."
                              {...register(`events.${index}.description`)}
                            />
                          </div>

                          {/* Display Society-provided Guidelines if present */}
                          {getValues(`events.${index}.societyRules`) && (
                            <div className="p-3 bg-lumen-stone/60 border-2 border-vast-ink/20 rounded-inputs space-y-1">
                              <span className="text-[11px] font-bold text-vast-ink uppercase tracking-wider block">
                                Society Submitted Guidelines &amp; Participant Notes
                              </span>
                              <p className="text-xs text-vast-ink font-medium whitespace-pre-line">
                                {getValues(`events.${index}.societyRules`)}
                              </p>
                            </div>
                          )}

                          {/* DSA Admin Official Rules & Directives Editor */}
                          <div className="flex flex-col space-y-1">
                            <label className="text-xs font-extrabold text-vast-ink uppercase tracking-wider block flex items-center gap-1.5">
                              <ShieldCheck className="w-4 h-4 text-forest-ink" />
                              <span>Official DSA Directives &amp; Event Rules (Set by DSA Admin)</span>
                            </label>
                            <textarea
                              rows={3}
                              className="w-full px-3.5 py-2 bg-pure-white border-2 border-vast-ink rounded-inputs text-xs text-vast-ink focus:outline-none focus:ring-2 focus:ring-vast-ink placeholder:text-fog/60 font-medium"
                              placeholder="Add official DSA security guidelines, time curfews, speaker rules, or administrative directives..."
                              {...register(`events.${index}.rules`)}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="pt-2 flex justify-end gap-2">
                        <Button
                          type="submit"
                          variant="primary"
                          size="sm"
                          isLoading={updateMutation.isPending}
                          leftIcon={<Save className="w-3.5 h-3.5" />}
                        >
                          Save Changes to Event
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </form>
        )}
      </div>
    </div>
  );
};
