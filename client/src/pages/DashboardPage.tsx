import { getSocietyLogo, getSocietyBanner } from '@/lib/utils';
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Navigate, Link } from 'react-router-dom';
import { UpcomingEventIcon } from '@/components/icons/UpcomingEventIcon';
import { SocietyIcon } from '@/components/icons/SocietyIcon';
import { useAuth } from '@/hooks/useAuth';
import { EventCard } from '@/components/feed/EventCard';
import { societyService } from '@/services/society.service';
import { DashboardSkeleton } from '@/components/dashboard/DashboardSkeleton';
import { DeleteEventDialog } from '@/components/events/DeleteEventDialog';
const AdminDashboardPage = React.lazy(() =>
  import('@/pages/admin/AdminDashboardPage').then((m) => ({ default: m.AdminDashboardPage })),
);
const AdvisorQueuePage = React.lazy(() =>
  import('@/pages/advisor/AdvisorQueuePage').then((m) => ({ default: m.AdvisorQueuePage })),
);
import { BannerHeader } from '@/components/layout/BannerHeader';
import { Info, FileText } from 'lucide-react';
const VenuePermissionSlipModal = React.lazy(() =>
  import('@/components/events/VenuePermissionSlipModal').then((m) => ({ default: m.VenuePermissionSlipModal })),
);
const UploadSignedSlipModal = React.lazy(() =>
  import('@/components/events/UploadSignedSlipModal').then((m) => ({ default: m.UploadSignedSlipModal })),
);
const DashboardAboutModal = React.lazy(() =>
  import('@/components/dashboard/DashboardAboutModal').then((m) => ({ default: m.DashboardAboutModal })),
);
import { ErrorState } from '@/components/ui';
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
  GraduationCap,
} from 'lucide-react';

const StudentDashboardView: React.FC<{ user: any; logout: () => void }> = ({ user, logout }) => {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-left">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-surface-glass border border-border-medium p-8 sm:p-10 shadow-elevation-2 backdrop-blur-xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-brand-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/15 border border-blue-400/25 text-blue-600 dark:text-blue-400 text-xs font-semibold uppercase tracking-wider">
              <GraduationCap className="w-4 h-4" />
              <span>GIKI Student Portal</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-text-primary tracking-tight">
              Welcome back, {user?.fullName || 'Student'}
            </h1>
            <p className="text-text-secondary text-sm sm:text-base max-w-xl">
              Explore upcoming campus events, connect with student societies, and stay up to date with live announcements from the Directorate of Student Affairs.
            </p>
          </div>
          <button
            onClick={logout}
            className="self-start md:self-center inline-flex items-center gap-2 px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-xl text-red-600 dark:text-red-400 text-sm font-semibold transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Quick Navigation Hub */}
      <div>
        <h2 className="text-xl font-bold text-text-primary mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-500" />
          <span>Campus Quick Links</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            to="/"
            className="group p-6 rounded-2xl bg-surface-glass hover:bg-surface-hover border border-border-medium shadow-elevation-1 transition-all flex flex-col justify-between space-y-4"
          >
            <div className="p-3 bg-blue-500/15 text-blue-500 rounded-xl w-fit group-hover:scale-110 transition-transform">
              <Megaphone className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-text-primary group-hover:text-blue-500 transition-colors flex items-center justify-between">
                Campus Feed
                <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </h3>
              <p className="text-xs text-text-secondary mt-1">Live campus announcements from the DSA</p>
            </div>
          </Link>

          <Link
            to="/upcoming-events"
            className="group p-6 rounded-2xl bg-surface-glass hover:bg-surface-hover border border-border-medium shadow-elevation-1 transition-all flex flex-col justify-between space-y-4"
          >
            <div className="p-3 bg-emerald-500/15 text-emerald-500 rounded-xl w-fit group-hover:scale-110 transition-transform">
              <UpcomingEventIcon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-text-primary group-hover:text-emerald-500 transition-colors flex items-center justify-between">
                Upcoming Events
                <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </h3>
              <p className="text-xs text-text-secondary mt-1">Competitions, workshops, and galas</p>
            </div>
          </Link>

          <Link
            to="/events"
            className="group p-6 rounded-2xl bg-surface-glass hover:bg-surface-hover border border-border-medium shadow-elevation-1 transition-all flex flex-col justify-between space-y-4"
          >
            <div className="p-3 bg-purple-500/15 text-purple-500 rounded-xl w-fit group-hover:scale-110 transition-transform">
              <CalendarDays className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-text-primary group-hover:text-purple-500 transition-colors flex items-center justify-between">
                Campus Calendar
                <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </h3>
              <p className="text-xs text-text-secondary mt-1">Interactive monthly and weekly schedule</p>
            </div>
          </Link>

          <Link
            to="/societies"
            className="group p-6 rounded-2xl bg-surface-glass hover:bg-surface-hover border border-border-medium shadow-elevation-1 transition-all flex flex-col justify-between space-y-4"
          >
            <div className="p-3 bg-amber-500/15 text-amber-500 rounded-xl w-fit group-hover:scale-110 transition-transform">
              <SocietyIcon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-text-primary group-hover:text-amber-500 transition-colors flex items-center justify-between">
                Societies Directory
                <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </h3>
              <p className="text-xs text-text-secondary mt-1">Explore and contact campus societies</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Account Info card */}
      <div className="p-6 rounded-2xl bg-surface-glass border border-border-medium shadow-elevation-1 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-success/15 text-success border border-success/25">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-bold text-text-primary">{user?.email}</div>
            <div className="text-xs text-text-secondary">Authenticated Student Account • GIKI Campus Network</div>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-success bg-success/10 px-3 py-1.5 rounded-lg border border-success/20">
          <Shield className="w-3.5 h-3.5" />
          <span>Active Student Session</span>
        </div>
      </div>
    </div>
  );
};

export const DashboardPage: React.FC = () => {
  const { user, logout } = useAuth();
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    title: string;
  } | null>(null);
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
  const [selectedSlipEvent, setSelectedSlipEvent] = useState<EventItem | null>(null);
  const [selectedUploadEvent, setSelectedUploadEvent] = useState<EventItem | null>(null);

  // Single aggregated dashboard query
  const { data: dashboardData, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['societyDashboard'],
    queryFn: societyService.getDashboard,
    enabled: user?.role === 'SOCIETY',
  });

  // If DSA_ADMIN, render central DSA Dashboard
  if (user?.role === 'DSA_ADMIN') {
    return (
      <React.Suspense fallback={<DashboardSkeleton />}>
        <AdminDashboardPage />
      </React.Suspense>
    );
  }

  // If ADVISOR, render central Advisor Queue Dashboard
  if (user?.role === 'ADVISOR') {
    return (
      <React.Suspense fallback={<DashboardSkeleton />}>
        <AdvisorQueuePage />
      </React.Suspense>
    );
  }

  // If STUDENT, render dedicated Student Dashboard
  if (user?.role === 'STUDENT') {
    return <StudentDashboardView user={user} logout={logout} />;
  }

  // Society Loading State
  if (user?.role === 'SOCIETY' && isLoading) {
    return <DashboardSkeleton />;
  }

  // Society Error State (Backend down / network error / 500)
  if (user?.role === 'SOCIETY' && isError) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4">
        <ErrorState
          error={error}
          onRetry={refetch}
          secondaryAction={{
            label: 'View Home Feed',
            href: '/',
          }}
        />
      </div>
    );
  }

  const profile = dashboardData?.profile;
  const stats = dashboardData?.statistics;
  const upcomingEvents = dashboardData?.upcomingEvents || [];
  const recentEvents = dashboardData?.recentEvents || [];
  const pendingEvents = dashboardData?.pendingEvents || [];
  const yearlyPlan = dashboardData?.yearlyPlanSummary;

  const changesRequestedEventsCount = pendingEvents.filter(e => e.approvalStatus === 'CHANGES_REQUESTED' || e.approvalStatus === 'APPROVED' || e.approvalStatus === 'REJECTED').length;
  const changesRequestedPlanCount = (yearlyPlan?.status === 'CHANGES_REQUESTED' || yearlyPlan?.editRequestStatus === 'APPROVED' || yearlyPlan?.editRequestStatus === 'REJECTED') ? 1 : 0;

  // Filter approved events requiring physical venue clearance slip
  const allApprovedEvents = [
    ...pendingEvents.filter((e: any) => e.approvalStatus === 'APPROVED'),
    ...upcomingEvents.filter((e: any) => e.approvalStatus === 'PUBLISHED' || e.approvalStatus === 'APPROVED'),
    ...recentEvents.filter((e: any) => e.approvalStatus === 'PUBLISHED' || e.approvalStatus === 'APPROVED'),
  ];
  const uniqueApprovedEvents = Array.from(new Map(allApprovedEvents.map(e => [e.id, e])).values());
  const venueClearancePendingEvents = uniqueApprovedEvents.filter(
    (e: any) => !e.signedVenueSlipUrl || e.venueClearanceStatus === 'PENDING_UPLOAD' || e.venueClearanceStatus === 'REJECTED'
  );

  // First-login redirect if profile setup incomplete
  if (user?.role === 'SOCIETY') {
    if (!profile || !profile.isSetupComplete) {
      return <Navigate to="/society/setup" replace />;
    }
  }

  

  return (
    <div className="w-full">
      <BannerHeader 
        title={profile?.name || user?.fullName || 'User'} 
        subtitle={profile?.advisor?.user ? `Advisor: ${profile.advisor.user.fullName}` : undefined} 
        logoUrl={getSocietyLogo(profile?.logoUrl)} 
        bannerUrl={getSocietyBanner(profile?.bannerUrl)} 
        socials={{ instagram: profile?.instagram, facebook: profile?.facebook, linkedin: profile?.linkedin, website: profile?.website }} 
        editUrl="/society/setup"
      />
      <div className="space-y-6 text-left py-4 px-4">
        <div className="flex flex-wrap justify-end gap-2 md:gap-3 mb-4 w-full md:w-auto shrink-0">
          <button
            onClick={() => setIsAboutModalOpen(true)}
            className="flex justify-center items-center gap-1.5 px-4 py-2.5 bg-surface hover:bg-surface-hover text-text-primary border border-border-medium rounded-xl text-sm font-bold transition-colors shadow-elevation-1 cursor-pointer"
          >
            <Info className="w-4 h-4" />
            <span>About Society</span>
          </button>
          <Link
            to="/society/setup"
            className="flex justify-center items-center gap-1.5 px-4 py-2.5 bg-surface hover:bg-surface-hover text-text-primary border border-border-medium rounded-xl text-sm font-bold transition-colors shadow-elevation-1 cursor-pointer"
          >
            <Edit className="w-4 h-4" />
            <span>Manage Info</span>
          </Link>
          <button
            onClick={logout}
            className="flex justify-center items-center gap-1.5 px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-xl text-red-600 dark:text-red-400 text-sm font-bold transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Log out</span>
          </button>
        </div>

      {user?.role === 'SOCIETY' && profile && (
        <>
          {/* 2. Dashboard: Actions & Stats */}
          {/* 2. Dashboard: Actions & Stats */}
            <div className="w-full relative z-1 p-6 md:p-8 rounded-[18px] bg-surface-glass backdrop-blur-xl border border-border-medium shadow-elevation-1 text-text-primary space-y-6">
              
              {/* Create Event */}
              <div>
                <h3 className="font-extrabold text-lg text-text-primary flex items-center gap-2 mb-4">
                  Create Event
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  <Link
                    to="/events/create"
                    className="flex flex-col items-center justify-center gap-2 p-4 bg-surface-hover/60 hover:bg-surface-hover text-text-primary rounded-xl font-bold transition-transform hover:-translate-y-1 shadow-elevation-1 border border-border-medium"
                  >
                    <Plus className="w-6 h-6 text-brand-primary" />
                    <span>Create Event</span>
                  </Link>
                </div>
              </div>

              {/* Separator Line */}
              <div className="w-full h-px bg-border-subtle"></div>

              {/* Manage Events */}
              <div>
                <h3 className="font-extrabold text-lg text-text-primary flex items-center gap-2 mb-4">
                  Manage Events
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <Link
                    to="/society/events"
                    className="relative flex flex-col items-center justify-center gap-2 p-4 bg-surface-hover/60 hover:bg-surface-hover text-text-primary rounded-xl font-bold transition-transform hover:-translate-y-1 shadow-elevation-1 border border-border-medium"
                  >
                    <MicVocal className="w-6 h-6 text-brand-primary" />
                    <span>Events</span>
                    {changesRequestedEventsCount > 0 && (
                      <span className="absolute -top-2 -right-2 flex items-center justify-center w-6 h-6 bg-red-500 text-white text-xs rounded-full shadow-sm animate-pulse border-2 border-surface">
                        {changesRequestedEventsCount > 9 ? '9+' : changesRequestedEventsCount}
                      </span>
                    )}
                  </Link>
                  <Link
                    to="/society/calendar"
                    className="relative flex flex-col items-center justify-center gap-2 p-4 bg-surface-hover/60 hover:bg-surface-hover text-text-primary rounded-xl font-bold transition-transform hover:-translate-y-1 shadow-elevation-1 border border-border-medium"
                  >
                    <CalendarDays className="w-6 h-6 text-brand-secondary" />
                    <span>Annual Calendar</span>
                    {changesRequestedPlanCount > 0 && (
                      <span className="absolute -top-2 -right-2 flex items-center justify-center w-6 h-6 bg-red-500 text-white text-xs rounded-full shadow-sm animate-pulse">
                        !
                      </span>
                    )}
                  </Link>
                </div>
              </div>
            </div>

            {/* Venue Clearance Required Banner */}
            {venueClearancePendingEvents.length > 0 && (
              <div className="p-6 rounded-[18px] bg-surface-glass border border-amber-500/30 text-text-primary space-y-4 shadow-elevation-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5 font-extrabold text-base text-amber-500">
                    <FileText className="w-5 h-5" />
                    <span>Physical Venue Clearance Required ({venueClearancePendingEvents.length})</span>
                  </div>
                  <span className="text-xs px-2.5 py-1 bg-amber-500/15 text-amber-600 dark:text-amber-400 font-bold rounded-lg border border-amber-500/30">
                    Action Required
                  </span>
                </div>
                <p className="text-xs text-text-secondary leading-relaxed max-w-3xl">
                  The following approved events require official physical clearance from the <strong>PS to Dean / Dean&apos;s Office</strong> for the allocated venue. Print the official slip, obtain the physical signature and stamp, and upload the signed copy.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                  {venueClearancePendingEvents.map((ev: any) => (
                    <div key={ev.id} className="p-4 bg-surface/90 backdrop-blur-md rounded-xl border border-border-subtle flex flex-col justify-between gap-3 shadow-sm">
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="font-bold text-sm text-text-primary truncate">{ev.title}</h4>
                          <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded bg-amber-500/20 text-amber-600 dark:text-amber-300 shrink-0">
                            {ev.venueClearanceStatus === 'REJECTED' ? 'Re-upload Required' : 'Awaiting PS Signature'}
                          </span>
                        </div>
                        <p className="text-xs text-text-secondary mt-1 flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                          <span>Venue: <strong className="text-text-primary">{ev.venue}</strong></span>
                        </p>
                        <p className="text-[11px] text-text-muted mt-0.5">
                          {new Date(ev.eventDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })} • {ev.startTime} - {ev.endTime}
                        </p>
                        {ev.venueClearanceNotes && (
                          <p className="text-[11px] text-red-500 mt-1.5 italic bg-red-500/10 p-1.5 rounded border border-red-500/20">
                            DSA Note: {ev.venueClearanceNotes}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 pt-2 border-t border-border-subtle">
                        <button
                          type="button"
                          onClick={() => setSelectedSlipEvent(ev)}
                          className="flex-1 py-2 px-3 bg-surface-hover hover:bg-surface text-text-primary border border-border-medium rounded-xl text-xs font-bold transition-colors text-center cursor-pointer"
                        >
                          Print Slip (PDF)
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedUploadEvent(ev)}
                          className="flex-1 py-2 px-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition-colors text-center cursor-pointer"
                        >
                          Upload Signed Slip
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 3. Focused Events Overview */}
          <div className="flex flex-col gap-6 mt-8">
            
            {/* Under Review & Revisions Column */}
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3">
                <div className="flex items-center gap-2 font-extrabold text-lg text-text-primary">
                  {changesRequestedEventsCount > 0 ? (
                    <AlertCircle className="w-5 h-5 text-ember-glow animate-pulse" />
                  ) : (
                    <Clock className="w-5 h-5 text-text-secondary" />
                  )}
                  <h3>Under Review & Revisions ({pendingEvents.length})</h3>
                </div>
              </div>

              {pendingEvents.length === 0 ? (
                <div className="bg-surface/50 p-10 rounded-[18px] border border-border-subtle text-center text-text-muted space-y-3 flex flex-col items-center">
                  <Shield className="w-12 h-12 text-text-muted opacity-30" />
                  <p className="font-bold text-sm">You&apos;re all caught up! No events pending approval or revisions.</p>
                </div>
              ) : (
                <div className="cards-container">
                    {pendingEvents.slice(0, 4).map((event) => <EventCard key={event.id} item={{...event, type: 'event'} as any} />)}
                  </div>
              )}
            </div>

            <hr className="border-border-subtle" />

            {/* Next Upcoming Column */}
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3">
                <div className="flex items-center gap-2 font-extrabold text-lg text-text-primary">
                  <UpcomingEventIcon className="w-5 h-5 text-success" />
                  <h3>Next Upcoming ({upcomingEvents.length})</h3>
                </div>
                {/* Fallback to calendar if there's no general events page for societies */}
                <Link to="/society/calendar" className="px-4 py-2 bg-text-primary text-text-inverse border border-transparent rounded-xl text-sm font-bold shadow-sm hover:opacity-90 transition-opacity">
                  View Calendar
                </Link>
              </div>

              {upcomingEvents.length === 0 ? (
                <div className="bg-surface/50 p-10 rounded-[18px] border border-border-subtle text-center text-text-muted space-y-3 flex flex-col items-center">
                  <UpcomingEventIcon className="w-12 h-12 text-text-muted opacity-30" />
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
        <div className="cards-container">
          <div className="bg-surface-glass backdrop-blur-md shadow-card p-6 rounded-2xl space-y-3 border border-border-subtle">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-brand-primary/10 border border-brand-primary/30 text-brand-primary rounded-xl">
                <UserCheck className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-text-primary">Session Verified</h3>
                <p className="text-xs text-text-muted">Authenticated via NestJS JWT Security</p>
              </div>
              <button
                onClick={logout}
                className="flex justify-center items-center gap-1.5 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-xl text-red-500 dark:text-red-400 text-xs font-semibold transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Log out</span>
              </button>
            </div>
            <p className="text-sm text-text-secondary font-medium pt-2">
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

        {isAboutModalOpen && (
          <React.Suspense fallback={null}>
            <DashboardAboutModal onClose={() => setIsAboutModalOpen(false)} profile={profile} />
          </React.Suspense>
        )}

        {selectedSlipEvent && (
          <React.Suspense fallback={null}>
            <VenuePermissionSlipModal
              isOpen={!!selectedSlipEvent}
              onClose={() => setSelectedSlipEvent(null)}
              event={selectedSlipEvent}
              societyName={profile?.name}
              societyLogo={profile?.logoUrl}
            />
          </React.Suspense>
        )}

        {selectedUploadEvent && (
          <React.Suspense fallback={null}>
            <UploadSignedSlipModal
              isOpen={!!selectedUploadEvent}
              onClose={() => setSelectedUploadEvent(null)}
              event={selectedUploadEvent}
            />
          </React.Suspense>
        )}
      </div>
    </div>
  );
};




