import type { Metadata } from 'next';
import Link from 'next/link';
import { spacing, buttonVariants, cn } from '@/design';
import { getBusinessSettings } from '@/lib/admin/settings';

export const metadata: Metadata = {
  title: 'Returns — Premium TechNoir',
  description: 'How to start a return with Premium TechNoir and what to expect.',
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="text-h4 font-heading font-bold text-neutral-white">{title}</h2>
      <div className="mt-3 flex flex-col gap-3 text-body-md font-body text-neutral-light-gray">{children}</div>
    </section>
  );
}

export default async function ReturnsPage() {
  const settings = await getBusinessSettings();

  return (
    <section className={cn(spacing.containerPadding, spacing.sectionMargin, 'mx-auto max-w-3xl')}>
      <h1 className="text-h1 font-heading font-bold text-neutral-white">Returns</h1>
      <p className="mt-4 text-body-lg font-body text-neutral-light-gray">
        Not the right fit? Here&apos;s how returns work. For the full legal terms, see our{' '}
        <Link href="/returns-policy" className="font-semibold text-accent-primary hover:underline">
          Return Policy
        </Link>
        .
      </p>

      <Section title="How to start a return">
        <ol className="flex list-decimal flex-col gap-2 pl-5">
          <li>Sign in to your account and find the order under order history.</li>
          <li>Select the item and choose &quot;Start a Return.&quot;</li>
          <li>Print the prepaid return label we email you and pack the device securely.</li>
          <li>Drop the package off with the listed carrier — we&apos;ll email you once it&apos;s received.</li>
        </ol>
        <p>Don&apos;t have an account, or need help? Contact us and we&apos;ll start the return for you.</p>
      </Section>

      <Section title="What to include">
        <p>
          Return the device along with everything it originally shipped with (charger, cables, box) whenever
          possible, in the same condition it arrived in.
        </p>
      </Section>

      <Section title="Refund timing">
        <p>
          Once we receive and inspect the returned device, refunds are issued to your original payment method,
          typically within 5–7 business days.
        </p>
      </Section>

      <div className="mt-10 flex flex-wrap gap-3">
        <Link href="/support/contact" className={cn(buttonVariants.primary, 'px-6 py-3 text-body-md')}>
          Start a return
        </Link>
        <a href={`mailto:${settings.supportEmail}`} className={cn(buttonVariants.ghost, 'px-6 py-3 text-body-md')}>
          Email support
        </a>
      </div>
    </section>
  );
}
