import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  CalendarDays,
  Users,
  User,
  LogOut,
  Shield,
  Building2,
  GraduationCap,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { usePendingCounts } from '@/hooks/usePendingCounts';

export const MainNavigation: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const { totalPending } = usePendingCounts();
  const hideRoutes = ['/society/setup', '/admin/settings', '/advisor/settings', '/dsa/settings', '/settings'];
  if (hideRoutes.some(route => location.pathname.includes(route))) return null;

  const navLinks = [
    { label: 'Home', path: '/', icon: Home },
    { label: 'Calendar', path: '/events', icon: CalendarDays },
    { label: 'Societies', path: '/societies', icon: Users },
    ...(user ? [{ label: 'Dashboard', path: '/dashboard', icon: User }] : []),
  ];

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case 'DSA_ADMIN':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 rounded-full text-[10px] font-extrabold uppercase tracking-wider">
            <Shield className="w-3 h-3" /> Admin
          </span>
        );
      case 'ADVISOR':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 rounded-full text-[10px] font-extrabold uppercase tracking-wider">
            <GraduationCap className="w-3 h-3" /> Advisor
          </span>
        );
      case 'SOCIETY':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 rounded-full text-[10px] font-extrabold uppercase tracking-wider">
            <Building2 className="w-3 h-3" /> Society
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 rounded-full text-[10px] font-extrabold uppercase tracking-wider">
            Student
          </span>
        );
    }
  };

  return (
    <>
      {/* Desktop Borderless Left Sidebar Navigation */}
      <aside className="hidden md:flex flex-col w-20 lg:w-60 shrink-0 sticky top-0 h-[100dvh] py-6 px-3 lg:px-5 font-figtree select-none z-40 bg-surface-glass backdrop-blur-md border-r border-border-subtle transition-all">
        <div className="flex flex-col h-full justify-between overflow-y-auto">
          
          {/* Top Section: Brand & Vertical Icon Nav Stack */}
          <div className="space-y-8">
            {/* GIKI Brand Logo */}
            <Link
              to="/"
              className="flex items-center gap-3 px-2 py-1 rounded-full hover:bg-surface-hover transition-all group"
              title="GIKI Campus Home"
            >
              <img
                src="/giki-logo.png"
                alt="GIKI Logo"
                className="w-10 h-10 object-cover scale-[1.6] rounded-full group-hover:scale-[1.7] transition-transform shrink-0"
              />
              <div className="text-left hidden lg:block">
                <h1 className="font-eb-garamond font-bold text-xl text-text-primary leading-none">
                  GIKI Campus
                </h1>
              </div>
            </Link>

            {/* Icon Navigation Stack */}
            <nav className="space-y-2">
              {navLinks.map((link) => {
                const isActive =
                  link.path === '/'
                    ? location.pathname === '/'
                    : location.pathname.startsWith(link.path);

                const Icon = link.icon;

                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    title={link.label}
                    className={`flex items-center justify-center lg:justify-start gap-4 px-3.5 py-3 rounded-full transition-all relative ${
                      isActive
                        ? 'bg-surface-elevated text-brand-primary font-bold shadow-sm border border-border-subtle'
                        : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover'
                    }`}
                  >
                    <Icon className="w-6 h-6 shrink-0" strokeWidth={isActive ? 2.5 : 2} />
                    <span className="hidden lg:inline text-sm font-extrabold">{link.label}</span>

                    {link.path === '/dashboard' && totalPending > 0 && (
                      <span className="flex items-center justify-center w-5 h-5 bg-brand-primary text-text-inverse text-[10px] font-extrabold rounded-full shrink-0 shadow-sm animate-pulse border border-border-subtle absolute -top-1 -right-1 lg:static lg:ml-auto">
                        {totalPending > 9 ? '9+' : totalPending}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Bottom Section: Profile & Authentication */}

        </div>
      </aside>

      {/* Mobile Top Navigation Header */}
      <div className="md:hidden sticky top-0 z-40 bg-surface-glass backdrop-blur-md border-b border-border-subtle px-4 py-3 font-figtree shadow-sm flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <img
            src="/giki-logo.png"
            alt="GIKI Logo"
            className="w-8 h-8 object-cover scale-[1.6] rounded-full shrink-0"
          />
          <span className="font-eb-garamond font-bold text-lg text-text-primary">
            GIKI Campus
          </span>
        </Link>

        {user && (
          <div className="flex items-center gap-2">
            {getRoleBadge(user.role)}
            <button
              onClick={logout}
              className="p-1.5 text-text-secondary hover:text-text-primary hover:bg-surface-hover rounded-xl border border-border-subtle cursor-pointer"
              title="Log Out"
            >
              <LogOut className="w-4 h-4 text-red-500" />
            </button>
          </div>
        )}
      </div>

      {/* Mobile Bottom Navigation Bar (Instagram Style) */}
      <div className="md:hidden fixed bottom-4 left-4 right-4 z-50 font-figtree">
        <nav className="flex items-center justify-between bg-surface-glass backdrop-blur-lg shadow-elevation-3 border border-border-subtle rounded-full px-4 py-2">
          {navLinks.map((link) => {
            const isActive =
              link.path === '/'
                ? location.pathname === '/'
                : location.pathname.startsWith(link.path);

            const Icon = link.icon;

            return (
              <Link
                key={link.path}
                to={link.path}
                className="flex flex-col items-center justify-center gap-1 min-w-[64px]"
              >
                <div
                  className={`relative flex items-center justify-center w-14 h-8 rounded-full transition-colors ${
                    isActive
                      ? 'bg-brand-primary/10 text-brand-primary'
                      : 'text-text-muted hover:text-text-primary'
                  }`}
                >
                  <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
                  {link.path === '/dashboard' && totalPending > 0 && (
                    <span className="absolute -top-1 -right-1 flex items-center justify-center w-4 h-4 bg-brand-primary text-text-inverse text-[9px] font-bold rounded-full shadow-sm">
                      {totalPending > 9 ? '9+' : totalPending}
                    </span>
                  )}
                </div>
                <span
                  className={`text-[11px] font-bold transition-colors ${
                    isActive ? 'text-brand-primary font-extrabold' : 'text-text-muted'
                  }`}
                >
                  {link.label}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
};


