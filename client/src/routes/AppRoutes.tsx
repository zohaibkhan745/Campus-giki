import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { RootLayout } from '@/layouts/RootLayout';
import { AuthLayout } from '@/layouts/AuthLayout';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { ProtectedRoute } from '@/routes/ProtectedRoute';
import { PublicOnlyRoute } from '@/routes/PublicOnlyRoute';

// UI components for Suspense Fallback
import { Loader2 } from 'lucide-react';

const PageFallback = () => (
  <div className="flex-1 flex flex-col items-center justify-center min-h-[50vh] space-y-4">
    <div className="p-4 bg-slate-900/50 rounded-2xl border border-slate-800">
      <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
    </div>
    <p className="text-sm font-semibold text-slate-400">Loading module...</p>
  </div>
);

// Lazy Loaded Pages
const HomePage = React.lazy(() => import('@/pages/HomePage').then(m => ({ default: m.HomePage })));
const LoginPage = React.lazy(() => import('@/pages/LoginPage').then(m => ({ default: m.LoginPage })));
const ActivateSocietyPage = React.lazy(() => import('@/pages/ActivateSocietyPage').then(m => ({ default: m.ActivateSocietyPage })));
const DashboardPage = React.lazy(() => import('@/pages/DashboardPage').then(m => ({ default: m.DashboardPage })));
const SocietySetupPage = React.lazy(() => import('@/pages/SocietySetupPage').then(m => ({ default: m.SocietySetupPage })));
const SocietyDirectoryPage = React.lazy(() => import('@/pages/societies/SocietyDirectoryPage').then(m => ({ default: m.SocietyDirectoryPage })));
const SocietyProfilePage = React.lazy(() => import('@/pages/societies/SocietyProfilePage').then(m => ({ default: m.SocietyProfilePage })));
const CampusCalendarPage = React.lazy(() => import('@/pages/events/CampusCalendarPage').then(m => ({ default: m.CampusCalendarPage })));
const UpcomingEventsPage = React.lazy(() => import('@/pages/events/UpcomingEventsPage').then(m => ({ default: m.UpcomingEventsPage })));
const CreateEventPage = React.lazy(() => import('@/pages/events/CreateEventPage').then(m => ({ default: m.CreateEventPage })));
const EditEventPage = React.lazy(() => import('@/pages/events/EditEventPage').then(m => ({ default: m.EditEventPage })));
const EventDetailPage = React.lazy(() => import('@/pages/events/EventDetailPage').then(m => ({ default: m.EventDetailPage })));
const YearlyCalendarPage = React.lazy(() => import('@/pages/calendar/YearlyCalendarPage').then(m => ({ default: m.YearlyCalendarPage })));
const AdvisorQueuePage = React.lazy(() => import('@/pages/advisor/AdvisorQueuePage').then(m => ({ default: m.AdvisorQueuePage })));
const AdvisorPlanReviewPage = React.lazy(() => import('@/pages/advisor/AdvisorPlanReviewPage').then(m => ({ default: m.AdvisorPlanReviewPage })));
const AdvisorEventReviewPage = React.lazy(() => import('@/pages/advisor/AdvisorEventReviewPage').then(m => ({ default: m.AdvisorEventReviewPage })));
const AdminYearlyPlansPage = React.lazy(() => import('@/pages/admin/AdminYearlyPlansPage').then(m => ({ default: m.AdminYearlyPlansPage })));
const AdminYearlyPlanDetailPage = React.lazy(() => import('@/pages/admin/AdminYearlyPlanDetailPage').then(m => ({ default: m.AdminYearlyPlanDetailPage })));
const AdminSocietiesPage = React.lazy(() => import('@/pages/admin/AdminSocietiesPage').then(m => ({ default: m.AdminSocietiesPage })));
const CreateSocietyPage = React.lazy(() => import('@/pages/admin/CreateSocietyPage').then(m => ({ default: m.CreateSocietyPage })));
const AdminEventsPage = React.lazy(() => import('@/pages/admin/AdminEventsPage').then(m => ({ default: m.AdminEventsPage })));
const AdminPendingEventsPage = React.lazy(() => import('@/pages/admin/AdminPendingEventsPage').then(m => ({ default: m.AdminPendingEventsPage })));
const AdminEventReviewPage = React.lazy(() => import('@/pages/admin/AdminEventReviewPage').then(m => ({ default: m.AdminEventReviewPage })));
const AdminPostsPage = React.lazy(() => import('@/pages/admin/AdminPostsPage').then(m => ({ default: m.AdminPostsPage })));
const AdminAdvisorsPage = React.lazy(() => import('@/pages/admin/AdminAdvisorsPage').then(m => ({ default: m.AdminAdvisorsPage })));
const NotFoundPage = React.lazy(() => import('@/pages/NotFoundPage').then(m => ({ default: m.NotFoundPage })));
const ComingSoonPage = React.lazy(() => import('@/pages/ComingSoonPage').then(m => ({ default: m.ComingSoonPage })));
const SocietyEventsPage = React.lazy(() => import('@/pages/societies/SocietyEventsPage').then(m => ({ default: m.SocietyEventsPage })));
const SocietyPostsPage = React.lazy(() => import('@/pages/societies/SocietyPostsPage').then(m => ({ default: m.SocietyPostsPage })));
const SettingsPage = React.lazy(() => import('@/pages/SettingsPage').then(m => ({ default: m.SettingsPage })));

export const AppRoutes: React.FC = () => {
  return (
    <Suspense fallback={<PageFallback />}>
      <Routes>
        {/* Public Routes with Global Navigation */}
        <Route element={<RootLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/upcoming-events" element={<UpcomingEventsPage />} />
          <Route path="/societies" element={<SocietyDirectoryPage />} />
          <Route path="/societies/:id" element={<SocietyProfilePage />} />
          <Route path="/events" element={<CampusCalendarPage />} />
          <Route path="/events/:id" element={<EventDetailPage />} />
        </Route>

        {/* Auth Routes */}
        <Route
          element={
            <PublicOnlyRoute>
              <AuthLayout />
            </PublicOnlyRoute>
          }
        >
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<Navigate to="/login" replace />} />
          <Route path="/activate-society" element={<ActivateSocietyPage />} />
        </Route>

        {/* Society Role Specific Routes */}
        <Route
          element={
            <ProtectedRoute allowedRoles={['SOCIETY']}>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/society/setup" element={<SocietySetupPage />} />
          <Route path="/society/calendar" element={<YearlyCalendarPage />} />
          <Route path="/society/events" element={<SocietyEventsPage />} />
          <Route path="/society/posts" element={<SocietyPostsPage />} />
          <Route path="/events/create" element={<CreateEventPage />} />
          <Route path="/events/:id/edit" element={<EditEventPage />} />
        </Route>

        {/* Advisor Role Specific Routes */}
        <Route
          element={
            <ProtectedRoute allowedRoles={['ADVISOR']}>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/advisor/yearly-plans" element={<AdvisorQueuePage />} />
          <Route path="/advisor/yearly-plans/:id" element={<AdvisorPlanReviewPage />} />
          <Route path="/advisor/events/:id" element={<AdvisorEventReviewPage />} />
        </Route>

        {/* DSA Admin Role Specific Routes */}
        <Route
          element={
            <ProtectedRoute allowedRoles={['DSA_ADMIN']}>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/admin/societies" element={<AdminSocietiesPage />} />
          <Route path="/admin/societies/create" element={<CreateSocietyPage />} />
          <Route path="/admin/yearly-plans" element={<AdminYearlyPlansPage />} />
          <Route path="/admin/yearly-plans/:id" element={<AdminYearlyPlanDetailPage />} />
          <Route path="/admin/events" element={<AdminEventsPage />} />
          <Route path="/admin/events/pending" element={<AdminPendingEventsPage />} />
          <Route path="/admin/events/:id" element={<AdminEventReviewPage />} />
          <Route path="/admin/posts" element={<AdminPostsPage />} />
          <Route path="/admin/advisors" element={<AdminAdvisorsPage />} />
        </Route>

        {/* General Authenticated Protected Routes */}
        <Route
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>

        {/* Catch-all 404 Route */}
        <Route path="/coming-soon" element={<ComingSoonPage />} />
        <Route path="/about" element={<ComingSoonPage />} />
        <Route path="/services" element={<ComingSoonPage />} />
        <Route path="/privacy-policy" element={<ComingSoonPage />} />
        <Route path="/terms-of-service" element={<ComingSoonPage />} />
        <Route path="/cookie-settings" element={<ComingSoonPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
};

