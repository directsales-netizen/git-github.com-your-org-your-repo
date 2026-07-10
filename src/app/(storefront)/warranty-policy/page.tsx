import type { Metadata } from 'next';
import { spacing, cn } from '@/design';

export const metadata: Metadata = {
  title: 'Warranty Policy — Premium TechNoir',
  description: 'The full terms of the Premium TechNoir warranty, including coverage, exclusions, and claims.',
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="text-h4 font-heading font-bold text-neutral-white">{title}</h2>
      <div className="mt-3 flex flex-col gap-3 text-body-md font-body text-neutral-light-gray">{children}</div>
    </section>
  );
}

export default function WarrantyPolicyPage() {
  return (
    <section className={cn(spacing.containerPadding, spacing.sectionMargin, 'mx-auto max-w-3xl')}>
      <h1 className="text-h1 font-heading font-bold text-neutral-white">Warranty Policy</h1>
      <p className="mt-4 text-body-lg font-body text-neutral-light-gray">
        This policy explains what&apos;s covered by the warranty included with every Premium TechNoir device. To
        file a claim, see our <a href="/support/warranty" className="font-semibold text-accent-primary hover:underline">Warranty</a> page.
      </p>

      <Section title="Standard coverage">
        <p>
          Every device ships with a minimum 30-day warranty covering full functionality, starting from the
          delivery date. Some listings include a longer warranty term, shown on the product page.
        </p>
      </Section>

      <Section title="What's covered">
        <p>
          Defects or failures in the components verified during our inspection process — battery, display,
          ports, keyboard/trackpad, and core device performance — that are not the result of damage after
          delivery.
        </p>
      </Section>

      <Section title="What's excluded">
        <p>
          Accidental damage, liquid damage, unauthorized repairs or modifications, lost or stolen devices, and
          cosmetic wear consistent with the device&apos;s listed condition grade.
        </p>
      </Section>

      <Section title="Remedies">
        <p>
          Depending on the issue, we&apos;ll offer a repair, replacement, or refund at our discretion. We&apos;ll
          always explain which option applies and why.
        </p>
      </Section>

      <Section title="Extended warranty">
        <p>
          Where offered at checkout, an extended warranty extends the coverage period under the same terms
          described above unless otherwise stated at purchase.
        </p>
      </Section>

      <Section title="Filing a claim">
        <p>
          Contact our support team with your order number and a description of the issue. We&apos;ll guide you
          through troubleshooting or next steps, including a prepaid shipping label if the device needs to be
          sent in.
        </p>
      </Section>
    </section>
  );
}
