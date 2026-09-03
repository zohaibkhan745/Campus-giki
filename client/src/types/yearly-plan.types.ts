export type PlanStatus = 'DRAFT' | 'PENDING' | 'PENDING_ADVISOR' | 'PENDING_ADMIN' | 'CHANGES_REQUESTED' | 'APPROVED' | 'REJECTED' | 'CANCELLED';

export interface PlannedEventPayload {
  eventName: string;
  startDate: string;
  endDate: string;
  description: string;
  venue: string;
  rules?: string;
  societyRules?: string;
}

export interface PlannedEventItem {
  id?: string;
  eventName: string;
  startDate: string;
  endDate: string;
  description: string;
  venue: string;
  rules?: string | null;
  societyRules?: string | null;
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
  editRequestStatus?: string | null;
  editRequestReason?: string | null;
  societyId: string;
  society?: YearlyPlanSociety | null;
  plannedEvents: PlannedEventItem[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateYearlyPlanPayload {
  year: number;
  status?: PlanStatus;
  events: PlannedEventPayload[];
}

export interface UpdateYearlyPlanPayload {
  status?: PlanStatus;
  events?: PlannedEventPayload[];
}

