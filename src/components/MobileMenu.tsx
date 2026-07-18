'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { Headphones, Home, PackageSearch, Search, UserPlus, Wrench, X } from 'lucide-react';
import type { NavLink } from '@/types/navigation';
import { accessibility, cn } from '@/design';

interface MobileMenuProps {
  links: NavLink[];
  activeHref: string;
  isOpen: boolean;
  onClose: () => void;
}

const MOBILE_NAV_ICON_MAP: Record<string, typeof Home> = {
  Shop: PackageSearch,
  About: Home,
  Support: Headphones,
};

export default function MobileMenu({ links, activeHref, isOpen, onClose }: MobileMenuProps) {
  const firstLinkRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    document.body.style.overflow = 'hidden';
    firstLinkRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  function getIcon(link: NavLink) {
    return MOBILE_NAV_ICON_MAP[link.label] ?? Wrench;
  }

  return (
    <div className="fixed inset-0 z-modal tablet:hidden" role="dialog" aria-modal="true" aria-label="Mobile navigation">
      <button
        type="button"
        aria-label="Close menu"
        onClick={onClose}
        className="absolute inset-0 bg-bg-primary/82 backdrop-blur-md"
      />

      <div className="absolute right-0 top-0 flex h-full w-full max-w-sm flex-col bg-bg-secondary/96 p-4 shadow-elevation backdrop-blur-xl">
        <div className="mb-5 flex items-center justify-between rounded-lg border border-neutral-titanium/15 bg-bg-primary/70 px-3 py-3">
          <div>
            <span className="block text-label-md font-body font-semibold text-neutral-white">Navigation</span>
            <span className="text-label-xs font-body uppercase tracking-[0.18em] text-accent-primary">Verified tech hub</span>
          </div>
          <button
            type="button"
            aria-label="Close menu"
            onClick={onClose}
            className={cn('rounded-md p-3 text-neutral-light-gray transition-colors duration-300 hover:bg-bg-secondary hover:text-accent-primary', accessibility.focusRing)}
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        <Link
          href="/shop"
          onClick={onClose}
          className={cn(
            'mb-4 flex items-center gap-3 rounded-lg border border-neutral-titanium/15 bg-bg-primary/70 px-3 py-3 text-body-sm font-body text-neutral-silver transition-colors duration-300 hover:border-accent-primary/30 hover:text-accent-primary',
            accessibility.focusRing
          )}
        >
          <Search size={18} aria-hidden="true" />
          <span className="flex-1">Search inventory</span>
          <span className="rounded-sm border border-neutral-titanium/20 px-1.5 py-0.5 text-[10px] uppercase tracking-[0.12em] text-neutral-titanium">Shop</span>
        </Link>

        <div className="flex flex-col gap-2">
          {links.map((link, index) => {
            const isActive = link.href === activeHref;
            const Icon = getIcon(link);
            return (
              <Link
                key={link.href}
                href={link.href}
                ref={index === 0 ? firstLinkRef : undefined}
                aria-current={isActive ? 'page' : undefined}
                onClick={onClose}
                className={cn(
                  'flex items-center gap-3 rounded-lg border px-3 py-3 text-body-md font-body transition-colors duration-300',
                  isActive
                    ? 'border-accent-primary/40 bg-accent-primary text-bg-primary'
                    : 'border-neutral-titanium/10 bg-bg-primary/45 text-neutral-light-gray hover:border-accent-primary/25 hover:text-accent-primary',
                  accessibility.focusRing
                )}
              >
                <Icon size={18} aria-hidden="true" />
                <span className="flex-1">{link.label}</span>
                <span className={cn('h-2 w-2 rounded-full', isActive ? 'bg-bg-primary' : 'bg-neutral-titanium/40')} aria-hidden="true" />
              </Link>
            );
          })}
        </div>

        <div className="mt-5 flex flex-col gap-2 border-t border-neutral-titanium/20 pt-5">
          <Link
            href="/login"
            onClick={onClose}
            className={cn('flex items-center gap-3 rounded-lg px-3 py-3 text-body-md font-body text-neutral-light-gray transition-colors duration-300 hover:bg-bg-primary hover:text-accent-primary', accessibility.focusRing)}
          >
            <UserPlus size={18} aria-hidden="true" />
            Log In
          </Link>
          <Link
            href="/register"
            onClick={onClose}
            className={cn('rounded-lg border border-accent-primary/25 bg-accent-primary/10 px-3 py-3 text-center text-body-md font-body font-semibold text-accent-primary transition-colors duration-300 hover:bg-accent-primary hover:text-bg-primary', accessibility.focusRing)}
          >
            Create Account
          </Link>
        </div>

        <p className="mt-auto rounded-lg border border-neutral-titanium/10 bg-bg-primary/50 px-3 py-3 text-caption font-body text-neutral-silver">
          Professionally tested devices, transparent grading, and support when you need it.
        </p>
      </div>
    </div>
  );
}
