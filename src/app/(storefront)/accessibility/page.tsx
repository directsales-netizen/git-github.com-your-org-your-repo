import type { Metadata } from 'next';
import { spacing, cn } from '@/design';
import { getBusinessSettings } from '@/lib/admin/settings';

export const metadata: Metadata = {
  title: 'Accessibility Statement — Premium TechNoir',
  description: 'Premium TechNoir’s commitment to web accessibility and how to report issues.',
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="text-h4 font-heading font-bold text-neutral-white">{title}</h2>
      <div className="mt-3 flex flex-col gap-3 text-body-md font-body text-neutral-light-gray">{children}</div>
    </section>
  );
}

export default async function AccessibilityStatementPage() {
  const settings = await getBusinessSettings();

  return (
    <section className={cn(spacing.containerPadding, spacing.sectionMargin, 'mx-auto max-w-3xl')}>
      <h1 className="text-h1 font-heading font-bold text-neutral-white">Accessibility Statement</h1>
      <p className="mt-4 text-body-lg font-body text-neutral-light-gray">
        Premium TechNoir is committed to making our website usable by everyone, including people with
        disabilities.
      </p>

      <Section title="Our standard">
        <p>
          We aim to meet WCAG 2.1 Level AA success criteria across the site, including semantic HTML, keyboard
          navigation, visible focus indicators, sufficient color contrast, and alt text for meaningful images.
        </p>
      </Section>

      <Section title="Ongoing work">
        <p>
          Accessibility is an ongoing effort. As we add new features, we test for keyboard operability and
          screen reader compatibility, and we welcome feedback on anything we&apos;ve missed.
        </p>
      </Section>

      <Section title="Known limitations">
        <p>
          Some third-party content or embedded tools may not fully meet these standards. We&apos;re working with
          vendors and our own team to close those gaps over time.
        </p>
      </Section>

      <Section title="Report an issue">
        <p>
          If you encounter a barrier using this site, please let us know at{' '}
          <a href={`mailto:${settings.supportEmail}`} className="font-semibold text-accent-primary hover:underline">
            {settings.supportEmail}
          </a>{' '}
          or through our{' '}
          <a href="/support/contact" className="font-semibold text-accent-primary hover:underline">
            contact page
          </a>
          . Please describe the issue and the page it occurred on so we can address it quickly.
        </p>
      </Section>
    </section>
  );
}
