import { api } from '@/lib/api';
import type { PlanStatus, YearlyPlan, PlannedEventPayload } from '@/types/yearly-plan.types';

export interface AdvisorOption {
  id: string;
  designation: string;
  department: string;
  user: {
    id: string;
    fullName: string;
    email: string;
    avatarUrl?: string | null;
  };
  societies?: { name: string }[];
}

export interface OnboardSocietyPayload {
  name: string;
  categoryId: string;
  presidentEmail: string;
    avatarUrl?: string | null;
  advisorId: string;
}

export interface CreateAdvisorPayload {
  fullName: string;
  email: string;
    avatarUrl?: string | null;
  password?: string;
  department: string;
  designation: string;
}

export interface OnboardSocietyResult {
  id: string;
  name: string;
  presidentEmail: string;
    avatarUrl?: string | null;
  temporaryPassword?: string;
  activationEmailSent: boolean;
  emailPreviewUrl?: string;
  isSetupComplete: boolean;
  hasWarning: boolean;
  category: {
    id: string;
    name: string;
  };
  advisor: {
    id: string;
    designation: string;
    user: {
      fullName: string;
    };
  };
  createdAt: string;
}

export type AdminSocietyStatusType = 'ACTIVE' | 'UNCONFIGURED' | 'INACTIVE';

export interface AdminSocietyItem {
  id: string;
  name: string;
  shortDescription?: string | null;
  logoUrl?: string | null;
  isSetupComplete: boolean;
  hasWarning: boolean;
  status: AdminSocietyStatusType;
  presidentEmail: string;
    avatarUrl?: string | null;
  category?: {
    id: string;
    name: string;
    slug: string;
  } | null;
  advisor?: {
    id: string;
    designation: string;
    department: string;
    user: {
      fullName: string;
      email: string;
    avatarUrl?: string | null;
    };
  } | null;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedAdminSocietiesResponse {
  items: AdminSocietyItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface AdminEventItem {
  id: string;
  title: string;
  description: string;
  eventDate: string;
  startTime: string;
  endTime: string;
  venue: string;
  coverImageUrl?: string | null;
  registrationLink?: string | null;
  createdAt: string;
  updatedAt: string;
  isUpcoming: boolean;
  approvalStatus: string;
  society: {
    id: string;
    name: string;
    logoUrl?: string | null;
    category?: {
      id: string;
      name: string;
      slug: string;
    } | null;
  };
}

export interface PaginatedAdminEventsResponse {
  items: AdminEventItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface AdminAdvisorSummary {
  id: string;
  designation: string;
  department: string;
  user: {
    fullName: string;
    email: string;
    avatarUrl?: string | null;
  };
}

export interface AdminSocietySummary {
  id: string;
  name: string;
  logoUrl?: string | null;
  advisor?: AdminAdvisorSummary | null;
}

export interface AdminPlanSummaryItem {
  id: string;
  year: number;
  status: PlanStatus;
  advisorComments?: string | null;
  createdAt: string;
  updatedAt: string;
  totalPlannedEvents: number;
  society: AdminSocietySummary;
}

export interface PaginatedAdminPlansResponse {
  items: AdminPlanSummaryItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface AdminDashboardStatistics {
  totalSocieties: number;
  activeSocieties: number;
  unconfiguredSocieties: number;
  inactiveSocieties: number;
  pendingYearlyPlans: number;
  approvedPlans: number;
  eventsThisWeek: number;
  eventsThisMonth: number;
  upcomingEvents: number;
}

export interface AdminDashboardData {
  statistics: AdminDashboardStatistics;
  approvedPlansPreview: Array<{
    id: string;
    year: number;
    status: PlanStatus;
    advisorComments?: string | null;
    updatedAt: string;
    totalPlannedEvents: number;
    society: {
      id: string;
      name: string;
      logoUrl?: string | null;
      advisor?: {
        id: string;
        designation: string;
        department: string;
        user: {
          fullName: string;
        };
      } | null;
    };
  }>;
  upcomingEventsPreview: Array<{
    id: string;
    title: string;
    eventDate: string;
    startTime: string;
    endTime: string;
    venue: string;
    society: {
      id: string;
      name: string;
      logoUrl?: string | null;
      category?: {
        name: string;
      } | null;
    };
  }>;
  pendingEventsPreview: Array<{
    id: string;
    title: string;
    eventDate: string;
    startTime: string;
    endTime: string;
    venue: string;
    society: {
      id: string;
      name: string;
      logoUrl?: string | null;
      category?: {
        name: string;
      } | null;
    };
  }>;
  recentlyApprovedEventsPreview?: Array<{
    id: string;
    title: string;
    eventDate: string;
    startTime: string;
    endTime: string;
    venue: string;
    society: {
      id: string;
      name: string;
      logoUrl?: string | null;
      category?: {
        name: string;
      } | null;
    };
  }>;
}



export const adminService = {
  async getDashboardData(): Promise<AdminDashboardData> {
    return api.get('/admin/dashboard');
  },

  async deleteAdvisor(id: string): Promise<void> {
    return api.delete(`/admin/advisors/${id}`);
  },

  async getAvailableAdvisors(): Promise<AdvisorOption[]> {
    return api.get('/admin/advisors');
  },

  async createAdvisor(payload: CreateAdvisorPayload): Promise<AdvisorOption> {
    return api.post('/admin/advisors', payload);
  },

  async getAllEvents(params?: {
    page?: number;
    limit?: number;
    society?: string;
    category?: string;
    status?: string;
    from?: string;
    to?: string;
    type?: 'upcoming' | 'past';
    search?: string;
  }): Promise<PaginatedAdminEventsResponse> {
    return api.get('/admin/events', { params });
  },

  async getAllSocieties(params?: {
    page?: number;
    limit?: number;
    category?: string;
    status?: AdminSocietyStatusType;
    search?: string;
  }): Promise<PaginatedAdminSocietiesResponse> {
    return api.get('/admin/societies', { params });
  },

  async onboardSociety(payload: OnboardSocietyPayload): Promise<OnboardSocietyResult> {
    return api.post('/admin/societies', payload);
  },

  async updateSociety(
    id: string,
    payload: { name?: string; categoryId?: string; advisorId?: string | null },
  ): Promise<AdminSocietyItem> {
    return api.patch(`/admin/societies/${id}`, payload);
  },

  async deleteSociety(id: string): Promise<{ message: string; id: string; name: string }> {
    return api.delete(`/admin/societies/${id}`);
  },

  async deactivateSociety(id: string): Promise<{ message: string; id: string; name: string }> {
    const response = await api.patch(`/admin/societies/${id}/deactivate`);
    return response.data;
  },

  async reactivateSociety(id: string): Promise<{ message: string; societyId: string }> {
    const response = await api.patch(`/admin/societies/${id}/reactivate`);
    return response.data;
  },

  async toggleWarning(id: string, hasWarning: boolean): Promise<{ message: string; societyId: string; hasWarning: boolean }> {
    const response = await api.patch(`/admin/societies/${id}/warning`, { hasWarning });
    return response.data;
  },

  async getAllYearlyPlans(params?: {
    page?: number;
    limit?: number;
    status?: PlanStatus;
    year?: number;
    society?: string;
    search?: string;
    editRequestStatus?: string;
  }): Promise<PaginatedAdminPlansResponse> {
    return api.get('/admin/yearly-plans', { params });
  },

  async getYearlyPlanDetailById(id: string): Promise<YearlyPlan> {
    return api.get(`/admin/yearly-plans/${id}`);
  },

  async updateYearlyPlan(id: string, payload: { events: PlannedEventPayload[] }): Promise<YearlyPlan> {
    return api.patch(`/admin/yearly-plans/${id}`, payload);
  },

  async updateEventStatus(id: string, payload: { status: string; comments?: string; rules?: string }) {
    return api.patch(`/admin/events/${id}/status`, payload);
  },

  async verifyVenueClearance(
    id: string,
    payload: { status: 'VERIFIED' | 'REJECTED'; notes?: string },
  ) {
    return api.patch(`/admin/events/${id}/venue-clearance`, payload);
  },
};


