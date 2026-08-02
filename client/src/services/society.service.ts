import { api } from '@/lib/api';
import type {
  Category,
  Society,
  SocietyDashboardResponse,
  PaginatedSocietiesResponse,
  PublicSocietyItem,
  SetupSocietyPayload,
  UpdateSocietyPayload,
  OrganizationType,
} from '@/types/society.types';
import type { EventItem } from '@/types/event.types';

export interface PublicSocietyEventsGroup {
  upcoming: EventItem[];
  past: EventItem[];
}

export const societyService = {
  async getCategories(): Promise<Category[]> {
    return api.get('/categories');
  },

  async getPublicSocieties(params?: {
    page?: number;
    limit?: number;
    category?: string;
    type?: OrganizationType;
    search?: string;
  }): Promise<PaginatedSocietiesResponse> {
    return api.get('/societies', { params });
  },

  async getPublicSocietyById(id: string): Promise<Society> {
    return api.get(`/societies/${id}`);
  },

  async getPublicSocietyEvents(id: string): Promise<PublicSocietyEventsGroup> {
    return api.get(`/societies/${id}/events`);
  },

  async getMySociety(): Promise<Society | null> {
    return api.get('/societies/me');
  },

  async getDashboard(): Promise<SocietyDashboardResponse> {
    return api.get('/societies/me/dashboard');
  },

  async setupSociety(payload: SetupSocietyPayload): Promise<Society> {
    return api.post('/societies/setup', payload);
  },

  async updateSociety(payload: UpdateSocietyPayload): Promise<Society> {
    return api.patch('/societies/me', payload);
  },
};
