import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  Shield,
  Building2,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  Calendar,
  TrendingUp,
  Sparkles,
  UserPlus,
  ArrowRight,
  ChevronRight,
  MapPin,
  LogOut,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { adminService } from '@/services/admin.service';
import { Alert } from '@/components/ui/Alert';

export const AdminDashboardPage: React.FC = () => {
  const { logout } = useAuth();
  const {
    data,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['adminDashboard'],
    queryFn: adminService.getDashboardData,
  });

  const stats = data?.statistics;
  const pendingPlans = data?.pendingPlansPreview || [];
  const upcomingEvents = data?.upcomingEventsPreview || [];

  return (
    <div className="max-w-7xl mx-auto space-y-6 text-left py-4">
      {/* Header Banner */}
      <div className="space-y-1 bg-lumen-cream p-6 rounded-cards border-2 border-vast-ink flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-forest-ink text-xs font-semibold uppercase tracking-wider mb-1">
            <Shield className="w-4 h-4" />
            <span>Directorate of Student Affairs</span>
          </div>
          <h1 className="text-2xl font-extrabold text-vast-ink font-eb-garamond">
            DSA Control Center &amp; Overview
          </h1>
          <p className="text-sm font-medium text-fog">
            Central administrative hub for monitoring campus societies, event schedules, and annual calendar plans.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/admin/societies/create">
            <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-vast-ink hover:opacity-90 text-pure-white rounded-buttons border-2 border-vast-ink text-xs font-bold transition-colors shrink-0">
              <UserPlus className="w-4 h-4" />
              <span className="hidden sm:inline">Onboard Society</span>
            </button>
          </Link>
          <button
            onClick={logout}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-pure-white hover:bg-lumen-stone border-2 border-vast-ink rounded-buttons text-vast-ink text-xs font-bold transition-colors shrink-0"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Log out</span>
          </button>
        </div>
      </div>

      {isError && (
        <div className="space-y-3">
          <Alert variant="error" message="Failed to load DSA dashboard metrics. DSA_ADMIN role required." />
          <button
            onClick={() => refetch()}
            className="text-xs text-indigo-400 hover:underline font-semibold"
          >
            Retry Loading Dashboard
          </button>
        </div>
      )}

      {/* 8 Statistics Grid Cards */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="bg-pure-white p-5 rounded-cards border-2 border-vast-ink space-y-2 animate-pulse">
              <div className="h-4 bg-lumen-stone rounded w-1/2" />
              <div className="h-8 bg-lumen-stone rounded w-1/3" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Total Societies */}
          <Link
            to="/admin/societies"
            className="bg-pure-white p-5 rounded-cards border-2 border-vast-ink hover:bg-lavender-whisper transition-all space-y-2 group"
          >
            <div className="flex items-center justify-between text-fog">
              <span className="text-xs font-semibold">Total Societies</span>
              <Building2 className="w-4 h-4 text-vast-ink" />
            </div>
            <p className="text-2xl font-extrabold text-vast-ink">
              {stats?.totalSocieties || 0}
            </p>
          </Link>

          {/* Active Societies */}
          <Link
            to="/admin/societies?status=ACTIVE"
            className="bg-pure-white p-5 rounded-cards border-2 border-vast-ink hover:bg-lavender-whisper transition-all space-y-2 group"
          >
            <div className="flex items-center justify-between text-fog">
              <span className="text-xs font-semibold">Active Societies</span>
              <CheckCircle2 className="w-4 h-4 text-forest-ink" />
            </div>
            <p className="text-2xl font-extrabold text-forest-ink">
              {stats?.activeSocieties || 0}
            </p>
          </Link>

          {/* Unconfigured Societies */}
          <Link
            to="/admin/societies?status=UNCONFIGURED"
            className="bg-pure-white p-5 rounded-cards border-2 border-vast-ink hover:bg-lavender-whisper transition-all space-y-2 group"
          >
            <div className="flex items-center justify-between text-fog">
              <span className="text-xs font-semibold">Unconfigured</span>
              <Clock className="w-4 h-4 text-ember-glow" />
            </div>
            <p className="text-2xl font-extrabold text-ember-glow">
              {stats?.unconfiguredSocieties || 0}
            </p>
          </Link>

          {/* Inactive Societies */}
          <Link
            to="/admin/societies?status=INACTIVE"
            className="bg-pure-white p-5 rounded-cards border-2 border-vast-ink hover:bg-lavender-whisper transition-all space-y-2 group"
          >
            <div className="flex items-center justify-between text-fog">
              <span className="text-xs font-semibold">Inactive Societies</span>
              <AlertCircle className="w-4 h-4 text-vast-ink" />
            </div>
            <p className="text-2xl font-extrabold text-vast-ink">
              {stats?.inactiveSocieties || 0}
            </p>
          </Link>

          {/* Pending Yearly Plans */}
          <Link
            to="/admin/yearly-plans?status=PENDING"
            className="bg-pure-white p-5 rounded-cards border-2 border-vast-ink hover:bg-lavender-whisper transition-all space-y-2 group"
          >
            <div className="flex items-center justify-between text-fog">
              <span className="text-xs font-semibold">Pending Plans</span>
              <FileText className="w-4 h-4 text-ember-glow" />
            </div>
            <p className="text-2xl font-extrabold text-ember-glow">
              {stats?.pendingYearlyPlans || 0}
            </p>
          </Link>

          {/* Approved Plans */}
          <Link
            to="/admin/yearly-plans?status=APPROVED"
            className="bg-pure-white p-5 rounded-cards border-2 border-vast-ink hover:bg-lavender-whisper transition-all space-y-2 group"
          >
            <div className="flex items-center justify-between text-fog">
              <span className="text-xs font-semibold">Approved Plans</span>
              <CheckCircle2 className="w-4 h-4 text-forest-ink" />
            </div>
            <p className="text-2xl font-extrabold text-forest-ink">
              {stats?.approvedPlans || 0}
            </p>
          </Link>

          {/* Events This Week */}
          <Link
            to="/admin/events?type=this_week"
            className="bg-pure-white p-5 rounded-cards border-2 border-vast-ink hover:bg-lavender-whisper transition-all space-y-2 group"
          >
            <div className="flex items-center justify-between text-fog">
              <span className="text-xs font-semibold">Events This Week</span>
              <Calendar className="w-4 h-4 text-forest-ink" />
            </div>
            <p className="text-2xl font-extrabold text-forest-ink">
              {stats?.eventsThisWeek || 0}
            </p>
          </Link>

          {/* Events This Month */}
          <Link
            to="/admin/events?type=this_month"
            className="bg-pure-white p-5 rounded-cards border-2 border-vast-ink hover:bg-lavender-whisper transition-all space-y-2 group"
          >
            <div className="flex items-center justify-between text-fog">
              <span className="text-xs font-semibold">Events This Month</span>
              <Calendar className="w-4 h-4 text-vast-ink" />
            </div>
            <p className="text-2xl font-extrabold text-vast-ink">
              {stats?.eventsThisMonth || 0}
            </p>
          </Link>

          {/* Upcoming Events */}
          <Link
            to="/admin/events?type=upcoming"
            className="bg-pure-white p-5 rounded-cards border-2 border-vast-ink hover:bg-lavender-whisper transition-all space-y-2 group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-fog uppercase tracking-wider">Upcoming</span>
              <div className="p-2 bg-pure-white border border-forest-ink text-forest-ink rounded-inputs">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-extrabold text-forest-ink">
              {stats?.upcomingEvents || 0}
            </p>
          </Link>
        </div>
      )}

      {/* Quick Navigation Action Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <Link
          to="/admin/societies/create"
          className="bg-pure-white p-4 rounded-cards border-2 border-vast-ink hover:bg-lavender-whisper transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-lavender-whisper border-2 border-vast-ink text-vast-ink rounded-badges">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-vast-ink text-sm">Onboard Society</h4>
              <p className="text-[11px] font-medium text-fog">Provision account</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-vast-ink group-hover:translate-x-1 transition-transform" />
        </Link>

        <Link
          to="/admin/societies"
          className="bg-pure-white p-4 rounded-cards border-2 border-vast-ink hover:bg-lavender-whisper transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-lavender-whisper border-2 border-vast-ink text-vast-ink rounded-badges">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-vast-ink text-sm">Society Directory</h4>
              <p className="text-[11px] font-medium text-fog">Reassign &amp; reset</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-vast-ink group-hover:translate-x-1 transition-transform" />
        </Link>

        <Link
          to="/admin/yearly-plans"
          className="bg-pure-white p-4 rounded-cards border-2 border-vast-ink hover:bg-lavender-whisper transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-lavender-whisper border-2 border-vast-ink text-vast-ink rounded-badges">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-vast-ink text-sm">Yearly Plan Audit</h4>
              <p className="text-[11px] font-medium text-fog">Audit logs &amp; plans</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-vast-ink group-hover:translate-x-1 transition-transform" />
        </Link>

        <Link
          to="/admin/events"
          className="bg-pure-white p-4 rounded-cards border-2 border-vast-ink hover:bg-lavender-whisper transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-lavender-whisper border-2 border-vast-ink text-vast-ink rounded-badges">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-vast-ink text-sm">Events Overview</h4>
              <p className="text-[11px] font-medium text-fog">Campus event list</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-vast-ink group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* Two Column Activity Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pending Yearly Plans Queue */}
        <div className="bg-lumen-cream p-6 rounded-cards border-2 border-vast-ink space-y-4">
          <div className="flex items-center justify-between border-b-2 border-vast-ink pb-3">
            <h3 className="font-bold text-vast-ink text-base flex items-center gap-2">
              <FileText className="w-4 h-4 text-ember-glow" />
              <span>Pending Advisor Review Plans ({pendingPlans.length})</span>
            </h3>
            <Link to="/admin/yearly-plans?status=PENDING" className="text-xs text-vast-ink hover:underline font-semibold">
              View All
            </Link>
          </div>

          {pendingPlans.length === 0 ? (
            <p className="text-sm font-medium text-fog py-6 text-center">No yearly plans currently pending advisor review.</p>
          ) : (
            <div className="space-y-3">
              {pendingPlans.map((plan) => (
                <Link
                  key={plan.id}
                  to={`/admin/yearly-plans/${plan.id}`}
                  className="bg-pure-white p-4 rounded-cards border-2 border-vast-ink hover:bg-lavender-whisper transition-all flex items-center justify-between group"
                >
                  <div className="space-y-1">
                    <h4 className="font-bold text-vast-ink text-sm">
                      {plan.society?.name} ({plan.year})
                    </h4>
                    <p className="text-xs font-medium text-fog">
                      Advisor: {plan.society?.advisor?.user?.fullName || 'Assigned Advisor'} • {plan.totalPlannedEvents} Events
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-vast-ink group-hover:translate-x-1 transition-transform" />
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Events Preview */}
        <div className="bg-lumen-cream p-6 rounded-cards border-2 border-vast-ink space-y-4">
          <div className="flex items-center justify-between border-b-2 border-vast-ink pb-3">
            <h3 className="font-bold text-vast-ink text-base flex items-center gap-2">
              <Calendar className="w-4 h-4 text-vast-ink" />
              <span>Upcoming Campus Events ({upcomingEvents.length})</span>
            </h3>
            <Link to="/admin/events?type=upcoming" className="text-xs text-vast-ink hover:underline font-semibold">
              View All
            </Link>
          </div>

          {upcomingEvents.length === 0 ? (
            <p className="text-sm font-medium text-fog py-6 text-center">No upcoming campus events scheduled.</p>
          ) : (
            <div className="space-y-3">
              {upcomingEvents.map((evt) => (
                <Link
                  key={evt.id}
                  to={`/events/${evt.id}`}
                  className="bg-pure-white p-4 rounded-cards border-2 border-vast-ink hover:bg-lavender-whisper transition-all flex items-center justify-between group"
                >
                  <div className="space-y-1">
                    <h4 className="font-bold text-vast-ink text-sm">
                      {evt.title}
                    </h4>
                    <div className="flex items-center gap-3 text-xs font-medium text-fog">
                      <span>Host: <strong className="text-vast-ink">{evt.society?.name}</strong></span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-fog" />
                        {evt.venue}
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-vast-ink group-hover:translate-x-1 transition-transform" />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
