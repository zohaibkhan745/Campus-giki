import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
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
  Ticket,
  CalendarDays,
  Settings,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { adminService } from '@/services/admin.service';
import { Alert } from '@/components/ui/Alert';
import { MakeAnnouncementDialog } from '@/components/feed/MakeAnnouncementDialog';

export const AdminDashboardPage: React.FC = () => {
  const { user, logout } = useAuth();
  const [isAnnouncementDialogOpen, setIsAnnouncementDialogOpen] = useState(false);
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
  const pendingEvents = data?.pendingEventsPreview || [];
  const upcomingEvents = data?.upcomingEventsPreview || [];

  return (
    <div className="max-w-6xl mx-auto space-y-6 text-left py-4">
      {/* 1. Welcome Banner — matches Society Dashboard */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-pure-white p-6 rounded-cards border-2 border-vast-ink shadow-sm">
        <div className="flex items-center gap-4">
          {user?.avatarUrl ? (
            <img 
              src={user.avatarUrl} 
              alt="Admin Avatar" 
              className="w-16 h-16 rounded-full border-2 border-vast-ink object-cover shrink-0" 
            />
          ) : (
            <div className="w-16 h-16 flex items-center justify-center bg-vast-ink border-2 border-vast-ink rounded-full text-white shrink-0">
              <Shield className="w-8 h-8" />
            </div>
          )}
          <div>
            <h1 className="text-2xl font-extrabold text-vast-ink line-clamp-1">
              Welcome back, {user?.fullName || 'Admin'}
            </h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-sm text-fog font-medium">
              <span className="flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-vast-ink shrink-0" />
                Directorate of Student Affairs
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0 mt-4 md:mt-0">
          <button
            onClick={() => setIsAnnouncementDialogOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-vast-ink hover:opacity-90 text-white rounded-inputs text-sm font-bold transition-colors shadow-lg shadow-blue-600/20"
          >
            <Megaphone className="w-4 h-4" />
            <span>Make Post</span>
          </button>
          <Link
            to="/settings"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-pure-white border-2 border-vast-ink hover:bg-lumen-stone rounded-inputs text-vast-ink text-sm font-bold transition-colors"
          >
            <Settings className="w-4 h-4" />
            <span className="hidden sm:inline">Settings</span>
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

      {isError && (
        <div className="space-y-3">
          <Alert variant="error" message="Failed to load dashboard data. DSA_ADMIN role required." />
          <button
            onClick={() => refetch()}
            className="text-xs text-ember-glow hover:underline font-semibold"
          >
            Retry
          </button>
        </div>
      )}

      {/* 2. Command Center */}
      <div className="bg-lumen-cream p-6 rounded-cards border-2 border-vast-ink space-y-5">
        <h3 className="font-extrabold text-lg text-vast-ink flex items-center gap-2">
          Command Center
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Link
            to="/admin/societies"
            className="flex flex-col items-center justify-center gap-2 p-4 bg-vast-ink hover:bg-vast-ink/90 text-pure-white rounded-inputs font-bold transition-transform hover:-translate-y-1 shadow-[4px_4px_0px_0px_#1B1B18]"
          >
            <Building2 className="w-6 h-6" />
            <span>Societies</span>
          </Link>
          <Link
            to="/admin/events"
            className="flex flex-col items-center justify-center gap-2 p-4 bg-pure-white hover:bg-lumen-stone text-vast-ink border-2 border-vast-ink rounded-inputs font-bold transition-transform hover:-translate-y-1 shadow-[4px_4px_0px_0px_#1B1B18]"
          >
            <Ticket className="w-6 h-6" />
            <span>Events</span>
          </Link>
          <Link
            to="/admin/posts"
            className="flex flex-col items-center justify-center gap-2 p-4 bg-pure-white hover:bg-lumen-stone text-vast-ink border-2 border-vast-ink rounded-inputs font-bold transition-transform hover:-translate-y-1 shadow-[4px_4px_0px_0px_#1B1B18]"
          >
            <MessageSquare className="w-6 h-6" />
            <span>Posts</span>
          </Link>
          <Link
            to="/admin/yearly-plans"
            className="flex flex-col items-center justify-center gap-2 p-4 bg-pure-white hover:bg-lumen-stone text-vast-ink border-2 border-vast-ink rounded-inputs font-bold transition-transform hover:-translate-y-1 shadow-[4px_4px_0px_0px_#1B1B18]"
          >
            <CalendarDays className="w-6 h-6" />
            <span>Yearly Plans</span>
          </Link>
        </div>
      </div>

      {/* 3. Add Society shortcut */}
      <Link
        to="/admin/societies/create"
        className="block bg-pure-white p-4 rounded-cards border-2 border-vast-ink hover:bg-lavender-whisper transition-all group"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-vast-ink text-white rounded-inputs">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-vast-ink text-sm">Onboard New Society</h4>
              <p className="text-[11px] font-medium text-fog">Provision a new society account with advisor assignment</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-vast-ink group-hover:translate-x-1 transition-transform" />
        </div>
      </Link>

      {/* 4. Activity Section — 2-column */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Pending Events */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b-2 border-vast-ink pb-3">
            <div className="flex items-center gap-2 font-extrabold text-lg text-vast-ink">
              <Clock className="w-5 h-5 text-ember-glow" />
              <h3>Pending Review ({pendingEvents.length})</h3>
            </div>
            <Link to="/admin/events?type=pending" className="text-sm font-bold text-vast-ink hover:text-forest-ink transition-colors underline underline-offset-2">
              View All
            </Link>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="bg-pure-white p-5 rounded-cards border-2 border-vast-ink animate-pulse space-y-2">
                  <div className="h-5 bg-lumen-stone rounded w-1/3" />
                  <div className="h-4 bg-lumen-stone rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : pendingEvents.length === 0 ? (
            <div className="bg-pure-white p-10 rounded-cards border-2 border-vast-ink text-center text-fog space-y-3 flex flex-col items-center">
              <Shield className="w-12 h-12 text-fog opacity-30" />
              <p className="font-bold text-sm">You're all caught up! No events pending review.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingEvents.map((evt) => (
                <Link
                  key={evt.id}
                  to={`/admin/events/${evt.id}/review`}
                  className="bg-pure-white p-4 rounded-cards border-2 border-vast-ink hover:bg-lavender-whisper transition-all flex items-center justify-between group"
                >
                  <div className="space-y-1">
                    <h4 className="font-bold text-vast-ink text-sm">{evt.title}</h4>
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

        {/* Upcoming Events */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b-2 border-vast-ink pb-3">
            <div className="flex items-center gap-2 font-extrabold text-lg text-vast-ink">
              <Calendar className="w-5 h-5 text-forest-ink" />
              <h3>Upcoming Events ({upcomingEvents.length})</h3>
            </div>
            <Link to="/admin/events?type=upcoming" className="text-sm font-bold text-vast-ink hover:text-forest-ink transition-colors underline underline-offset-2">
              View All
            </Link>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="bg-pure-white p-5 rounded-cards border-2 border-vast-ink animate-pulse space-y-2">
                  <div className="h-5 bg-lumen-stone rounded w-1/3" />
                  <div className="h-4 bg-lumen-stone rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : upcomingEvents.length === 0 ? (
            <div className="bg-pure-white p-10 rounded-cards border-2 border-vast-ink text-center text-fog space-y-3 flex flex-col items-center">
              <Calendar className="w-12 h-12 text-fog opacity-30" />
              <p className="font-bold text-sm">No upcoming events scheduled.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingEvents.map((evt) => (
                <Link
                  key={evt.id}
                  to={`/events/${evt.id}`}
                  className="bg-pure-white p-4 rounded-cards border-2 border-vast-ink hover:bg-lavender-whisper transition-all flex items-center justify-between group"
                >
                  <div className="space-y-1">
                    <h4 className="font-bold text-vast-ink text-sm">{evt.title}</h4>
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

      <MakeAnnouncementDialog
        isOpen={isAnnouncementDialogOpen}
        onClose={() => setIsAnnouncementDialogOpen(false)}
      />
    </div>
  );
};
