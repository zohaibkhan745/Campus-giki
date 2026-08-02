import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  CalendarDays,
  Users,
  User,
  LogOut,
  Settings,
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

  const navLinks = [
    { label: 'Home', path: '/', icon: Home },
    { label: 'Calendar', path: '/events', icon: CalendarDays },
    { label: 'Clubs', path: '/societies', icon: Users },
    ...(user ? [{ label: 'Dashboard', path: '/dashboard', icon: User }] : []),
  ];

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case 'DSA_ADMIN':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-100 text-purple-700 border border-purple-300 rounded-full text-[10px] font-extrabold uppercase tracking-wider">
            <Shield className="w-3 h-3" /> Admin
          </span>
        );
      case 'ADVISOR':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 border border-amber-300 rounded-full text-[10px] font-extrabold uppercase tracking-wider">
            <GraduationCap className="w-3 h-3" /> Advisor
          </span>
        );
      case 'SOCIETY':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 border border-blue-300 rounded-full text-[10px] font-extrabold uppercase tracking-wider">
            <Building2 className="w-3 h-3" /> Society
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-700 border border-emerald-300 rounded-full text-[10px] font-extrabold uppercase tracking-wider">
            Student
          </span>
        );
    }
  };

  return (
    <>
      {/* Desktop Borderless Instagram-Inspired Left Sidebar Navigation */}
      <aside className="hidden md:flex flex-col w-20 lg:w-60 shrink-0 sticky top-0 h-screen py-6 px-3 lg:px-5 font-figtree select-none z-40 border-r border-vast-ink/15 bg-lumen-cream transition-all">
        <div className="flex flex-col h-full justify-between overflow-y-auto">
          
          {/* Top Section: Brand & Vertical Icon Nav Stack */}
          <div className="space-y-8">
            {/* GIKI Brand Logo */}
            <Link
              to="/"
              className="flex items-center gap-3 px-2 py-1 rounded-full hover:bg-lumen-stone transition-all group"
              title="GIKI Campus Home"
            >
              <div className="w-10 h-10 rounded-full bg-vast-ink text-pure-white border-2 border-vast-ink flex items-center justify-center font-extrabold text-xl shadow-sm group-hover:scale-105 transition-transform shrink-0">
                G
              </div>
              <div className="text-left hidden lg:block">
                <h1 className="font-eb-garamond font-bold text-xl text-vast-ink leading-none">
                  GIKI Campus
                </h1>
                <p className="text-[10px] font-extrabold text-fog uppercase tracking-widest mt-1">
                  Student Portal
                </p>
              </div>
            </Link>

            {/* Icon Navigation Stack (Borderless, Flat Pill Active States) */}
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
                        ? 'bg-vast-ink text-pure-white shadow-sm'
                        : 'text-vast-ink hover:bg-lumen-stone'
                    }`}
                  >
                    <Icon className="w-6 h-6 shrink-0" strokeWidth={isActive ? 2.5 : 2} />
                    <span className="hidden lg:inline text-sm font-extrabold">{link.label}</span>

                    {link.path === '/dashboard' && totalPending > 0 && (
                      <span className="flex items-center justify-center w-5 h-5 bg-ember-glow text-pure-white text-[10px] font-extrabold rounded-full shrink-0 shadow-sm animate-pulse border border-pure-white absolute -top-1 -right-1 lg:static lg:ml-auto">
                        {totalPending > 9 ? '9+' : totalPending}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Bottom Section: Profile & Authentication */}
          {user && (
            <div className="pt-4 border-t border-vast-ink/15 text-left">
              <div className="flex items-center justify-center lg:justify-between gap-2 p-2 rounded-full hover:bg-lumen-stone transition-all">
                <div className="min-w-0 flex-1 hidden lg:block">
                  <p className="text-xs font-extrabold text-vast-ink truncate">
                    {user.fullName || user.email}
                  </p>
                  <div className="mt-1">
                    {getRoleBadge(user.role)}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Link
                    to="/settings"
                    className="p-2 text-vast-ink hover:bg-lumen-stone rounded-full transition-colors hidden lg:block"
                    title="Settings"
                  >
                    <Settings className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={logout}
                    className="p-2 text-vast-ink hover:bg-red-50 hover:text-red-500 rounded-full transition-colors shrink-0"
                    title="Log Out"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Mobile Top Navigation Header */}
      <div className="md:hidden sticky top-0 z-40 bg-lumen-cream border-b-2 border-vast-ink px-4 py-3 font-figtree shadow-sm flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-inputs bg-vast-ink text-pure-white border border-vast-ink flex items-center justify-center font-extrabold text-base">
            G
          </div>
          <span className="font-eb-garamond font-bold text-lg text-vast-ink">
            GIKI Campus
          </span>
        </Link>

        {user && (
          <div className="flex items-center gap-2">
            {getRoleBadge(user.role)}
            <button
              onClick={logout}
              className="p-1.5 text-vast-ink hover:bg-lumen-stone rounded-inputs border border-vast-ink/20"
              title="Log Out"
            >
              <LogOut className="w-4 h-4 text-red-500" />
            </button>
          </div>
        )}
      </div>

      {/* Mobile Bottom Navigation Bar (Instagram Style) */}
      <div className="md:hidden fixed bottom-4 left-4 right-4 z-50 font-figtree">
        <nav className="flex items-center justify-between bg-pure-white shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-vast-ink/10 rounded-[32px] px-4 py-2">
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
                      ? 'bg-vast-ink text-pure-white'
                      : 'text-vast-ink/60 hover:text-vast-ink'
                  }`}
                >
                  <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
                  {link.path === '/dashboard' && totalPending > 0 && (
                    <span className="absolute -top-1 -right-1 flex items-center justify-center w-4 h-4 bg-ember-glow text-pure-white text-[9px] font-bold rounded-full shadow-sm">
                      {totalPending > 9 ? '9+' : totalPending}
                    </span>
                  )}
                </div>
                <span
                  className={`text-[11px] font-bold transition-colors ${
                    isActive ? 'text-vast-ink font-extrabold' : 'text-vast-ink/60'
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
