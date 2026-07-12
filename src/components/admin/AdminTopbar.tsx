'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Bell, LogOut, Menu, Search, User } from 'lucide-react';
import { accessibility, cn } from '@/design';

export interface AdminNotification {
  id: string;
  message: string;
  tone: 'warning' | 'info';
  /** Omitted = not clickable (rare — every current notification source links somewhere). */
  href?: string;
}

interface AdminTopbarProps {
  adminEmail: string;
  notifications: AdminNotification[];
  onMenuClick: () => void;
  onSearchClick: () => void;
}

export default function AdminTopbar({ adminEmail, notifications, onMenuClick, onSearchClick }: AdminTopbarProps) {
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

      <button
        type="button"
        onClick={onSearchClick}
        aria-label="Open command palette"
        className={cn(
          'relative hidden max-w-sm flex-1 items-center gap-2 rounded-md border border-neutral-titanium bg-bg-secondary py-2 pl-9 pr-3 text-left text-body-sm font-body text-neutral-silver/60 hover:border-neutral-titanium/60 tablet:flex',
          accessibility.focusRing
        )}
      >
        <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-silver" aria-hidden="true" />
        <span className="flex-1">Jump to a page…</span>
        <kbd className="rounded border border-neutral-titanium/30 px-1.5 py-0.5 text-caption text-neutral-silver">⌘K</kbd>
      </button>

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
                notifications.map((n) => {
                  const dot = (
                    <span
                      aria-hidden="true"
                      className={cn('mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full', n.tone === 'warning' ? 'bg-warning' : 'bg-info')}
                    />
                  );
                  return n.href ? (
                    <Link
                      key={n.id}
                      href={n.href}
                      role="menuitem"
                      onClick={() => setIsNotifOpen(false)}
                      className={cn('flex items-start gap-2 rounded-md px-3 py-2 text-body-sm font-body text-neutral-light-gray hover:bg-bg-primary hover:text-accent-primary', accessibility.focusRing)}
                    >
                      {dot}
                      {n.message}
                    </Link>
                  ) : (
                    <div key={n.id} className="flex items-start gap-2 rounded-md px-3 py-2 text-body-sm font-body text-neutral-light-gray">
                      {dot}
                      {n.message}
                    </div>
                  );
                })
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
