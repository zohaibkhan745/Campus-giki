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
import { EventGrid } from '@/components/admin/FlippableAdminEventCard';

export const AdminDashboardPage: React.FC = () => {
  const { user, logout } = useAuth();
  const [isAnnouncementDialogOpen, setIsAnnouncementDialogOpen] = useState(false);
  const { totalPending } = usePendingCounts();
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
    <div className="w-full">
      <BannerHeader title={user?.fullName || "Dean Student Affairs"} logoUrl={user?.avatarUrl ? resolveImageUrl(user.avatarUrl) : "/default-dsa.png"} fallbackImage="/default-dsa.png" />
      <div className="max-w-6xl mx-auto space-y-6 text-left py-4 px-4">
        {/* Actions Row */}
        <div className="flex justify-end mb-4">
          <div className="grid grid-cols-2 md:flex md:flex-wrap lg:flex-nowrap md:justify-end gap-2 md:gap-3 w-full md:w-auto shrink-0 mt-4 md:mt-0">
                    <Link
            to="/admin/societies/create"
            className="flex justify-center items-center gap-1.5 px-4 py-2.5 bg-white hover:bg-gray-100 text-gray-900 rounded-xl text-sm font-bold transition-colors shadow-lg"
          >
            <UserPlus className="w-4 h-4" />
            <span>Onboard Society</span>
          </Link>
          <button
            onClick={() => setIsAnnouncementDialogOpen(true)}
            className="flex justify-center items-center gap-1.5 px-4 py-2.5 bg-white hover:bg-gray-100 text-gray-900 rounded-xl text-sm font-bold transition-colors shadow-lg"
          >
            <Megaphone className="w-4 h-4" />
            <span>Make Post</span>
          </button>
          <Link
            to="/settings"
            className="flex justify-center items-center gap-1.5 px-4 py-2.5 bg-white hover:bg-gray-100 text-gray-900 rounded-xl text-sm font-bold transition-colors"
          >
            <Settings className="w-4 h-4" />
            <span>Settings</span>
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

      {isError && (
        <div className="space-y-3">
          null /* Removed error alert */
          <button
            onClick={() => refetch()}
            className="text-xs text-ember-glow hover:underline font-semibold"
          >
            Retry
          </button>
        </div>
      )}

      {/* 2. Command Center */}
      <div className="bg-white/[0.08] backdrop-blur-[20px] p-6 rounded-[18px] border border-white/20 shadow-[0_12px_40px_rgba(0,0,0,0.4)] space-y-5">
        <h3 className="font-extrabold text-lg text-white flex items-center gap-2">Dashboard</h3>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <Link
            to="/admin/societies"
            className="flex flex-col items-center justify-center gap-2 p-4 bg-transparent hover:bg-white/10 text-white border border-white/20 rounded-xl font-bold transition-transform hover:-translate-y-1 shadow-[0_4px_12px_rgba(0,0,0,0.2)]"
          >
            <Building2 className="w-6 h-6" />
            <span>Societies</span>
          </Link>
          <Link
            to="/admin/events"
            className="flex flex-col items-center justify-center gap-2 p-4 bg-transparent hover:bg-white/10 text-white border border-white/20 rounded-xl font-bold transition-transform hover:-translate-y-1 shadow-[0_4px_12px_rgba(0,0,0,0.2)] relative"
          >
            {totalPending > 0 && (
              <span className="absolute top-2 right-2 flex items-center justify-center w-5 h-5 bg-ember-glow text-pure-white text-[10px] font-bold rounded-full shadow-sm animate-pulse">
                {totalPending > 9 ? '9+' : totalPending}
              </span>
            )}
            <MicVocal className="w-6 h-6" />
            <span>Events</span>
          </Link>
          <Link
            to="/admin/posts"
            className="flex flex-col items-center justify-center gap-2 p-4 bg-transparent hover:bg-white/10 text-white border border-white/20 rounded-xl font-bold transition-transform hover:-translate-y-1 shadow-[0_4px_12px_rgba(0,0,0,0.2)]"
          >
            <MessageSquare className="w-6 h-6" />
            <span>Posts</span>
          </Link>
          <Link
            to="/admin/yearly-plans"
            className="flex flex-col items-center justify-center gap-2 p-4 bg-transparent hover:bg-white/10 text-white border border-white/20 rounded-xl font-bold transition-transform hover:-translate-y-1 shadow-[0_4px_12px_rgba(0,0,0,0.2)]"
          >
            <CalendarDays className="w-6 h-6" />
            <span>Yearly Plans</span>
          </Link>
          <Link
            to="/admin/advisors" className="col-span-2 md:col-span-1 flex flex-col items-center justify-center gap-2 p-4 bg-transparent hover:bg-white/10 text-white border border-white/20 rounded-xl font-bold transition-transform hover:-translate-y-1 shadow-[0_4px_12px_rgba(0,0,0,0.2)]"
          >
            <Users className="w-6 h-6" />
            <span>Advisors</span>
          </Link>
        </div>
      </div>

      

      {/* 4. Activity Section — 2-column */}
      <div className="bg-white/[0.08] backdrop-blur-[20px] p-6 rounded-[18px] border border-white/20 shadow-[0_12px_40px_rgba(0,0,0,0.4)] flex flex-col gap-6">
        {/* Pending Events */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b-2 border-white/10 pb-3">
            <div className="flex items-center gap-2 font-extrabold text-lg text-white">
              <Clock className="w-5 h-5 text-white" />
              <h3>Pending Review ({pendingEvents.length})</h3>
            </div>
            <Link to="/admin/events/pending" className="text-sm font-bold text-white hover:text-forest-ink transition-colors underline underline-offset-2">
              View All
            </Link>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="bg-white/[0.05] hover:bg-white/[0.08] backdrop-blur-[12px] p-5 rounded-[18px] border border-white/10 hover:border-white/25 transition-all shadow-sm animate-pulse space-y-2">
                  <div className="h-5 bg-white/10 rounded w-1/3" />
                  <div className="h-4 bg-white/10 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : pendingEvents.length === 0 ? (
            <div className="bg-transparent p-10 rounded-[18px] border border-white/20 text-center text-gray-400 space-y-3 flex flex-col items-center">
              <Shield className="w-12 h-12 text-gray-400 opacity-30" />
              <p className="font-bold text-sm">You're all caught up! No events pending review.</p>
            </div>
          ) : (
            <EventGrid events={pendingEvents.slice(0, 4)} />
          )}
        </div>

        <hr className="border-white/10" />


        {/* Upcoming Events */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b-2 border-white/10 pb-3">
            <div className="flex items-center gap-2 font-extrabold text-lg text-white">
              <UpcomingEventIcon className="w-5 h-5 text-white" />
              <h3>Upcoming Events ({upcomingEvents.length})</h3>
            </div>
            <Link to="/admin/events" className="text-sm font-bold text-white hover:text-forest-ink transition-colors underline underline-offset-2">
              View All
            </Link>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="bg-white/[0.05] hover:bg-white/[0.08] backdrop-blur-[12px] p-5 rounded-[18px] border border-white/10 hover:border-white/25 transition-all shadow-sm animate-pulse space-y-2">
                  <div className="h-5 bg-white/10 rounded w-1/3" />
                  <div className="h-4 bg-white/10 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : upcomingEvents.length === 0 ? (
            <div className="bg-transparent p-10 rounded-[18px] border border-white/20 text-center text-gray-400 space-y-3 flex flex-col items-center">
              <UpcomingEventIcon className="w-12 h-12 text-gray-400 opacity-30" />
              <p className="font-bold text-sm">No upcoming events scheduled.</p>
            </div>
          ) : (
            <EventGrid events={upcomingEvents.slice(0, 4)} />
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








