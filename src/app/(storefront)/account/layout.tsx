import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getCustomerSession } from '@/lib/customer/getSession';
import { spacing, cn } from '@/design';

const NAV = [
  { href: '/account', label: 'Overview' },
  { href: '/account/orders', label: 'Orders' },
  { href: '/account/purchase-inquiries', label: 'Purchase Requests' },
  { href: '/account/addresses', label: 'Addresses' },
];

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  // Defense-in-depth beyond src/proxy.ts — belt-and-suspenders in case the
  // proxy matcher config ever drifts (same pattern as the admin dashboard).
  const session = await getCustomerSession();
  if (!session) redirect('/login?from=/account');

  return (
    <section className={cn(spacing.containerPadding, spacing.sectionMargin, 'mx-auto max-w-4xl')}>
      <h1 className="text-h2 font-heading font-bold text-neutral-white">My Account</h1>
      <nav aria-label="Account" className="mt-6 flex gap-2 border-b border-neutral-titanium/20">
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="px-3 py-2 text-body-sm font-body text-neutral-light-gray hover:text-accent-primary"
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="mt-6">{children}</div>
    </section>
  );
}
