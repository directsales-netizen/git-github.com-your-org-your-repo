import type { Metadata } from 'next';
import { spacing, cn } from '@/design';

export const metadata: Metadata = {
  title: 'Return Policy — Premium TechNoir',
  description: 'The full terms of the Premium TechNoir return policy, including eligibility, timelines, and refunds.',
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="text-h4 font-heading font-bold text-neutral-white">{title}</h2>
      <div className="mt-3 flex flex-col gap-3 text-body-md font-body text-neutral-light-gray">{children}</div>
    </section>
  );
}

export default function ReturnPolicyPage() {
  return (
    <section className={cn(spacing.containerPadding, spacing.sectionMargin, 'mx-auto max-w-3xl')}>
      <h1 className="text-h1 font-heading font-bold text-neutral-white">Return Policy</h1>
      <p className="mt-4 text-body-lg font-body text-neutral-light-gray">
        This policy explains how returns work for purchases made through Premium TechNoir. For step-by-step
        instructions, see our <a href="/support/returns" className="font-semibold text-accent-primary hover:underline">Returns</a> page.
      </p>

      <Section title="Eligibility window">
        <p>
          Most devices may be returned within 30 days of delivery, in the same condition they arrived in and
          with all original accessories included where applicable. The eligibility window for a specific item is
          shown on its product page.
        </p>
      </Section>

      <Section title="What isn't eligible">
        <p>
          Devices with damage caused after delivery, missing major components, or signs of unauthorized repair
          are not eligible for a standard return, though they may still qualify for a warranty claim.
        </p>
      </Section>

      <Section title="Return shipping">
        <p>
          We provide a prepaid return label for eligible returns. Devices should be packed securely to prevent
          damage in transit.
        </p>
      </Section>

      <Section title="Refunds">
        <p>
          Once we receive and inspect the returned device, we issue a refund to your original payment method.
          Refunds are typically processed within 5–7 business days of receipt.
        </p>
      </Section>

      <Section title="Exchanges">
        <p>
          We don&apos;t currently process direct exchanges — return the original item for a refund and place a
          new order for the device you&apos;d prefer.
        </p>
      </Section>

      <Section title="Questions">
        <p>Contact our support team through the contact options on this site if you have questions about a specific return.</p>
      </Section>
    </section>
  );
}
