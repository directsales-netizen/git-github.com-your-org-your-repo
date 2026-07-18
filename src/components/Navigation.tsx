'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Headphones, Home, Menu, PackageSearch, Search, ShoppingCart, User, Wrench } from 'lucide-react';
import { NAV_LINKS, type NavLink } from '@/types/navigation';
import { accessibility, cn, flex } from '@/design';
import Logo from '@/components/Logo';
import MobileMenu from '@/components/MobileMenu';
import { useCart } from '@/lib/cart/CartContext';
import { useHideOnScroll, useScrolled } from '@/components/animations/NavbarMotion';
import { useReducedMotion } from '@/hooks/useReducedMotion';

const NAV_ICON_MAP: Record<string, typeof Home> = {
  Shop: PackageSearch,
  About: Home,
  Support: Headphones,
};

function getNavIcon(link: NavLink) {
  return NAV_ICON_MAP[link.label] ?? Wrench;
}

export default function Navigation({ isAuthenticated = false }: { isAuthenticated?: boolean }) {
  const pathname = usePathname();
  const router = useRouter();
  const { count } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const accountRef = useRef<HTMLDivElement>(null);
  const scrolled = useScrolled(8);
  const reducedMotion = useReducedMotion();
  const hideOnScroll = useHideOnScroll();
  // Reduced-motion users keep an always-visible nav — hiding it entirely,
  // even instantly, trades a screen-space nicety for disorientation risk
  // that isn't worth it for a purely aesthetic behavior.
  const isHidden = hideOnScroll && !reducedMotion;

  async function handleLogout() {
    setIsAccountOpen(false);
    await fetch('/api/customer/auth/logout', { method: 'POST' });
    router.push('/');
    router.refresh();
  }

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
      <header
        className={cn(
          'sticky top-0 z-fixed px-3 pt-3 transition-all duration-300 tablet:px-4',
          isHidden && '-translate-y-full',
          scrolled ? 'pb-2' : 'pb-3'
        )}
      >
      <nav
        aria-label="Main"
        className={cn(
          flex.between,
          'mx-auto max-w-[1440px] gap-3 rounded-lg border border-neutral-titanium/15 bg-bg-primary/85 px-3 py-2 shadow-[0_18px_60px_rgba(0,0,0,0.32)] backdrop-blur-xl tablet:px-4',
          scrolled && 'border-accent-primary/15 bg-bg-primary/78'
        )}
      >
        <Link href="/" className={cn(accessibility.focusRing, 'group flex min-w-0 items-center gap-3 rounded-md px-2 py-1.5')}>
          <span className="rounded-md border border-accent-primary/20 bg-accent-primary/10 p-1.5 transition-colors duration-300 group-hover:border-accent-primary/50">
            <Logo variant="icon" />
          </span>
          <span className="hidden min-w-0 flex-col desktop:flex">
            <span className="truncate text-label-md font-heading font-bold text-neutral-white">Premium TechNoir</span>
            <span className="text-label-xs font-body uppercase tracking-[0.18em] text-accent-primary">Verified tech hub</span>
          </span>
        </Link>

        <ul className="hidden items-center gap-1 rounded-md border border-neutral-titanium/10 bg-bg-secondary/60 p-1 tablet:flex">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href;
            const Icon = getNavIcon(link);
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  aria-current={isActive ? 'page' : undefined}
                  className={cn(
                    'relative inline-flex h-10 items-center gap-2 rounded-md px-3 text-body-sm font-body font-medium transition-colors duration-300 hover:bg-bg-primary hover:text-accent-primary desktop:px-4',
                    isActive ? 'bg-accent-primary text-bg-primary' : 'text-neutral-light-gray',
                    accessibility.focusRing,
                  )}
                >
                  <Icon size={16} aria-hidden="true" />
                  {link.label}
                  {isActive && !reducedMotion && (
                    <motion.span
                      layoutId="nav-active-glow"
                      className="absolute inset-0 -z-10 rounded-md bg-accent-primary shadow-[0_0_22px_rgba(47,231,242,0.28)]"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className={cn(flex.center, 'gap-1')}>
          <Link
            href="/shop"
            aria-label="Search inventory"
            className={cn(
              'hidden h-10 items-center gap-2 rounded-md border border-neutral-titanium/10 bg-bg-secondary/60 px-3 text-body-sm font-body text-neutral-silver transition-colors duration-300 hover:border-accent-primary/30 hover:text-accent-primary desktop:flex',
              accessibility.focusRing
            )}
          >
            <Search size={20} aria-hidden="true" />
            <span>Search inventory</span>
            <span className="rounded-sm border border-neutral-titanium/20 px-1.5 py-0.5 text-[10px] uppercase tracking-[0.12em] text-neutral-titanium">⌘K</span>
          </Link>

          <Link
            href="/cart"
            aria-label={`Cart, ${count} items`}
            className={cn('relative flex h-10 w-10 items-center justify-center rounded-md text-neutral-light-gray transition-colors duration-300 hover:bg-bg-secondary hover:text-accent-primary', accessibility.focusRing)}
          >
            <ShoppingCart size={20} aria-hidden="true" />
            <span aria-live="polite" className="sr-only">{count} items in cart</span>
            {count > 0 && (
              <span
                aria-hidden="true"
                className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-accent-primary text-[10px] font-bold text-bg-primary"
              >
                {count}
              </span>
            )}
          </Link>

          <div className="relative hidden tablet:block" ref={accountRef}>
            <button
              type="button"
              aria-label="Account"
              aria-haspopup="menu"
              aria-expanded={isAccountOpen}
              onClick={() => setIsAccountOpen((open) => !open)}
              className={cn('flex h-10 w-10 items-center justify-center rounded-md text-neutral-light-gray transition-colors duration-300 hover:bg-bg-secondary hover:text-accent-primary', accessibility.focusRing)}
            >
              <User size={20} aria-hidden="true" />
            </button>

            {isAccountOpen && (
              <div
                role="menu"
                aria-label="Account menu"
                className="absolute right-0 mt-2 w-52 rounded-md border border-neutral-titanium/20 bg-bg-secondary/95 p-2 shadow-elevation backdrop-blur-xl"
              >
                {isAuthenticated ? (
                  <>
                    <Link
                      href="/account"
                      role="menuitem"
                      onClick={() => setIsAccountOpen(false)}
                      className={cn('block rounded-md px-3 py-2 text-body-sm font-body text-neutral-light-gray transition-colors duration-300 hover:bg-bg-primary hover:text-accent-primary', accessibility.focusRing)}
                    >
                      My Account
                    </Link>
                    <button
                      type="button"
                      role="menuitem"
                      onClick={handleLogout}
                      className={cn('block w-full rounded-md px-3 py-2 text-left text-body-sm font-body text-neutral-light-gray transition-colors duration-300 hover:bg-bg-primary hover:text-accent-primary', accessibility.focusRing)}
                    >
                      Log Out
                    </button>
                  </>
                ) : (
                  <>
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
                  </>
                )}
              </div>
            )}
          </div>

          <button
            type="button"
            aria-label="Open menu"
            aria-expanded={isMenuOpen}
            onClick={() => setIsMenuOpen(true)}
            className={cn('flex h-10 w-10 items-center justify-center rounded-md text-neutral-light-gray transition-colors duration-300 hover:bg-bg-secondary hover:text-accent-primary tablet:hidden', accessibility.focusRing)}
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
