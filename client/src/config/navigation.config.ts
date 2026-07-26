import type { Role } from '@/types/auth.types';
import {
  LayoutDashboard,
  Calendar,
  Users,
  Shield,
  FileText,
  Bookmark,
  Award,
} from 'lucide-react';
import React from 'react';

export interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const ROLE_NAVIGATION: Record<Role, NavItem[]> = {
  STUDENT: [
    { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { title: 'Campus Events', href: '/events', icon: Calendar },
    { title: 'Societies', href: '/societies', icon: Users },
    { title: 'Saved Events', href: '/saved-events', icon: Bookmark },
  ],
  SOCIETY: [
    { title: 'Society Portal', href: '/dashboard', icon: LayoutDashboard },
    { title: 'Manage Events', href: '/events/manage', icon: Calendar },
    { title: 'Society Members', href: '/members', icon: Users },
    { title: 'Approvals & Requests', href: '/requests', icon: FileText },
  ],
  ADVISOR: [
    { title: 'Advisor Overview', href: '/dashboard', icon: LayoutDashboard },
    { title: 'Plan Review Queue', href: '/advisor/yearly-plans', icon: FileText },
    { title: 'Overseen Societies', href: '/societies/overseen', icon: Users },
    { title: 'Event Approvals', href: '/events/approvals', icon: Award },
  ],
  DSA_ADMIN: [
    { title: 'DSA Control Center', href: '/dashboard', icon: Shield },
    { title: 'Onboard Society', href: '/admin/societies/create', icon: Users },
    { title: 'Yearly Plan Records', href: '/admin/yearly-plans', icon: FileText },
    { title: 'All Events', href: '/admin/events', icon: Calendar },
    { title: 'System Logs', href: '/admin/logs', icon: FileText },
  ],
};
