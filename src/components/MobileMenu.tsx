'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { X } from 'lucide-react';
import type { NavLink } from '@/types/navigation';
import { accessibility, cn } from '@/design';

interface MobileMenuProps {
  links: NavLink[];
  activeHref: string;
  isOpen: boolean;
  onClose: () => void;
}

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

  return (
    <div className="fixed inset-0 z-modal tablet:hidden" role="dialog" aria-modal="true" aria-label="Mobile navigation">
      <button
        type="button"
        aria-label="Close menu"
        onClick={onClose}
        className="absolute inset-0 bg-bg-primary/80 backdrop-blur-sm"
      />

      <div className="absolute right-0 top-0 flex h-full w-full max-w-xs flex-col gap-1 bg-bg-secondary p-6 shadow-elevation">
        <div className="mb-4 flex items-center justify-between">
          <span className="text-label-md font-body font-semibold text-neutral-white">Menu</span>
          <button
            type="button"
            aria-label="Close menu"
            onClick={onClose}
            className={cn('rounded-md p-3 text-neutral-light-gray hover:text-accent-primary', accessibility.focusRing)}
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        {links.map((link, index) => {
          const isActive = link.href === activeHref;
          return (
            <Link
              key={link.href}
              href={link.href}
              ref={index === 0 ? firstLinkRef : undefined}
              aria-current={isActive ? 'page' : undefined}
              onClick={onClose}
              className={cn(
                'rounded-md px-3 py-3 text-body-md font-body transition-colors duration-300 hover:bg-bg-primary hover:text-accent-primary',
                isActive ? 'text-accent-primary' : 'text-neutral-light-gray',
                accessibility.focusRing
              )}
            >
              {link.label}
            </Link>
          );
        })}

        <div className="mt-4 flex flex-col gap-1 border-t border-neutral-titanium/20 pt-4">
          <Link
            href="/login"
            onClick={onClose}
            className={cn('rounded-md px-3 py-3 text-body-md font-body text-neutral-light-gray transition-colors duration-300 hover:bg-bg-primary hover:text-accent-primary', accessibility.focusRing)}
          >
            Log In
          </Link>
          <Link
            href="/register"
            onClick={onClose}
            className={cn('rounded-md px-3 py-3 text-body-md font-body text-neutral-light-gray transition-colors duration-300 hover:bg-bg-primary hover:text-accent-primary', accessibility.focusRing)}
          >
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
}
