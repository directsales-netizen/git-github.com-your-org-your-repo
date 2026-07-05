'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, Search, ShoppingCart, User } from 'lucide-react';
import { NAV_LINKS } from '@/types/navigation';
import { accessibility, cn, flex } from '@/design';
import Logo from '@/components/Logo';
import MobileMenu from '@/components/MobileMenu';

// No cart state exists yet — 0 is the correct default, not a placeholder count.
const CART_ITEM_COUNT = 0;

export default function Navigation() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const accountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isAccountOpen) return;

    function handleClickOutside(event: MouseEvent) {
      if (accountRef.current && !accountRef.current.contains(event.target as Node)) {
        setIsAccountOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setIsAccountOpen(false);
    }

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isAccountOpen]);

  return (
    <>
      <header className="sticky top-0 z-fixed border-b border-neutral-titanium/20 bg-bg-primary/95 backdrop-blur">
      <nav
        aria-label="Main"
        className={cn(flex.between, 'mx-auto max-w-[1440px] px-6 py-4 tablet:px-8 desktop:px-12')}
      >
        <Link href="/" className={cn(accessibility.focusRing, 'rounded-sm')}>
          <Logo variant="lockup" />
        </Link>

        <ul className="hidden items-center gap-8 tablet:flex">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href;
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  aria-current={isActive ? 'page' : undefined}
                  className={cn(
                    'text-body-md font-body transition-colors duration-300 hover:text-accent-primary',
                    isActive ? 'text-accent-primary' : 'text-neutral-light-gray',
                    accessibility.focusRing,
                    'rounded-sm'
                  )}
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className={cn(flex.center, 'gap-1')}>
          <button
            type="button"
            aria-label="Search"
            className={cn('flex h-11 w-11 items-center justify-center rounded-md text-neutral-light-gray transition-colors duration-300 hover:bg-bg-secondary hover:text-accent-primary', accessibility.focusRing)}
          >
            <Search size={20} aria-hidden="true" />
          </button>

          <button
            type="button"
            aria-label={`Cart, ${CART_ITEM_COUNT} items`}
            className={cn('relative flex h-11 w-11 items-center justify-center rounded-md text-neutral-light-gray transition-colors duration-300 hover:bg-bg-secondary hover:text-accent-primary', accessibility.focusRing)}
          >
            <ShoppingCart size={20} aria-hidden="true" />
            <span aria-live="polite" className="sr-only">{CART_ITEM_COUNT} items in cart</span>
            {CART_ITEM_COUNT > 0 && (
              <span
                aria-hidden="true"
                className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-accent-primary text-[10px] font-bold text-bg-primary"
              >
                {CART_ITEM_COUNT}
              </span>
            )}
          </button>

          <div className="relative hidden tablet:block" ref={accountRef}>
            <button
              type="button"
              aria-label="Account"
              aria-haspopup="menu"
              aria-expanded={isAccountOpen}
              onClick={() => setIsAccountOpen((open) => !open)}
              className={cn('flex h-11 w-11 items-center justify-center rounded-md text-neutral-light-gray transition-colors duration-300 hover:bg-bg-secondary hover:text-accent-primary', accessibility.focusRing)}
            >
              <User size={20} aria-hidden="true" />
            </button>

            {isAccountOpen && (
              <div
                role="menu"
                aria-label="Account menu"
                className="absolute right-0 mt-2 w-48 rounded-md border border-neutral-titanium/20 bg-bg-secondary p-2 shadow-elevation"
              >
                <Link
                  href="/login"
                  role="menuitem"
                  onClick={() => setIsAccountOpen(false)}
                  className={cn('block rounded-md px-3 py-2 text-body-sm font-body text-neutral-light-gray transition-colors duration-300 hover:bg-bg-primary hover:text-accent-primary', accessibility.focusRing)}
                >
                  Log In
                </Link>
                <Link
                  href="/register"
                  role="menuitem"
                  onClick={() => setIsAccountOpen(false)}
                  className={cn('block rounded-md px-3 py-2 text-body-sm font-body text-neutral-light-gray transition-colors duration-300 hover:bg-bg-primary hover:text-accent-primary', accessibility.focusRing)}
                >
                  Create Account
                </Link>
              </div>
            )}
          </div>

          <button
            type="button"
            aria-label="Open menu"
            aria-expanded={isMenuOpen}
            onClick={() => setIsMenuOpen(true)}
            className={cn('flex h-11 w-11 items-center justify-center rounded-md text-neutral-light-gray transition-colors duration-300 hover:bg-bg-secondary hover:text-accent-primary tablet:hidden', accessibility.focusRing)}
          >
            <Menu size={20} aria-hidden="true" />
          </button>
        </div>
      </nav>
      </header>

      <MobileMenu
        links={NAV_LINKS}
        activeHref={pathname}
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
      />
    </>
  );
}
