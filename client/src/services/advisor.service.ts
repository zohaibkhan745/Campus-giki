import { api } from '@/lib/api';
import type {
  PaginatedAdvisorPlansResponse,
  PaginatedAdvisorEventsResponse,
  PaginatedAdvisorPostsResponse,
} from '@/types/advisor.types';
import type { PlanStatus } from '@/types/yearly-plan.types';

export const advisorService = {
  async getMe(): Promise<{ societies: Array<{ id: string; name: string; logoUrl: string | null }> }> {
    return api.get('/advisors/me');
  },

  async getMySocietyYearlyPlans(params?: {
    page?: number;
    limit?: number;
    status?: PlanStatus;
  }): Promise<PaginatedAdvisorPlansResponse> {
    return api.get('/advisors/me/yearly-plans', { params });
  },

  async getMySocietyEvents(params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<PaginatedAdvisorEventsResponse> {
    return api.get('/advisors/me/events', { params });
  },

  async updateEventStatus(eventId: string, payload: { status: string; comments?: string }) {
    return api.patch(`/advisors/me/events/${eventId}/status`, payload);
  },

  async getMySocietyPosts(params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<PaginatedAdvisorPostsResponse> {
    return api.get('/advisors/me/posts', { params });
  },

  async updatePostStatus(postId: string, payload: { status: 'APPROVED' | 'REJECTED'; comments?: string }) {
    return api.patch(`/advisors/me/posts/${postId}/status`, payload);
  },
};
