'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ChevronDown,
  ChevronsLeft,
  ChevronsRight,
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
  type LucideIcon,
} from 'lucide-react';
import { accessibility, cn } from '@/design';
import Logo from '@/components/Logo';
import { useSidebarCollapsed } from '@/hooks/useSidebarCollapsed';

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

interface NavSection {
  label: string;
  items: NavItem[];
}

const NAV_SECTIONS: NavSection[] = [
  { label: 'Overview', items: [{ label: 'Analytics', href: '/admin', icon: Gauge }] },
  {
    label: 'Commerce',
    items: [
      { label: 'Inventory', href: '/admin/inventory', icon: Package },
      { label: 'Orders', href: '/admin/orders', icon: ShoppingCart },
      { label: 'Customers', href: '/admin/customers', icon: Users },
    ],
  },
  {
    label: 'Engagement',
    items: [
      { label: 'AI Chatbot', href: '/admin/chatbot', icon: MessageSquare },
      { label: 'Appointments', href: '/admin/appointments', icon: CalendarClock },
      { label: 'Rewards', href: '/admin/rewards', icon: Gift },
    ],
  },
  { label: 'Site', items: [{ label: 'Content', href: '/admin/content', icon: FileText }] },
  {
    label: 'System',
    items: [
      { label: 'Users & Roles', href: '/admin/users', icon: ShieldCheck },
      { label: 'Settings', href: '/admin/settings', icon: Settings },
      { label: 'Activity Logs', href: '/admin/logs', icon: History },
    ],
  },
];

export default function AdminSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useSidebarCollapsed();
  const [closedSections, setClosedSections] = useState<Set<string>>(new Set());

  function toggleSection(label: string) {
    setClosedSections((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  }

  return (
    <nav aria-label="Admin" className="flex h-full flex-col bg-bg-secondary">
      <div className={cn('flex items-center gap-2 border-b border-neutral-titanium/20 px-4 py-4', collapsed && 'justify-center px-2')}>
        {collapsed ? <Logo variant="icon" /> : <Logo variant="lockup" />}
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-3">
        {NAV_SECTIONS.map((section) => {
          const isClosed = closedSections.has(section.label);
          return (
            <div key={section.label} className="mb-2">
              {!collapsed && (
                <button
                  type="button"
                  onClick={() => toggleSection(section.label)}
                  aria-expanded={!isClosed}
                  className={cn(
                    'flex w-full items-center justify-between rounded-md px-2 py-1.5 text-label-xs font-body font-semibold uppercase tracking-wide text-neutral-titanium hover:text-neutral-silver',
                    accessibility.focusRing
                  )}
                >
                  {section.label}
                  <ChevronDown size={12} className={cn('transition-transform duration-300', isClosed && '-rotate-90')} aria-hidden="true" />
                </button>
              )}

              {(!isClosed || collapsed) && (
                <ul className="mt-1 flex flex-col gap-0.5">
                  {section.items.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          onClick={onNavigate}
                          aria-current={isActive ? 'page' : undefined}
                          title={collapsed ? item.label : undefined}
                          className={cn(
                            'flex items-center gap-3 rounded-md px-2.5 py-2 text-body-sm font-body transition-colors duration-300',
                            collapsed && 'justify-center',
                            isActive
                              ? 'bg-accent-primary/10 text-accent-primary'
                              : 'text-neutral-light-gray hover:bg-bg-primary hover:text-accent-primary',
                            accessibility.focusRing
                          )}
                        >
                          <Icon size={18} aria-hidden="true" />
                          {!collapsed && item.label}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          );
        })}
      </div>

      <div className="border-t border-neutral-titanium/20 p-2">
        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className={cn(
            'flex w-full items-center justify-center gap-2 rounded-md px-2.5 py-2 text-body-sm font-body text-neutral-silver hover:bg-bg-primary hover:text-accent-primary',
            accessibility.focusRing
          )}
        >
          {collapsed ? <ChevronsRight size={18} aria-hidden="true" /> : <ChevronsLeft size={18} aria-hidden="true" />}
          {!collapsed && 'Collapse'}
        </button>
      </div>
    </nav>
  );
}
