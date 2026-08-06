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
    { label: 'Communities', path: '/societies', icon: Users },
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
      <aside className="hidden md:flex flex-col w-20 lg:w-60 shrink-0 sticky top-0 h-screen py-6 px-3 lg:px-5 font-figtree select-none z-40 bg-lumen-cream transition-all">
        <div className="flex flex-col h-full justify-between overflow-y-auto">
          
          {/* Top Section: Brand & Vertical Icon Nav Stack */}
          <div className="space-y-8">
            {/* GIKI Brand Logo */}
            <Link
              to="/"
              className="flex items-center gap-3 px-2 py-1 rounded-full hover:bg-lumen-stone transition-all group"
              title="GIKI Campus Home"
            >
              <img
                src="/giki-logo.png"
                alt="GIKI Logo"
                className="w-10 h-10 object-cover scale-[1.6] rounded-full group-hover:scale-[1.7] transition-transform shrink-0 mix-blend-multiply"
              />
              <div className="text-left hidden lg:block">
                <h1 className="font-eb-garamond font-bold text-xl text-vast-ink leading-none">
                  GIKI Campus
                </h1>
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
          <div className="pt-4 border-t border-vast-ink/10 space-y-2">
            {user ? (
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3 px-2 py-1.5 rounded-full hover:bg-lumen-stone transition-all overflow-hidden">
                  <div className="w-8 h-8 rounded-full bg-vast-ink text-pure-white flex items-center justify-center font-bold text-xs shrink-0">
                    {user.fullName?.[0] || 'U'}
                  </div>
                  <div className="hidden lg:flex flex-col min-w-0 text-left">
                    <span className="text-xs font-extrabold text-vast-ink truncate">
                      {user.fullName}
                    </span>
                    <div className="mt-0.5">{getRoleBadge(user.role)}</div>
                  </div>
                </div>

                <div className="flex items-center justify-around lg:justify-start gap-1">
                  <Link
                    to="/settings"
                    className="p-2 text-vast-ink hover:bg-lumen-stone rounded-full transition-colors"
                    title="Settings"
                  >
                    <Settings className="w-5 h-5" />
                  </Link>
                  <button
                    onClick={logout}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                    title="Log Out"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center justify-center lg:justify-start gap-3 px-4 py-3 bg-vast-ink text-pure-white rounded-full font-bold text-sm hover:opacity-90 transition-all shadow-sm w-full"
              >
                <User className="w-5 h-5 shrink-0" />
                <span className="hidden lg:inline">Log In</span>
              </Link>
            )}
          </div>
        </div>
      </aside>

      {/* Mobile Top Navigation Header */}
      <div className="md:hidden sticky top-0 z-40 bg-lumen-cream border-b-2 border-vast-ink px-4 py-3 font-figtree shadow-sm flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <img
            src="/giki-logo.png"
            alt="GIKI Logo"
            className="w-8 h-8 object-cover scale-[1.6] rounded-full shrink-0 mix-blend-multiply"
          />
          <span className="font-eb-garamond font-bold text-lg text-vast-ink">
            GIKI Campus
          </span>
        </Link>

        {user ? (
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
        ) : (
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-vast-ink text-pure-white text-xs font-bold rounded-full shadow-sm"
          >
            <User className="w-3.5 h-3.5" />
            <span>Log in</span>
          </Link>
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
