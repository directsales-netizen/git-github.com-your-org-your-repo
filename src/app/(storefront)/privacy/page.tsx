import type { Metadata } from 'next';
import { spacing, cn } from '@/design';

export const metadata: Metadata = {
  title: 'Privacy Policy — Premium TechNoir',
  description: 'How Premium TechNoir collects, uses, and protects your information.',
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="text-h4 font-heading font-bold text-neutral-white">{title}</h2>
      <div className="mt-3 flex flex-col gap-3 text-body-md font-body text-neutral-light-gray">{children}</div>
    </section>
  );
}

export default function PrivacyPolicyPage() {
  return (
    <section className={cn(spacing.containerPadding, spacing.sectionMargin, 'mx-auto max-w-3xl')}>
      <h1 className="text-h1 font-heading font-bold text-neutral-white">Privacy Policy</h1>
      <p className="mt-4 text-body-lg font-body text-neutral-light-gray">
        Premium TechNoir is honest about what we collect and why. This page explains what information we gather
        when you visit our site, place an order, or talk to our support assistant, and how it&apos;s protected.
      </p>

      <Section title="What we collect">
        <p>
          When you browse our site, we may collect anonymous, aggregate analytics — approximate location (country/
          region/city inferred from your IP address), browser and device type, screen size, language, referring
          site, and the pages you visit — only after you accept our cookie/analytics notice. Declining means none
          of this is collected for your visit.
        </p>
        <p>
          If you contact us, book an appointment, or place an order, we collect the information needed to fulfill
          that request (such as name, email or phone, and shipping details).
        </p>
      </Section>

      <Section title="What we never collect">
        <p>
          We do not collect passwords in plain text, payment card details, or the content of anything you type
          into our AI assistant beyond what&apos;s needed to answer your question in the moment.
        </p>
      </Section>

      <Section title="How we protect it">
        <p>
          Identifying details like IP addresses are masked before storage by default. Access to visitor analytics
          is restricted to a small number of authorized SuperAdmin accounts, and every access is logged. Data is
          encrypted in transit.
        </p>
      </Section>

      <Section title="Your choices">
        <p>
          You can decline analytics cookies at any time from the notice shown on your first visit. You may
          contact us to request access to, or deletion of, personal information we hold about you, consistent
          with applicable privacy laws (including GDPR and CCPA where they apply).
        </p>
      </Section>

      <Section title="Contact us">
        <p>Questions about this policy can be sent to our support team through the contact options on this site.</p>
      </Section>
    </section>
  );
}
