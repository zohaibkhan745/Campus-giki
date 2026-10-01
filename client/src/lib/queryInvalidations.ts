import { QueryClient } from '@tanstack/react-query';

/**
 * Centralized, domain-driven query cache invalidation & optimistic state helpers.
 *
 * Prevents stale UI states, out-of-sync badge counters, and missing published items
 * across dashboards, feeds, calendar, and management tables.
 */

/**
 * Invalidates all event-related queries across Admin, Advisor, Society, and Public views.
 */
export const invalidateEventQueries = async (
  queryClient: QueryClient,
  eventId?: string,
): Promise<void> => {
  const invalidations: Promise<void>[] = [
    // 1. Single Event Detail
    eventId
      ? queryClient.invalidateQueries({ queryKey: ['event', eventId] })
      : queryClient.invalidateQueries({ queryKey: ['event'] }),

    // 2. Admin Views & Dashboards
    queryClient.invalidateQueries({ queryKey: ['dashboardEvents'] }),
    queryClient.invalidateQueries({ queryKey: ['adminDashboard'] }),
    queryClient.invalidateQueries({ queryKey: ['adminPendingSummary'] }),
    queryClient.invalidateQueries({ queryKey: ['adminEventsList'] }),
    queryClient.invalidateQueries({ queryKey: ['adminEvents'] }),

    // 3. Society Views & Dashboards
    queryClient.invalidateQueries({ queryKey: ['mySocietyEventsList'] }),
    queryClient.invalidateQueries({ queryKey: ['myEvents'] }),
    queryClient.invalidateQueries({ queryKey: ['societyEvents'] }),
    queryClient.invalidateQueries({ queryKey: ['societyDashboard'] }),

    // 4. Advisor Views
    queryClient.invalidateQueries({ queryKey: ['advisorEventsQueue'] }),
    queryClient.invalidateQueries({ queryKey: ['advisorEvents'] }),
    queryClient.invalidateQueries({ queryKey: ['advisorDashboard'] }),

    // 5. Public Views & Feeds
    queryClient.invalidateQueries({ queryKey: ['campusFeed'] }),
    queryClient.invalidateQueries({ queryKey: ['events'] }),
    queryClient.invalidateQueries({ queryKey: ['publicEvents'] }),
    queryClient.invalidateQueries({ queryKey: ['publicCalendarEvents'] }),
    queryClient.invalidateQueries({ queryKey: ['publicListEvents'] }),
    queryClient.invalidateQueries({ queryKey: ['publicSocietyEvents'] }),
  ];

  await Promise.all(invalidations);
};

/**
 * Optimistically updates the client cache when an event is approved by the DSA,
 * guaranteeing 0ms instantaneous UI update without requiring a manual page reload.
 */
export const optimisticApproveEvent = (
  queryClient: QueryClient,
  eventId: string,
): void => {
  const now = new Date().toISOString();

  // 1. Instantly update the single event query cache
  queryClient.setQueryData(['event', eventId], (old: any) => {
    if (!old) return old;
    return {
      ...old,
      approvalStatus: 'PUBLISHED',
      isPublished: true,
      dsaApprovedAt: now,
      venueClearanceStatus: old.venueClearanceStatus || 'PENDING_UPLOAD',
    };
  });

  // 2. Remove from Admin Dashboard Pending List immediately
  queryClient.setQueriesData(
    { queryKey: ['dashboardEvents'] },
    (old: any) => {
      if (!old || !Array.isArray(old.items)) return old;
      return {
        ...old,
        items: old.items.filter((item: any) => item.id !== eventId),
        meta: old.meta
          ? { ...old.meta, total: Math.max(0, (old.meta.total || 1) - 1) }
          : old.meta,
      };
    },
  );

  // 3. Decrement pending counts in Admin Pending Summary immediately
  queryClient.setQueryData(['adminPendingSummary'], (old: any) => {
    if (!old) return old;
    const newPendingEvents = Math.max(0, (old.pendingEventsCount || 1) - 1);
    const newTotal = Math.max(0, (old.totalPending || 1) - 1);
    return {
      ...old,
      pendingEventsCount: newPendingEvents,
      totalPending: newTotal,
    };
  });
};

/**
 * Invalidates all yearly-plan-related queries across Admin, Advisor, and Society views.
 */
export const invalidatePlanQueries = async (
  queryClient: QueryClient,
  planId?: string,
): Promise<void> => {
  const invalidations: Promise<void>[] = [
    // 1. Plan Details
    planId
      ? queryClient.invalidateQueries({ queryKey: ['yearlyPlanDetail', planId] })
      : queryClient.invalidateQueries({ queryKey: ['yearlyPlanDetail'] }),
    planId
      ? queryClient.invalidateQueries({ queryKey: ['adminYearlyPlanDetail', planId] })
      : queryClient.invalidateQueries({ queryKey: ['adminYearlyPlanDetail'] }),

    // 2. Admin Views & Queues
    queryClient.invalidateQueries({ queryKey: ['adminYearlyPlans'] }),
    queryClient.invalidateQueries({ queryKey: ['adminPlans'] }),
    queryClient.invalidateQueries({ queryKey: ['adminEditRequests'] }),
    queryClient.invalidateQueries({ queryKey: ['adminDashboard'] }),
    queryClient.invalidateQueries({ queryKey: ['adminPendingSummary'] }),

    // 3. Society Views
    queryClient.invalidateQueries({ queryKey: ['myYearlyPlans'] }),
    queryClient.invalidateQueries({ queryKey: ['yearly-plans'] }),
    queryClient.invalidateQueries({ queryKey: ['societyDashboard'] }),

    // 4. Advisor Views
    queryClient.invalidateQueries({ queryKey: ['advisorYearlyPlansQueue'] }),
    queryClient.invalidateQueries({ queryKey: ['advisorPlans'] }),
  ];

  await Promise.all(invalidations);
};

/**
 * Invalidates all society-related queries across Admin and Public views.
 */
export const invalidateSocietyQueries = async (
  queryClient: QueryClient,
  societyId?: string,
): Promise<void> => {
  const invalidations: Promise<void>[] = [
    queryClient.invalidateQueries({ queryKey: ['adminSocietiesList'] }),
    queryClient.invalidateQueries({ queryKey: ['publicSocieties'] }),
    queryClient.invalidateQueries({ queryKey: ['societiesListForFilter'] }),
    queryClient.invalidateQueries({ queryKey: ['adminDashboard'] }),
    queryClient.invalidateQueries({ queryKey: ['mySociety'] }),
    queryClient.invalidateQueries({ queryKey: ['societyDashboard'] }),
    queryClient.invalidateQueries({ queryKey: ['categories'] }),
  ];

  if (societyId) {
    invalidations.push(
      queryClient.invalidateQueries({ queryKey: ['adminSocietyDetail', societyId] }),
      queryClient.invalidateQueries({ queryKey: ['publicSociety', societyId] }),
    );
  }

  await Promise.all(invalidations);
};

/**
 * Invalidates all post-related queries across Admin, Society, and Public views.
 */
export const invalidatePostQueries = async (
  queryClient: QueryClient,
): Promise<void> => {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: ['adminPosts'] }),
    queryClient.invalidateQueries({ queryKey: ['campusFeed'] }),
    queryClient.invalidateQueries({ queryKey: ['dashboardPosts'] }),
  ]);
};
