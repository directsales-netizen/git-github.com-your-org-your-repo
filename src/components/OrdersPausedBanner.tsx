import { Mail } from 'lucide-react';

/**
 * Shown on every storefront page when BusinessSettings.ordersPaused is on
 * (src/lib/admin/settings.ts) — see the gate in src/app/(storefront)/layout.tsx.
 * Unlike MaintenancePage, the storefront stays fully browsable; only adding
 * to cart and checkout are blocked (see CartContext and /api/checkout/session).
 */
export default function OrdersPausedBanner({ supportEmail }: { supportEmail: string }) {
  return (
    <div className="bg-accent-secondary/15 px-6 py-3 text-center text-body-sm font-body text-neutral-white">
      Online ordering is temporarily paused. Browsing is still open — to place an order, email{' '}
      <a href={`mailto:${supportEmail}`} className="inline-flex items-center gap-1 font-semibold text-accent-primary hover:underline">
        <Mail size={14} aria-hidden="true" />
        {supportEmail}
      </a>{' '}
      or chat with our AI assistant.
    </div>
  );
}
