export type PlanStatus = 'DRAFT' | 'PENDING' | 'CHANGES_REQUESTED' | 'APPROVED';

export interface PlannedEventItem {
  id?: string;
  eventName: string;
  plannedDate: string;
  notes?: string | null;
}

export interface YearlyPlanSocietyAdvisor {
  id: string;
  designation: string;
  department: string;
  user: {
    fullName: string;
    email: string;
  };
}

export interface YearlyPlanSociety {
  id: string;
  name: string;
  logoUrl?: string | null;
  advisor?: YearlyPlanSocietyAdvisor | null;
}

export interface YearlyPlan {
  id: string;
  year: number;
  status: PlanStatus;
  advisorComments?: string | null;
  societyId: string;
  society?: YearlyPlanSociety | null;
  plannedEvents: PlannedEventItem[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateYearlyPlanPayload {
  year: number;
  status?: PlanStatus;
  events: {
    eventName: string;
    plannedDate: string;
    notes?: string;
  }[];
}

export interface UpdateYearlyPlanPayload {
  status?: PlanStatus;
  events?: {
    eventName: string;
    plannedDate: string;
    notes?: string;
  }[];
}
