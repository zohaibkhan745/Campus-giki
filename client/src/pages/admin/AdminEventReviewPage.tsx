import { CustomDropdown } from '@/components/ui/CustomDropdown';
import React, { useEffect, useState } from 'react';
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
  Printer,
} from 'lucide-react';
import { eventService } from '@/services/event.service';
import { adminService } from '@/services/admin.service';
import { VenuePermissionSlipModal } from '@/components/events/VenuePermissionSlipModal';
import { RequestChangesModal } from '@/components/events/RequestChangesModal';
import { ApproveEventModal } from '@/components/events/ApproveEventModal';
import { EventPrintModal } from '@/components/events/EventPrintModal';
import { resolveImageUrl } from '@/lib/utils';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { BackButton } from '@/components/ui';
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
import { invalidateEventQueries, optimisticApproveEvent } from '@/lib/queryInvalidations';

export const AdminEventReviewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [serverError, setServerError] = useState<string | null>(null);
  const [venueNotes, setVenueNotes] = useState('');
  const [isVenueSlipPreviewOpen, setIsVenueSlipPreviewOpen] = useState(false);
  const [isRequestChangesOpen, setIsRequestChangesOpen] = useState(false);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  const {
    data: eventData,
    isLoading: isLoadingEvent,
    isError,
  } = useQuery({
    queryKey: ['event', id],
    queryFn: () => eventService.getEventById(id!),
    enabled: !!id,
    staleTime: 0,
    refetchOnMount: 'always',
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
      void invalidateEventQueries(queryClient, id);
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'Failed to update venue clearance status.';
      globalNotification.triggerFailed(Array.isArray(msg) ? msg.join(', ') : msg);
    },
  });

  useEffect(() => {
    if (eventData) {
      setVenueNotes(eventData.venueClearanceNotes || '');
    }
  }, [eventData]);

  const updateEventStatusMutation = useMutation({
    meta: { notify: true },
    mutationFn: (data: {
      status: 'APPROVED' | 'CHANGES_REQUESTED' | 'PENDING_ADVISOR';
      comments?: string;
      rules?: string;
      requiresVenueClearance?: boolean;
    }) =>
      adminService.updateEventStatus(id!, {
        status: data.status,
        comments: data.comments,
        rules: data.rules,
        requiresVenueClearance: data.requiresVenueClearance,
      }),
    onSuccess: (_, variables) => {
      if (id) {
        if (variables.status === 'APPROVED') {
          optimisticApproveEvent(queryClient, id);
        }
        void invalidateEventQueries(queryClient, id);
      }
      setIsRequestChangesOpen(false);
      setIsApproveModalOpen(false);
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

  const handleConfirmRequestChanges = (comments?: string) => {
    updateEventStatusMutation.mutate({
      status: 'CHANGES_REQUESTED',
      comments,
    });
  };

  const handleConfirmApproval = (payload: { rules?: string; requiresVenueClearance: boolean }) => {
    updateEventStatusMutation.mutate({
      status: 'APPROVED',
      rules: payload.rules,
      requiresVenueClearance: payload.requiresVenueClearance,
    });
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
      <div className="max-w-md mx-auto py-12 space-y-4 text-center">
        <BackButton to="/dashboard" />
      </div>
    );
  }

  const isPending = eventData.approvalStatus === 'PENDING_ADMIN';

  return (
    <div className="max-w-4xl mx-auto space-y-6 text-left py-4 px-4 pb-32">
      {/* Top Heading */}
      <div className="flex items-center mb-4">
        <BackButton variant="inline" />
      </div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-text-primary leading-tight">
            Event Details: {eventData.title}
          </h1>
          <div className="flex items-center gap-3 mt-3">
            <span className={`px-3 py-1 border backdrop-blur-md rounded-inputs text-xs uppercase tracking-wider font-bold ${getBadgeStyles(eventData.approvalStatus || '')}`}>
              {formatStatus(eventData.approvalStatus || '')}
            </span>
            <span className="text-sm text-text-secondary font-medium">Society: {eventData.society?.name}</span>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsPrintModalOpen(true)}
            className="bg-surface hover:bg-surface-hover text-text-primary border border-border-medium"
            leftIcon={<Printer className="w-4 h-4 text-blue-500" />}
          >
            Print Summary
          </Button>
        </div>
      </div>

      {/* Event Banner / Cover Image */}
      {eventData.coverImageUrl && (
        <div className="w-full min-h-[280px] max-h-[560px] sm:max-h-[640px] rounded-2xl overflow-hidden bg-black/90 border border-border-medium shadow-elevation-1 relative flex items-center justify-center group">
          {/* Ambient blurred backdrop so letterboxing is seamlessly matched */}
          <img
            src={resolveImageUrl(eventData.coverImageUrl)}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 w-full h-full object-cover filter blur-xl opacity-35 scale-110 pointer-events-none"
          />
          {/* Main uncropped image */}
          <img
            src={resolveImageUrl(eventData.coverImageUrl)}
            alt={eventData.title}
            className="relative z-10 max-h-[560px] sm:max-h-[640px] w-auto max-w-full object-contain shadow-2xl transition-transform duration-300"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=1200&auto=format&fit=crop&q=80';
            }}
          />
          <div className="absolute bottom-4 left-4 pointer-events-none z-20">
            <span className="text-xs font-bold uppercase tracking-wider text-white/90 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/20">
              Event Banner
            </span>
          </div>
        </div>
      )}

      {/* Promotional Video */}
      {eventData.videoUrl && (
        <div className="w-full rounded-2xl overflow-hidden bg-black border border-border-medium shadow-elevation-1">
          <video
            controls
            src={resolveImageUrl(eventData.videoUrl)}
            className="w-full max-h-[480px] object-contain"
          />
        </div>
      )}

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
        
        {/* DSA Decision Actions */}
        <div className="space-y-4">
          <h2 className="text-lg font-extrabold flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-brand-primary" />
            DSA Decision
          </h2>
          
          {eventData.dsaComments && (
            <div className="p-3.5 rounded-xl bg-surface border border-border-subtle text-xs text-text-secondary">
              <span className="font-bold text-text-primary block mb-0.5">Current DSA Comments:</span>
              <p className="whitespace-pre-line">{eventData.dsaComments}</p>
            </div>
          )}

          {isPending ? (
            <div className="flex flex-col sm:flex-row gap-3 pt-1">
              <Button
                type="button"
                variant="primary"
                onClick={() => setIsApproveModalOpen(true)}
                isLoading={updateEventStatusMutation.isPending}
                leftIcon={<CheckCircle2 className="w-4 h-4 text-white" />}
                className="bg-emerald-600 text-white hover:bg-emerald-700 w-full sm:flex-1"
              >
                Approve (Publish)
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsRequestChangesOpen(true)}
                isLoading={updateEventStatusMutation.isPending}
                leftIcon={<AlertCircle className="w-4 h-4 text-amber-500" />}
                className="bg-surface hover:bg-surface-hover text-text-primary border border-border-medium w-full sm:flex-1"
              >
                Request Changes
              </Button>
            </div>
          ) : (
            <p className="text-xs text-text-secondary font-medium pt-1">
              This event is currently in {eventData.approvalStatus} status and cannot be approved/rejected at this time.
            </p>
          )}
        </div>

        {/* Physical Venue Clearance Review Section */}
        {(eventData.approvalStatus === 'APPROVED' || eventData.approvalStatus === 'PUBLISHED') && (
          <>
            <div className="w-full h-px bg-border-subtle my-6"></div>
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-lg font-extrabold flex items-center gap-2">
                  <FileText className="w-5 h-5 text-amber-500" />
                  Physical Venue Clearance &amp; Authority Endorsement
                </h2>
                <span className={cn(
                  "px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-inputs border",
                  eventData.venueClearanceStatus === 'VERIFIED'
                    ? "bg-green-600/20 text-green-600 dark:text-green-400 border-green-500/40"
                    : eventData.venueClearanceStatus === 'SUBMITTED'
                    ? "bg-blue-600/20 text-blue-600 dark:text-blue-400 border-blue-500/40"
                    : eventData.venueClearanceStatus === 'REJECTED'
                    ? "bg-red-600/20 text-red-600 dark:text-red-400 border-red-500/40"
                    : "bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/40"
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

              <div className="p-4 bg-surface-glass border border-border-subtle rounded-2xl space-y-2 text-xs text-text-secondary">
                <p>
                  Requested Venue: <strong className="text-text-primary text-sm">{eventData.venue}</strong>
                </p>
                <p className="text-text-muted">
                  Society must obtain an official signature and stamp from the respective authority certifying that this facility is vacant and allocated.
                </p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setIsVenueSlipPreviewOpen(true)}
                    className="inline-flex items-center gap-1.5 text-xs text-brand-primary hover:underline font-bold transition-colors cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Preview Official Generated Slip (PDF)</span>
                  </button>
                </div>
              </div>

              {/* Stamped Document Preview & Action */}
              {eventData.signedVenueSlipUrl ? (
                <div className="space-y-4 pt-2">
                  <div className="p-4 bg-surface-glass border border-border-subtle rounded-2xl space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs uppercase tracking-wider text-text-secondary font-bold">
                        Uploaded Authority Endorsement Slip
                      </span>
                      {eventData.venueSlipUploadedAt && (
                        <span className="text-[11px] text-text-muted">
                          Uploaded on {new Date(eventData.venueSlipUploadedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </div>

                    {/* Preview box */}
                    <div className="rounded-xl overflow-hidden border border-border-subtle bg-canvas-subtle flex flex-col items-center justify-center p-3">
                      {eventData.signedVenueSlipUrl.toLowerCase().endsWith('.pdf') ? (
                        <div className="py-8 flex flex-col items-center gap-3">
                          <FileText className="w-12 h-12 text-red-400" />
                          <p className="text-xs text-text-secondary font-medium">Scanned PDF Document Uploaded</p>
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
                    <label className="block text-xs uppercase tracking-wider text-text-secondary font-semibold mb-1">
                      DSA Venue Notes / Re-upload Instructions
                    </label>
                    <textarea
                      rows={2}
                      value={venueNotes}
                      onChange={(e) => setVenueNotes(e.target.value)}
                      placeholder="e.g. Signature and stamp verified, hall reserved. OR: Stamp unclear, please re-upload."
                      disabled={verifyVenueMutation.isPending}
                      className="w-full text-sm transition-all outline-none bg-surface text-text-primary placeholder:text-text-muted rounded-inputs px-3.5 py-2.5 border border-border-medium focus:border-border-strong focus:ring-2 focus:ring-brand-primary/20 resize-y"
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
                      leftIcon={<AlertCircle className="w-4 h-4 text-red-500" />}
                      className="bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-300 border-red-500/30 w-full sm:flex-1"
                    >
                      Request Re-upload
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-xs text-amber-600 dark:text-amber-300 flex items-center gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>The society has not yet uploaded the signed venue slip for this event.</span>
                </div>
              )}
            </div>
          </>
        )}

        {/* Separator Line */}
        <div className="w-full h-px bg-border-subtle my-6"></div>

        {/* Event Overview Section */}
        <div className="space-y-6">
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
              readOnly
              value={eventData.title || ''}
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
                  readOnly
                  value={eventData.description || ''}
                  className="w-full text-sm transition-all outline-none bg-surface-hover/50 text-text-primary placeholder:text-text-muted rounded-inputs px-3.5 py-2.5 pl-10 border border-border-subtle disabled:opacity-75 resize-y"
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
                readOnly
                value={
                  eventData.eventDate
                    ? new Date(eventData.eventDate).toISOString().split('T')[0]
                    : ''
                }
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                type="time"
                label="Start Time *"
                leftIcon={<Clock className="w-4 h-4" />}
                disabled={true}
                readOnly
                value={eventData.startTime || ''}
              />
              <Input
                type="time"
                label="End Time *"
                leftIcon={<Clock className="w-4 h-4" />}
                disabled={true}
                readOnly
                value={eventData.endTime || ''}
              />
            </div>

            <Input
              label="Venue / Location *"
              placeholder="e.g. AHA Auditorium"
              leftIcon={<MapPin className="w-4 h-4" />}
              disabled={true}
              readOnly
              value={eventData.venue || ''}
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
                readOnly
                value={eventData.inChargeName || ''}
              />
              <Input
                label="Registration Number *"
                placeholder="e.g. 2023123"
                disabled={true}
                readOnly
                value={eventData.inChargeRegNum || ''}
              />
              <Input
                label="Contact Number *"
                placeholder="e.g. 03001234567"
                disabled={true}
                readOnly
                value={eventData.inChargeContact || ''}
              />
            </div>
          </div>
        </div>
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

      {isRequestChangesOpen && (
        <RequestChangesModal
          isOpen={isRequestChangesOpen}
          onClose={() => setIsRequestChangesOpen(false)}
          onSubmit={handleConfirmRequestChanges}
          isLoading={updateEventStatusMutation.isPending}
          reviewerRole="DSA_ADMIN"
          eventTitle={eventData.title}
          initialComments={eventData.dsaComments || ''}
        />
      )}

      {isApproveModalOpen && (
        <ApproveEventModal
          isOpen={isApproveModalOpen}
          onClose={() => setIsApproveModalOpen(false)}
          onSubmit={handleConfirmApproval}
          isLoading={updateEventStatusMutation.isPending}
          eventTitle={eventData.title}
          venueName={eventData.venue}
          initialRules={eventData.rules || ''}
        />
      )}

      {/* Official Event Sanction & Summary Print Modal */}
      <EventPrintModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        event={eventData}
      />
    </div>
  );
};
