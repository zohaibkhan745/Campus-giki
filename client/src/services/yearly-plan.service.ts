import { api } from '@/lib/api';
import type {
  YearlyPlan,
  CreateYearlyPlanPayload,
  UpdateYearlyPlanPayload,
} from '@/types/yearly-plan.types';

export interface ReviewYearlyPlanPayload {
  decision: 'APPROVED' | 'CHANGES_REQUESTED';
  comment?: string;
}

export const yearlyPlanService = {
  async getMyPlans(): Promise<YearlyPlan[]> {
    return api.get('/yearly-plans/me');
  },

  async getPlanById(id: string): Promise<YearlyPlan> {
    return api.get(`/yearly-plans/${id}`);
  },

  async createPlan(payload: CreateYearlyPlanPayload): Promise<YearlyPlan> {
    return api.post('/yearly-plans', payload);
  },

  async updatePlan(
    id: string,
    payload: UpdateYearlyPlanPayload,
  ): Promise<YearlyPlan> {
    return api.patch(`/yearly-plans/${id}`, payload);
  },

  async reviewPlan(
    id: string,
    payload: ReviewYearlyPlanPayload,
  ): Promise<YearlyPlan> {
    return api.patch(`/yearly-plans/${id}/review`, payload);
  },

  async requestEdit(id: string, reason: string): Promise<void> {
    return api.patch(`/yearly-plans/${id}/edit-request`, { reason });
  },

  async resolveEditRequest(id: string, status: 'APPROVED' | 'REJECTED'): Promise<void> {
    return api.patch(`/yearly-plans/${id}/edit-request-resolve`, { status });
  },
};
