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
      ? queryClient.invalidateQueries({ queryKey: ['event', eventId], refetchType: 'all' })
      : queryClient.invalidateQueries({ queryKey: ['event'], refetchType: 'all' }),

    // 2. Admin Views & Dashboards
    queryClient.invalidateQueries({ queryKey: ['dashboardEvents'], refetchType: 'all' }),
    queryClient.invalidateQueries({ queryKey: ['adminDashboard'], refetchType: 'all' }),
    queryClient.invalidateQueries({ queryKey: ['adminPendingSummary'], refetchType: 'all' }),
    queryClient.invalidateQueries({ queryKey: ['adminEventsList'], refetchType: 'all' }),
    queryClient.invalidateQueries({ queryKey: ['adminEvents'], refetchType: 'all' }),

    // 3. Society Views & Dashboards
    queryClient.invalidateQueries({ queryKey: ['mySocietyEventsList'], refetchType: 'all' }),
    queryClient.invalidateQueries({ queryKey: ['myEvents'], refetchType: 'all' }),
    queryClient.invalidateQueries({ queryKey: ['societyEvents'], refetchType: 'all' }),
    queryClient.invalidateQueries({ queryKey: ['societyDashboard'], refetchType: 'all' }),

    // 4. Advisor Views
    queryClient.invalidateQueries({ queryKey: ['advisorEventsQueue'], refetchType: 'all' }),
    queryClient.invalidateQueries({ queryKey: ['advisorEvents'], refetchType: 'all' }),
    queryClient.invalidateQueries({ queryKey: ['advisorDashboard'], refetchType: 'all' }),

    // 5. Public Views & Feeds
    queryClient.invalidateQueries({ queryKey: ['campusFeed'], refetchType: 'all' }),
    queryClient.invalidateQueries({ queryKey: ['events'], refetchType: 'all' }),
    queryClient.invalidateQueries({ queryKey: ['publicEvents'], refetchType: 'all' }),
    queryClient.invalidateQueries({ queryKey: ['publicCalendarEvents'], refetchType: 'all' }),
    queryClient.invalidateQueries({ queryKey: ['publicListEvents'], refetchType: 'all' }),
    queryClient.invalidateQueries({ queryKey: ['publicSocietyEvents'], refetchType: 'all' }),
  ];

  await Promise.all(invalidations);
};

/**
 * Optimistically updates the client cache when an event is updated or resubmitted,
 * ensuring the Society Dashboard and event lists immediately reflect the updated status
 * (e.g. 'PENDING_ADMIN' or 'PENDING_ADVISOR') without requiring a manual page refresh.
 */
export const optimisticUpdateEvent = (
  queryClient: QueryClient,
  updatedEvent: any,
): void => {
  if (!updatedEvent || !updatedEvent.id) return;
  const eventId = updatedEvent.id;

  // 1. Single Event Detail
  queryClient.setQueryData(['event', eventId], (old: any) => {
    if (!old) return updatedEvent;
    return { ...old, ...updatedEvent };
  });

  // 2. Society Dashboard (instantly updates pendingEvents array with 0ms delay)
  queryClient.setQueriesData(
    { queryKey: ['societyDashboard'] },
    (old: any) => {
      if (!old) return old;
      let updatedPending = Array.isArray(old.pendingEvents) ? [...old.pendingEvents] : [];
      const index = updatedPending.findIndex((e: any) => e.id === eventId);
      if (index >= 0) {
        updatedPending[index] = { ...updatedPending[index], ...updatedEvent };
      } else if (
        ['PENDING_ADVISOR', 'PENDING_ADMIN', 'CHANGES_REQUESTED'].includes(
          updatedEvent.approvalStatus,
        )
      ) {
        updatedPending = [updatedEvent, ...updatedPending];
      }

      const updatedUpcoming = Array.isArray(old.upcomingEvents)
        ? old.upcomingEvents.map((e: any) => (e.id === eventId ? { ...e, ...updatedEvent } : e))
        : old.upcomingEvents;

      const updatedRecent = Array.isArray(old.recentEvents)
        ? old.recentEvents.map((e: any) => (e.id === eventId ? { ...e, ...updatedEvent } : e))
        : old.recentEvents;

      return {
        ...old,
        pendingEvents: updatedPending,
        upcomingEvents: updatedUpcoming,
        recentEvents: updatedRecent,
      };
    },
  );

  // 3. Society Events List
  queryClient.setQueriesData(
    { queryKey: ['mySocietyEventsList'] },
    (old: any) => {
      if (!old) return old;
      if (Array.isArray(old)) {
        return old.map((e: any) => (e.id === eventId ? { ...e, ...updatedEvent } : e));
      }
      if (Array.isArray(old.items)) {
        return {
          ...old,
          items: old.items.map((e: any) => (e.id === eventId ? { ...e, ...updatedEvent } : e)),
        };
      }
      return old;
    },
  );
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
