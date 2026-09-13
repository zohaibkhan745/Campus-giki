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
import { AdminDashboardPage } from '@/pages/admin/AdminDashboardPage';
import { AdvisorQueuePage } from '@/pages/advisor/AdvisorQueuePage';
import { BannerHeader } from '@/components/layout/BannerHeader';
import { Info, FileText } from 'lucide-react';
import { VenuePermissionSlipModal } from '@/components/events/VenuePermissionSlipModal';
import { UploadSignedSlipModal } from '@/components/events/UploadSignedSlipModal';
import { DashboardAboutModal } from '@/components/dashboard/DashboardAboutModal';
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
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-950/80 via-slate-900/90 to-indigo-950/80 border border-white/10 p-8 sm:p-10 shadow-2xl backdrop-blur-xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/15 border border-blue-400/25 text-blue-400 text-xs font-semibold uppercase tracking-wider">
              <GraduationCap className="w-4 h-4" />
              <span>GIKI Student Portal</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Welcome back, {user?.fullName || 'Student'}
            </h1>
            <p className="text-gray-400 text-sm sm:text-base max-w-xl">
              Explore upcoming campus events, connect with student societies, and stay up to date with live announcements from the Directorate of Student Affairs.
            </p>
          </div>
          <button
            onClick={logout}
            className="self-start md:self-center inline-flex items-center gap-2 px-4 py-2.5 bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 rounded-xl text-red-400 text-sm font-semibold transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Quick Navigation Hub */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-400" />
          <span>Campus Quick Links</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            to="/"
            className="group p-6 rounded-2xl bg-white/[0.05] hover:bg-white/[0.09] border border-white/10 hover:border-white/20 transition-all flex flex-col justify-between space-y-4"
          >
            <div className="p-3 bg-blue-500/15 text-blue-400 rounded-xl w-fit group-hover:scale-110 transition-transform">
              <Megaphone className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors flex items-center justify-between">
                Campus Feed
                <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </h3>
              <p className="text-xs text-gray-400 mt-1">Live DSA and society announcements</p>
            </div>
          </Link>

          <Link
            to="/upcoming-events"
            className="group p-6 rounded-2xl bg-white/[0.05] hover:bg-white/[0.09] border border-white/10 hover:border-white/20 transition-all flex flex-col justify-between space-y-4"
          >
            <div className="p-3 bg-emerald-500/15 text-emerald-400 rounded-xl w-fit group-hover:scale-110 transition-transform">
              <UpcomingEventIcon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors flex items-center justify-between">
                Upcoming Events
                <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </h3>
              <p className="text-xs text-gray-400 mt-1">Competitions, workshops, and galas</p>
            </div>
          </Link>

          <Link
            to="/events"
            className="group p-6 rounded-2xl bg-white/[0.05] hover:bg-white/[0.09] border border-white/10 hover:border-white/20 transition-all flex flex-col justify-between space-y-4"
          >
            <div className="p-3 bg-purple-500/15 text-purple-400 rounded-xl w-fit group-hover:scale-110 transition-transform">
              <CalendarDays className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white group-hover:text-purple-400 transition-colors flex items-center justify-between">
                Campus Calendar
                <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </h3>
              <p className="text-xs text-gray-400 mt-1">Interactive monthly and weekly schedule</p>
            </div>
          </Link>

          <Link
            to="/societies"
            className="group p-6 rounded-2xl bg-white/[0.05] hover:bg-white/[0.09] border border-white/10 hover:border-white/20 transition-all flex flex-col justify-between space-y-4"
          >
            <div className="p-3 bg-amber-500/15 text-amber-400 rounded-xl w-fit group-hover:scale-110 transition-transform">
              <SocietyIcon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white group-hover:text-amber-400 transition-colors flex items-center justify-between">
                Societies Directory
                <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </h3>
              <p className="text-xs text-gray-400 mt-1">Explore and contact campus societies</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Account Info card */}
      <div className="p-6 rounded-2xl bg-white/[0.04] border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-forest-ink/15 text-forest-ink border border-forest-ink/25">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-bold text-white">{user?.email}</div>
            <div className="text-xs text-gray-400">Authenticated Student Account • GIKI Campus Network</div>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-forest-ink bg-forest-ink/10 px-3 py-1.5 rounded-lg border border-forest-ink/20">
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

  // Single aggregated dashboard query
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['societyDashboard'],
    queryFn: societyService.getDashboard,
    enabled: user?.role === 'SOCIETY',
  });

  // If DSA_ADMIN, render central DSA Dashboard
  if (user?.role === 'DSA_ADMIN') {
    return <AdminDashboardPage />;
  }

  // If ADVISOR, render central Advisor Queue Dashboard
  if (user?.role === 'ADVISOR') {
    return <AdvisorQueuePage />;
  }

  // If STUDENT, render dedicated Student Dashboard
  if (user?.role === 'STUDENT') {
    return <StudentDashboardView user={user} logout={logout} />;
  }

  const profile = dashboardData?.profile;
  const stats = dashboardData?.statistics;
  const upcomingEvents = dashboardData?.upcomingEvents || [];
  const recentEvents = dashboardData?.recentEvents || [];
  const pendingEvents = dashboardData?.pendingEvents || [];
  const yearlyPlan = dashboardData?.yearlyPlanSummary;

  const changesRequestedEventsCount = pendingEvents.filter(e => e.approvalStatus === 'CHANGES_REQUESTED' || e.approvalStatus === 'APPROVED' || e.approvalStatus === 'REJECTED').length;
  const changesRequestedPlanCount = (yearlyPlan?.status === 'CHANGES_REQUESTED' || yearlyPlan?.editRequestStatus === 'APPROVED' || yearlyPlan?.editRequestStatus === 'REJECTED') ? 1 : 0;

  const [selectedSlipEvent, setSelectedSlipEvent] = useState<EventItem | null>(null);
  const [selectedUploadEvent, setSelectedUploadEvent] = useState<EventItem | null>(null);

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
              
              {/* Create Event */}
              <div>
                <h3 className="font-extrabold text-lg text-white flex items-center gap-2 mb-4">
                  Create Event
                </h3>
                <div className="grid grid-cols-1 gap-4">
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
                      <span className="absolute -top-2 -right-2 flex items-center justify-center w-6 h-6 bg-red-500 text-pure-white text-xs rounded-full shadow-sm animate-pulse border-2 border-pure-white">
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
                      <span className="absolute -top-2 -right-2 flex items-center justify-center w-6 h-6 bg-red-500 text-pure-white text-xs rounded-full shadow-sm animate-pulse">
                        !
                      </span>
                    )}
                  </Link>
                </div>
              </div>
            </div>

            {/* Venue Clearance Required Banner */}
            {venueClearancePendingEvents.length > 0 && (
              <div className="p-6 rounded-[18px] bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/5 border border-amber-500/30 text-white space-y-4 shadow-[0_12px_40px_rgba(0,0,0,0.3)]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5 font-extrabold text-base text-amber-400">
                    <FileText className="w-5 h-5" />
                    <span>Physical Venue Clearance Required ({venueClearancePendingEvents.length})</span>
                  </div>
                  <span className="text-xs px-2.5 py-1 bg-amber-500/20 text-amber-300 font-bold rounded-lg border border-amber-500/30">
                    Action Required
                  </span>
                </div>
                <p className="text-xs text-amber-200/90 leading-relaxed max-w-3xl">
                  The following approved events require official physical clearance from the <strong>PS to Dean / Dean&apos;s Office</strong> for the allocated venue. Print the official slip, obtain the physical signature and stamp, and upload the signed copy.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                  {venueClearancePendingEvents.map((ev: any) => (
                    <div key={ev.id} className="p-4 bg-black/40 backdrop-blur-md rounded-xl border border-white/10 flex flex-col justify-between gap-3">
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="font-bold text-sm text-white truncate">{ev.title}</h4>
                          <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 shrink-0">
                            {ev.venueClearanceStatus === 'REJECTED' ? 'Re-upload Required' : 'Awaiting PS to Dean Signature'}
                          </span>
                        </div>
                        <p className="text-xs text-gray-300 mt-1 flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <span>Venue: <strong className="text-white">{ev.venue}</strong></span>
                        </p>
                        <p className="text-[11px] text-gray-400 mt-0.5">
                          {new Date(ev.eventDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })} • {ev.startTime} - {ev.endTime}
                        </p>
                        {ev.venueClearanceNotes && (
                          <p className="text-[11px] text-red-300 mt-1.5 italic bg-red-950/30 p-1.5 rounded border border-red-500/20">
                            DSA Note: {ev.venueClearanceNotes}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 pt-2 border-t border-white/10">
                        <button
                          type="button"
                          onClick={() => setSelectedSlipEvent(ev)}
                          className="flex-1 py-2 px-3 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-colors text-center cursor-pointer"
                        >
                          Print Slip (PDF)
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedUploadEvent(ev)}
                          className="flex-1 py-2 px-3 bg-amber-500 hover:bg-amber-600 text-gray-950 rounded-xl text-xs font-bold transition-colors text-center cursor-pointer"
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
                <div className="bg-transparent p-10 rounded-[18px] border border-white/20 text-center text-gray-400 space-y-3 flex flex-col items-center">
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
                <Link to="/society/calendar" className="px-4 py-2 bg-white text-gray-900 border border-transparent rounded-xl text-sm font-bold shadow-md hover:bg-gray-100 transition-all">
                  View Calendar
                </Link>
              </div>

              {upcomingEvents.length === 0 ? (
                <div className="bg-transparent p-10 rounded-[18px] border border-white/20 text-center text-gray-400 space-y-3 flex flex-col items-center">
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

        {isAboutModalOpen && <DashboardAboutModal onClose={() => setIsAboutModalOpen(false)} profile={profile} />}

        {selectedSlipEvent && (
          <VenuePermissionSlipModal
            isOpen={!!selectedSlipEvent}
            onClose={() => setSelectedSlipEvent(null)}
            event={selectedSlipEvent}
            societyName={profile?.name}
            societyLogo={profile?.logoUrl}
          />
        )}

        {selectedUploadEvent && (
          <UploadSignedSlipModal
            isOpen={!!selectedUploadEvent}
            onClose={() => setSelectedUploadEvent(null)}
            event={selectedUploadEvent}
          />
        )}
      </div>
    </div>
  );
};




