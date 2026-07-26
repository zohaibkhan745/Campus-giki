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
  isPublished: boolean;
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
  coverImageUrl?: string;
  registrationLink?: string;
}

export type UpdateEventPayload = Partial<CreateEventPayload>;
