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
    societyId?: string;
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

  async requestEdit(id: string, reason: string): Promise<void> {
    return api.patch(`/events/${id}/edit-request`, { reason });
  },

  async resolveEditRequest(id: string, status: 'APPROVED' | 'REJECTED'): Promise<void> {
    return api.patch(`/events/${id}/edit-request-resolve`, { status });
  },

  async updateEvent(id: string, payload: UpdateEventPayload): Promise<EventItem> {
    return api.patch(`/events/${id}`, payload);
  },

  async deleteEvent(id: string): Promise<{ message: string; id: string }> {
    return api.delete(`/events/${id}`);
  },

  async uploadVenueSlip(eventId: string, file: File): Promise<EventItem> {
    const formData = new FormData();
    formData.append('file', file);
    return api.post(`/events/${eventId}/venue-slip`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  async getVenueSlipData(eventId: string): Promise<any> {
    return api.get(`/events/${eventId}/venue-slip`);
  },
};
