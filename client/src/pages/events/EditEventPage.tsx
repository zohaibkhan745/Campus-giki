import { CustomDropdown } from '@/components/ui/CustomDropdown';
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

    const requestEditMutation = useMutation({
    mutationFn: () => eventService.requestEdit(id!, 'Society requested edit access'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event', id] });
    },
  });

  const isEditLocked = 
    (eventData?.approvalStatus === 'APPROVED' || 
     eventData?.approvalStatus === 'PUBLISHED' || 
     eventData?.approvalStatus === 'PENDING_ADMIN') && 
    (eventData as any)?.editRequestStatus !== 'APPROVED';

  const updateMutation = useMutation({
    meta: { notify: true },
    mutationFn: (data: EventFormData) => eventService.updateEvent(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myEvents'] });
      queryClient.invalidateQueries({ queryKey: ['event', id] });
      queryClient.invalidateQueries({ queryKey: ['publicEvents'] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['societyEvents'] });
      queryClient.invalidateQueries({ queryKey: ['societyDashboard'] });
      queryClient.invalidateQueries({ queryKey: ['adminEvents'] });
      queryClient.invalidateQueries({ queryKey: ['adminEventsList'] });
      queryClient.invalidateQueries({ queryKey: ['advisorDashboard'] });
      queryClient.invalidateQueries({ queryKey: ['adminDashboard'] });
      queryClient.invalidateQueries({ queryKey: ['campusFeed'] });
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

      setServerError('');
    },
  });

  const onSubmit = (data: EventFormData, submitForApproval = false) => {
    setServerError('');
    updateMutation.mutate({ ...data, submitForApproval });
  };

  if (isLoadingEvent) {
    return (
      <div className="min-h-[50vh] flex flex-col justify-center items-center text-gray-400 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <p className="text-sm font-medium">Loading event details...</p>
      </div>
    );
  }

  if (isError || !eventData) {
    return (
      <div className="max-w-md mx-auto py-12 space-y-4 text-center">
        null /* Removed error alert */
        <Link
          to="/dashboard"
          className="fixed top-4 left-4 sm:top-6 sm:left-6 z-[100] inline-flex items-center justify-center w-10 h-10 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white rounded-full transition-all cursor-pointer shadow-lg"
          title="Go Back"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 text-left py-4">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="fixed top-4 left-4 sm:top-6 sm:left-6 z-[100] inline-flex items-center justify-center w-10 h-10 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white rounded-full transition-all cursor-pointer shadow-lg"
          title="Go Back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-1 bg-transparent p-6 rounded-cards border border-white/20">
        <h1 className="text-2xl font-extrabold text-white">
          Edit Event: {eventData.title}
        </h1>
        <p className="text-sm text-gray-400">
          Update your event schedule, venue location, or media resources.
        </p>
      </div>

      {eventData.approvalStatus === 'CHANGES_REQUESTED' && eventData.advisorComments && (
        null /* Removed error alert */
      )}

      {eventData.approvalStatus === 'CHANGES_REQUESTED' && eventData.dsaComments && (
        null /* Removed error alert */
      )}

      {null}

      <form onSubmit={(e) => e.preventDefault()} className="bg-white/[0.08] backdrop-blur-[20px] p-6 md:p-8 rounded-cards border border-white/20 space-y-8" noValidate>
        <div className="space-y-4">
          <h2 className="text-base font-bold text-white border-b border-white/20 pb-2">
            Event Overview
          </h2>

          <Input
            label="Event Title *"
            placeholder="e.g. GIKI SoftDesk Hackathon 2026"
            leftIcon={<Calendar className="w-4 h-4" />}
            disabled={updateMutation.isPending || isEditLocked}
            error={errors.title?.message}
            {...register('title')}
          />

          <div className="space-y-1.5 text-left">
            <label className="block text-xs font-semibold text-white font-medium uppercase tracking-wider">
              Event Description *
            </label>
            <div className="relative flex items-start">
              <div className="absolute left-3 top-3 text-gray-400 pointer-events-none flex items-center justify-center">
                <FileText className="w-4 h-4" />
              </div>
              <textarea
                rows={4}
                placeholder="Describe your event agenda, prerequisites, target audience, and guidelines..."
                disabled={updateMutation.isPending || isEditLocked}
                className="w-full bg-transparent text-white placeholder:text-gray-400 text-sm rounded-inputs border border-white/20 px-3.5 py-2.5 pl-10 transition-all outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 resize-y"
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
          <h2 className="text-base font-bold text-white border-b border-white/20 pb-2">
            Event Type & In-Charge Details
          </h2>

          <div className="space-y-1.5 text-left">
            <label className="block text-xs font-semibold text-white font-medium uppercase tracking-wider">
              Event Type
            </label>
            <CustomDropdown placeholder="Select Type" disabled={true} options={[{value:"Workshop",label:"Workshop"},{value:"Seminar",label:"Seminar"},{value:"Hackathon",label:"Hackathon"},{value:"Competition",label:"Competition"},{value:"Social",label:"Social"},{value:"Other",label:"Other"}]} {...register('eventType')} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="In-Charge Name"
              placeholder="e.g. Zohaib Khan"
              disabled={updateMutation.isPending || isEditLocked}
              error={errors.inChargeName?.message}
              {...register('inChargeName')}
            />
            <Input
              label="In-Charge Reg. No"
              placeholder="e.g. 2023787"
              disabled={updateMutation.isPending || isEditLocked}
              error={errors.inChargeRegNum?.message}
              {...register('inChargeRegNum')}
            />
          </div>

          <Input
            label="In-Charge Contact Number"
            placeholder="e.g. +923001234567"
            disabled={updateMutation.isPending || isEditLocked}
            error={errors.inChargeContact?.message}
            {...register('inChargeContact')}
          />
        </div>

        <div className="space-y-4">
          <h2 className="text-base font-bold text-white border-b border-white/20 pb-2">
            Date, Time & Venue
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Event Date *"
              type="date"
              disabled={updateMutation.isPending || isEditLocked}
              error={errors.eventDate?.message}
              {...register('eventDate')}
            />

            <Input
              label="Start Time (24h) *"
              type="time"
              leftIcon={<Clock className="w-4 h-4" />}
              disabled={updateMutation.isPending || isEditLocked}
              error={errors.startTime?.message}
              {...register('startTime')}
            />

            <Input
              label="End Time (24h) *"
              type="time"
              leftIcon={<Clock className="w-4 h-4" />}
              disabled={updateMutation.isPending || isEditLocked}
              error={errors.endTime?.message}
              {...register('endTime')}
            />
          </div>

          <Input
            label="Venue Location *"
            placeholder="e.g. Agha Hasan Abedi Auditorium / FCSE Lab 1"
            leftIcon={<MapPin className="w-4 h-4" />}
            disabled={updateMutation.isPending || isEditLocked}
            error={errors.venue?.message}
            {...register('venue')}
          />
        </div>

        <div className="space-y-4">
          <h2 className="text-base font-bold text-white border-b border-white/20 pb-2">
            Media & Registration (Optional)
          </h2>

          <EventMediaUploader
            coverImageUrl={coverImageUrl}
            videoUrl={videoUrl}
            onImageChange={(url) => setValue('coverImageUrl', url, { shouldValidate: true })}
            onVideoChange={(url) => setValue('videoUrl', url, { shouldValidate: true })}
            folder="events"
            disabled={updateMutation.isPending || isEditLocked}
          />

          <Input
            label="Registration Form Link (Optional)"
            placeholder="e.g. https://forms.gle/your-event-form"
            leftIcon={<ExternalLink className="w-4 h-4" />}
            disabled={updateMutation.isPending || isEditLocked}
            error={errors.registrationLink?.message}
            {...register('registrationLink')}
          />
        </div>

        
          <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-white/20 mt-4">
            {isEditLocked ? (
              (eventData as any)?.editRequestStatus === 'PENDING' ? (
                <Button type="button" variant="outline" disabled className="w-full text-gray-400 border-white/20">
                  <Clock className="w-5 h-5 mr-2" />
                  Edit Request Pending DSA Approval
                </Button>
              ) : (
                <Button 
                  type="button" 
                  variant="primary" 
                  className="w-full bg-blue-600 text-white hover:bg-blue-700"
                  onClick={() => requestEditMutation.mutate()}
                  isLoading={requestEditMutation.isPending}
                >
                  <ShieldCheck className="w-5 h-5 mr-2" />
                  Request Edit Access from DSA
                </Button>
              )
            ) : (
              <>
                <Button
                  type="button"
                  variant="primary"
                  className="w-full bg-white text-black hover:bg-gray-200"
                  isLoading={updateMutation.isPending}
                  onClick={handleSubmit((data) => onSubmit(data, false))}
                  leftIcon={<Save className="w-5 h-5" />}
                >
                  Save Changes
                </Button>
                
                {eventData?.approvalStatus === 'CHANGES_REQUESTED' && (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full bg-transparent border border-white/20 hover:bg-white/10 text-white"
                    isLoading={updateMutation.isPending}
                    onClick={handleSubmit((data) => onSubmit(data, true))}
                    leftIcon={<ShieldCheck className="w-5 h-5 text-green-400" />}
                  >
                    Resubmit for Advisor Review
                  </Button>
                )}
              </>
            )}
          </div>
        </form>
    </div>
  );
};
