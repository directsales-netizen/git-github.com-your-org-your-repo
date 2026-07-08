import { Wrench } from 'lucide-react';
import Logo from '@/components/Logo';

/**
 * Replaces the entire public-facing storefront when
 * BusinessSettings.maintenanceMode is on (src/lib/admin/settings.ts) — see
 * the gate in src/app/(storefront)/layout.tsx. Admin sessions bypass this
 * and see the site normally so the team can keep working during the window.
 */
export default function MaintenancePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-bg-primary px-6 text-center">
      <Logo variant="lockup" />
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent-primary/10">
        <Wrench size={28} className="text-accent-primary" aria-hidden="true" />
      </div>
      <div className="max-w-lg">
        <h1 className="text-h2 font-heading font-bold text-neutral-white">We&apos;ll be right back</h1>
        <p className="mt-4 text-body-md font-body text-neutral-light-gray">
          We&apos;re performing scheduled updates to Premium TechNoir to keep improving your experience. The site
          will be back shortly — thanks for your patience.
        </p>
        <p className="mt-6 text-body-sm font-body text-neutral-silver">
          Need help right now? Reach our support team at{' '}
          <a href="mailto:support@premiumtechnoir.com" className="font-semibold text-accent-primary hover:underline">
            support@premiumtechnoir.com
          </a>
          .
        </p>
      </div>
    </div>
  );
}
