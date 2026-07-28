import type { PlanStatus } from './yearly-plan.types';

export interface AdvisorSocietySummary {
  id: string;
  name: string;
  logoUrl?: string | null;
}

export interface AdvisorPlanItem {
  id: string;
  year: number;
  status: PlanStatus;
  advisorComments?: string | null;
  createdAt: string;
  updatedAt: string;
  totalPlannedEvents: number;
  society: AdvisorSocietySummary;
}

export interface PaginatedAdvisorPlansResponse {
  items: AdvisorPlanItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface AdvisorEventItem {
  id: string;
  title: string;
  description: string;
  eventDate: string;
  startTime: string;
  endTime: string;
  venue: string;
  approvalStatus: string;
  coverImageUrl?: string | null;
  society: AdvisorSocietySummary;
}

export interface PaginatedAdvisorEventsResponse {
  items: AdvisorEventItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}
