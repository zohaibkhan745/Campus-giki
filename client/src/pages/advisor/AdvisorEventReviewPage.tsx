import { CustomDropdown } from '@/components/ui/CustomDropdown';
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
import { advisorService } from '@/services/advisor.service';
import {
  eventFormSchema,
  type EventFormData,
} from '@/lib/validations/event.schema';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import type { AxiosError } from 'axios';

const getBadgeStyles = (status: string) => {
  switch (status) {
    case 'PUBLISHED':
    case 'APPROVED': return 'bg-green-600 text-white border-green-700';
    case 'PENDING_ADVISOR': return 'bg-orange-500 text-white border-orange-600';
    case 'PENDING_ADMIN': return 'bg-white text-black border-gray-200';
    case 'CHANGES_REQUESTED': return 'bg-red-500 text-white border-red-600';
    default: return 'bg-white/10 text-white border-white/20';
  }
}
const formatStatus = (s: string) => s.replace('_', ' ');

export const AdvisorEventReviewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [serverError, setServerError] = useState<string | null>(null);
  const [advisorComment, setAdvisorComment] = useState('');

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
      queryClient.invalidateQueries({ queryKey: ['event', id] });
      queryClient.invalidateQueries({ queryKey: ['advisorEventsQueue'] });
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
      queryClient.invalidateQueries({ queryKey: ['event', id] });
      queryClient.invalidateQueries({ queryKey: ['advisorEventsQueue'] });
      queryClient.invalidateQueries({ queryKey: ['advisorEvents'] });
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

  const onSaveDetails = (data: EventFormData) => {
    setServerError(null);
    updateMutation.mutate(data);
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
        <Link
          to="/advisor/yearly-plans"
          className="fixed top-4 left-4 sm:top-6 sm:left-6 z-[100] inline-flex items-center justify-center w-10 h-10 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white rounded-full transition-all cursor-pointer shadow-lg"
          title="Go Back"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
      </div>
    );
  }

  const isPending = eventData.approvalStatus === 'PENDING_ADVISOR';

  return (
    <div className="max-w-4xl mx-auto space-y-6 text-left py-4 px-4 pb-32">
      {/* Top Heading */}
      <button
        onClick={() => navigate(-1)}
        className="fixed top-4 left-4 sm:top-6 sm:left-6 z-[100] inline-flex items-center justify-center w-10 h-10 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white rounded-full transition-all cursor-pointer shadow-lg"
        title="Go Back"
      >
        <ArrowLeft className="w-5 h-5" />
      </button>
      <div className="mb-6 mt-12 sm:mt-8">
        <h1 className="text-4xl font-extrabold text-white leading-tight">
          Event Details: {eventData.title}
        </h1>
        <div className="flex items-center gap-3 mt-3">
          <span className={`px-3 py-1 border backdrop-blur-md rounded-inputs text-xs uppercase tracking-wider font-bold ${getBadgeStyles(eventData.approvalStatus || '')}`}>
            {formatStatus(eventData.approvalStatus || '')}
          </span>
          <span className="text-sm text-gray-400 font-medium">Society: {eventData.society?.name}</span>
        </div>
      </div>

      {eventData.rules && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/30 backdrop-blur-md rounded-cards space-y-1">
          <div className="flex items-center gap-2 text-amber-400 font-extrabold text-xs uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>Official DSA Directives &amp; Event Rules</span>
          </div>
          <p className="text-xs text-amber-200/80 font-medium whitespace-pre-line leading-relaxed pl-6">
            {eventData.rules}
          </p>
        </div>
      )}

      {/* Main Glassmorphic Card */}
      <div className="relative z-1 w-full p-8 rounded-[18px] bg-white/[0.08] backdrop-blur-[20px] border border-white/20 shadow-[0_12px_40px_rgba(0,0,0,0.4)] text-white space-y-8">
        
        {/* Advisor Review & Comments Section */}
        <div className="space-y-4">
          <h2 className="text-lg font-extrabold flex items-center gap-2">
            <ShieldCheck className="w-5 h-5" />
            Advisor Review & Feedback
          </h2>
          
          <div className="space-y-1.5 text-left">
            <label className="block text-xs uppercase tracking-wider text-gray-400 font-semibold mb-1">
              Feedback / Comments
            </label>
            <textarea
              rows={3}
              value={advisorComment}
              onChange={(e) => setAdvisorComment(e.target.value)}
              placeholder="Provide feedback or reasons for requesting changes..."
              disabled={!isPending || updateEventStatusMutation.isPending}
              className="w-full text-sm transition-all outline-none bg-transparent text-white placeholder:text-gray-500 rounded-inputs px-3.5 py-2.5 border border-white/20 focus:border-white/40 focus:ring-2 focus:ring-white/10 resize-y disabled:opacity-50"
            />
          </div>

          {isPending ? (
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button
                type="button"
                variant="primary"
                onClick={() => updateEventStatusMutation.mutate({ status: 'PENDING_ADMIN' })}
                isLoading={updateEventStatusMutation.isPending}
                leftIcon={<CheckCircle2 className="w-4 h-4 text-white" />}
                className="bg-green-600 text-white hover:bg-green-700 w-full sm:flex-1"
              >
                Approve (Send to DSA)
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => updateEventStatusMutation.mutate({ status: 'CHANGES_REQUESTED' })}
                isLoading={updateEventStatusMutation.isPending}
                leftIcon={<AlertCircle className="w-4 h-4 text-black" />}
                className="bg-white text-black hover:bg-gray-200 w-full sm:flex-1"
              >
                Request Changes
              </Button>
            </div>
          ) : (
            <p className="text-xs text-gray-400 font-medium pt-2">
              This event is currently in {eventData.approvalStatus} status and cannot be approved/rejected at this time.
            </p>
          )}
        </div>

        {/* Separator Line */}
        <div className="w-full h-px bg-white/10 my-6"></div>

        {/* Event Overview Section */}
        <form onSubmit={handleSubmit(onSaveDetails)} className="space-y-6" noValidate>
          <div className="space-y-4">
            <h2 className="text-lg font-extrabold flex items-center gap-2">
              <Calendar className="w-5 h-5" />
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
              <label className="block text-xs uppercase tracking-wider text-gray-400 font-semibold mb-1">
                Event Description *
              </label>
              <div className="relative flex items-start">
                <div className="absolute left-3 top-3 text-gray-400 pointer-events-none flex items-center justify-center">
                  <FileText className="w-4 h-4" />
                </div>
                <textarea
                  rows={4}
                  placeholder="Describe your event agenda, prerequisites, target audience, and guidelines..."
                  disabled={true}
                  className="w-full text-sm transition-all outline-none bg-transparent text-white placeholder:text-gray-500 rounded-inputs px-3.5 py-2.5 pl-10 border border-white/20 disabled:opacity-50 resize-y"
                  {...register('description')}
                />
              </div>
            </div>
          </div>

          {/* Separator Line */}
          <div className="w-full h-px bg-white/10 my-6"></div>

          {/* Event Type & Logistics */}
          <div className="space-y-4">
            <h2 className="text-lg font-extrabold flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Logistics & Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5 text-left">
                <label className="block text-xs uppercase tracking-wider text-gray-400 font-semibold mb-1">
                  Event Type
                </label>
                <CustomDropdown placeholder="Select Type" disabled={true} options={[{value:"Workshop",label:"Workshop"},{value:"Seminar",label:"Seminar"},{value:"Hackathon",label:"Hackathon"},{value:"Competition",label:"Competition"},{value:"Social",label:"Social"},{value:"Other",label:"Other"}]} {...register('eventType')} />
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
          <div className="w-full h-px bg-white/10 my-6"></div>

          {/* In-Charge Details */}
          <div className="space-y-4">
            <h2 className="text-lg font-extrabold flex items-center gap-2">
              <ShieldCheck className="w-5 h-5" />
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
