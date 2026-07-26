import { api } from '@/lib/api';
import type { PaginatedAdvisorPlansResponse } from '@/types/advisor.types';
import type { PlanStatus } from '@/types/yearly-plan.types';

export const advisorService = {
  async getMySocietyYearlyPlans(params?: {
    page?: number;
    limit?: number;
    status?: PlanStatus;
  }): Promise<PaginatedAdvisorPlansResponse> {
    return api.get('/advisors/me/yearly-plans', { params });
  },
};
