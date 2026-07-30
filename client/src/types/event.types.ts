export interface EventItem {
  id: string;
  title: string;
  description: string;
  eventDate: string;
  startTime: string;
  endTime: string;
  venue: string;
  coverImageUrl?: string | null;
  registrationLink?: string | null;
  eventType?: string | null;
  inChargeName?: string | null;
  inChargeRegNum?: string | null;
  inChargeContact?: string | null;
  isPublished: boolean;
  approvalStatus?: 'DRAFT' | 'PUBLISHED' | 'PENDING_ADVISOR' | 'PENDING_ADMIN' | 'CHANGES_REQUESTED' | 'APPROVED';
  advisorComments?: string | null;
  dsaComments?: string | null;
  advisorApprovedAt?: string | null;
  dsaApprovedAt?: string | null;
  lastChangeRequestBy?: string | null;
  societyId: string;
  society?: {
    id: string;
    name: string;
    logoUrl?: string | null;
    category?: {
      id: string;
      name: string;
      slug: string;
    } | null;
  };
  createdAt: string;
  updatedAt: string;
}

export interface SocietyEventsGroup {
  upcoming: EventItem[];
  past: EventItem[];
}

export interface CreateEventPayload {
  title: string;
  description: string;
  eventDate: string;
  startTime: string;
  endTime: string;
  venue: string;
  coverImageUrl?: string | null;
  registrationLink?: string | null;
  eventType?: string | null;
  inChargeName?: string | null;
  inChargeRegNum?: string | null;
  inChargeContact?: string | null;
  submitForApproval?: boolean;
}

export type UpdateEventPayload = Partial<CreateEventPayload>;
