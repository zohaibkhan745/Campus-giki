import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { adminService } from '@/services/admin.service';
import { advisorService } from '@/services/advisor.service';
import { societyService } from '@/services/society.service';

export const usePendingCounts = () => {
  const { user } = useAuth();

  const isAdmin = user?.role === 'DSA_ADMIN';
  const isAdvisor = user?.role === 'ADVISOR';
  const isSociety = user?.role === 'SOCIETY';

  // Admin counts (single lightweight endpoint instead of 3 separate queries including the 13-query dashboard)
  const { data: adminSummary } = useQuery({
    queryKey: ['adminPendingSummary'],
    queryFn: adminService.getPendingSummary,
    enabled: isAdmin,
    staleTime: 60000,
  });

  // Society counts (derived from dashboard data)
  const { data: societyDashboardData } = useQuery({
    queryKey: ['societyDashboard'],
    queryFn: societyService.getDashboard,
    enabled: isSociety,
    staleTime: 60000,
  });

  // Advisor queries
  const { data: advisorEvents } = useQuery({
    queryKey: ['advisorEvents', 'PENDING_ADVISOR'],
    queryFn: () => advisorService.getMySocietyEvents({ status: 'PENDING_ADVISOR', limit: 1 }),
    enabled: isAdvisor,
    staleTime: 60000,
  });

  const { data: advisorPlans } = useQuery({
    queryKey: ['advisorPlans', 'PENDING_ADVISOR'],
    queryFn: () => advisorService.getMySocietyYearlyPlans({ status: 'PENDING_ADVISOR' as any, limit: 1 }),
    enabled: isAdvisor,
    staleTime: 60000,
  });

  let totalPending = 0;
  let pendingEventsCount = 0;
  let pendingPlansCount = 0;

  if (isAdmin && adminSummary) {
    pendingEventsCount = adminSummary.pendingEventsCount;
    pendingPlansCount = adminSummary.pendingPlansCount;
    totalPending = adminSummary.totalPending;
  }

  if (isAdvisor) {
    pendingEventsCount = advisorEvents?.meta?.total || 0;
    pendingPlansCount = advisorPlans?.meta?.total || 0;
    totalPending = pendingEventsCount + pendingPlansCount;
  }

  if (isSociety && societyDashboardData) {
    const changesRequestedEvents = societyDashboardData.pendingEvents.filter(e => e.approvalStatus === 'CHANGES_REQUESTED' || e.approvalStatus === 'APPROVED' || e.approvalStatus === 'REJECTED').length;
    
    const summary = societyDashboardData.yearlyPlanSummary;
    const changesRequestedPlan = summary.status === 'CHANGES_REQUESTED' || summary.editRequestStatus === 'APPROVED' || summary.editRequestStatus === 'REJECTED' ? 1 : 0;
    
    pendingEventsCount = changesRequestedEvents;
    pendingPlansCount = changesRequestedPlan;
    totalPending = changesRequestedEvents + changesRequestedPlan;
  }

  return { totalPending, pendingEventsCount, pendingPlansCount };
};
