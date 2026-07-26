import { api } from '@/lib/api';
import type {
  EventItem,
  SocietyEventsGroup,
  CreateEventPayload,
  UpdateEventPayload,
} from '@/types/event.types';

export const eventService = {
  async getAllPublicEvents(params?: {
    from?: string;
    to?: string;
    category?: string;
    page?: number;
    limit?: number;
  }): Promise<{ items: EventItem[]; meta: { total: number; page: number; limit: number; totalPages: number } }> {
    return api.get('/events', { params });
  },

  async createEvent(payload: CreateEventPayload): Promise<EventItem> {
    return api.post('/events', payload);
  },

  async getMyEvents(): Promise<SocietyEventsGroup> {
    return api.get('/societies/me/events');
  },

  async getEventById(id: string): Promise<EventItem> {
    return api.get(`/events/${id}`);
  },

  async updateEvent(id: string, payload: UpdateEventPayload): Promise<EventItem> {
    return api.patch(`/events/${id}`, payload);
  },

  async deleteEvent(id: string): Promise<{ message: string; id: string }> {
    return api.delete(`/events/${id}`);
  },
};
