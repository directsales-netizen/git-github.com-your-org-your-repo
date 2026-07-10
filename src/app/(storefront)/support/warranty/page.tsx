import type { Metadata } from 'next';
import Link from 'next/link';
import { spacing, buttonVariants, cn } from '@/design';
import { getBusinessSettings } from '@/lib/admin/settings';

export const metadata: Metadata = {
  title: 'Warranty — Premium TechNoir',
  description: 'What your Premium TechNoir warranty covers and how to file a claim.',
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="text-h4 font-heading font-bold text-neutral-white">{title}</h2>
      <div className="mt-3 flex flex-col gap-3 text-body-md font-body text-neutral-light-gray">{children}</div>
    </section>
  );
}

export default async function WarrantyPage() {
  const settings = await getBusinessSettings();

  return (
    <section className={cn(spacing.containerPadding, spacing.sectionMargin, 'mx-auto max-w-3xl')}>
      <h1 className="text-h1 font-heading font-bold text-neutral-white">Warranty</h1>
      <p className="mt-4 text-body-lg font-body text-neutral-light-gray">
        Every device we sell is backed by a minimum 30-day warranty. For full terms, see our{' '}
        <Link href="/warranty-policy" className="font-semibold text-accent-primary hover:underline">
          Warranty Policy
        </Link>
        .
      </p>

      <Section title="What's covered">
        <p>
          Full functionality of the device as described on its product page — including the components tested
          during our inspection process (battery, screen, ports, keyboard/trackpad, and overall performance).
        </p>
      </Section>

      <Section title="What's not covered">
        <p>
          Accidental damage after delivery, unauthorized repairs, liquid damage, and normal cosmetic wear that
          matches the listed condition grade.
        </p>
      </Section>

      <Section title="Extended warranty">
        <p>
          Some listings offer an extended warranty option at checkout. Check the product page for availability
          and terms.
        </p>
      </Section>

      <Section title="How to file a claim">
        <ol className="flex list-decimal flex-col gap-2 pl-5">
          <li>Contact our support team with your order number and a description of the issue.</li>
          <li>We&apos;ll walk through basic troubleshooting, or confirm the device needs to be sent in.</li>
          <li>If a repair, replacement, or refund is needed, we&apos;ll provide a prepaid shipping label.</li>
        </ol>
      </Section>

      <div className="mt-10 flex flex-wrap gap-3">
        <Link href="/support/contact" className={cn(buttonVariants.primary, 'px-6 py-3 text-body-md')}>
          File a warranty claim
        </Link>
        <a href={`mailto:${settings.supportEmail}`} className={cn(buttonVariants.ghost, 'px-6 py-3 text-body-md')}>
          Email support
        </a>
      </div>
    </section>
  );
}
