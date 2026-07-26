import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
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
} from 'lucide-react';
import { eventService } from '@/services/event.service';
import {
  eventFormSchema,
  type EventFormData,
} from '@/lib/validations/event.schema';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import type { AxiosError } from 'axios';

export const CreateEventPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
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
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: EventFormData) => eventService.createEvent(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myEvents'] });
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

  const onSubmit = (data: EventFormData) => {
    setServerError(null);
    createMutation.mutate(data);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 text-left py-4">
      <div className="flex items-center justify-between">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 text-xs font-semibold text-fog hover:text-vast-ink transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </Link>
      </div>

      <div className="space-y-1 bg-pure-white p-6 rounded-cards border-2 border-vast-ink">
        <h1 className="text-2xl font-extrabold text-vast-ink">
          Create New Campus Event
        </h1>
        <p className="text-sm text-fog">
          Publish a new workshop, hackathon, competition, or seminar for your society.
        </p>
      </div>

      {serverError && <Alert variant="error" message={serverError} />}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
        <div className="bg-lumen-cream p-6 rounded-cards border-2 border-vast-ink space-y-4">
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
                className="w-full bg-pure-white text-vast-ink placeholder:text-fog text-sm rounded-inputs border-2 border-vast-ink px-3.5 py-2.5 pl-10 transition-all outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 resize-y"
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

        <div className="bg-lumen-cream p-6 rounded-cards border-2 border-vast-ink space-y-4">
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

        <div className="bg-lumen-cream p-6 rounded-cards border-2 border-vast-ink space-y-4">
          <h2 className="text-base font-bold text-vast-ink border-b-2 border-vast-ink pb-2">
            Media & External Registration (Optional)
          </h2>

          <Input
            label="Cover Image URL"
            placeholder="https://giki.edu.pk/events/softdesk-banner.png"
            leftIcon={<Image className="w-4 h-4" />}
            disabled={createMutation.isPending}
            error={errors.coverImageUrl?.message}
            {...register('coverImageUrl')}
          />

          <Input
            label="External Registration Link (Google Form / Ticket Link)"
            placeholder="https://forms.gle/sampleRegistrationFormId"
            leftIcon={<ExternalLink className="w-4 h-4" />}
            disabled={createMutation.isPending}
            error={errors.registrationLink?.message}
            {...register('registrationLink')}
          />
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full"
          isLoading={createMutation.isPending}
          leftIcon={<CheckCircle2 className="w-5 h-5" />}
        >
          Publish Event Immediately
        </Button>
      </form>
    </div>
  );
};
