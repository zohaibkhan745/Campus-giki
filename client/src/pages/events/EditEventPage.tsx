import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, Link, useParams } from 'react-router-dom';
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
  ShieldCheck,
} from 'lucide-react';
import { eventService } from '@/services/event.service';
import {
  eventFormSchema,
  type EventFormData,
} from '@/lib/validations/event.schema';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { EventMediaUploader } from '@/components/common/EventMediaUploader';
import type { AxiosError } from 'axios';

export const EditEventPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [serverError, setServerError] = useState<string | null>(null);

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
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<EventFormData>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      title: '',
      description: '',
      eventDate: '',
      startTime: '',
      endTime: '',
      venue: '',
      coverImageUrl: '',
      videoUrl: '',
      registrationLink: '',
      eventType: '',
      inChargeName: '',
      inChargeRegNum: '',
      inChargeContact: '',
    },
  });

  const coverImageUrl = watch('coverImageUrl');
  const videoUrl = watch('videoUrl');

  // Pre-fill form when event data is loaded
  useEffect(() => {
    if (eventData) {
      const formattedDate = eventData.eventDate
        ? new Date(eventData.eventDate).toISOString().split('T')[0]
        : '';

      reset({
        title: eventData.title || '',
        description: eventData.description || '',
        eventDate: formattedDate,
        startTime: eventData.startTime || '',
        endTime: eventData.endTime || '',
        venue: eventData.venue || '',
        coverImageUrl: eventData.coverImageUrl || '',
        videoUrl: eventData.videoUrl || '',
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
      queryClient.invalidateQueries({ queryKey: ['myEvents'] });
      queryClient.invalidateQueries({ queryKey: ['event', id] });
      queryClient.invalidateQueries({ queryKey: ['publicEvents'] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['societyEvents'] });
      queryClient.invalidateQueries({ queryKey: ['societyDashboard'] });
      queryClient.invalidateQueries({ queryKey: ['adminEvents'] });
      queryClient.invalidateQueries({ queryKey: ['adminDashboard'] });
      queryClient.invalidateQueries({ queryKey: ['feed'] });
      navigate('/dashboard', { replace: true });
    },
    onError: (
      error: AxiosError<{ message?: string | string[]; error?: string }>,
    ) => {
      const respMessage = error.response?.data?.message;
      let errText = 'Failed to update event. Please verify your inputs.';

      if (Array.isArray(respMessage)) {
        errText = respMessage.join(', ');
      } else if (typeof respMessage === 'string') {
        errText = respMessage;
      }

      setServerError(errText);
    },
  });

  const onSubmit = (data: EventFormData, submitForApproval = false) => {
    setServerError(null);
    updateMutation.mutate({ ...data, submitForApproval });
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
        <Alert variant="error" message="Event not found or you do not have ownership permissions." />
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-vast-ink hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Dashboard</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 text-left py-4">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 px-3.5 py-2 bg-transparent hover:bg-lumen-stone border border-vast-ink/20 text-vast-ink text-xs font-bold rounded-buttons transition-all cursor-pointer shadow-[2px_2px_0px_0px_#1B1B18]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
      </div>

      <div className="space-y-1 bg-transparent p-6 rounded-cards border border-vast-ink/20">
        <h1 className="text-2xl font-extrabold text-vast-ink">
          Edit Event: {eventData.title}
        </h1>
        <p className="text-sm text-fog">
          Update your event schedule, venue location, or media resources.
        </p>
      </div>

      {eventData.approvalStatus === 'CHANGES_REQUESTED' && eventData.advisorComments && (
        <Alert
          variant="error"
          title="Comment by Advisor"
          message={eventData.advisorComments}
        />
      )}

      {eventData.approvalStatus === 'CHANGES_REQUESTED' && eventData.dsaComments && (
        <Alert
          variant="error"
          title="Comment by DSA"
          message={eventData.dsaComments}
        />
      )}

      {serverError && <Alert variant="error" message={serverError} />}

      <form onSubmit={(e) => e.preventDefault()} className="bg-lumen-cream p-6 md:p-8 rounded-cards border border-vast-ink/20 space-y-8" noValidate>
        <div className="space-y-4">
          <h2 className="text-base font-bold text-vast-ink border-b-2 border-vast-ink pb-2">
            Event Overview
          </h2>

          <Input
            label="Event Title *"
            placeholder="e.g. GIKI SoftDesk Hackathon 2026"
            leftIcon={<Calendar className="w-4 h-4" />}
            disabled={updateMutation.isPending}
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
                disabled={updateMutation.isPending}
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

        <div className="space-y-4">
          <h2 className="text-base font-bold text-vast-ink border-b-2 border-vast-ink pb-2">
            Event Type & In-Charge Details
          </h2>

          <div className="space-y-1.5 text-left">
            <label className="block text-xs font-semibold text-vast-ink font-medium uppercase tracking-wider">
              Event Type
            </label>
            <select
              disabled={updateMutation.isPending}
              className="w-full bg-transparent text-vast-ink text-sm rounded-inputs border border-vast-ink/20 px-3.5 py-2.5 transition-all outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50"
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
              placeholder="e.g. Zohaib Khan"
              disabled={updateMutation.isPending}
              error={errors.inChargeName?.message}
              {...register('inChargeName')}
            />
            <Input
              label="In-Charge Reg. No"
              placeholder="e.g. 2023787"
              disabled={updateMutation.isPending}
              error={errors.inChargeRegNum?.message}
              {...register('inChargeRegNum')}
            />
          </div>

          <Input
            label="In-Charge Contact Number"
            placeholder="e.g. +923001234567"
            disabled={updateMutation.isPending}
            error={errors.inChargeContact?.message}
            {...register('inChargeContact')}
          />
        </div>

        <div className="space-y-4">
          <h2 className="text-base font-bold text-vast-ink border-b-2 border-vast-ink pb-2">
            Date, Time & Venue
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Event Date *"
              type="date"
              disabled={updateMutation.isPending}
              error={errors.eventDate?.message}
              {...register('eventDate')}
            />

            <Input
              label="Start Time (24h) *"
              type="time"
              leftIcon={<Clock className="w-4 h-4" />}
              disabled={updateMutation.isPending}
              error={errors.startTime?.message}
              {...register('startTime')}
            />

            <Input
              label="End Time (24h) *"
              type="time"
              leftIcon={<Clock className="w-4 h-4" />}
              disabled={updateMutation.isPending}
              error={errors.endTime?.message}
              {...register('endTime')}
            />
          </div>

          <Input
            label="Venue Location *"
            placeholder="e.g. Agha Hasan Abedi Auditorium / FCSE Lab 1"
            leftIcon={<MapPin className="w-4 h-4" />}
            disabled={updateMutation.isPending}
            error={errors.venue?.message}
            {...register('venue')}
          />
        </div>

        <div className="space-y-4">
          <h2 className="text-base font-bold text-vast-ink border-b-2 border-vast-ink pb-2">
            Media & Registration (Optional)
          </h2>

          <EventMediaUploader
            coverImageUrl={coverImageUrl}
            videoUrl={videoUrl}
            onImageChange={(url) => setValue('coverImageUrl', url, { shouldValidate: true })}
            onVideoChange={(url) => setValue('videoUrl', url, { shouldValidate: true })}
            folder="events"
            disabled={updateMutation.isPending}
          />

          <Input
            label="Registration Form Link (Optional)"
            placeholder="e.g. https://forms.gle/your-event-form"
            leftIcon={<ExternalLink className="w-4 h-4" />}
            disabled={updateMutation.isPending}
            error={errors.registrationLink?.message}
            {...register('registrationLink')}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t-2 border-vast-ink mt-4">
          <Button
            type="button"
            variant="primary"
            size="lg"
            className="w-full"
            isLoading={updateMutation.isPending}
            onClick={handleSubmit((data) => onSubmit(data, false))}
            leftIcon={<Save className="w-5 h-5" />}
          >
            Save Changes
          </Button>

          {eventData.approvalStatus === 'CHANGES_REQUESTED' && (
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="w-full bg-transparent border border-vast-ink/20 hover:bg-lavender-whisper"
              isLoading={updateMutation.isPending}
              onClick={handleSubmit((data) => onSubmit(data, true))}
              leftIcon={<ShieldCheck className="w-5 h-5 text-forest-ink" />}
            >
              Resubmit for Advisor Review
            </Button>
          )}
        </div>
      </form>
    </div>
  );
};
