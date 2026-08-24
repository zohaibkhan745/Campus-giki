import { getSocietyLogo, getSocietyBanner } from '@/lib/utils';
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Navigate, Link } from 'react-router-dom';
import { UpcomingEventIcon } from '@/components/icons/UpcomingEventIcon';
import { SocietyIcon } from '@/components/icons/SocietyIcon';
import { useAuth } from '@/hooks/useAuth';
import { societyService } from '@/services/society.service';
import { DashboardSkeleton } from '@/components/dashboard/DashboardSkeleton';
import { DeleteEventDialog } from '@/components/events/DeleteEventDialog';
import { MakeAnnouncementDialog } from '@/components/feed/MakeAnnouncementDialog';
import { AdminDashboardPage } from '@/pages/admin/AdminDashboardPage';
import { AdvisorQueuePage } from '@/pages/advisor/AdvisorQueuePage';
import { BannerHeader } from '@/components/layout/BannerHeader';
import { DashboardAboutModal } from '@/components/ui/DashboardAboutModal';
import { Info } from 'lucide-react';
import type { EventItem } from '@/types/event.types';
import {
  UserCheck,
  Shield,
  Sparkles,
  Building2,
  Tag,
  Plus,
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Edit,
  Trash2,
  ExternalLink,
  History,
  TrendingUp,
  Award,
  CalendarDays,
  Globe,
  Mail,
  Zap,
  LogOut,
  AlertCircle,
  Megaphone,
  ArrowRight,
  MicVocal,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { user, logout } = useAuth();
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    title: string;
  } | null>(null);
  const [isAnnouncementDialogOpen, setIsAnnouncementDialogOpen] = useState(false);
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);

  // If DSA_ADMIN, render central DSA Dashboard
  if (user?.role === 'DSA_ADMIN') {
    return <AdminDashboardPage />;
  }

  // If ADVISOR, render central Advisor Queue Dashboard
  if (user?.role === 'ADVISOR') {
    return <AdvisorQueuePage />;
  }

  // Single aggregated dashboard query
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['societyDashboard'],
    queryFn: societyService.getDashboard,
    enabled: user?.role === 'SOCIETY',
  });

  const profile = dashboardData?.profile;
  const stats = dashboardData?.statistics;
  const upcomingEvents = dashboardData?.upcomingEvents || [];
  const recentEvents = dashboardData?.recentEvents || [];
  const pendingEvents = dashboardData?.pendingEvents || [];
  const yearlyPlan = dashboardData?.yearlyPlanSummary;

  const changesRequestedEventsCount = pendingEvents.filter(e => e.approvalStatus === 'CHANGES_REQUESTED').length;
  const changesRequestedPlanCount = yearlyPlan?.status === 'CHANGES_REQUESTED' ? 1 : 0;

  // First-login redirect if profile setup incomplete
  if (user?.role === 'SOCIETY' && !isLoading) {
    if (!profile || !profile.isSetupComplete) {
      return <Navigate to="/society/setup" replace />;
    }
  }

  if (user?.role === 'SOCIETY' && isLoading) {
    return <DashboardSkeleton />;
  }

  

  return (
    <div className="w-full">
      <BannerHeader title={profile?.name || user?.fullName || 'User'} subtitle={profile?.advisor?.user ? `Advisor: ${profile.advisor.user.fullName}` : undefined} logoUrl={getSocietyLogo(profile?.logoUrl)} bannerUrl={getSocietyBanner(profile?.bannerUrl)} socials={{ instagram: profile?.instagram, facebook: profile?.facebook, linkedin: profile?.linkedin, website: profile?.website }} />
      <div className="space-y-6 text-left py-4 px-4">
        {/* Actions Row */}
        <div className="flex justify-end mb-4">
          <div className="grid grid-cols-3 md:flex md:flex-wrap lg:flex-nowrap md:justify-end gap-2 md:gap-3 w-full md:w-auto shrink-0 mt-4 md:mt-0">
          <button
              onClick={() => setIsAboutModalOpen(true)}
              className="flex justify-center items-center gap-1.5 px-4 py-2.5 bg-white hover:bg-gray-100 text-gray-900 border-none rounded-xl text-sm font-bold transition-colors shadow-lg"
            >
              <Info className="w-4 h-4" />
              <span>About Society</span>
            </button>
            <Link
            to="/society/setup"
            className="flex justify-center items-center gap-1.5 px-4 py-2.5 bg-white hover:bg-gray-100 text-gray-900 border-none rounded-xl text-sm font-bold transition-colors"
          >
            <Edit className="w-4 h-4" />
              <span>Manage Info</span>
            </Link>
          <button
            onClick={logout}
            className="flex justify-center items-center gap-1.5 px-4 py-2.5 bg-red-500 hover:bg-red-600 border-none rounded-xl text-white text-sm font-bold transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Log out</span>
          </button>
        </div>
      </div>

      {user?.role === 'SOCIETY' && profile && (
        <>
          {/* 2. Dashboard: Actions & Stats */}
            <div className="w-full relative z-1 p-6 md:p-8 rounded-[18px] bg-white/[0.08] backdrop-blur-[20px] border border-white/20 shadow-[0_12px_40px_rgba(0,0,0,0.4)] text-white space-y-6">
              
              {/* Create Event/Post */}
              <div>
                <h3 className="font-extrabold text-lg text-white flex items-center gap-2 mb-4">
                  Create Event/Post
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <Link
                    to="/society/posts"
                    className="flex flex-col items-center justify-center gap-2 p-4 bg-transparent hover:bg-white/10 text-white rounded-xl font-bold transition-transform hover:-translate-y-1 shadow-[0_4px_12px_rgba(0,0,0,0.2)] border border-white/20"
                  >
                    <Megaphone className="w-6 h-6" />
                    <span>Posts</span>
                  </Link>
                  <Link
                    to="/events/create"
                    className="flex flex-col items-center justify-center gap-2 p-4 bg-transparent hover:bg-white/10 text-white rounded-xl font-bold transition-transform hover:-translate-y-1 shadow-[0_4px_12px_rgba(0,0,0,0.2)] border border-white/20"
                  >
                    <Plus className="w-6 h-6" />
                    <span>Create Event</span>
                  </Link>
                </div>
              </div>

              {/* Separator Line */}
              <div className="w-full h-px bg-white/10"></div>

              {/* Manage Events */}
              <div>
                <h3 className="font-extrabold text-lg text-white flex items-center gap-2 mb-4">
                  Manage Events
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <Link
                    to="/society/events"
                    className="relative flex flex-col items-center justify-center gap-2 p-4 bg-transparent hover:bg-white/10 text-white rounded-xl font-bold transition-transform hover:-translate-y-1 shadow-[0_4px_12px_rgba(0,0,0,0.2)] border border-white/20"
                  >
                    <MicVocal className="w-6 h-6" />
                    <span>Events</span>
                    {changesRequestedEventsCount > 0 && (
                      <span className="absolute -top-2 -right-2 flex items-center justify-center w-6 h-6 bg-ember-glow text-pure-white text-xs rounded-full shadow-sm animate-pulse border-2 border-pure-white">
                        {changesRequestedEventsCount > 9 ? '9+' : changesRequestedEventsCount}
                      </span>
                    )}
                  </Link>
                  <Link
                    to="/society/calendar"
                    className="relative flex flex-col items-center justify-center gap-2 p-4 bg-transparent hover:bg-white/10 text-white rounded-xl font-bold transition-transform hover:-translate-y-1 shadow-[0_4px_12px_rgba(0,0,0,0.2)] border border-white/20"
                  >
                    <CalendarDays className="w-6 h-6" />
                    <span>Annual Calendar</span>
                    {changesRequestedPlanCount > 0 && (
                      <span className="absolute -top-2 -right-2 flex items-center justify-center w-6 h-6 bg-ember-glow text-pure-white text-xs rounded-full shadow-sm animate-pulse">
                        !
                      </span>
                    )}
                  </Link>
                </div>
              </div>
            </div>

            {/* 3. Focused Events Overview */}
          <div className="bg-white/[0.08] backdrop-blur-[20px] p-6 rounded-[18px] border border-white/20 shadow-[0_12px_40px_rgba(0,0,0,0.4)] flex flex-col gap-6">
            
            {/* Under Review & Revisions Column */}
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3">
                <div className="flex items-center gap-2 font-extrabold text-lg text-white">
                  {changesRequestedEventsCount > 0 ? (
                    <AlertCircle className="w-5 h-5 text-ember-glow animate-pulse" />
                  ) : (
                    <Clock className="w-5 h-5 text-white" />
                  )}
                  <h3>Under Review & Revisions ({pendingEvents.length})</h3>
                </div>
              </div>

              {pendingEvents.length === 0 ? (
                <div className="bg-white/[0.08] backdrop-blur-[20px] shadow-[0_12px_40px_rgba(0,0,0,0.4)] p-10 rounded-[18px] text-center text-gray-400 space-y-3 flex flex-col items-center border border-white/20">
                  <Shield className="w-12 h-12 text-gray-400 opacity-30" />
                  <p className="font-bold text-sm">You're all caught up! No events pending approval or revisions.</p>
                </div>
              ) : (
                <div className="cards-container">
                    {pendingEvents.slice(0, 4).map((event) => <EventCard key={event.id} item={{...event, type: 'event'} as any} />)}
                  </div>
              )}
            </div>

            <hr className="border-white/10" />


            {/* Next Upcoming Column */}
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3">
                <div className="flex items-center gap-2 font-extrabold text-lg text-white">
                  <UpcomingEventIcon className="w-5 h-5 text-forest-ink" />
                  <h3>Next Upcoming ({upcomingEvents.length})</h3>
                </div>
                {/* Fallback to calendar if there's no general events page for societies */}
                <Link to="/society/calendar" className="text-sm font-bold text-white hover:text-forest-ink transition-colors underline underline-offset-2">
                  View Calendar
                </Link>
              </div>

              {upcomingEvents.length === 0 ? (
                <div className="bg-white/[0.08] backdrop-blur-[20px] shadow-[0_12px_40px_rgba(0,0,0,0.4)] p-10 rounded-[18px] text-center text-gray-400 space-y-3 flex flex-col items-center border border-white/20">
                  <UpcomingEventIcon className="w-12 h-12 text-gray-400 opacity-30" />
                  <p className="font-bold text-sm">No upcoming events scheduled right now.</p>
                </div>
              ) : (
                <div className="cards-container">
                    {upcomingEvents.slice(0, 3).map((event) => <EventCard key={event.id} item={{...event, type: 'event'} as any} />)}
                  </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Non-society user dashboard fallback */}
      {user?.role !== 'SOCIETY' && (
        <div className="cards-container grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 w-full mx-auto">
          <div className="bg-white/[0.08] backdrop-blur-[20px] shadow-[0_12px_40px_rgba(0,0,0,0.4)] p-6 rounded-[18px] space-y-3 border border-white/20">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-transparent border border-forest-ink text-forest-ink rounded-xl">
                <UserCheck className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-white">Session Verified</h3>
                <p className="text-xs text-gray-400">Authenticated via NestJS JWT Security</p>
              </div>
              <button
                onClick={logout}
                className="flex justify-center items-center gap-1.5 px-3 py-1.5 bg-transparent border border-white/10 hover:bg-red-500/20 border border-red-500/20 rounded-xl text-red-400 text-xs font-semibold transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Log out</span>
              </button>
            </div>
            <p className="text-sm text-white font-medium pt-2">
              Your JWT bearer token is securely stored and verified against PostgreSQL.
            </p>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <DeleteEventDialog
        isOpen={!!deleteTarget}
        eventId={deleteTarget?.id || null}
        eventTitle={deleteTarget?.title || null}
        onClose={() => setDeleteTarget(null)}
      />

      <MakeAnnouncementDialog
        isOpen={isAnnouncementDialogOpen}
        onClose={() => setIsAnnouncementDialogOpen(false)}
      />
        {isAboutModalOpen && <DashboardAboutModal onClose={() => setIsAboutModalOpen(false)} profile={profile} />}
      </div>
    </div>
  );
};




