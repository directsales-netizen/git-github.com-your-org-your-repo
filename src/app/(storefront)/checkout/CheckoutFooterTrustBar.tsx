import Link from 'next/link';
import { Lock } from 'lucide-react';

export default function CheckoutFooterTrustBar() {
  return (
    <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 border-t border-neutral-titanium/10 pt-6 text-caption font-body text-neutral-silver">
      <span className="flex items-center gap-1.5">
        <Lock size={13} aria-hidden="true" />
        SSL Encrypted
      </span>
      <span>Secure checkout powered by Stripe</span>
      <Link href="/privacy" className="hover:text-neutral-light-gray">Privacy Policy</Link>
      <Link href="/terms" className="hover:text-neutral-light-gray">Terms of Service</Link>
    </div>
  );
}
