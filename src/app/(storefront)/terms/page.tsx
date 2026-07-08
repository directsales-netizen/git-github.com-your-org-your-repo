import type { Metadata } from 'next';
import { spacing, cn } from '@/design';

export const metadata: Metadata = {
  title: 'Terms of Service — Premium TechNoir',
  description: 'The terms that govern use of the Premium TechNoir website and purchases.',
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="text-h4 font-heading font-bold text-neutral-white">{title}</h2>
      <div className="mt-3 flex flex-col gap-3 text-body-md font-body text-neutral-light-gray">{children}</div>
    </section>
  );
}

export default function TermsOfServicePage() {
  return (
    <section className={cn(spacing.containerPadding, spacing.sectionMargin, 'mx-auto max-w-3xl')}>
      <h1 className="text-h1 font-heading font-bold text-neutral-white">Terms of Service</h1>
      <p className="mt-4 text-body-lg font-body text-neutral-light-gray">
        These terms govern your use of the Premium TechNoir website and any devices you purchase from us.
      </p>

      <Section title="Product condition & grading">
        <p>
          Every device is professionally tested and assigned an honest condition grade (A–D) before listing.
          Grading details are shown on each product page.
        </p>
      </Section>

      <Section title="Warranty">
        <p>
          Every device ships with a minimum 30-day warranty covering full functionality, unless a longer term is
          stated on the product page.
        </p>
      </Section>

      <Section title="Orders & pricing">
        <p>
          Prices and availability are validated at the time of purchase. We reserve the right to correct listing
          errors and to cancel orders affected by a pricing or inventory error, with a full refund.
        </p>
      </Section>

      <Section title="Acceptable use">
        <p>
          You agree not to misuse this site — including attempting to access restricted admin systems, tampering
          with checkout requests, or scraping data at a scale that disrupts the service for others.
        </p>
      </Section>

      <Section title="Changes to these terms">
        <p>We may update these terms as our services evolve. Continued use of the site after changes constitutes acceptance.</p>
      </Section>
    </section>
  );
}
