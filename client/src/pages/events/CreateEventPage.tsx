import React, { useState, useEffect, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, CheckCircle2, ShieldCheck, Sparkles } from "lucide-react";
import { eventService } from "@/services/event.service";
import { societyService } from "@/services/society.service";
import { yearlyPlanService } from "@/services/yearly-plan.service";
import type { PlannedEventItem } from "@/types/yearly-plan.types";
import {
  eventFormSchema,
  type EventFormData,
} from "@/lib/validations/event.schema";
import { CouncilNoticeModal } from "@/components/ui/CouncilNoticeModal";
import { Alert } from "@/components/ui/Alert";
import { EventMediaUploader } from "@/components/common/EventMediaUploader";
import { CustomDatePicker } from "@/components/ui/CustomDatePicker";
import { CustomTimePicker } from "@/components/ui/CustomTimePicker";
import { CustomDropdown } from "@/components/ui/CustomDropdown";
import { cn } from "@/lib/utils";
import type { AxiosError } from "axios";

export const CreateEventPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [serverError, setServerError] = useState<string | null>(null);
  const [showNoticeModal, setShowNoticeModal] = useState(false);

  const [selectedEventKey, setSelectedEventKey] = useState<string>("");
  const [isMultiDay, setIsMultiDay] = useState(false);
  const [isCustomVenue, setIsCustomVenue] = useState(false);
  const [isCustomIncharge, setIsCustomIncharge] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors },
  } = useForm<EventFormData>({
    resolver: zodResolver(eventFormSchema),
    mode: "onChange",
    defaultValues: {
      title: "",
      description: "",
      eventDate: "",
      startTime: "09:00",
      endTime: "17:00",
      venue: "",
      coverImageUrl: "",
      registrationLink: "",
      eventType: "",
      inChargeName: "",
      inChargeRegNum: "",
      inChargeContact: "",
    },
  });

  const coverImageUrl = watch("coverImageUrl");
  const videoUrl = watch("videoUrl");

  const { data: dashboardData } = useQuery({
    queryKey: ["societyDashboard"],
    queryFn: societyService.getDashboard,
  });

  useEffect(() => {
    if ((dashboardData as any)?.profile) {
      const profile = (dashboardData as any)?.profile;
      let hasFullCouncil = false;
      try {
        const council = JSON.parse(profile.executiveCouncil || "[]");
        const mandatoryRoles = [
          "Vice President",
          "Event Coordinator",
          "General Secretary",
          "Treasurer",
          "Director Liaison",
        ];
        const existingRoles = council.map((m: any) => m.role);
        hasFullCouncil = mandatoryRoles.every((r) => existingRoles.includes(r));
      } catch {}
      if (!hasFullCouncil) {
        setShowNoticeModal(true);
      }
    }
  }, [dashboardData, navigate]);

  // Handle In-Charge Auto-fill
  useEffect(() => {
    if (!isCustomIncharge && (dashboardData as any)?.profile) {
      try {
        const council = JSON.parse(
          (dashboardData as any).profile.executiveCouncil || "[]",
        );
        const ec = council.find((m: any) => m.role === "Event Coordinator");
        if (ec) {
          setValue("inChargeName", ec.name || "", { shouldValidate: true });
          setValue("inChargeRegNum", ec.regNum || "", { shouldValidate: true });
          setValue("inChargeContact", ec.contact || "", {
            shouldValidate: true,
          });
        }
      } catch (e) {}
    } else if (isCustomIncharge) {
      setValue("inChargeName", "", { shouldValidate: false });
      setValue("inChargeRegNum", "", { shouldValidate: false });
      setValue("inChargeContact", "", { shouldValidate: false });
    }
  }, [isCustomIncharge, dashboardData, setValue]);

  const { data: myPlans } = useQuery({
    queryKey: ["myYearlyPlans"],
    queryFn: () => yearlyPlanService.getMyPlans(),
  });

  const plannedEvents = useMemo(() => {
    if (!myPlans) return [];
    const list: {
      key: string;
      planYear: number;
      planStatus: string;
      event: PlannedEventItem;
    }[] = [];
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
      setValue("title", pe.eventName || "", { shouldValidate: true });
      if (pe.startDate) {
        const dateFormatted = new Date(pe.startDate)
          .toISOString()
          .split("T")[0];
        setValue("eventDate", dateFormatted, { shouldValidate: true });
      }
      setValue("venue", pe.venue || "", { shouldValidate: true });
      setValue("description", pe.description || "", { shouldValidate: true });
    }
  };

  const createMutation = useMutation({
    meta: { notify: true },
    mutationFn: (data: EventFormData) => eventService.createEvent(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myEvents"] });
      queryClient.invalidateQueries({ queryKey: ["publicEvents"] });
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["societyEvents"] });
      queryClient.invalidateQueries({ queryKey: ["societyDashboard"] });
      queryClient.invalidateQueries({ queryKey: ["adminEvents"] });
      queryClient.invalidateQueries({ queryKey: ["adminEventsList"] });
      queryClient.invalidateQueries({ queryKey: ["advisorDashboard"] });
      queryClient.invalidateQueries({ queryKey: ["adminDashboard"] });
      queryClient.invalidateQueries({ queryKey: ["campusFeed"] });
      navigate("/dashboard", { replace: true });
    },
    onError: (
      error: AxiosError<{ message?: string | string[]; error?: string }>,
    ) => {
      const respMessage = error.response?.data?.message;
      let errText = "Failed to create event. Please verify your inputs.";
      if (Array.isArray(respMessage)) {
        errText = respMessage[0];
      } else if (typeof respMessage === "string") {
        errText = respMessage;
      }
      setServerError(errText);
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
  });

  const handlePublish = (data: EventFormData, requireReview: boolean) => {
    setServerError(null);
    createMutation.mutate({ ...data, submitForApproval: requireReview });
  };

  const onError = () => {
    setTimeout(() => {
      const firstError = document.querySelector(".error-text");
      if (firstError) {
        firstError.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 100);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="fixed top-4 left-4 sm:top-6 sm:left-6 z-[100] inline-flex items-center justify-center w-10 h-10 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white rounded-full transition-all cursor-pointer shadow-lg"
            title="Go Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Create New Campus Event
          </h1>
          <p className="text-sm font-medium text-white/60 mt-1">
            Fill in the details below to list a new event on the campus feed.
          </p>
        </div>
      </div>

      {serverError && (
        <Alert
          variant="error"
          message={serverError}
          className="animate-in fade-in slide-in-from-top-2"
        />
      )}

      {plannedEvents && plannedEvents.length > 0 && (
        <div className="glass-form-card !py-4">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-white font-bold text-sm">
              Import Event Details
            </h3>
            <span className="text-[10px] font-extrabold text-white uppercase tracking-wider bg-white/10 px-2.5 py-1 rounded-inputs border border-white/20">
              Optional Auto-Fill
            </span>
          </div>
          <p className="text-xs text-white/60 font-medium mb-3">
            Select a planned event from your annual calendar to automatically
            pre-fill title, date, venue, and description:
          </p>
          <CustomDropdown
            value={selectedEventKey}
            onChange={(e: any) =>
              handleSelectPlannedEvent(
                typeof e === "string" ? e : e?.target?.value || "",
              )
            }
            options={[
              { value: "", label: "Select Planned Event" },
              ...plannedEvents.map((ev) => ({
                value: ev.key,
                label: ev.event.eventName || "Unnamed Event",
              })),
            ]}
          />
        </div>
      )}

      <form
        onSubmit={(e) => e.preventDefault()}
        className="glass-form-card"
        noValidate
      >
        <div className="form-section">
          <div className="section-header">
            <h2 className="section-title">Event Overview</h2>
            <div className="section-divider"></div>
          </div>

          <div className="field-group">
            <label className="field-label">Event Title *</label>
            <div className={cn("input-box", errors.title && "error")}>
              <svg className="input-icon" viewBox="0 0 24 24">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              <input
                type="text"
                placeholder="e.g. GIKI SoftDesk Hackathon 2026"
                disabled={createMutation.isPending}
                {...register("title")}
              />
            </div>
            {errors.title?.message && (
              <span className="error-text !block">{errors.title.message}</span>
            )}
          </div>

          <div className="field-group">
            <label className="field-label">Event Description *</label>
            <div
              className={cn("input-box", errors.description && "error")}
              style={{ alignItems: "flex-start" }}
            >
              <svg
                className="input-icon"
                style={{ marginTop: "2px" }}
                viewBox="0 0 24 24"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
              <textarea
                placeholder="Describe your event agenda, prerequisites, target audience, and guidelines..."
                disabled={createMutation.isPending}
                {...register("description")}
              ></textarea>
            </div>
            {errors.description?.message && (
              <span className="error-text !block">
                {errors.description.message}
              </span>
            )}
          </div>
        </div>

        <div className="form-section">
          <div className="section-header">
            <div className="inline-header">
              <h2 className="section-title">Date, Time & Venue</h2>
              <div className="event-duration-toggle">
                <label className="toggle-option">
                  <input
                    type="radio"
                    name="eventDuration"
                    value="one"
                    checked={!isMultiDay}
                    onChange={() => setIsMultiDay(false)}
                    hidden
                  />
                  <span className="toggle-btn">One Day Event</span>
                </label>
                <label className="toggle-option">
                  <input
                    type="radio"
                    name="eventDuration"
                    value="multi"
                    checked={isMultiDay}
                    onChange={() => setIsMultiDay(true)}
                    hidden
                  />
                  <span className="toggle-btn">Multi Day Event</span>
                </label>
              </div>
            </div>
            <div className="section-divider"></div>
          </div>

          <div id="dateGrid" className={cn(isMultiDay && "multi-day")}>
            <div className="field-group">
              <label className="field-label">
                {isMultiDay ? "Event Start Date *" : "Date *"}
              </label>
              <Controller
                name="eventDate"
                control={control}
                render={({ field }) => (
                  <CustomDatePicker
                    value={field.value}
                    onChange={field.onChange}
                    placeholder={isMultiDay ? "From Date" : "Select Date"}
                    disabled={createMutation.isPending}
                  />
                )}
              />
              {errors.eventDate?.message && (
                <span className="error-text !block">
                  {errors.eventDate.message}
                </span>
              )}
            </div>

            {isMultiDay && (
              <div className="field-group">
                <label className="field-label">Event End Date *</label>
                <CustomDatePicker
                  placeholder="To Date"
                  disabled={createMutation.isPending}
                />
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
                  <CustomTimePicker
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="From Time"
                    disabled={createMutation.isPending}
                  />
                )}
              />
              {errors.startTime?.message && (
                <span className="error-text !block">
                  {errors.startTime.message}
                </span>
              )}
            </div>
            <div className="field-group">
              <label className="field-label">End Time *</label>
              <Controller
                name="endTime"
                control={control}
                render={({ field }) => (
                  <CustomTimePicker
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="To Time"
                    disabled={createMutation.isPending}
                  />
                )}
              />
              {errors.endTime?.message && (
                <span className="error-text !block">
                  {errors.endTime.message}
                </span>
              )}
            </div>
          </div>

          <div className="field-group">
            <label className="field-label">Venue Location *</label>
            <CustomDropdown
              value={isCustomVenue ? "Custom (Add)" : watch("venue")}
              onChange={(e: any) => {
                const val = typeof e === "string" ? e : e?.target?.value || "";
                if (val === "Custom (Add)") {
                  setIsCustomVenue(true);
                  setValue("venue", "", { shouldValidate: true });
                } else {
                  setIsCustomVenue(false);
                  setValue("venue", val, { shouldValidate: true });
                }
              }}
              options={[
                { label: "Auditorium", value: "Auditorium" },
                {
                  label: "Faculty Club (Inside)",
                  value: "Faculty Club (Inside)",
                },
                {
                  label: "Faculty Club (Outside)",
                  value: "Faculty Club (Outside)",
                },
                {
                  label: "Faculty Club (Inside + Outside)",
                  value: "Faculty Club (Inside + Outside)",
                },
                {
                  label: "Guest House (Inside)",
                  value: "Guest House (Inside)",
                },
                {
                  label: "Guest House (Outside)",
                  value: "Guest House (Outside)",
                },
                {
                  label: "Guest House (Inside + Outside)",
                  value: "Guest House (Inside + Outside)",
                },
                { label: "Sports Complex", value: "Sports Complex" },
                { label: "Basket Ball Court", value: "Basket Ball Court" },
                { label: "Main Ground", value: "Main Ground" },
                { label: "Custom (Add)", value: "Custom (Add)" },
              ]}
              disabled={createMutation.isPending}
              placeholder="Select Venue"
            />

            {isCustomVenue && (
              <div
                className={cn("input-box", errors.venue && "error")}
                style={{ marginTop: "10px" }}
              >
                <input
                  type="text"
                  placeholder="Enter custom venue"
                  disabled={createMutation.isPending}
                  {...register("venue")}
                />
              </div>
            )}
            {errors.venue?.message && (
              <span className="error-text !block">{errors.venue.message}</span>
            )}
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
                      { value: "Workshop", label: "Workshop / Bootcamp" },
                      { value: "Seminar", label: "Technical Seminar" },
                      { value: "Hackathon", label: "Hackathon" },
                      { value: "Competition", label: "Coding Competition" },
                      { value: "Social", label: "Society Welcome / Dinner" },
                      { value: "Other", label: "All Pak" },
                    ]}
                    disabled={createMutation.isPending}
                    placeholder="Select Type"
                  />
                )}
              />
              {errors.eventType?.message && (
                <span className="error-text !block">
                  {errors.eventType.message}
                </span>
              )}
            </div>

            <div className="field-group">
              <div className="inline-header">
                <label className="field-label">In-Charge Designation *</label>
                <button
                  type="button"
                  className="btn-change"
                  onClick={() => setIsCustomIncharge(!isCustomIncharge)}
                >
                  {isCustomIncharge ? "Default" : "Change"}
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
              <div
                className={cn(
                  "input-box",
                  !isCustomIncharge && "disabled",
                  errors.inChargeName && "error",
                )}
              >
                <input
                  type="text"
                  readOnly={!isCustomIncharge}
                  {...register("inChargeName")}
                  onInput={(e: any) => {
                    e.currentTarget.value = e.currentTarget.value.replace(
                      /[^a-zA-Z\s.,-]/g,
                      "",
                    );
                  }}
                />
              </div>
              {errors.inChargeName?.message && (
                <span className="error-text !block">
                  {errors.inChargeName.message}
                </span>
              )}
            </div>
            <div className="field-group">
              <label className="field-label">In-Charge Reg. No *</label>
              <div
                className={cn(
                  "input-box",
                  !isCustomIncharge && "disabled",
                  errors.inChargeRegNum && "error",
                )}
              >
                <input
                  type="text"
                  maxLength={7}
                  readOnly={!isCustomIncharge}
                  {...register("inChargeRegNum")}
                  onInput={(e: any) => {
                    e.currentTarget.value = e.currentTarget.value
                      .replace(/[^0-9]/g, "")
                      .slice(0, 7);
                  }}
                />
              </div>
              {errors.inChargeRegNum?.message && (
                <span className="error-text !block">
                  {errors.inChargeRegNum.message}
                </span>
              )}
            </div>
            <div className="field-group">
              <label className="field-label">In-Charge Contact *</label>
              <div
                className={cn(
                  "input-box",
                  !isCustomIncharge && "disabled",
                  errors.inChargeContact && "error",
                )}
              >
                <input
                  type="text"
                  maxLength={11}
                  readOnly={!isCustomIncharge}
                  {...register("inChargeContact")}
                  onInput={(e: any) => {
                    e.currentTarget.value = e.currentTarget.value
                      .replace(/[^0-9]/g, "")
                      .slice(0, 11);
                  }}
                />
              </div>
              {errors.inChargeContact?.message && (
                <span className="error-text !block">
                  {errors.inChargeContact.message}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="form-section">
          <div className="section-header">
            <h2 className="section-title">Media & Registration (Optional)</h2>
            <div className="section-divider"></div>
          </div>

          <div className="field-group">
            <div className="max-w-md">
              <EventMediaUploader
                coverImageUrl={coverImageUrl}
                videoUrl={videoUrl}
                theme="dark"
                onImageChange={(url) =>
                  setValue("coverImageUrl", url, { shouldValidate: true })
                }
                onVideoChange={(url) =>
                  setValue("videoUrl", url, { shouldValidate: true })
                }
                folder="events"
                label="Event Cover Poster (Optional)"
                disabled={createMutation.isPending}
              />
            </div>
          </div>

          <div className="field-group">
            <label className="field-label">
              Registration Form Link (Optional)
            </label>
            <div
              className={cn("input-box", errors.registrationLink && "error")}
            >
              <svg className="input-icon" viewBox="0 0 24 24">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                <polyline points="15 3 21 3 21 9"></polyline>
                <line x1="10" y1="14" x2="21" y2="3"></line>
              </svg>
              <input
                type="url"
                placeholder="e.g. https://forms.gle/your-event-form"
                disabled={createMutation.isPending}
                {...register("registrationLink")}
              />
            </div>
            {errors.registrationLink?.message && (
              <span className="error-text !block">
                {errors.registrationLink.message}
              </span>
            )}
          </div>
        </div>

        <button
          type="button"
          className="btn-submit-review"
          disabled={createMutation.isPending}
          onClick={handleSubmit((data) => handlePublish(data, true), onError)}
        >
          <span>Submit for Advisor & DSA Review</span>
        </button>
      </form>
      <CouncilNoticeModal
        isOpen={showNoticeModal}
        onClose={() => navigate("/society/setup?tab=council")}
      />
    </div>
  );
};
