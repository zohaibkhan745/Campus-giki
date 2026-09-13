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
import { adminService } from '@/services/admin.service';
import { VenuePermissionSlipModal } from '@/components/events/VenuePermissionSlipModal';
import { resolveImageUrl } from '@/lib/utils';
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

import { cn } from '@/lib/utils';
import { globalNotification } from '@/contexts/NotificationContext';
export const AdminEventReviewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [serverError, setServerError] = useState<string | null>(null);
  const [dsaComment, setDsaComment] = useState('');
  const [commentError, setCommentError] = useState(false);
  const [venueNotes, setVenueNotes] = useState('');
  const [isVenueSlipPreviewOpen, setIsVenueSlipPreviewOpen] = useState(false);

  const {
    data: eventData,
    isLoading: isLoadingEvent,
    isError,
  } = useQuery({
    queryKey: ['event', id],
    queryFn: () => eventService.getEventById(id!),
    enabled: !!id,
  });

  const verifyVenueMutation = useMutation({
    mutationFn: (payload: { status: 'VERIFIED' | 'REJECTED'; notes?: string }) =>
      adminService.verifyVenueClearance(id!, payload),
    onSuccess: (data, variables) => {
      globalNotification.triggerSuccess(
        variables.status === 'VERIFIED'
          ? 'Physical venue clearance verified successfully!'
          : 'Venue slip re-upload requested from society.'
      );
      queryClient.invalidateQueries({ queryKey: ['event', id] });
      queryClient.invalidateQueries({ queryKey: ['adminDashboard'] });
      queryClient.invalidateQueries({ queryKey: ['adminEventsList'] });
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'Failed to update venue clearance status.';
      globalNotification.triggerFailed(Array.isArray(msg) ? msg.join(', ') : msg);
    },
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

      setDsaComment(eventData.dsaComments || '');
      setVenueNotes(eventData.venueClearanceNotes || '');

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
      queryClient.invalidateQueries({ queryKey: ['adminDashboard'] });
      queryClient.invalidateQueries({ queryKey: ['societyDashboard'] });
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
    mutationFn: (data: { status: 'APPROVED' | 'CHANGES_REQUESTED' | 'PENDING_ADVISOR' }) =>
      adminService.updateEventStatus(id!, { status: data.status, comments: dsaComment.trim() || undefined }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event', id] });
      queryClient.invalidateQueries({ queryKey: ['adminDashboard'] });
      queryClient.invalidateQueries({ queryKey: ['adminEventsList'] });
      queryClient.invalidateQueries({ queryKey: ['societyDashboard'] });
      navigate('/dashboard', { replace: true });
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
    if (!dsaComment.trim()) {
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
          to="/dashboard"
          className="fixed top-4 left-4 sm:top-6 sm:left-6 z-[100] inline-flex items-center justify-center w-10 h-10 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white rounded-full transition-all cursor-pointer shadow-lg"
          title="Go Back"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
      </div>
    );
  }

  const isPending = eventData.approvalStatus === 'PENDING_ADMIN';

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
            DSA Admin Review & Feedback
          </h2>
          
          <div className="space-y-1.5 text-left">
            <label className="block text-xs uppercase tracking-wider text-gray-400 font-semibold mb-1">
              Feedback / Comments
            </label>
            <textarea
              rows={3}
              value={dsaComment}
              onChange={(e) => {
                setDsaComment(e.target.value);
                if (e.target.value.trim()) setCommentError(false);
              }}
              placeholder="Provide feedback or reasons for requesting changes..."
              disabled={!isPending || updateEventStatusMutation.isPending}
              className={cn(
                "w-full text-sm transition-all outline-none bg-transparent text-white placeholder:text-gray-500 rounded-inputs px-3.5 py-2.5 border resize-y disabled:opacity-50",
                commentError 
                  ? "border-red-500/50 ring-2 ring-red-500/20 focus:border-red-500" 
                  : "border-white/20 focus:border-white/40 focus:ring-2 focus:ring-white/10"
              )}
            />
            {commentError && (
              <p className="text-red-400 text-xs mt-1 font-medium">Comment is required to request changes.</p>
            )}
          </div>

          {isPending ? (
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button
                type="button"
                variant="primary"
                onClick={() => updateEventStatusMutation.mutate({ status: 'APPROVED' })}
                isLoading={updateEventStatusMutation.isPending}
                leftIcon={<CheckCircle2 className="w-4 h-4 text-white" />}
                className="bg-green-600 text-white hover:bg-green-700 w-full sm:flex-1"
              >
                Approve (Publish)
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleRequestChanges}
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

        {/* Physical Venue Clearance Review Section */}
        {(eventData.approvalStatus === 'APPROVED' || eventData.approvalStatus === 'PUBLISHED') && (
          <>
            <div className="w-full h-px bg-white/10 my-6"></div>
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-lg font-extrabold flex items-center gap-2">
                  <FileText className="w-5 h-5 text-amber-400" />
                  Physical Venue Clearance &amp; PS to Dean Endorsement
                </h2>
                <span className={cn(
                  "px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-inputs border",
                  eventData.venueClearanceStatus === 'VERIFIED'
                    ? "bg-green-600/20 text-green-400 border-green-500/40"
                    : eventData.venueClearanceStatus === 'SUBMITTED'
                    ? "bg-blue-600/20 text-blue-400 border-blue-500/40"
                    : eventData.venueClearanceStatus === 'REJECTED'
                    ? "bg-red-600/20 text-red-400 border-red-500/40"
                    : "bg-amber-500/20 text-amber-300 border-amber-500/40"
                )}>
                  {eventData.venueClearanceStatus === 'VERIFIED'
                    ? 'Verified & Cleared'
                    : eventData.venueClearanceStatus === 'SUBMITTED'
                    ? 'Signed Slip Uploaded (Review Needed)'
                    : eventData.venueClearanceStatus === 'REJECTED'
                    ? 'Slip Re-upload Requested'
                    : 'Awaiting Society Upload'}
                </span>
              </div>

              <div className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-2 text-xs text-gray-300">
                <p>
                  Requested Venue: <strong className="text-white text-sm">{eventData.venue}</strong>
                </p>
                <p className="text-gray-400">
                  Society must obtain an official signature and stamp from the PS to Dean / Dean&apos;s Office certifying that this facility is vacant and allocated.
                </p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setIsVenueSlipPreviewOpen(true)}
                    className="inline-flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 font-bold transition-colors cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Preview Official Generated Slip (PDF)</span>
                  </button>
                </div>
              </div>

              {/* Stamped Document Preview & Action */}
              {eventData.signedVenueSlipUrl ? (
                <div className="space-y-4 pt-2">
                  <div className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs uppercase tracking-wider text-gray-400 font-bold">
                        Uploaded PS to Dean Endorsement Slip
                      </span>
                      {eventData.venueSlipUploadedAt && (
                        <span className="text-[11px] text-gray-400">
                          Uploaded on {new Date(eventData.venueSlipUploadedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </div>

                    {/* Preview box */}
                    <div className="rounded-xl overflow-hidden border border-white/10 bg-black flex flex-col items-center justify-center p-3">
                      {eventData.signedVenueSlipUrl.toLowerCase().endsWith('.pdf') ? (
                        <div className="py-8 flex flex-col items-center gap-3">
                          <FileText className="w-12 h-12 text-red-400" />
                          <p className="text-xs text-gray-300 font-medium">Scanned PDF Document Uploaded</p>
                          <a
                            href={resolveImageUrl(eventData.signedVenueSlipUrl)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors"
                          >
                            <span>Open Stamped Document</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      ) : (
                        <div className="space-y-2 w-full text-center">
                          <a
                            href={resolveImageUrl(eventData.signedVenueSlipUrl)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block group relative"
                            title="Click to view full size in new tab"
                          >
                            <img
                              src={resolveImageUrl(eventData.signedVenueSlipUrl)}
                              alt="Signed Venue Slip"
                              className="max-h-96 mx-auto rounded-lg object-contain shadow-lg group-hover:opacity-90 transition-opacity"
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg text-white text-xs font-bold gap-1.5">
                              <span>Click to Expand / Open Full Resolution</span>
                              <ExternalLink className="w-3.5 h-3.5" />
                            </div>
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Feedback notes input */}
                  <div className="space-y-1.5 text-left">
                    <label className="block text-xs uppercase tracking-wider text-gray-400 font-semibold mb-1">
                      DSA Venue Notes / Re-upload Instructions
                    </label>
                    <textarea
                      rows={2}
                      value={venueNotes}
                      onChange={(e) => setVenueNotes(e.target.value)}
                      placeholder="e.g. Signature and stamp verified, hall reserved. OR: Stamp unclear, please re-upload."
                      disabled={verifyVenueMutation.isPending}
                      className="w-full text-sm transition-all outline-none bg-transparent text-white placeholder:text-gray-500 rounded-inputs px-3.5 py-2.5 border border-white/20 focus:border-white/40 focus:ring-2 focus:ring-white/10 resize-y"
                    />
                  </div>

                  {/* Verification action buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-1">
                    <Button
                      type="button"
                      variant="primary"
                      onClick={() => verifyVenueMutation.mutate({ status: 'VERIFIED', notes: venueNotes.trim() || undefined })}
                      isLoading={verifyVenueMutation.isPending}
                      leftIcon={<CheckCircle2 className="w-4 h-4 text-white" />}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white w-full sm:flex-1"
                    >
                      {eventData.venueClearanceStatus === 'VERIFIED' ? 'Update Verified Notes' : 'Verify & Confirm Venue'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => verifyVenueMutation.mutate({ status: 'REJECTED', notes: venueNotes.trim() || 'Please re-upload a clear photo with the official stamp.' })}
                      isLoading={verifyVenueMutation.isPending}
                      leftIcon={<AlertCircle className="w-4 h-4 text-red-400" />}
                      className="bg-red-500/10 hover:bg-red-500/20 text-red-300 border-red-500/30 w-full sm:flex-1"
                    >
                      Request Re-upload
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-xs text-amber-300 flex items-center gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>The society has not yet uploaded the signed venue slip for this event.</span>
                </div>
              )}
            </div>
          </>
        )}

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
                <CustomDropdown placeholder="Select Type" disabled={true} options={[{value:"Workshop",label:"Workshop"},{value:"Seminar",label:"Seminar"},{value:"Hackathon",label:"Hackathon"},{value:"Competition",label:"Competition"},{value:"Social",label:"Social"},{value:"Other",label:"Other"}]} value={eventData.eventType || undefined} />
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

      {isVenueSlipPreviewOpen && (
        <VenuePermissionSlipModal
          isOpen={isVenueSlipPreviewOpen}
          onClose={() => setIsVenueSlipPreviewOpen(false)}
          event={eventData}
          societyName={eventData.society?.name}
          societyLogo={eventData.society?.logoUrl}
        />
      )}
    </div>
  );
};
