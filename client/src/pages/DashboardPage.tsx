import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { societyService } from '@/services/society.service';
import { DashboardSkeleton } from '@/components/dashboard/DashboardSkeleton';
import { DeleteEventDialog } from '@/components/events/DeleteEventDialog';
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
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { user, logout } = useAuth();
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    title: string;
  } | null>(null);

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
      className={`bg-pure-white rounded-cards border p-4 transition-all flex flex-col justify-between ${
        isPast ? 'border-vast-ink opacity-80' : 'border-2 border-vast-ink hover:border-2 border-vast-ink'
      }`}
    >
      <div className="space-y-3">
        {event.coverImageUrl && (
          <div className="w-full h-32 rounded-inputs overflow-hidden bg-lumen-stone">
            <img
              src={event.coverImageUrl}
              alt={event.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="flex items-start justify-between gap-2">
          <h4 className="font-bold text-sm text-vast-ink leading-snug line-clamp-1">
            {event.title}
          </h4>
          {event.registrationLink && (
            <a
              href={event.registrationLink}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1 bg-pure-white border border-vast-ink text-vast-ink hover:bg-blue-500/20 rounded-md transition-colors shrink-0"
              title="Open External Registration"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
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
      </div>

      <div className="flex items-center justify-end gap-2 pt-3 border-t border-vast-ink mt-3">
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
      {/* 1. Welcome Card */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-pure-white p-6 rounded-cards border-2 border-vast-ink">
        <div>
          <h1 className="text-2xl font-bold text-vast-ink">
            Welcome back, {user?.fullName || 'User'}!
          </h1>
          <p className="text-sm text-fog mt-0.5">
            Manage your society profile, event schedules, and yearly calendar activities.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-pure-white border border-vast-ink rounded-inputs text-vast-ink text-xs font-semibold">
            <Shield className="w-4 h-4" />
            <span>Role: {user?.role}</span>
          </div>
          <button
            onClick={logout}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-pure-white border border-vast-ink hover:bg-red-500/20 border border-red-500/20 rounded-inputs text-red-400 text-xs font-semibold transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Log out</span>
          </button>
        </div>
      </div>

      {user?.role === 'SOCIETY' && profile && (
        <>
          {/* 2. Society Profile Summary & Yearly Plan Widget */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-lumen-cream p-6 rounded-cards border-2 border-vast-ink flex flex-col justify-between space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  {profile.logoUrl ? (
                    <img
                      src={profile.logoUrl}
                      alt={profile.name}
                      className="w-12 h-12 rounded-inputs object-cover border-2 border-vast-ink"
                    />
                  ) : (
                    <div className="p-3 bg-blue-600/20 border border-blue-500/30 rounded-inputs text-vast-ink">
                      <Building2 className="w-6 h-6" />
                    </div>
                  )}
                  <div>
                    <h2 className="text-lg font-extrabold text-vast-ink">{profile.name}</h2>
                    <p className="text-xs text-fog line-clamp-1">{profile.shortDescription}</p>
                  </div>
                </div>

                {profile.category && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-pure-white border border-vast-ink text-vast-ink rounded-inputs text-xs font-semibold">
                    <Tag className="w-3.5 h-3.5" />
                    {profile.category.name}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs text-fog pt-2 border-t border-vast-ink">
                {profile.advisor && profile.advisor.user && (
                  <div className="flex items-center gap-1.5 text-vast-ink font-medium">
                    <UserCheck className="w-3.5 h-3.5 text-vast-ink" />
                    <span>Advisor: {profile.advisor.user.fullName} ({profile.advisor.designation})</span>
                  </div>
                )}
                {profile.email && (
                  <div className="flex items-center gap-1.5 text-vast-ink font-medium">
                    <Mail className="w-3.5 h-3.5 text-vast-ink" />
                    <span>{profile.email}</span>
                  </div>
                )}
                {profile.website && (
                  <a
                    href={profile.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-vast-ink hover:underline"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>{profile.website}</span>
                  </a>
                )}
              </div>
            </div>

            {/* 3. Yearly Plan Status Widget */}
            <div className="bg-lumen-cream p-6 rounded-cards border-2 border-vast-ink flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-vast-ink font-medium font-bold text-sm">
                  <CalendarDays className="w-4 h-4 text-vast-ink" />
                  <h3>Yearly Plan Status</h3>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-pure-white border border-ember-glow border border-amber-500/20 text-ember-glow">
                  {yearlyPlan?.status || 'NOT_STARTED'}
                </span>
              </div>

              <div className="space-y-1">
                <div className="text-2xl font-extrabold text-vast-ink">
                  {yearlyPlan?.totalEventsInPlan || 0} Events
                </div>
                <p className="text-xs text-fog">
                  Events planned in official society annual calendar draft.
                </p>
              </div>

              <div className="pt-2 border-t border-vast-ink">
                <Link
                  to="/society/calendar"
                  className="block text-center text-xs font-semibold text-vast-ink hover:text-fog transition-colors"
                >
                  Manage Annual Calendar →
                </Link>
              </div>
            </div>
          </div>

          {/* 4. Statistics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-pure-white p-5 rounded-cards border-2 border-vast-ink space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-fog uppercase tracking-wider">Total Events</span>
                <div className="p-2 bg-pure-white border border-vast-ink text-vast-ink rounded-inputs">
                  <CalendarIcon className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-extrabold text-vast-ink">{stats?.totalEvents || 0}</div>
              <p className="text-[11px] text-fog">Published society events</p>
            </div>

            <div className="bg-pure-white p-5 rounded-cards border-2 border-vast-ink space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-fog uppercase tracking-wider">Upcoming</span>
                <div className="p-2 bg-pure-white border border-forest-ink text-forest-ink rounded-inputs">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-extrabold text-vast-ink">{stats?.upcomingEvents || 0}</div>
              <p className="text-[11px] text-fog">Active scheduled events</p>
            </div>

            <div className="bg-pure-white p-5 rounded-cards border-2 border-vast-ink space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-fog uppercase tracking-wider">Past Events</span>
                <div className="p-2 bg-lumen-stone text-fog rounded-inputs">
                  <History className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-extrabold text-vast-ink">{stats?.pastEvents || 0}</div>
              <p className="text-[11px] text-fog">Concluded events</p>
            </div>

            <div className="bg-pure-white p-5 rounded-cards border-2 border-vast-ink space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-fog uppercase tracking-wider">Standing</span>
                <div className="p-2 bg-pure-white border border-ember-glow text-ember-glow rounded-inputs">
                  <Award className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-extrabold text-vast-ink">Active</div>
              <p className="text-[11px] text-fog">Verified GIKI Society</p>
            </div>
          </div>

          {/* 5. Quick Actions Toolbar */}
          <div className="bg-lumen-cream p-5 rounded-cards border-2 border-vast-ink space-y-3">
            <div className="flex items-center gap-2 font-bold text-sm text-vast-ink">
              <h3>Quick Actions</h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Link
                to="/events/create"
                className="flex items-center justify-center gap-2 p-3 bg-vast-ink hover:opacity-90 text-white rounded-inputs text-xs font-semibold transition-colors shadow-lg shadow-blue-600/20"
              >
                <Plus className="w-4 h-4" />
                <span>Create Event</span>
              </Link>

              <Link
                to="/society/setup"
                className="flex items-center justify-center gap-2 p-3 bg-lumen-stone hover:bg-lavender-whisper text-vast-ink rounded-inputs text-xs font-semibold transition-colors border-2 border-vast-ink"
              >
                <Edit className="w-4 h-4 text-vast-ink" />
                <span>Edit Profile</span>
              </Link>

              <a
                href="#upcoming-events-section"
                className="flex items-center justify-center gap-2 p-3 bg-lumen-stone hover:bg-lavender-whisper text-vast-ink rounded-inputs text-xs font-semibold transition-colors border-2 border-vast-ink"
              >
                <CalendarIcon className="w-4 h-4 text-forest-ink" />
                <span>View Events</span>
              </a>

              <Link
                to="/society/calendar"
                className="flex items-center justify-center gap-2 p-3 bg-lumen-stone hover:bg-lavender-whisper text-vast-ink rounded-inputs text-xs font-semibold transition-colors border-2 border-vast-ink"
              >
                <CalendarDays className="w-4 h-4 text-vast-ink" />
                <span>Manage Calendar</span>
              </Link>
            </div>
          </div>

          {/* 6. Upcoming, Pending & Recent Events Overview Grid */}
          <div id="upcoming-events-section" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Pending Approvals Column */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b-2 border-vast-ink pb-3">
                <div className="flex items-center gap-2 font-bold text-base text-ember-glow">
                  <Clock className="w-4 h-4 text-ember-glow" />
                  <h3 className="text-vast-ink">Pending Approvals ({pendingEvents.length})</h3>
                </div>
              </div>

              {pendingEvents.length === 0 ? (
                <div className="bg-pure-white p-6 rounded-cards border-2 border-vast-ink text-center text-xs text-fog space-y-2">
                  <Shield className="w-8 h-8 text-fog mx-auto opacity-50" />
                  <p>No events pending approval.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingEvents.map((event) => renderEventCard(event))}
                </div>
              )}
            </div>

            {/* Upcoming Events Column */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b-2 border-vast-ink pb-3">
                <div className="flex items-center gap-2 font-bold text-base text-vast-ink">
                  <CalendarIcon className="w-4 h-4 text-vast-ink" />
                  <h3>Upcoming Events ({upcomingEvents.length})</h3>
                </div>
                <Link to="/events/create" className="text-xs text-vast-ink hover:underline">
                  + Add Event
                </Link>
              </div>

              {upcomingEvents.length === 0 ? (
                <div className="bg-pure-white p-6 rounded-cards border-2 border-vast-ink text-center text-xs text-fog space-y-2">
                  <CalendarIcon className="w-8 h-8 text-fog mx-auto" />
                  <p>No upcoming events scheduled.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {upcomingEvents.map((event) => renderEventCard(event))}
                </div>
              )}
            </div>

            {/* Recent Events Column */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b-2 border-vast-ink pb-3">
                <div className="flex items-center gap-2 font-bold text-base text-vast-ink">
                  <History className="w-4 h-4 text-fog" />
                  <h3>Recent Events ({recentEvents.length})</h3>
                </div>
              </div>

              {recentEvents.length === 0 ? (
                <div className="bg-pure-white p-6 rounded-cards border-2 border-vast-ink text-center text-xs text-fog">
                  No past events recorded yet.
                </div>
              ) : (
                <div className="space-y-4">
                  {recentEvents.map((event) => renderEventCard(event, true))}
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
    </div>
  );
};
