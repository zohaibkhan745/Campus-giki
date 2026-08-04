import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams, Link } from 'react-router-dom';
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
import { adminService } from '@/services/admin.service';
import {
  eventFormSchema,
  type EventFormData,
} from '@/lib/validations/event.schema';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import type { AxiosError } from 'axios';

export const AdminEventReviewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [serverError, setServerError] = useState<string | null>(null);
  const [dsaComment, setDsaComment] = useState('');
  const [rules, setRules] = useState('');
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  // Query existing event data
  const {
    data: eventData,
    isLoading: isLoadingEvent,
    isError,
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

  // Pre-fill form when event data is loaded
  useEffect(() => {
    if (eventData) {
      const formattedDate = eventData.eventDate
        ? new Date(eventData.eventDate).toISOString().split('T')[0]
        : '';

      setDsaComment(eventData.dsaComments || '');
      setRules(eventData.rules || '');

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
    mutationFn: (data: EventFormData) => eventService.updateEvent(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event', id] });
      queryClient.invalidateQueries({ queryKey: ['adminDashboard'] });
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
    mutationFn: (data: { status: 'PUBLISHED' | 'CHANGES_REQUESTED' }) =>
      adminService.updateEventStatus(id!, { status: data.status, comments: dsaComment.trim() || undefined, rules: rules.trim() || undefined }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event', id] });
      queryClient.invalidateQueries({ queryKey: ['adminDashboard'] });
      queryClient.invalidateQueries({ queryKey: ['adminEventsList'] });
      navigate('/dashboard', { replace: true });
    },
    onError: (
      error: AxiosError<{ message?: string | string[]; error?: string }>,
    ) => {
      const respMessage = error.response?.data?.message;
      setServerError(typeof respMessage === 'string' ? respMessage : 'Failed to update status.');
    },
  });

  const onSaveDetails = (data: EventFormData) => {
    setServerError(null);
    updateMutation.mutate(data);
  };

  if (isLoadingEvent) {
    return (
      <div className="min-h-[50vh] flex flex-col justify-center items-center text-fog gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <p className="text-sm font-medium">Loading event details...</p>
      </div>
    );
  }

  if (isError || !eventData) {
    return (
      <div className="max-w-md mx-auto py-12 space-y-4 text-center">
        <Alert variant="error" message="Event not found or you do not have permission." />
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-vast-ink hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Queue</span>
        </Link>
      </div>
    );
  }

  const isPending = eventData.approvalStatus === 'PENDING_ADMIN';

  return (
    <div className="max-w-3xl mx-auto space-y-6 text-left py-4">
      <div className="flex items-center justify-between">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 text-xs font-semibold text-fog hover:text-vast-ink transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Queue</span>
        </Link>
      </div>

      <div className="space-y-1 bg-transparent p-6 rounded-cards border border-vast-ink/20">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-extrabold text-vast-ink">
            {eventData.approvalStatus === 'PENDING_ADMIN' ? 'Review Event' : 'Event Details'}: {eventData.title}
          </h1>
          <span className="px-3 py-1 bg-lumen-stone text-vast-ink font-medium rounded-inputs text-xs font-semibold">
            {eventData.approvalStatus}
          </span>
        </div>
        <p className="text-sm text-fog">
          Society: {eventData.society?.name}
        </p>
      </div>

      {eventData.advisorComments && (
        <Alert
          variant="info"
          title="Comment by Advisor"
          message={eventData.advisorComments}
        />
      )}

      {serverError && <Alert variant="error" message={serverError} />}
      {updateMutation.isSuccess && (
        <Alert variant="success" message="Event details updated successfully." />
      )}

      <div className="bg-lumen-cream p-6 md:p-8 rounded-cards border border-vast-ink/20 space-y-8">
        {/* Review Actions */}
        <div className="space-y-4">
          <h2 className="text-base font-bold text-vast-ink border-b border-vast-ink/20 pb-2">
            DSA Admin Review & Comments
          </h2>
        
        <div className="space-y-1.5 text-left">
          <label className="block text-xs font-semibold text-vast-ink font-medium uppercase tracking-wider">
            Feedback / Comments
          </label>
          <textarea
            rows={3}
            value={dsaComment}
            onChange={(e) => setDsaComment(e.target.value)}
            placeholder="Provide feedback or reasons for requesting changes..."
            disabled={updateEventStatusMutation.isPending}
            className="w-full bg-transparent text-vast-ink placeholder:text-fog text-sm rounded-inputs border border-vast-ink/20 px-3.5 py-2.5 transition-all outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 resize-y"
          />
        </div>

        <div className="space-y-1.5 text-left pt-2">
          <label className="block text-xs font-extrabold text-vast-ink uppercase tracking-wider flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-forest-ink" />
            <span>Official DSA Directives &amp; Event Rules</span>
          </label>
          <textarea
            rows={3}
            value={rules}
            onChange={(e) => setRules(e.target.value)}
            placeholder="Add official DSA security guidelines, time curfews, speaker rules, or administrative directives..."
            disabled={updateEventStatusMutation.isPending}
            className="w-full bg-transparent text-vast-ink placeholder:text-fog text-sm rounded-inputs border border-vast-ink/20 px-3.5 py-2.5 transition-all outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 resize-y"
          />
        </div>

        {isPending ? (
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Button
              type="button"
              variant="primary"
              onClick={() => updateEventStatusMutation.mutate({ status: 'PUBLISHED' })}
              isLoading={updateEventStatusMutation.isPending}
              leftIcon={<CheckCircle2 className="w-4 h-4" />}
            >
              Accept
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => updateEventStatusMutation.mutate({ status: 'CHANGES_REQUESTED' })}
              isLoading={updateEventStatusMutation.isPending}
              leftIcon={<AlertCircle className="w-4 h-4" />}
            >
              Request Changes
            </Button>
          </div>
        ) : (
          <p className="text-xs text-fog font-medium pt-2">
            This event is currently in {eventData.approvalStatus} status and cannot be approved/rejected at this time.
          </p>
        )}
        </div>

        <form onSubmit={(e) => e.preventDefault()} className="space-y-8 pt-6 border-t border-vast-ink/20" noValidate>
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-vast-ink/20 pb-2">
              <h2 className="text-base font-bold text-vast-ink">
                Event Overview
              </h2>
          </div>

          <Input
            label="Event Title *"
            placeholder="e.g. GIKI SoftDesk Hackathon 2026"
            leftIcon={<Calendar className="w-4 h-4" />}
            disabled={true}
            error={errors.title?.message}
            {...register('title')}
          />

          <div className="space-y-1.5 text-left">
            <label className="block text-xs font-semibold text-vast-ink font-medium uppercase tracking-wider">
              Event Description *
            </label>
            <div className="relative flex items-start">
              <div className="absolute left-3 top-3 text-fog pointer-events-none flex items-center justify-center">
                <FileText className="w-4 h-4" />
              </div>
              <textarea
                rows={4}
                placeholder="Describe your event agenda, prerequisites, target audience, and guidelines..."
                disabled={true}
                className="w-full bg-transparent text-vast-ink placeholder:text-fog text-sm rounded-inputs border border-vast-ink/20 px-3.5 py-2.5 pl-10 transition-all outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 resize-y"
                {...register('description')}
              />
            </div>
            {errors.description?.message && (
              <p className="text-xs text-red-400 font-medium">
                {errors.description.message}
              </p>
            )}
          </div>

          </div>

          <div className="space-y-4 pt-4 border-t border-vast-ink/20">
            <h2 className="text-base font-bold text-vast-ink pb-2">
              Event Type & In-Charge Details
            </h2>

            <div className="space-y-1.5 text-left">
              <label className="block text-xs font-semibold text-vast-ink font-medium uppercase tracking-wider">
                Event Type
              </label>
            <select
              disabled={true}
              className="w-full bg-lumen-cream text-vast-ink text-sm rounded-inputs border border-vast-ink/20 px-3.5 py-2.5 transition-all outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50"
              {...register('eventType')}
            >
              <option value="">-- Select Event Type --</option>
              <option value="Workshop/Training">Workshop / Training</option>
              <option value="Hackathon/Competition">Hackathon / Competition</option>
              <option value="Cultural/Social">Cultural / Social Event</option>
              <option value="Lecture/Seminar">Lecture / Seminar</option>
              <option value="Conference/Symposium">Conference / Symposium</option>
              <option value="Entertainment">Entertainment</option>
              <option value="Sports/Esports">Sports / E-Sports</option>
              <option value="Exhibition/Showcase">Exhibition / Showcase</option>
              <option value="Community Service">Community Service</option>
              <option value="Literary">Literary</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="In-Charge Name"
              placeholder="e.g. Full Name"
              disabled={true}
              error={errors.inChargeName?.message}
              {...register('inChargeName')}
            />
            <Input
              label="In-Charge Reg. No"
              placeholder="e.g. 2023787"
              disabled={true}
              error={errors.inChargeRegNum?.message}
              {...register('inChargeRegNum')}
            />
          </div>

          <Input
            label="In-Charge Contact Number"
            placeholder="e.g. +923001234567"
            disabled={true}
            error={errors.inChargeContact?.message}
            {...register('inChargeContact')}
          />
        </div>

        <div className="space-y-4">
          <h2 className="text-base font-bold text-vast-ink">
            Date, Time & Venue
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Event Date *"
              type="date"
              disabled={true}
              error={errors.eventDate?.message}
              {...register('eventDate')}
            />

            <Input
              label="Start Time (24h) *"
              type="time"
              leftIcon={<Clock className="w-4 h-4" />}
              disabled={true}
              error={errors.startTime?.message}
              {...register('startTime')}
            />

            <Input
              label="End Time (24h) *"
              type="time"
              leftIcon={<Clock className="w-4 h-4" />}
              disabled={true}
              error={errors.endTime?.message}
              {...register('endTime')}
            />
          </div>

          <Input
            label="Venue Location *"
            placeholder="e.g. Agha Hasan Abedi Auditorium / FCSE Lab 1"
            leftIcon={<MapPin className="w-4 h-4" />}
            disabled={true}
            error={errors.venue?.message}
            {...register('venue')}
          />

          <div className="space-y-4 pt-4 border-t-2 border-vast-ink/20">
            <h2 className="text-base font-bold text-vast-ink pb-2">
              Media & External Registration (Optional)
            </h2>

            <div className="space-y-2">
              <label className="block text-sm font-bold text-vast-ink">Cover Image</label>
              {eventData?.coverImageUrl ? (
                <div 
                  className="relative rounded-cards overflow-hidden border border-vast-ink/20 bg-lumen-stone shadow-sm w-full max-h-64 flex items-center justify-center cursor-pointer group"
                  onClick={() => setIsImageModalOpen(true)}
                >
                  <img
                    src={eventData.coverImageUrl}
                    alt="Event Cover"
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-vast-ink/0 group-hover:bg-vast-ink/20 transition-colors flex items-center justify-center">
                    <span className="opacity-0 group-hover:opacity-100 bg-vast-ink text-pure-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md transition-opacity">
                      View Full Image
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-fog p-4 bg-lumen-stone/50 border border-vast-ink/20 rounded-inputs text-center">
                  No cover image provided.
                </div>
              )}
            </div>

            <Input
              label="Registration Form Link (Optional)"
              placeholder="e.g. https://forms.gle/your-event-form"
              leftIcon={<ExternalLink className="w-4 h-4" />}
              disabled={true}
              error={errors.registrationLink?.message}
              {...register('registrationLink')}
            />
          </div>
        </div>
      </form>
      </div>

      {/* Image Modal */}
      {isImageModalOpen && eventData?.coverImageUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/80 p-4 backdrop-blur-sm" onClick={() => setIsImageModalOpen(false)}>
          <div className="relative max-w-5xl w-full max-h-screen flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
            <button 
              onClick={() => setIsImageModalOpen(false)}
              className="absolute -top-12 right-0 p-2 text-pure-white hover:text-red-400 transition-colors"
            >
              <X className="w-8 h-8" />
            </button>
            <img 
              src={eventData.coverImageUrl} 
              alt="Event Cover Full" 
              className="w-auto h-auto max-w-full max-h-[85vh] object-contain rounded-cards shadow-2xl border-2 border-pure-white/20"
            />
          </div>
        </div>
      )}
    </div>
  );
};
