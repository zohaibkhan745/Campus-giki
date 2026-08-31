
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
import { CustomDropdown } from '@/components/ui/CustomDropdown';
import { CustomDatePicker } from '@/components/ui/CustomDatePicker';
import { CustomTimePicker } from '@/components/ui/CustomTimePicker';
import { Controller } from 'react-hook-form';
import { cn } from '@/lib/utils';
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

    const [isMultiDay, setIsMultiDay] = useState(false);
  const [isCustomVenue, setIsCustomVenue] = useState(false);
  const [isCustomIncharge, setIsCustomIncharge] = useState(false);
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    control,
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
        
      const standardVenues = ["Auditorium", "Faculty Club (Inside)", "Faculty Club (Outside)", "Faculty Club (Inside + Outside)", "Guest House (Inside)", "Guest House (Outside)", "Guest House (Inside + Outside)", "Sports Complex", "Basket Ball Court", "Main Ground"];
      if (eventData.venue && !standardVenues.includes(eventData.venue)) {
        setIsCustomVenue(true);
      }
      
      const standardIncharge = ["President", "Vice President", "General Secretary", "Joint Secretary"];
      if (eventData.inChargeName && !standardIncharge.includes(eventData.inChargeName) && eventData.inChargeName !== "") {
        setIsCustomIncharge(true);
      }

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

  const onError = () => {
    setTimeout(() => {
      const firstError = document.querySelector('.error-text');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Link to="/dashboard" className="p-2 hover:bg-white/10 rounded-full transition-colors text-white">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">
              Edit Event: {eventData.title}
            </h1>
            <p className="text-sm text-gray-400">
              Update your event schedule, venue location, or media resources.
            </p>
          </div>
        </div>

        {eventData.approvalStatus === 'CHANGES_REQUESTED' && (eventData.advisorComments || eventData.dsaComments) && (() => {
          const isByAdmin = eventData.lastChangeRequestBy === 'DSA_ADMIN';
          return (
            <div className={ackdrop-blur-md p-5 rounded-[18px] shadow-lg mb-6 border }>
              <h3 className={ont-bold mb-3 flex items-center gap-2 }>
                <ShieldCheck className="w-5 h-5" />
                Changes Requested by {isByAdmin ? 'Admin' : 'Advisor'}
              </h3>
              <div className={space-y-4 text-sm leading-relaxed }>
                {eventData.advisorComments && (
                  <div>
                    <span className={ont-semibold block mb-1 }>Advisor Notes:</span>
                    <p>{eventData.advisorComments}</p>
                  </div>
                )}
                {eventData.dsaComments && (
                  <div>
                    <span className={ont-semibold block mb-1 }>DSA / Admin Notes:</span>
                    <p>{eventData.dsaComments}</p>
                  </div>
                )}
              </div>
              <p className={mt-4 text-xs font-medium }>Please address the feedback above and resubmit the event for review.</p>
            </div>
          );
        })()}

        <form onSubmit={(e) => e.preventDefault()} className="bg-white/[0.08] backdrop-blur-[20px] p-6 md:p-8 rounded-cards border border-white/20 space-y-8" noValidate>
<div className="form-section">
          <div className="section-header">
            <h2 className="section-title">Event Overview</h2>
            <div className="section-divider"></div>
          </div>
          
          <div className="field-group">
            <label className="field-label">Event Title *</label>
            <div className={cn("input-box", errors.title && "error")}>
              <svg className="input-icon" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
              <input type="text" placeholder="e.g. GIKI SoftDesk Hackathon 2026" disabled={updateMutation.isPending || isEditLocked} {...register('title')} />
            </div>
            {errors.title?.message && <span className="error-text !block">{errors.title.message}</span>}
          </div>

          <div className="field-group">
            <label className="field-label">Event Description *</label>
            <div className={cn("input-box", errors.description && "error")} style={{alignItems:"flex-start"}}>
              <svg className="input-icon" style={{marginTop:"2px"}} viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
              <textarea placeholder="Describe your event agenda, prerequisites, target audience, and guidelines..." disabled={updateMutation.isPending || isEditLocked} {...register('description')}></textarea>
            </div>
            {errors.description?.message && <span className="error-text !block">{errors.description.message}</span>}
          </div>
        </div>

        <div className="form-section">
          <div className="section-header">
            <div className="inline-header">
              <h2 className="section-title">Date, Time & Venue</h2>
              <div className="event-duration-toggle">
                  <label className="toggle-option">
                      <input type="radio" name="eventDuration" value="one" checked={!isMultiDay} onChange={() => setIsMultiDay(false)} hidden />
                      <span className="toggle-btn">One Day Event</span>
                  </label>
                  <label className="toggle-option">
                      <input type="radio" name="eventDuration" value="multi" checked={isMultiDay} onChange={() => setIsMultiDay(true)} hidden />
                      <span className="toggle-btn">Multi Day Event</span>
                  </label>
              </div>
            </div>
            <div className="section-divider"></div>
          </div>

          <div id="dateGrid" className={cn(isMultiDay && "multi-day")}>
            <div className="field-group">
              <label className="field-label">{isMultiDay ? 'Event Start Date *' : 'Date *'}</label>
              <Controller
                name="eventDate"
                control={control}
                render={({ field }) => (
                  <CustomDatePicker value={field.value} onChange={field.onChange} placeholder={isMultiDay ? 'From Date' : 'Select Date'} disabled={updateMutation.isPending || isEditLocked} />
                )}
              />
              {errors.eventDate?.message && <span className="error-text !block">{errors.eventDate.message}</span>}
            </div>

            {isMultiDay && (
              <div className="field-group">
                <label className="field-label">Event End Date *</label>
                <CustomDatePicker placeholder="To Date" disabled={updateMutation.isPending || isEditLocked} />
              </div>
            )}
          </div>

          <div className="field-grid-2">
            <div className="field-group">
              <label className="field-label">Start Time *</label>
              <Controller
                name="startTime"
                control={control}
                render={({ field }) => (
                  <CustomTimePicker value={field.value} onChange={field.onChange} placeholder="From Time" disabled={updateMutation.isPending || isEditLocked} />
                )}
              />
              {errors.startTime?.message && <span className="error-text !block">{errors.startTime.message}</span>}
            </div>
            <div className="field-group">
              <label className="field-label">End Time *</label>
              <Controller
                name="endTime"
                control={control}
                render={({ field }) => (
                  <CustomTimePicker value={field.value} onChange={field.onChange} placeholder="To Time" disabled={updateMutation.isPending || isEditLocked} />
                )}
              />
              {errors.endTime?.message && <span className="error-text !block">{errors.endTime.message}</span>}
            </div>
          </div>

          <div className="field-group">
            <label className="field-label">Venue Location *</label>
            <CustomDropdown 
              value={isCustomVenue ? 'Custom (Add)' : watch('venue')} 
              onChange={(e: any) => {
                  const val = typeof e === "string" ? e : e?.target?.value || "";
                  if (val === "Custom (Add)") {
                  setIsCustomVenue(true);
                  setValue('venue', '', { shouldValidate: true });
                } else {
                  setIsCustomVenue(false);
                  setValue('venue', val, { shouldValidate: true });
                }
              }} 
              options={[
                {label: "Auditorium", value: "Auditorium"},
                {label: "Faculty Club (Inside)", value: "Faculty Club (Inside)"},
                {label: "Faculty Club (Outside)", value: "Faculty Club (Outside)"},
                {label: "Faculty Club (Inside + Outside)", value: "Faculty Club (Inside + Outside)"},
                {label: "Guest House (Inside)", value: "Guest House (Inside)"},
                {label: "Guest House (Outside)", value: "Guest House (Outside)"},
                {label: "Guest House (Inside + Outside)", value: "Guest House (Inside + Outside)"},
                {label: "Sports Complex", value: "Sports Complex"},
                {label: "Basket Ball Court", value: "Basket Ball Court"},
                {label: "Main Ground", value: "Main Ground"},
                {label: "Custom (Add)", value: "Custom (Add)"},
              ]} 
              disabled={updateMutation.isPending || isEditLocked} 
              placeholder="Select Venue"
            />
            
            {isCustomVenue && (
              <div className={cn("input-box", errors.venue && "error")} style={{ marginTop: '10px' }}>
                <input type="text" placeholder="Enter custom venue" disabled={updateMutation.isPending || isEditLocked} {...register('venue')} />
              </div>
            )}
            {errors.venue?.message && <span className="error-text !block">{errors.venue.message}</span>}
          </div>
        </div>

        <div className="form-section">
          <div className="section-header">
            <h2 className="section-title">Event Type & In-Charge Details</h2>
            <div className="section-divider"></div>
          </div>

          <div className="field-grid-2 items-end">
            <div className="field-group">
              <label className="field-label">Event Type *</label>
              <Controller
                name="eventType"
                control={control}
                render={({ field }) => (
                  <CustomDropdown 
                    value={field.value} 
                    onChange={field.onChange} 
                    options={[
                      {value:"Workshop",label:"Workshop / Bootcamp"},
                      {value:"Seminar",label:"Technical Seminar"},
                      {value:"Hackathon",label:"Hackathon"},
                      {value:"Competition",label:"Coding Competition"},
                      {value:"Social",label:"Society Welcome / Dinner"},
                      {value:"Other",label:"All Pak"}
                    ]} 
                    disabled={updateMutation.isPending || isEditLocked} 
                    placeholder="Select Type"
                  />
                )}
              />
              {errors.eventType?.message && <span className="error-text !block">{errors.eventType.message}</span>}
            </div>

            <div className="field-group">
              <div className="inline-header">
                <label className="field-label">In-Charge Designation *</label>
                <button type="button" className="btn-change" onClick={() => setIsCustomIncharge(!isCustomIncharge)}>
                  {isCustomIncharge ? 'Default' : 'Change'}
                </button>
              </div>
              
              {!isCustomIncharge ? (
                <div className="input-box disabled">
                  <input type="text" value="Event Coordinator" disabled />
                </div>
              ) : (
                <div className="input-box">
                  <input type="text" placeholder="Enter designation" />
                </div>
              )}
            </div>
          </div>

          <div className="field-grid-3">
            <div className="field-group">
              <label className="field-label">In-Charge Name *</label>
              <div className={cn("input-box", !isCustomIncharge && "disabled", errors.inChargeName && "error")}>
                <input type="text" readOnly={!isCustomIncharge} {...register('inChargeName')} />
              </div>
              {errors.inChargeName?.message && <span className="error-text !block">{errors.inChargeName.message}</span>}
            </div>
            <div className="field-group">
              <label className="field-label">In-Charge Reg. No *</label>
              <div className={cn("input-box", !isCustomIncharge && "disabled", errors.inChargeRegNum && "error")}>
                <input type="text" maxLength={7} readOnly={!isCustomIncharge} {...register('inChargeRegNum')} />
              </div>
              {errors.inChargeRegNum?.message && <span className="error-text !block">{errors.inChargeRegNum.message}</span>}
            </div>
            <div className="field-group">
              <label className="field-label">In-Charge Contact *</label>
              <div className={cn("input-box", !isCustomIncharge && "disabled", errors.inChargeContact && "error")}>
                <input type="text" maxLength={11} readOnly={!isCustomIncharge} {...register('inChargeContact')} />
              </div>
              {errors.inChargeContact?.message && <span className="error-text !block">{errors.inChargeContact.message}</span>}
            </div>
          </div>
        </div>

        <div className="form-section">
          <div className="section-header">
            <h2 className="section-title">Media & Registration (Optional)</h2>
            <div className="section-divider"></div>
          </div>

          <div className="field-group">
            <EventMediaUploader
              coverImageUrl={coverImageUrl}
              videoUrl={videoUrl}
              theme="dark"
              onImageChange={(url) => setValue('coverImageUrl', url, { shouldValidate: true })}
              onVideoChange={(url) => setValue('videoUrl', url, { shouldValidate: true })}
              folder="events"
              disabled={updateMutation.isPending || isEditLocked}
            />
          </div>

          <div className="field-group">
            <label className="field-label">Registration Form Link (Optional)</label>
            <div className={cn("input-box", errors.registrationLink && "error")}>
              <svg className="input-icon" viewBox="0 0 24 24"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
              <input type="url" placeholder="e.g. https://forms.gle/your-event-form" disabled={updateMutation.isPending || isEditLocked} {...register('registrationLink')} />
            </div>
            {errors.registrationLink?.message && <span className="error-text !block">{errors.registrationLink.message}</span>}
          </div>
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
                  onClick={handleSubmit((data) => onSubmit(data, false), onError)}
                  leftIcon={<Save className="w-5 h-5" />}
                >
                  Save Changes
                </Button>
                
                {eventData?.approvalStatus === 'CHANGES_REQUESTED' && (
                  <Button
                    type="button"
                    variant="primary"
                    className="w-full bg-green-600 border border-green-500 hover:bg-green-700 text-white"
                    isLoading={updateMutation.isPending}
                    onClick={handleSubmit((data) => onSubmit(data, true), onError)}
                    leftIcon={<ShieldCheck className="w-5 h-5" />}
                  >
                    {eventData.lastChangeRequestBy === "DSA_ADMIN" ? "Resubmit for Admin Review" : "Resubmit for Advisor Review"}
                  </Button>
                )}
              </>
            )}
          </div>
        </form>
    </div>
  );
};
