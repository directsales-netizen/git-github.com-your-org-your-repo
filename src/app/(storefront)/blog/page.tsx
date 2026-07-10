import type { Metadata } from 'next';
import { Newspaper } from 'lucide-react';
import { spacing, cn } from '@/design';
import NewsletterSignup from '@/components/sections/NewsletterSignup';

export const metadata: Metadata = {
  title: 'Blog — Premium TechNoir',
  description: 'Guides, sustainability updates, and news from Premium TechNoir. New posts coming soon.',
};

export default function BlogPage() {
  return (
    <>
      <section className={cn(spacing.containerPadding, spacing.sectionMargin, 'mx-auto max-w-[1440px]')}>
        <h1 className="text-h1 font-heading font-bold text-neutral-white">Blog</h1>
        <p className="mt-4 max-w-2xl text-body-lg font-body text-neutral-light-gray">
          Buying guides, device care tips, and sustainability updates from the Premium TechNoir team.
        </p>

        <div className="mt-12 flex flex-col items-center rounded-xl border border-neutral-titanium/20 bg-bg-secondary p-12 text-center">
          <Newspaper size={32} className="text-accent-primary" aria-hidden="true" />
          <h2 className="mt-4 text-h4 font-heading font-bold text-neutral-white">Our first posts are coming soon</h2>
          <p className="mt-3 max-w-md text-body-md font-body text-neutral-light-gray">
            We&apos;re working on guides to help you choose the right device and get the most out of it. Sign up
            below and we&apos;ll let you know when we publish.
          </p>
        </div>
      </section>

      <NewsletterSignup />
    </>
  );
}
