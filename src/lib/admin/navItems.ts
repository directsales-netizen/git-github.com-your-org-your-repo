import {
  Gauge,
  Package,
  ShoppingCart,
  Users,
  MessageSquare,
  CalendarClock,
  Gift,
  FileText,
  ShieldCheck,
  Settings,
  History,
  Radar,
  Headset,
  MonitorSmartphone,
  Inbox,
  ClipboardCheck,
  ShieldAlert,
  Lock,
  KeyRound,
  type LucideIcon,
} from 'lucide-react';
import type { SessionRole } from '@/lib/admin/session';

export interface AdminNavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  section: string;
  /** Omitted = every authenticated role can see it. */
  requiresSuperAdmin?: boolean;
}

/**
 * Single source of truth for every admin destination — AdminSidebar.tsx
 * renders these grouped into sections; CommandPalette.tsx flattens and
 * fuzzy-searches the same list, so the two never drift apart.
 */
export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  { label: 'Analytics', href: '/admin', icon: Gauge, section: 'Overview' },
  { label: 'Inventory', href: '/admin/inventory', icon: Package, section: 'Commerce' },
  { label: 'Orders', href: '/admin/orders', icon: ShoppingCart, section: 'Commerce' },
  { label: 'Customers', href: '/admin/customers', icon: Users, section: 'Commerce' },
  { label: 'Requests', href: '/admin/requests', icon: Inbox, section: 'Engagement' },
  { label: 'AI Chatbot', href: '/admin/chatbot', icon: MessageSquare, section: 'Engagement' },
  { label: 'Appointments', href: '/admin/appointments', icon: CalendarClock, section: 'Engagement' },
  { label: 'Rewards', href: '/admin/rewards', icon: Gift, section: 'Engagement' },
  { label: 'Content', href: '/admin/content', icon: FileText, section: 'Site' },
  { label: 'Activity Logs', href: '/admin/logs', icon: History, section: 'System' },
  { label: 'Active Sessions', href: '/admin/sessions', icon: MonitorSmartphone, section: 'System' },
  { label: 'Users & Roles', href: '/admin/users', icon: ShieldCheck, section: 'SuperAdmin', requiresSuperAdmin: true },
  { label: 'Purchase Inquiries', href: '/admin/purchase-inquiries', icon: ClipboardCheck, section: 'SuperAdmin', requiresSuperAdmin: true },
  { label: 'Settings', href: '/admin/settings', icon: Settings, section: 'SuperAdmin', requiresSuperAdmin: true },
  { label: 'Credentials', href: '/admin/settings/credentials', icon: KeyRound, section: 'SuperAdmin', requiresSuperAdmin: true },
  { label: 'Security', href: '/admin/security', icon: Lock, section: 'SuperAdmin', requiresSuperAdmin: true },
  { label: 'Visitor Analytics', href: '/admin/visitor-analytics', icon: Radar, section: 'SuperAdmin', requiresSuperAdmin: true },
  { label: 'Fraud Review', href: '/admin/fraud', icon: ShieldAlert, section: 'SuperAdmin', requiresSuperAdmin: true },
  { label: 'Live Chat Takeover', href: '/admin/chatbot/live', icon: Headset, section: 'SuperAdmin', requiresSuperAdmin: true },
];

export function visibleNavItems(role: SessionRole | undefined): AdminNavItem[] {
  return ADMIN_NAV_ITEMS.filter((item) => !item.requiresSuperAdmin || role === 'SuperAdmin');
}
