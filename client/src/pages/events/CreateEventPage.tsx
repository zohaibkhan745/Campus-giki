import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, Link } from 'react-router-dom';
import {
  Calendar,
  Clock,
  MapPin,
  FileText,
  Image,
  ExternalLink,
  ArrowLeft,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { eventService } from '@/services/event.service';
import { yearlyPlanService } from '@/services/yearly-plan.service';
import type { PlannedEventItem } from '@/types/yearly-plan.types';
import {
  eventFormSchema,
  type EventFormData,
} from '@/lib/validations/event.schema';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { EventMediaUploader } from '@/components/common/EventMediaUploader';
import type { AxiosError } from 'axios';

export const CreateEventPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [serverError, setServerError] = useState<string | null>(null);

  const [selectedEventKey, setSelectedEventKey] = useState<string>('');

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<EventFormData>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      title: '',
      description: '',
      eventDate: '',
      startTime: '09:00',
      endTime: '17:00',
      venue: '',
      coverImageUrl: '',
      registrationLink: '',
      eventType: '',
      inChargeName: '',
      inChargeRegNum: '',
      inChargeContact: '',
    },
  });

  const coverImageUrl = watch('coverImageUrl');
  const videoUrl = watch('videoUrl');

  const { data: myPlans } = useQuery({
    queryKey: ['myYearlyPlans'],
    queryFn: () => yearlyPlanService.getMyPlans(),
  });

  const plannedEvents = React.useMemo(() => {
    if (!myPlans) return [];
    const list: { key: string; planYear: number; planStatus: string; event: PlannedEventItem }[] = [];
    myPlans.forEach((plan) => {
      plan.plannedEvents?.forEach((pe, idx) => {
        list.push({
          key: pe.id || `${plan.id}-${idx}`,
          planYear: plan.year,
          planStatus: plan.status,
          event: pe,
        });
      });
    });
    return list;
  }, [myPlans]);

  const handleSelectPlannedEvent = (key: string) => {
    setSelectedEventKey(key);
    if (!key) return;

    const found = plannedEvents.find((item) => item.key === key);
    if (found) {
      const { event: pe } = found;
      setValue('title', pe.eventName || '', { shouldValidate: true });
      if (pe.startDate) {
        const dateFormatted = new Date(pe.startDate).toISOString().split('T')[0];
        setValue('eventDate', dateFormatted, { shouldValidate: true });
      }
      setValue('venue', pe.venue || '', { shouldValidate: true });
      setValue('description', pe.description || '', { shouldValidate: true });
    }
  };

  const createMutation = useMutation({
    mutationFn: (data: EventFormData) => eventService.createEvent(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myEvents'] });
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
      let errText = 'Failed to create event. Please verify your inputs.';

      if (Array.isArray(respMessage)) {
        errText = respMessage.join(', ');
      } else if (typeof respMessage === 'string') {
        errText = respMessage;
      }

      setServerError(errText);
    },
  });

  const handlePublish = (data: EventFormData, submitForApproval: boolean) => {
    setServerError(null);
    createMutation.mutate({ ...data, submitForApproval });
  };

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
          Create New Campus Event
        </h1>
        <p className="text-sm text-fog">
          Publish a new workshop, hackathon, competition, or seminar for your society.
        </p>
      </div>

      {/* Annual Calendar Import Selector Card */}
      {plannedEvents.length > 0 && (
        <div className="p-5 bg-lumen-cream border border-vast-ink/20 rounded-cards space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-vast-ink font-bold text-sm">
              Import Event Details from Annual Calendar Plan
            </h3>
            <span className="text-[10px] font-extrabold text-vast-ink uppercase tracking-wider bg-transparent px-2.5 py-1 rounded-inputs border border-vast-ink/20">
              Optional Auto-Fill
            </span>
          </div>

          <p className="text-xs text-fog font-medium">
            Select a planned event from your annual calendar to automatically pre-fill title, date, venue, and description:
          </p>

          <select
            value={selectedEventKey}
            onChange={(e) => handleSelectPlannedEvent(e.target.value)}
            className="w-full bg-lumen-cream text-vast-ink text-xs font-bold rounded-inputs border border-vast-ink/20 px-3.5 py-2.5 transition-all outline-none focus:ring-2 focus:ring-vast-ink cursor-pointer"
          >
            <option value="" className="bg-lumen-cream text-vast-ink font-semibold">-- Select Event from Annual Plan (or Create Custom Event) --</option>
            {plannedEvents.map((item) => (
              <option key={item.key} value={item.key} className="bg-lumen-cream text-vast-ink font-semibold">
                {item.event.eventName}
              </option>
            ))}
          </select>
        </div>
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
            disabled={createMutation.isPending}
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
                disabled={createMutation.isPending}
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
              disabled={createMutation.isPending}
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
              disabled={createMutation.isPending}
              error={errors.inChargeName?.message}
              {...register('inChargeName')}
            />
            <Input
              label="In-Charge Reg. No"
              placeholder="e.g. 2023787"
              disabled={createMutation.isPending}
              error={errors.inChargeRegNum?.message}
              {...register('inChargeRegNum')}
            />
          </div>

          <Input
            label="In-Charge Contact Number"
            placeholder="e.g. +923001234567"
            disabled={createMutation.isPending}
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
              disabled={createMutation.isPending}
              error={errors.eventDate?.message}
              {...register('eventDate')}
            />

            <Input
              label="Start Time (24h) *"
              type="time"
              leftIcon={<Clock className="w-4 h-4" />}
              disabled={createMutation.isPending}
              error={errors.startTime?.message}
              {...register('startTime')}
            />

            <Input
              label="End Time (24h) *"
              type="time"
              leftIcon={<Clock className="w-4 h-4" />}
              disabled={createMutation.isPending}
              error={errors.endTime?.message}
              {...register('endTime')}
            />
          </div>

          <Input
            label="Venue Location *"
            placeholder="e.g. Agha Hasan Abedi Auditorium / FCSE Lab 1"
            leftIcon={<MapPin className="w-4 h-4" />}
            disabled={createMutation.isPending}
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
            disabled={createMutation.isPending}
          />

          <Input
            label="Registration Form Link (Optional)"
            placeholder="e.g. https://forms.gle/your-event-form"
            leftIcon={<ExternalLink className="w-4 h-4" />}
            disabled={createMutation.isPending}
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
            isLoading={createMutation.isPending}
            onClick={handleSubmit((data) => handlePublish(data, false))}
            leftIcon={<CheckCircle2 className="w-5 h-5" />}
          >
            Directly Publish Event
          </Button>

          <Button
            type="button"
            variant="outline"
            size="lg"
            className="w-full bg-transparent border border-vast-ink/20 hover:bg-lavender-whisper"
            isLoading={createMutation.isPending}
            onClick={handleSubmit((data) => handlePublish(data, true))}
            leftIcon={<ShieldCheck className="w-5 h-5 text-forest-ink" />}
          >
            Submit for Advisor &amp; DSA Review
          </Button>
        </div>
      </form>
    </div>
  );
};
