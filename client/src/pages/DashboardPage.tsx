import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { societyService } from '@/services/society.service';
import { DashboardSkeleton } from '@/components/dashboard/DashboardSkeleton';
import { DeleteEventDialog } from '@/components/events/DeleteEventDialog';
import { MakeAnnouncementDialog } from '@/components/feed/MakeAnnouncementDialog';
import { AdminDashboardPage } from '@/pages/admin/AdminDashboardPage';
import { AdvisorQueuePage } from '@/pages/advisor/AdvisorQueuePage';
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
  Ticket,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { user, logout } = useAuth();
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    title: string;
  } | null>(null);
  const [isAnnouncementDialogOpen, setIsAnnouncementDialogOpen] = useState(false);

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

  // First-login redirect if profile setup incomplete
  if (user?.role === 'SOCIETY' && !isLoading) {
    if (!profile || !profile.isSetupComplete) {
      return <Navigate to="/society/setup" replace />;
    }
  }

  if (user?.role === 'SOCIETY' && isLoading) {
    return <DashboardSkeleton />;
  }

  const renderEventCard = (event: EventItem, isPast = false) => (
    <div
      key={event.id}
      className={`bg-pure-white rounded-cards border transition-all flex flex-col justify-between ${
        isPast ? 'border-vast-ink opacity-80' : 'border-2 border-vast-ink hover:border-2 border-vast-ink'
      }`}
    >
      <Link
        to={`/events/${event.id}/edit`}
        className="p-4 block space-y-3 cursor-pointer group focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 rounded-t-cards"
      >
        {event.coverImageUrl && (
          <div className="w-full h-32 rounded-inputs overflow-hidden bg-lumen-stone">
            <img
              src={event.coverImageUrl}
              alt={event.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=1200&auto=format&fit=crop&q=80';
              }}
            />
          </div>
        )}

        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1">
            <h4 className="font-bold text-sm text-vast-ink leading-snug line-clamp-1 group-hover:text-ember-glow transition-colors">
              {event.title}
            </h4>
            {event.approvalStatus === 'CHANGES_REQUESTED' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-600 rounded border border-red-200 text-[10px] font-bold uppercase tracking-wider">
                <AlertCircle className="w-3 h-3" />
                {event.lastChangeRequestBy === 'DSA_ADMIN' ? 'Comment by DSA' : 'Comment by Advisor'}
              </span>
            )}
          </div>
        </div>

        <p className="text-xs text-fog line-clamp-2">{event.description}</p>

        <div className="space-y-1 text-xs text-vast-ink font-medium pt-1">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-3.5 h-3.5 text-vast-ink shrink-0" />
            <span>{new Date(event.eventDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
          </div>

          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-vast-ink shrink-0" />
            <span>{event.startTime} - {event.endTime}</span>
          </div>

          <div className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-forest-ink shrink-0" />
            <span className="truncate">{event.venue}</span>
          </div>
        </div>
      </Link>

      <div className="flex flex-wrap items-center justify-end gap-2 px-4 pb-4 pt-3 border-t border-vast-ink mt-auto">
        {event.registrationLink && (
          <a
            href={event.registrationLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 px-2.5 py-1 bg-pure-white border border-vast-ink text-vast-ink hover:bg-blue-500/20 rounded-inputs text-xs font-semibold transition-colors mr-auto"
            title="Open External Registration"
          >
            <ExternalLink className="w-3 h-3" />
            <span>Form</span>
          </a>
        )}
        <Link
          to={`/events/${event.id}/edit`}
          className="inline-flex items-center gap-1 px-2.5 py-1 bg-lumen-stone hover:bg-lavender-whisper text-vast-ink text-xs font-semibold rounded-inputs transition-colors"
        >
          <Edit className="w-3 h-3" />
          <span>Edit</span>
        </Link>
        <button
          onClick={() => setDeleteTarget({ id: event.id, title: event.title })}
          className="inline-flex items-center gap-1 px-2.5 py-1 bg-pure-white border border-vast-ink hover:bg-red-500/20 text-red-400 text-xs font-semibold rounded-inputs transition-colors"
        >
          <Trash2 className="w-3 h-3" />
          <span>Delete</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 text-left">
      {/* 1. Welcome & Identity Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-pure-white p-6 rounded-cards border-2 border-vast-ink shadow-sm">
        <div className="flex items-center gap-4">
          {profile?.logoUrl ? (
            <img
              src={profile.logoUrl}
              alt={profile.name}
              className="w-16 h-16 rounded-full object-cover border-2 border-vast-ink bg-lumen-cream"
            />
          ) : (
            <div className="w-16 h-16 flex items-center justify-center bg-lumen-stone border-2 border-vast-ink rounded-full text-vast-ink shrink-0">
              <Building2 className="w-8 h-8" />
            </div>
          )}
          <div>
            <h1 className="text-2xl font-extrabold text-vast-ink line-clamp-1">
              Welcome back, {profile?.name || user?.fullName || 'User'}
            </h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-1 text-sm text-fog font-medium">
              {profile?.advisor && profile.advisor.user && (
                <span className="flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-vast-ink shrink-0" />
                  Advisor: <span className="text-vast-ink font-semibold">{profile.advisor.user.fullName}</span>
                </span>
              )}
              {/* Removed Yearly Plan Status */}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3 shrink-0 mt-4 md:mt-0">
          <Link
            to="/society/setup"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-pure-white border-2 border-vast-ink hover:bg-lumen-stone rounded-inputs text-vast-ink text-sm font-bold transition-colors"
          >
            <Edit className="w-4 h-4" />
            <span>Edit Profile</span>
          </Link>
          <button
            onClick={logout}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-pure-white border-2 border-vast-ink hover:bg-red-500/10 rounded-inputs text-red-500 text-sm font-bold transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Log out</span>
          </button>
        </div>
      </div>

      {user?.role === 'SOCIETY' && profile && (
        <>
          {/* 2. Command Center: Actions & Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Quick Actions Panel */}
            <div className="bg-lumen-cream p-6 rounded-cards border-2 border-vast-ink flex flex-col justify-center space-y-5">
              <h3 className="font-extrabold text-lg text-vast-ink flex items-center gap-2">
                Command Center
              </h3>
              
              <div className="grid grid-cols-2 gap-3">
                <Link
                  to="/society/posts"
                  className="flex flex-col items-center justify-center gap-2 p-4 bg-vast-ink hover:bg-vast-ink/90 text-pure-white rounded-inputs font-bold transition-transform hover:-translate-y-1 shadow-[4px_4px_0px_0px_#1B1B18]"
                >
                  <Megaphone className="w-6 h-6" />
                  <span>Posts</span>
                </Link>
                <Link
                  to="/events/create"
                  className="flex flex-col items-center justify-center gap-2 p-4 bg-pure-white hover:bg-lumen-stone text-vast-ink border-2 border-vast-ink rounded-inputs font-bold transition-transform hover:-translate-y-1 shadow-[4px_4px_0px_0px_#1B1B18]"
                >
                  <Plus className="w-6 h-6" />
                  <span>Create Event</span>
                </Link>
              </div>
              {/* Edit Profile and Plan Calendar moved out */}
            </div>

            {/* Manage Events & Metrics Area */}
            <div className="bg-lumen-cream p-6 rounded-cards border-2 border-vast-ink flex flex-col justify-center space-y-5 relative overflow-hidden group">
              <h3 className="font-extrabold text-lg text-vast-ink flex items-center gap-2 z-10">
                Manage Events
              </h3>
              <p className="text-sm font-medium text-fog z-10 leading-snug">
                View all your society events, filter by status, and track approvals.
              </p>
              
              <div className="grid grid-cols-2 gap-3 z-10">
                <Link
                  to="/society/events"
                  className="flex flex-col items-center justify-center gap-2 p-4 bg-vast-ink hover:bg-vast-ink/90 text-pure-white rounded-inputs font-bold transition-transform hover:-translate-y-1 shadow-[4px_4px_0px_0px_#1B1B18]"
                >
                  <Ticket className="w-6 h-6" />
                  <span>Events</span>
                </Link>
                <Link
                  to="/society/calendar"
                  className="flex flex-col items-center justify-center gap-2 p-4 bg-pure-white hover:bg-lumen-stone text-vast-ink border-2 border-vast-ink rounded-inputs font-bold transition-transform hover:-translate-y-1 shadow-[4px_4px_0px_0px_#1B1B18]"
                >
                  <CalendarDays className="w-6 h-6" />
                  <span>Annual Calendar</span>
                </Link>
              </div>

              {/* Decorative background element */}
              <CalendarIcon className="absolute -right-4 -bottom-4 w-40 h-40 text-vast-ink opacity-[0.03] z-0 pointer-events-none group-hover:scale-110 transition-transform duration-500" />
            </div>
          </div>

          {/* 3. Focused Events Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Action Required Column */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b-2 border-vast-ink pb-3">
                <div className="flex items-center gap-2 font-extrabold text-lg text-vast-ink">
                  <AlertCircle className="w-5 h-5 text-ember-glow" />
                  <h3>Action Required ({pendingEvents.length})</h3>
                </div>
              </div>

              {pendingEvents.length === 0 ? (
                <div className="bg-pure-white p-10 rounded-cards border-2 border-vast-ink text-center text-fog space-y-3 flex flex-col items-center">
                  <Shield className="w-12 h-12 text-fog opacity-30" />
                  <p className="font-bold text-sm">You're all caught up! No events pending approval.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingEvents.map((event) => renderEventCard(event))}
                </div>
              )}
            </div>

            {/* Next Upcoming Column */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b-2 border-vast-ink pb-3">
                <div className="flex items-center gap-2 font-extrabold text-lg text-vast-ink">
                  <CalendarIcon className="w-5 h-5 text-forest-ink" />
                  <h3>Next Upcoming ({upcomingEvents.length})</h3>
                </div>
                {/* Fallback to calendar if there's no general events page for societies */}
                <Link to="/society/calendar" className="text-sm font-bold text-vast-ink hover:text-forest-ink transition-colors underline underline-offset-2">
                  View Calendar
                </Link>
              </div>

              {upcomingEvents.length === 0 ? (
                <div className="bg-pure-white p-10 rounded-cards border-2 border-vast-ink text-center text-fog space-y-3 flex flex-col items-center">
                  <CalendarIcon className="w-12 h-12 text-fog opacity-30" />
                  <p className="font-bold text-sm">No upcoming events scheduled right now.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {upcomingEvents.slice(0, 3).map((event) => renderEventCard(event))}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Non-society user dashboard fallback */}
      {user?.role !== 'SOCIETY' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-pure-white p-6 rounded-cards border-2 border-vast-ink space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-pure-white border border-forest-ink text-forest-ink rounded-inputs">
                <UserCheck className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-vast-ink">Session Verified</h3>
                <p className="text-xs text-fog">Authenticated via NestJS JWT Security</p>
              </div>
              <button
                onClick={logout}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-pure-white border border-vast-ink hover:bg-red-500/20 border border-red-500/20 rounded-inputs text-red-400 text-xs font-semibold transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Log out</span>
              </button>
            </div>
            <p className="text-sm text-vast-ink font-medium pt-2">
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
    </div>
  );
};
