import { CustomDropdown } from '@/components/ui/CustomDropdown';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { invalidateEventQueries } from '@/lib/queryInvalidations';
import {
  Calendar,
  Clock,
  MapPin,
  FileText,
  Image,
  ExternalLink,
  ArrowLeft,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  X,
  ShieldCheck,
} from 'lucide-react';
import { eventService } from '@/services/event.service';
import { advisorService } from '@/services/advisor.service';
import {
  eventFormSchema,
  type EventFormData,
} from '@/lib/validations/event.schema';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { ErrorState, BackButton } from '@/components/ui';
import type { AxiosError } from 'axios';

const getBadgeStyles = (status: string) => {
  switch (status) {
    case 'PUBLISHED':
    case 'APPROVED': return 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30';
    case 'PENDING_ADVISOR': return 'bg-orange-500/20 text-orange-600 dark:text-orange-400 border-orange-500/30';
    case 'PENDING_ADMIN': return 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30';
    case 'CHANGES_REQUESTED': return 'bg-rose-500/20 text-rose-600 dark:text-rose-400 border-rose-500/30';
    default: return 'bg-surface-hover text-text-muted border-border-subtle';
  }
}
const formatStatus = (s: string) => s.replace('_', ' ');

import { cn } from '@/lib/utils';
import { globalNotification } from '@/contexts/NotificationContext';
export const AdvisorEventReviewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [serverError, setServerError] = useState<string | null>(null);
  const [advisorComment, setAdvisorComment] = useState('');
  const [commentError, setCommentError] = useState(false);

  const {
    data: eventData,
    isLoading: isLoadingEvent,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['event', id],
    queryFn: () => eventService.getEventById(id!),
    enabled: !!id,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EventFormData>({
    resolver: zodResolver(eventFormSchema),
  });

  useEffect(() => {
    if (eventData) {
      const formattedDate = eventData.eventDate
        ? new Date(eventData.eventDate).toISOString().split('T')[0]
        : '';

      setAdvisorComment(eventData.advisorComments || '');

      reset({
        title: eventData.title,
        description: eventData.description,
        eventDate: formattedDate,
        startTime: eventData.startTime,
        endTime: eventData.endTime,
        venue: eventData.venue,
        coverImageUrl: eventData.coverImageUrl || '',
        registrationLink: eventData.registrationLink || '',
        eventType: eventData.eventType || '',
        inChargeName: eventData.inChargeName || '',
        inChargeRegNum: eventData.inChargeRegNum || '',
        inChargeContact: eventData.inChargeContact || '',
      });
    }
  }, [eventData, reset]);

  const updateMutation = useMutation({
    meta: { notify: true },
    mutationFn: (data: EventFormData) => eventService.updateEvent(id!, data),
    onSuccess: () => {
      void invalidateEventQueries(queryClient, id);
    },
    onError: (
      error: AxiosError<{ message?: string | string[]; error?: string }>,
    ) => {
      const respMessage = error.response?.data?.message;
      let errText = 'Failed to update event. Please verify your inputs.';
      if (Array.isArray(respMessage)) errText = respMessage.join(', ');
      else if (typeof respMessage === 'string') errText = respMessage;
      setServerError(errText);
    },
  });

  const updateEventStatusMutation = useMutation({
    meta: { notify: true },
    mutationFn: ({ status }: { status: string }) =>
      advisorService.updateEventStatus(id!, { status, comments: advisorComment }),
    onSuccess: () => {
      void invalidateEventQueries(queryClient, id);
      navigate('/advisor/yearly-plans', { replace: true });
    },
    onError: (
      error: AxiosError<{ message?: string | string[]; error?: string }>,
    ) => {
      const respMessage = error.response?.data?.message;
      let errText = 'Failed to update event status.';
      if (Array.isArray(respMessage)) errText = respMessage.join(', ');
      else if (typeof respMessage === 'string') errText = respMessage;
      setServerError(errText);
    },
  });

  const handleRequestChanges = () => {
    if (!advisorComment.trim()) {
      setCommentError(true);
      globalNotification.triggerFailed('Please add a comment detailing the requested changes.');
      return;
    }
    setCommentError(false);
    updateEventStatusMutation.mutate({ status: 'CHANGES_REQUESTED' });
  };

  const onSaveDetails = (data: EventFormData) => {
    setServerError(null);
    updateMutation.mutate(data);
  };

  if (isLoadingEvent) {
    return (
      <div className="min-h-[50vh] flex flex-col justify-center items-center text-text-secondary gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <p className="text-sm font-medium">Loading event details...</p>
      </div>
    );
  }

  if (isError || !eventData) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4">
        <ErrorState
          error={error}
          title={isError ? undefined : 'Event Not Found'}
          message={
            isError
              ? undefined
              : 'The requested event proposal could not be found or may have been removed.'
          }
          badge={isError ? undefined : 'Event Unavailable'}
          onRetry={isError ? () => refetch() : undefined}
          secondaryAction={{
            label: 'Back to Review Queue',
            to: '/advisor/yearly-plans',
          }}
        />
      </div>
    );
  }

  const isPending = eventData.approvalStatus === 'PENDING_ADVISOR';

  return (
    <div className="max-w-4xl mx-auto space-y-6 text-left py-4 px-4 pb-32">
      {/* Top Heading */}
      <div className="flex items-center mb-4">
        <BackButton variant="inline" />
      </div>
      <div className="mb-6">
        <h1 className="text-4xl font-extrabold text-text-primary leading-tight">
          Event Details: {eventData.title}
        </h1>
        <div className="flex items-center gap-3 mt-3">
          <span className={`px-3 py-1 border backdrop-blur-md rounded-inputs text-xs uppercase tracking-wider font-bold ${getBadgeStyles(eventData.approvalStatus || '')}`}>
            {formatStatus(eventData.approvalStatus || '')}
          </span>
          <span className="text-sm text-text-secondary font-medium">Society: {eventData.society?.name}</span>
        </div>
      </div>

      {eventData.rules && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/30 backdrop-blur-md rounded-cards space-y-1">
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-extrabold text-xs uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>Official DSA Directives &amp; Event Rules</span>
          </div>
          <p className="text-xs text-amber-800 dark:text-amber-200/80 font-medium whitespace-pre-line leading-relaxed pl-6">
            {eventData.rules}
          </p>
        </div>
      )}

      {/* Main Glassmorphic Card */}
      <div className="relative z-1 w-full p-8 rounded-cards bg-surface-glass backdrop-blur-xl border border-border-medium shadow-elevation-1 text-text-primary space-y-8">
        
        {/* Advisor Review & Comments Section */}
        <div className="space-y-4">
          <h2 className="text-lg font-extrabold flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-brand-primary" />
            Advisor Review & Feedback
          </h2>
          
          <div className="space-y-1.5 text-left">
            <label className="block text-xs uppercase tracking-wider text-text-secondary font-semibold mb-1">
              Feedback / Comments
            </label>
            <textarea
              rows={3}
              value={advisorComment}
              onChange={(e) => {
                setAdvisorComment(e.target.value);
                if (e.target.value.trim()) setCommentError(false);
              }}
              placeholder="Provide feedback or reasons for requesting changes..."
              disabled={!isPending || updateEventStatusMutation.isPending}
              className={cn(
                "w-full text-sm transition-all outline-none bg-surface text-text-primary placeholder:text-text-muted rounded-inputs px-3.5 py-2.5 border resize-y disabled:opacity-50",
                commentError 
                  ? "border-red-500/50 ring-2 ring-red-500/20 focus:border-red-500" 
                  : "border-border-medium focus:border-border-strong focus:ring-2 focus:ring-brand-primary/20"
              )}
            />
            {commentError && (
              <p className="text-red-500 dark:text-red-400 text-xs mt-1 font-medium">Comment is required to request changes.</p>
            )}
          </div>

          {isPending ? (
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button
                type="button"
                variant="primary"
                onClick={() => updateEventStatusMutation.mutate({ status: 'PENDING_ADMIN' })}
                isLoading={updateEventStatusMutation.isPending}
                leftIcon={<CheckCircle2 className="w-4 h-4 text-white" />}
                className="bg-emerald-600 text-white hover:bg-emerald-700 w-full sm:flex-1"
              >
                Approve (Send to DSA)
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleRequestChanges}
                isLoading={updateEventStatusMutation.isPending}
                leftIcon={<AlertCircle className="w-4 h-4 text-text-secondary" />}
                className="bg-surface hover:bg-surface-hover text-text-primary border border-border-medium w-full sm:flex-1"
              >
                Request Changes
              </Button>
            </div>
          ) : (
            <p className="text-xs text-text-secondary font-medium pt-2">
              This event is currently in {eventData.approvalStatus} status and cannot be approved/rejected at this time.
            </p>
          )}
        </div>

        {/* Separator Line */}
        <div className="w-full h-px bg-border-subtle my-6"></div>

        {/* Event Overview Section */}
        <form onSubmit={handleSubmit(onSaveDetails)} className="space-y-6" noValidate>
          <div className="space-y-4">
            <h2 className="text-lg font-extrabold flex items-center gap-2">
              <Calendar className="w-5 h-5 text-brand-primary" />
              Event Overview
            </h2>

            <Input
              label="Event Title *"
              placeholder="e.g. GIKI SoftDesk Hackathon 2026"
              leftIcon={<Calendar className="w-4 h-4" />}
              disabled={true}
              error={errors.title?.message}
              {...register('title')}
            />

            <div className="space-y-1.5 text-left">
              <label className="block text-xs uppercase tracking-wider text-text-secondary font-semibold mb-1">
                Event Description *
              </label>
              <div className="relative flex items-start">
                <div className="absolute left-3 top-3 text-text-muted pointer-events-none flex items-center justify-center">
                  <FileText className="w-4 h-4" />
                </div>
                <textarea
                  rows={4}
                  placeholder="Describe your event agenda, prerequisites, target audience, and guidelines..."
                  disabled={true}
                  className="w-full text-sm transition-all outline-none bg-surface-hover/50 text-text-primary placeholder:text-text-muted rounded-inputs px-3.5 py-2.5 pl-10 border border-border-subtle disabled:opacity-75 resize-y"
                  {...register('description')}
                />
              </div>
            </div>
          </div>

          {/* Separator Line */}
          <div className="w-full h-px bg-border-subtle my-6"></div>

          {/* Event Type & Logistics */}
          <div className="space-y-4">
            <h2 className="text-lg font-extrabold flex items-center gap-2">
              <MapPin className="w-5 h-5 text-brand-primary" />
              Logistics & Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5 text-left">
                <label className="block text-xs uppercase tracking-wider text-text-secondary font-semibold mb-1">
                  Event Type
                </label>
                <CustomDropdown placeholder="Not Specified" disabled={true} options={[{value:"Workshop",label:"Workshop"},{value:"Seminar",label:"Seminar"},{value:"Hackathon",label:"Hackathon"},{value:"Competition",label:"Competition"},{value:"Social",label:"Social"},{value:"Other",label:"Other"}]} value={eventData.eventType || undefined} />
              </div>
              <Input
                type="date"
                label="Event Date *"
                leftIcon={<Calendar className="w-4 h-4" />}
                disabled={true}
                {...register('eventDate')}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                type="time"
                label="Start Time *"
                leftIcon={<Clock className="w-4 h-4" />}
                disabled={true}
                {...register('startTime')}
              />
              <Input
                type="time"
                label="End Time *"
                leftIcon={<Clock className="w-4 h-4" />}
                disabled={true}
                {...register('endTime')}
              />
            </div>

            <Input
              label="Venue / Location *"
              placeholder="e.g. AHA Auditorium"
              leftIcon={<MapPin className="w-4 h-4" />}
              disabled={true}
              {...register('venue')}
            />
          </div>

          {/* Separator Line */}
          <div className="w-full h-px bg-border-subtle my-6"></div>

          {/* In-Charge Details */}
          <div className="space-y-4">
            <h2 className="text-lg font-extrabold flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-brand-primary" />
              In-Charge Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="In-Charge Name *"
                placeholder="e.g. John Doe"
                disabled={true}
                {...register('inChargeName')}
              />
              <Input
                label="Registration Number *"
                placeholder="e.g. 2023123"
                disabled={true}
                {...register('inChargeRegNum')}
              />
              <Input
                label="Contact Number *"
                placeholder="e.g. 03001234567"
                disabled={true}
                {...register('inChargeContact')}
              />
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
