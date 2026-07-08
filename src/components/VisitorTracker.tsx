'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { accessibility, buttonVariants, cn } from '@/design';

const CONSENT_KEY = 'ptn_analytics_consent';
type ConsentChoice = 'accepted' | 'declined';

function readConsent(): ConsentChoice | null {
  if (typeof window === 'undefined') return null;
  const value = localStorage.getItem(CONSENT_KEY);
  return value === 'accepted' || value === 'declined' ? value : null;
}

function sendBeacon(path: string) {
  fetch('/api/visitor/track', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    keepalive: true,
    body: JSON.stringify({
      path,
      title: document.title,
      referrer: document.referrer || null,
      screen: `${window.screen.width}x${window.screen.height}`,
      language: navigator.language,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      consent: true,
    }),
  }).catch(() => {
    // Analytics is best-effort — never surface a failure to the visitor.
  });
}

/**
 * Mounted once in the storefront root layout, never on /admin. Shows a
 * minimal consent banner before any tracking beacon is sent; declining
 * permanently opts the visitor out (no cookie is ever set for them). See
 * docs/VISITOR_ANALYTICS.md for what this feeds and who can see it.
 */
export default function VisitorTracker() {
  const pathname = usePathname();
  const [consent, setConsent] = useState<ConsentChoice | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setConsent(readConsent());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated || consent !== 'accepted' || !pathname || pathname.startsWith('/admin')) return;
    sendBeacon(pathname);
  }, [hydrated, consent, pathname]);

  if (!hydrated || consent !== null || pathname?.startsWith('/admin')) return null;

  function choose(choice: ConsentChoice) {
    localStorage.setItem(CONSENT_KEY, choice);
    setConsent(choice);
  }

  return (
    <div
      role="region"
      aria-label="Cookie and analytics notice"
      className="fixed inset-x-0 bottom-0 z-modal border-t border-neutral-titanium/20 bg-bg-secondary/95 px-4 py-4 backdrop-blur-sm tablet:px-6"
    >
      <div className="mx-auto flex max-w-4xl flex-col items-start gap-3 tablet:flex-row tablet:items-center tablet:justify-between">
        <p className="text-body-sm font-body text-neutral-light-gray">
          We use minimal, anonymous analytics (pages visited, device type, approximate location) to improve the site. We never collect
          passwords, payment details, or the content of anything you type. See our Privacy Policy for details.
        </p>
        <div className="flex shrink-0 gap-2">
          <button type="button" onClick={() => choose('declined')} className={cn(buttonVariants.ghost, accessibility.focusRing, 'px-4 py-2 text-body-sm')}>
            Decline
          </button>
          <button type="button" onClick={() => choose('accepted')} className={cn(buttonVariants.primary, accessibility.focusRing, 'px-4 py-2 text-body-sm')}>
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
