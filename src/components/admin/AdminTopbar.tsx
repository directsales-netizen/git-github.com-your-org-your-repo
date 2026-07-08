'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, LogOut, Menu, Search, User } from 'lucide-react';
import { accessibility, cn } from '@/design';

export interface AdminNotification {
  id: string;
  message: string;
  tone: 'warning' | 'info';
}

interface AdminTopbarProps {
  adminEmail: string;
  notifications: AdminNotification[];
  onMenuClick: () => void;
}

export default function AdminTopbar({ adminEmail, notifications, onMenuClick }: AdminTopbarProps) {
  const router = useRouter();
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) setIsNotifOpen(false);
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) setIsProfileOpen(false);
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsNotifOpen(false);
        setIsProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  async function handleLogout() {
    await fetch('/api/admin/auth/logout', { method: 'POST' });
    router.push('/admin/login');
    router.refresh();
  }

  return (
    <header className="flex items-center gap-3 border-b border-neutral-titanium/20 bg-bg-primary px-4 py-3 tablet:px-6">
      <button
        type="button"
        aria-label="Open menu"
        onClick={onMenuClick}
        className={cn('flex h-10 w-10 items-center justify-center rounded-md text-neutral-light-gray hover:bg-bg-secondary hover:text-accent-primary desktop:hidden', accessibility.focusRing)}
      >
        <Menu size={20} aria-hidden="true" />
      </button>

      <div className="relative hidden max-w-sm flex-1 tablet:block">
        <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-silver" aria-hidden="true" />
        <input
          type="search"
          placeholder="Search orders, products, customers…"
          aria-label="Search admin dashboard"
          className="w-full rounded-md border border-neutral-titanium bg-bg-secondary py-2 pl-9 pr-3 text-body-sm font-body text-neutral-white placeholder-neutral-silver/60 focus-visible:border-2 focus-visible:border-accent-primary focus-visible:outline-none"
        />
      </div>

      <div className="ml-auto flex items-center gap-1">
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            aria-label={`Notifications${notifications.length > 0 ? `, ${notifications.length} unread` : ''}`}
            aria-expanded={isNotifOpen}
            onClick={() => setIsNotifOpen((open) => !open)}
            className={cn('relative flex h-10 w-10 items-center justify-center rounded-md text-neutral-light-gray hover:bg-bg-secondary hover:text-accent-primary', accessibility.focusRing)}
          >
            <Bell size={18} aria-hidden="true" />
            {notifications.length > 0 && (
              <span aria-hidden="true" className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-error" />
            )}
          </button>

          {isNotifOpen && (
            <div role="menu" aria-label="Notifications" className="absolute right-0 z-popover mt-2 w-72 rounded-md border border-neutral-titanium/20 bg-bg-secondary p-2 shadow-elevation">
              {notifications.length === 0 ? (
                <p className="px-3 py-4 text-center text-body-sm font-body text-neutral-silver">You&apos;re all caught up.</p>
              ) : (
                notifications.map((n) => (
                  <div key={n.id} className="flex items-start gap-2 rounded-md px-3 py-2 text-body-sm font-body text-neutral-light-gray hover:bg-bg-primary">
                    <span
                      aria-hidden="true"
                      className={cn('mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full', n.tone === 'warning' ? 'bg-warning' : 'bg-info')}
                    />
                    {n.message}
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        <div className="relative" ref={profileRef}>
          <button
            type="button"
            aria-label="Profile menu"
            aria-haspopup="menu"
            aria-expanded={isProfileOpen}
            onClick={() => setIsProfileOpen((open) => !open)}
            className={cn('flex h-10 w-10 items-center justify-center rounded-full bg-accent-primary/15 text-accent-primary hover:bg-accent-primary/25', accessibility.focusRing)}
          >
            <User size={18} aria-hidden="true" />
          </button>

          {isProfileOpen && (
            <div role="menu" aria-label="Profile" className="absolute right-0 z-popover mt-2 w-56 rounded-md border border-neutral-titanium/20 bg-bg-secondary p-2 shadow-elevation">
              <p className="truncate px-3 py-2 text-body-sm font-body text-neutral-silver">{adminEmail}</p>
              <button
                type="button"
                role="menuitem"
                onClick={handleLogout}
                className={cn('flex w-full items-center gap-2 rounded-md px-3 py-2 text-body-sm font-body text-neutral-light-gray hover:bg-bg-primary hover:text-error', accessibility.focusRing)}
              >
                <LogOut size={16} aria-hidden="true" />
                Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
