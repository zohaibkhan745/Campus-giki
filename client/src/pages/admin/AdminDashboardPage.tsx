import { resolveImageUrl } from '@/lib/utils';
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { UpcomingEventIcon } from '@/components/icons/UpcomingEventIcon';
import { SocietyIcon } from '@/components/icons/SocietyIcon';
import {
  Shield,
  Building2,
  Clock,
  FileText,
  Calendar,
  UserPlus,
  ArrowRight,
  MapPin,
  LogOut,
  Megaphone,
  MessageSquare,
  MicVocal,
  CalendarDays,
  Settings,
  Users,
  Ban
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { adminService } from '@/services/admin.service';
import { Alert } from '@/components/ui/Alert';
import { MakeAnnouncementDialog } from '@/components/feed/MakeAnnouncementDialog';
import { usePendingCounts } from '@/hooks/usePendingCounts';
import { BannerHeader } from '@/components/layout/BannerHeader';
import { CustomDropdown } from '@/components/ui/CustomDropdown';
import { EventGrid } from '@/components/admin/FlippableAdminEventCard';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';

export const AdminDashboardPage: React.FC = () => {
  const { user, logout } = useAuth();
  const [isAnnouncementDialogOpen, setIsAnnouncementDialogOpen] = useState(false);
  const { pendingEventsCount, pendingPlansCount } = usePendingCounts();
  const {
    data,
    isLoading,
    isError,
    error: dashboardError,
    refetch,
  } = useQuery({
    queryKey: ['adminDashboard'],
    queryFn: adminService.getDashboardData,
    staleTime: 30000,
  });

  const stats = data?.statistics;
  
  const [statusFilter, setStatusFilter] = useState<string>('PENDING_ADMIN');
  const {
    data: eventsData,
    isLoading: eventsLoading,
    isError: isEventsError,
    error: eventsError,
    refetch: refetchEvents,
  } = useQuery({
    queryKey: ['dashboardEvents', statusFilter],
    queryFn: () => adminService.getAllEvents({ status: statusFilter as any, limit: 4 }),
    staleTime: 30000,
  });
  
  const pendingEvents = eventsData?.items || [];
  const isPendingLoading = isLoading || eventsLoading;

  const upcomingEvents = data?.upcomingEventsPreview || [];

  return (
    <div className="w-full">
      <BannerHeader title={user?.fullName || "Dean Student Affairs"} logoUrl={user?.avatarUrl ? resolveImageUrl(user.avatarUrl) : "/default-dsa.png"} fallbackImage="/default-dsa.png" editUrl="/settings" />
      <div className="w-full max-w-[1440px] mx-auto space-y-6 text-left py-4 px-4">
        {/* Actions Row */}
        <div className="flex justify-end mb-4">
          <div className="grid grid-cols-2 md:flex md:flex-wrap lg:flex-nowrap md:justify-end gap-2 md:gap-3 w-full md:w-auto shrink-0 mt-4 md:mt-0">
                    <Link
            to="/admin/societies/create"
            className="flex justify-center items-center gap-1.5 px-4 py-2.5 bg-surface hover:bg-surface-hover text-text-primary border border-border-medium rounded-xl text-sm font-bold transition-colors shadow-sm"
          >
            <UserPlus className="w-4 h-4" />
            <span>Onboard Society</span>
          </Link>
          {user?.dsaRole === 'DIRECTOR' && (
            <Link
              to="/admin/staff"
              className="flex justify-center items-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-bold transition-colors shadow-lg shadow-indigo-600/30"
            >
              <Users className="w-4 h-4" />
              <span>DDSA Staff</span>
            </Link>
          )}
          <button
            onClick={() => setIsAnnouncementDialogOpen(true)}
            className="flex justify-center items-center gap-1.5 px-4 py-2.5 bg-text-primary text-text-inverse hover:opacity-90 rounded-xl text-sm font-bold transition-all shadow-md cursor-pointer"
          >
            <Megaphone className="w-4 h-4" />
            <span>Make Post</span>
          </button>
          <Link
            to="/settings"
            className="flex justify-center items-center gap-1.5 px-4 py-2.5 bg-surface-hover hover:bg-surface text-text-primary border border-border-medium rounded-xl text-sm font-bold transition-all"
          >
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </Link>
          <button
            onClick={logout}
            className="flex justify-center items-center gap-1.5 px-4 py-2.5 bg-red-600 hover:bg-red-700 border-none rounded-xl text-white text-sm font-bold transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Log out</span>
          </button>
        </div>
      </div>

      {isError && (
        <ErrorState
          error={dashboardError}
          onRetry={refetch}
          compact
          className="mb-4"
        />
      )}

      {/* 2. Command Center */}
      <div className="bg-surface-glass backdrop-blur-[20px] p-6 rounded-[18px] border border-border-medium shadow-elevation-1 space-y-5">
        <h3 className="font-extrabold text-lg text-text-primary flex items-center gap-2">Dashboard</h3>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <Link
            to="/admin/societies"
            className="flex flex-col items-center justify-center gap-2 p-4 bg-surface-hover hover:bg-surface text-text-primary border border-border-medium rounded-xl font-bold transition-transform hover:-translate-y-1 shadow-sm"
          >
            <SocietyIcon className="w-6 h-6" />
            <span>Societies</span>
          </Link>
          <Link
            to="/admin/events"
            className="flex flex-col items-center justify-center gap-2 p-4 bg-surface-hover hover:bg-surface text-text-primary border border-border-medium rounded-xl font-bold transition-transform hover:-translate-y-1 shadow-sm relative"
          >
            {pendingEventsCount > 0 && (
              <span className="absolute top-2 right-2 flex items-center justify-center w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full shadow-sm animate-pulse">
                {pendingEventsCount > 9 ? '9+' : pendingEventsCount}
              </span>
            )}
            <MicVocal className="w-6 h-6" />
            <span>Events</span>
          </Link>
          <Link
            to="/admin/posts"
            className="flex flex-col items-center justify-center gap-2 p-4 bg-surface-hover hover:bg-surface text-text-primary border border-border-medium rounded-xl font-bold transition-transform hover:-translate-y-1 shadow-sm"
          >
            <MessageSquare className="w-6 h-6" />
            <span>Posts</span>
          </Link>
          <Link
            to="/admin/yearly-plans"
            className="flex flex-col items-center justify-center gap-2 p-4 bg-surface-hover hover:bg-surface text-text-primary border border-border-medium rounded-xl font-bold transition-transform hover:-translate-y-1 shadow-sm relative"
          >
            {pendingPlansCount > 0 && (
              <span className="absolute top-2 right-2 flex items-center justify-center w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full shadow-sm animate-pulse">
                {pendingPlansCount > 9 ? '9+' : pendingPlansCount}
              </span>
            )}
            <CalendarDays className="w-6 h-6" />
            <span>Yearly Plans</span>
          </Link>
          <Link
            to="/admin/advisors" className="col-span-2 md:col-span-1 flex flex-col items-center justify-center gap-2 p-4 bg-surface-hover hover:bg-surface text-text-primary border border-border-medium rounded-xl font-bold transition-transform hover:-translate-y-1 shadow-sm"
          >
            <Users className="w-6 h-6" />
            <span>Advisors</span>
          </Link>
        </div>
      </div>

      

      <div className="flex flex-col gap-10 mt-8">
        {/* 1. Pending Event Proposals for DSA Review */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b-2 border-border-subtle pb-3 gap-3">
            <div>
              <div className="flex items-center gap-2 font-extrabold text-lg text-text-primary">
                <MicVocal className="w-5 h-5 text-indigo-400" />
                <h3>Pending Event Proposals for Review ({pendingEvents.length})</h3>
              </div>
              <p className="text-xs text-text-secondary mt-0.5">
                Review and approve society event proposals submitted for administrative clearance
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <CustomDropdown 
                className="w-auto min-w-[200px]"
                value={statusFilter}
                onChange={(e: any) => setStatusFilter(e.target.value)}
                options={[
                  { value: 'PENDING_ADMIN', label: 'Pending DSA Approval' },
                  { value: 'CHANGES_REQUESTED', label: 'Changes Requested' }
                ]}
              />
              <Link to="/admin/events" className="whitespace-nowrap px-4 py-2 bg-text-primary text-text-inverse border border-transparent rounded-xl text-sm font-bold shadow-md hover:opacity-90 transition-all">
                View All Events
              </Link>
            </div>
          </div>

          {isPendingLoading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="bg-surface-glass backdrop-blur-md p-5 rounded-cards border border-border-subtle transition-all shadow-elevation-1 animate-pulse space-y-2">
                  <div className="h-5 bg-border-subtle rounded w-1/3" />
                  <div className="h-4 bg-border-subtle rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : isEventsError ? (
            <ErrorState
              error={eventsError}
              onRetry={refetchEvents}
              compact
            />
          ) : pendingEvents.length === 0 ? (
            <EmptyState
              icon={Shield}
              title="No Event Proposals Pending Review"
              description={
                statusFilter === 'CHANGES_REQUESTED'
                  ? 'No events currently under requested revisions.'
                  : 'No event proposals are pending DSA administrative review.'
              }
              compact
            />
          ) : (
            <EventGrid events={pendingEvents.slice(0, 4)} reviewUrlBase="/admin/events" />
          )}
        </div>
      </div>

        <MakeAnnouncementDialog
        isOpen={isAnnouncementDialogOpen}
        onClose={() => setIsAnnouncementDialogOpen(false)}
      />
    </div>
    </div>
  );
};








