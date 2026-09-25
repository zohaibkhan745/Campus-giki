import React, { useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, CalendarDays, Menu } from 'lucide-react';
import { UpcomingEventIcon } from '@/components/icons/UpcomingEventIcon';
import { SocietyIcon } from '@/components/icons/SocietyIcon';
import { useAuth } from '@/hooks/useAuth';
import { useQueryClient } from '@tanstack/react-query';
import { feedService } from '@/services/feed.service';
import { eventService } from '@/services/event.service';
import { societyService } from '@/services/society.service';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

/**
 * Dock Navigation Specification
 * Conforms to Open-Closed Principle (OCP): new navigational destinations can be added
 * by configuration without modifying layout physics or animation cycles.
 */
export interface DockNavItem {
  readonly id: string;
  readonly label: string;
  readonly path: string;
  readonly icon: React.ReactElement;
  /**
   * If true, this item is only displayed when an authenticated session exists.
   */
  readonly requiresAuth?: boolean;
  /**
   * Route prefixes that designate this navigation item as active.
   */
  readonly activePrefixes?: readonly string[];
}

/**
 * Registry of all available navigation destinations.
 */
const NAV_ITEM_REGISTRY: readonly DockNavItem[] = [
  { id: 'home', label: 'Home', path: '/', icon: <Home /> },
  { id: 'upcoming', label: 'Upcoming', path: '/upcoming-events', icon: <UpcomingEventIcon /> },
  { id: 'calendar', label: 'Calendar', path: '/events', icon: <CalendarDays /> },
  { id: 'societies', label: 'Societies', path: '/societies', icon: <SocietyIcon /> },
  {
    id: 'dashboard',
    label: 'Dashboard',
    path: '/dashboard',
    icon: <Menu />,
    requiresAuth: true,
    activePrefixes: ['/dashboard', '/admin', '/advisor', '/society', '/settings'],
  },
] as const;

/**
 * Pure resolver function (Single Responsibility Principle)
 * Computes the visible navigation items given current authentication state.
 */
function resolveVisibleNavItems(items: readonly DockNavItem[], isAuthenticated: boolean): DockNavItem[] {
  return items.filter(item => !item.requiresAuth || isAuthenticated);
}

/**
 * Pure route-matcher function (DRY Principle)
 * Checks whether a navigation item matches the active browser path.
 */
function isNavItemActive(item: DockNavItem, currentPath: string): boolean {
  if (item.activePrefixes && item.activePrefixes.length > 0) {
    return item.activePrefixes.some(prefix => currentPath.startsWith(prefix));
  }
  if (item.path === '/') {
    return currentPath === '/';
  }
  return currentPath.startsWith(item.path);
}

export const DockNav: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const queryClient = useQueryClient();
  const hideRoutes = ['/society/setup', '/admin/settings', '/advisor/settings', '/dsa/settings', '/settings'];
  const isHidden = hideRoutes.some(route => location.pathname.includes(route));

  // Predictive pre-fetching on user intent (hover or touch)
  const handlePrefetch = (path: string) => {
    try {
      if (path === '/') {
        queryClient.prefetchInfiniteQuery({
          queryKey: ['campusFeed', 12],
          queryFn: ({ pageParam = 1 }) => feedService.getFeed({ page: pageParam, limit: 12 }),
          initialPageParam: 1,
        });
      } else if (path === '/upcoming-events') {
        queryClient.prefetchQuery({
          queryKey: ['events', 'upcoming'],
          queryFn: () => eventService.getAllPublicEvents({ from: new Date().toISOString(), limit: 50, page: 1 }),
        });
      } else if (path === '/events') {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        queryClient.prefetchQuery({
          queryKey: ['publicCalendarEvents', startOfMonth.toISOString(), endOfMonth.toISOString(), 'all', ''],
          queryFn: () => eventService.getAllPublicEvents({ 
            from: new Date(now.getFullYear(), now.getMonth(), -7).toISOString(), 
            to: new Date(now.getFullYear(), now.getMonth() + 1, 7).toISOString(), 
            limit: 150 
          }),
        });
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        queryClient.prefetchQuery({
          queryKey: ['publicListEvents', 'upcoming', ''],
          queryFn: () => eventService.getAllPublicEvents({ 
            from: today.toISOString(), 
            limit: 150 
          }),
        });
        queryClient.prefetchQuery({
          queryKey: ['societiesListForFilter'],
          queryFn: () => societyService.getPublicSocieties({ limit: 100 }),
        });
      } else if (path === '/societies') {
        queryClient.prefetchQuery({
          queryKey: ['publicSocieties', 1, '', '', ''],
          queryFn: () => societyService.getPublicSocieties({ page: 1, limit: 100 }),
        });
        queryClient.prefetchQuery({
          queryKey: ['categories'],
          queryFn: societyService.getCategories,
        });
      }
    } catch {
      // Speculative pre-fetch failure is safely non-blocking
    }
  };


  // Dynamically resolve navigation links based on user authentication state
  const visibleNavLinks = useMemo(
    () => resolveVisibleNavItems(NAV_ITEM_REGISTRY, !!user),
    [user]
  );

  if (isHidden) return null;

  return (
    <nav
      id="dock"
      aria-label="Bottom Navigation Dock"
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-3.5 py-2.5 rounded-full bg-surface-glass backdrop-blur-xl border border-border-medium shadow-[0_12px_36px_rgba(0,0,0,0.18)] dark:shadow-[0_12px_36px_rgba(0,0,0,0.6)] transition-all duration-300"
    >
      {visibleNavLinks.map((item) => {
        const active = isNavItemActive(item, location.pathname);

        return (
          <Link
            key={item.id}
            to={item.path}
            aria-label={item.label}
            onMouseEnter={() => handlePrefetch(item.path)}
            onTouchStart={() => handlePrefetch(item.path)}
            className={`group relative flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-full transition-all duration-200 ease-out ${
              active
                ? 'bg-text-primary text-text-inverse shadow-[0_4px_16px_rgba(0,0,0,0.15)] dark:shadow-[0_4px_16px_rgba(255,255,255,0.25)] scale-105'
                : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover hover:scale-110 hover:-translate-y-0.5 active:scale-95'
            }`}
          >
            {/* Tooltip */}
            <span className="absolute -top-10 left-1/2 -translate-x-1/2 px-2.5 py-1 text-[11px] font-semibold tracking-wide text-text-primary bg-surface-elevated border border-border-medium rounded-lg shadow-xl backdrop-blur-md opacity-0 pointer-events-none transition-all duration-150 group-hover:opacity-100 group-hover:-translate-y-1 whitespace-nowrap">
              {item.label}
            </span>

            {React.cloneElement(item.icon as any, {
              className: 'w-5 h-5 sm:w-5 sm:h-5 transition-transform duration-150',
              strokeWidth: active ? 2.3 : 1.8,
            })}
          </Link>
        );
      })}

      {/* Visual Separator */}
      <div className="w-px h-6 bg-border-medium mx-0.5 shrink-0" aria-hidden="true" />

      {/* Ergonomic One-Click Theme Toggle */}
      <ThemeToggle />
    </nav>
  );
};
