'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Menu, Search, ShoppingCart, User } from 'lucide-react';
import { NAV_LINKS } from '@/types/navigation';
import { accessibility, cn, flex } from '@/design';
import Logo from '@/components/Logo';
import MobileMenu from '@/components/MobileMenu';
import { useCart } from '@/lib/cart/CartContext';
import { useScrolled } from '@/components/animations/NavbarMotion';
import { useReducedMotion } from '@/hooks/useReducedMotion';

export default function Navigation({ isAuthenticated = false }: { isAuthenticated?: boolean }) {
  const pathname = usePathname();
  const router = useRouter();
  const { count } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const accountRef = useRef<HTMLDivElement>(null);
  const scrolled = useScrolled(8);
  const reducedMotion = useReducedMotion();

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
          'sticky top-0 z-fixed border-b transition-all duration-300',
          scrolled
            ? 'border-neutral-titanium/20 bg-bg-primary/80 shadow-elevation backdrop-blur-xl'
            : 'border-transparent bg-bg-primary/95 backdrop-blur'
        )}
      >
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
                    'relative text-body-md font-body transition-colors duration-300 hover:text-accent-primary',
                    isActive ? 'text-accent-primary' : 'text-neutral-light-gray',
                    accessibility.focusRing,
                    'rounded-sm'
                  )}
                >
                  {link.label}
                  {isActive && !reducedMotion && (
                    <motion.span
                      layoutId="nav-active-underline"
                      className="absolute -bottom-1 left-0 right-0 h-0.5 rounded-full bg-accent-primary"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
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

          <Link
            href="/cart"
            aria-label={`Cart, ${count} items`}
            className={cn('relative flex h-11 w-11 items-center justify-center rounded-md text-neutral-light-gray transition-colors duration-300 hover:bg-bg-secondary hover:text-accent-primary', accessibility.focusRing)}
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
