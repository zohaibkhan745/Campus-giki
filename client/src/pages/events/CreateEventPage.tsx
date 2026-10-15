import React, { useState, useEffect, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, Link } from "react-router-dom";
import { invalidateEventQueries } from "@/lib/queryInvalidations";
import { ArrowLeft, CheckCircle2, ShieldCheck, Sparkles, Loader2, Building2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { adminService } from "@/services/admin.service";
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
import { BackButton } from "@/components/ui";
import { cn } from "@/lib/utils";
import type { AxiosError } from "axios";

export const CreateEventPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const isDsaAdmin = user?.role === "DSA_ADMIN";

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
      societyId: "",
      title: "",
      description: "",
      eventDate: "",
      startTime: "09:00",
      endTime: "17:00",
      venue: "",
      coverImageUrl: "",
      registrationLink: "",
      eventType: "",
      inChargeName: isDsaAdmin ? "DSA Directorate" : "",
      inChargeRegNum: isDsaAdmin ? "0000000" : "",
      inChargeContact: isDsaAdmin ? "03001234567" : "",
    },
  });

  const coverImageUrl = watch("coverImageUrl");
  const videoUrl = watch("videoUrl");
  const selectedSocietyId = watch("societyId");

  // Fetch list of societies if user is DSA Admin
  const { data: societiesData, isLoading: isLoadingSocieties } = useQuery({
    queryKey: ["publicSocietiesList"],
    queryFn: () => societyService.getPublicSocieties({ limit: 100 }),
    enabled: isDsaAdmin,
  });
  const societies = societiesData?.items || [];

  // Query selected society details for DSA Admin to auto-fill council in-charge details
  const { data: selectedSocietyDetail } = useQuery({
    queryKey: ["adminSocietyDetail", selectedSocietyId],
    queryFn: () => adminService.getSocietyById(selectedSocietyId),
    enabled: isDsaAdmin && Boolean(selectedSocietyId),
  });

  const { data: dashboardData } = useQuery({
    queryKey: ["societyDashboard"],
    queryFn: societyService.getDashboard,
    enabled: !isDsaAdmin,
  });

  useEffect(() => {
    if (isDsaAdmin) return;
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
  }, [dashboardData, navigate, isDsaAdmin]);

  // Compute default in-charge details based on council or DSA administration fallback
  const defaultInCharge = useMemo(() => {
    if (!isDsaAdmin) {
      if ((dashboardData as any)?.profile) {
        try {
          const council = JSON.parse(
            (dashboardData as any).profile.executiveCouncil || "[]",
          );
          const ec = council.find((m: any) => m.role === "Event Coordinator");
          if (ec && ec.name && ec.name.trim()) {
            const cleanRegNum = (ec.regNum || "").replace(/\D/g, "").slice(0, 7);
            const cleanContact = (ec.contact || "").replace(/\D/g, "").slice(0, 11);
            return {
              designation: "Event Coordinator",
              name: ec.name.trim(),
              regNum: cleanRegNum.length === 7 ? cleanRegNum : "0000000",
              contact: cleanContact.length === 11 ? cleanContact : "03001234567",
            };
          }
        } catch {}
      }
      return {
        designation: "Event Coordinator",
        name: "",
        regNum: "",
        contact: "",
      };
    }

    // For DSA Admin:
    if (selectedSocietyDetail) {
      // 1. Try Event Coordinator from selected society's Executive Council
      try {
        const council = JSON.parse(
          selectedSocietyDetail.executiveCouncil || "[]",
        );
        const ec = council.find((m: any) => m.role === "Event Coordinator");
        if (ec && ec.name && ec.name.trim()) {
          const cleanRegNum = (ec.regNum || "").replace(/\D/g, "").slice(0, 7);
          const cleanContact = (ec.contact || "").replace(/\D/g, "").slice(0, 11);
          return {
            designation: "Event Coordinator",
            name: ec.name.trim(),
            regNum: cleanRegNum.length === 7 ? cleanRegNum : "0000000",
            contact: cleanContact.length === 11 ? cleanContact : "03001234567",
          };
        }
      } catch {}

      // 2. Fallback to Society President
      if (
        selectedSocietyDetail.presidentName &&
        selectedSocietyDetail.presidentName.trim()
      ) {
        const cleanRegNum = (
          selectedSocietyDetail.presidentRegNum || ""
        )
          .replace(/\D/g, "")
          .slice(0, 7);
        const cleanContact = (
          selectedSocietyDetail.presidentContact || ""
        )
          .replace(/\D/g, "")
          .slice(0, 11);
        return {
          designation: "Society President",
          name: selectedSocietyDetail.presidentName.trim(),
          regNum: cleanRegNum.length === 7 ? cleanRegNum : "0000000",
          contact: cleanContact.length === 11 ? cleanContact : "03001234567",
        };
      }
    }

    // 3. Fallback to DSA Directorate
    return {
      designation: "DSA Directorate",
      name: "DSA Directorate",
      regNum: "0000000",
      contact: "03001234567",
    };
  }, [isDsaAdmin, dashboardData, selectedSocietyDetail]);

  // Handle In-Charge Auto-fill for society users & DSA Admin
  useEffect(() => {
    if (!isCustomIncharge) {
      if (defaultInCharge.name) {
        setValue("inChargeName", defaultInCharge.name, { shouldValidate: true });
        setValue("inChargeRegNum", defaultInCharge.regNum, {
          shouldValidate: true,
        });
        setValue("inChargeContact", defaultInCharge.contact, {
          shouldValidate: true,
        });
      }
    } else {
      setValue("inChargeName", "", { shouldValidate: false });
      setValue("inChargeRegNum", "", { shouldValidate: false });
      setValue("inChargeContact", "", { shouldValidate: false });
    }
  }, [isCustomIncharge, defaultInCharge, setValue]);

  const { data: myPlans } = useQuery({
    queryKey: ["myYearlyPlans"],
    queryFn: () => yearlyPlanService.getMyPlans(),
    enabled: !isDsaAdmin,
  });

  const plannedEvents = useMemo(() => {
    if (isDsaAdmin || !myPlans) return [];
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
  }, [myPlans, isDsaAdmin]);

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
      void invalidateEventQueries(queryClient);
      navigate(isDsaAdmin ? "/admin/events" : "/dashboard", { replace: true });
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
    if (isDsaAdmin && !data.societyId) {
      setServerError("Please select the host society for this event.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
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
          <div className="mb-4">
            <BackButton to={isDsaAdmin ? "/admin/events" : "/dashboard"} variant="inline" />
          </div>
          <h1 className="text-3xl font-extrabold text-text-primary tracking-tight">
            {isDsaAdmin ? "Schedule & Publish Campus Event" : "Create New Campus Event"}
          </h1>
          <p className="text-sm font-medium text-text-secondary mt-1">
            {isDsaAdmin
              ? "Publish official campus events and All-Pak competitions linked to host student societies."
              : "Fill in the details below to submit a new event proposal to your advisor and DSA."}
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

      {/* Host Society Selector for DSA Admin */}
      {isDsaAdmin && (
        <div className="bg-surface-glass border border-border-medium rounded-cards p-6 backdrop-blur-[20px] shadow-elevation-1">
          <div className="flex items-center gap-2 mb-2">
            <Building2 className="w-5 h-5 text-brand-primary" />
            <h3 className="text-text-primary font-bold text-sm">
              Host Society <span className="text-red-500">*</span>
            </h3>
            <span className="text-[10px] font-extrabold text-brand-primary uppercase tracking-wider bg-brand-primary/10 px-2.5 py-1 rounded-inputs border border-brand-primary/20">
              Required for Admin
            </span>
          </div>
          <p className="text-xs text-text-secondary font-medium mb-3">
            Select the student society hosting or associated with this event (e.g., ACM, SOPHEP, NETRONIX for All-Pak events):
          </p>
          <CustomDropdown
            value={watch("societyId") || ""}
            onChange={(e: any) => {
              const val = typeof e === "string" ? e : e?.target?.value || "";
              setValue("societyId", val, { shouldValidate: true });
              if (serverError) setServerError(null);
            }}
            options={[
              { value: "", label: isLoadingSocieties ? "Loading societies..." : "Select Host Society" },
              ...societies.map((s) => ({
                value: s.id,
                label: s.name,
              })),
            ]}
            disabled={createMutation.isPending || isLoadingSocieties}
          />
          {errors.societyId?.message && (
            <span className="error-text mt-2 block text-xs text-red-500">
              {errors.societyId.message}
            </span>
          )}
        </div>
      )}

      {!isDsaAdmin && plannedEvents && plannedEvents.length > 0 && (
        <div className="bg-surface-glass border border-border-medium rounded-cards p-6 backdrop-blur-[20px] shadow-elevation-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-text-primary font-bold text-sm">
              Import Event Details
            </h3>
            <span className="text-[10px] font-extrabold text-text-primary uppercase tracking-wider bg-surface-hover px-2.5 py-1 rounded-inputs border border-border-medium">
              Optional Auto-Fill
            </span>
          </div>
          <p className="text-xs text-text-secondary font-medium mb-3">
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
              <span className="error-text">{errors.title.message}</span>
            )}
          </div>

          <div className="field-group">
            <label className="field-label">Event Description *</label>
            <div className={cn("input-box", errors.description && "error")}>
              <svg
                className="input-icon mt-0.5"
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
              <span className="error-text">
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
                <span className="error-text">
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
                <span className="error-text">
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
                <span className="error-text">
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
              <div className={cn("input-box mt-2.5", errors.venue && "error")}>
                <input
                  type="text"
                  placeholder="Enter custom venue"
                  disabled={createMutation.isPending}
                  {...register("venue")}
                />
              </div>
            )}
            {errors.venue?.message && (
              <span className="error-text">{errors.venue.message}</span>
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
                <span className="error-text">
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
                  <input type="text" value={defaultInCharge.designation} disabled />
                </div>
              ) : (
                <div className="input-box">
                  <input type="text" placeholder="Enter designation (e.g. Lead Organizer)" />
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
                <span className="error-text">
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
                <span className="error-text">
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
                <span className="error-text">
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
            <div className="max-w-md mx-auto">
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
              <span className="error-text">
                {errors.registrationLink.message}
              </span>
            )}
          </div>
        </div>

        {isDsaAdmin ? (
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button
              type="button"
              className="btn-submit-review w-full flex-1 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              disabled={createMutation.isPending}
              onClick={handleSubmit((data) => handlePublish(data, true), onError)}
            >
              {createMutation.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin text-white" />
                  <span>Publishing Campus Event...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5 text-white" />
                  <span>Publish Campus Event (DSA Official)</span>
                </>
              )}
            </button>
            <button
              type="button"
              className="w-full sm:w-auto px-6 py-3.5 bg-surface-hover hover:bg-surface text-text-primary border border-border-medium rounded-xl text-sm font-bold transition-all cursor-pointer disabled:opacity-60"
              disabled={createMutation.isPending}
              onClick={handleSubmit((data) => {
                if (!data.societyId) {
                  setServerError("Please select the host society for this event.");
                  window.scrollTo({ top: 0, behavior: "smooth" });
                  return;
                }
                createMutation.mutate({ ...data, submitForApproval: false });
              }, onError)}
            >
              Save as Draft
            </button>
          </div>
        ) : (
          <button
            type="button"
            className="btn-submit-review active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            disabled={createMutation.isPending}
            onClick={handleSubmit((data) => handlePublish(data, true), onError)}
          >
            {createMutation.isPending ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin text-white" />
                <span>Submitting for Review...</span>
              </>
            ) : (
              <span>Submit for Advisor & DSA Review</span>
            )}
          </button>
        )}
      </form>
      {!isDsaAdmin && (
        <CouncilNoticeModal
          isOpen={showNoticeModal}
          onClose={() => navigate("/society/setup?tab=council")}
        />
      )}
    </div>
  );
};
