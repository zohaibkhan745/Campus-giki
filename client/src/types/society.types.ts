import type { EventItem } from './event.types';

export type OrganizationType = 'SOCIETY' | 'CLUB' | 'TEAM';

export interface Category {
  id: string;
  name: string;
  slug: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PublicSocietyItem {
  id: string;
  name: string;
  type?: OrganizationType;
  shortDescription?: string | null;
  logoUrl?: string | null;
  category?: {
    id: string;
    name: string;
    slug: string;
  } | null;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginatedSocietiesResponse {
  items: PublicSocietyItem[];
  meta: PaginationMeta;
}

export interface Society {
  id: string;
  name: string;
  type?: OrganizationType;
  shortDescription?: string | null;
  longDescription?: string | null;
  logoUrl?: string | null;
  bannerUrl?: string | null;
  instagram?: string | null;
  facebook?: string | null;
  linkedin?: string | null;
  website?: string | null;
  email?: string | null;
  presidentName?: string | null;
  presidentRegNum?: string | null;
  presidentContact?: string | null;
  isSetupComplete: boolean;
  userId: string;
  advisorId?: string | null;
  advisor?: {
    id: string;
    designation: string;
    department: string;
    user?: {
      fullName: string;
      email: string;
    } | null;
  } | null;
  category?: Category | null;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStatistics {
  totalEvents: number;
  upcomingEvents: number;
  pastEvents: number;
}

export interface YearlyPlanSummary {
  totalEventsInPlan: number;
  status: string;
}

export interface SocietyDashboardResponse {
  profile: Society | null;
  statistics: DashboardStatistics;
  pendingEvents: EventItem[];
  upcomingEvents: EventItem[];
  recentEvents: EventItem[];
  yearlyPlanSummary: YearlyPlanSummary;
}

export interface SetupSocietyPayload {
  name: string;
  type?: OrganizationType;
  shortDescription: string;
  longDescription: string;
  categoryId: string;
  logoUrl?: string;
  bannerUrl?: string;
  instagram?: string;
  facebook?: string;
  linkedin?: string;
  website?: string;
  email?: string;
  presidentName?: string;
  presidentRegNum?: string;
  presidentContact?: string;
}

export type UpdateSocietyPayload = Partial<SetupSocietyPayload>;
