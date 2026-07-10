import type { Metadata } from 'next';
import Link from 'next/link';
import { Mail, Package, RotateCcw, ShieldCheck } from 'lucide-react';
import { spacing, cardVariants, grid, accessibility, cn } from '@/design';

export const metadata: Metadata = {
  title: 'Help & FAQ — Premium TechNoir',
  description: 'Answers to common questions about orders, shipping, returns, and warranty at Premium TechNoir.',
};

const SUPPORT_LINKS = [
  { title: 'Shipping Info', description: 'Delivery timeframes, tracking, and carriers.', href: '/support/shipping', Icon: Package },
  { title: 'Returns', description: 'How to start a return and what to expect.', href: '/support/returns', Icon: RotateCcw },
  { title: 'Warranty', description: 'What your warranty covers and how to file a claim.', href: '/support/warranty', Icon: ShieldCheck },
  { title: 'Contact Us', description: 'Reach our team by email, phone, or AI assistant.', href: '/support/contact', Icon: Mail },
];

const FAQS = [
  {
    question: 'What do the condition grades (A–D) mean?',
    answer:
      'Every device is professionally tested and assigned a grade from A (like new) to D (acceptable, heavy signs of use). Each listing shows the grade along with battery health, screen condition, and what’s included. See our Sustainability page for the full breakdown.',
  },
  {
    question: 'How long is the warranty?',
    answer:
      'Every device ships with a minimum 30-day warranty covering full functionality. Some listings include a longer warranty — check the product page for specifics.',
  },
  {
    question: 'Can I return a device if it’s not right for me?',
    answer:
      'Yes. See our Returns page for the window and process, or start a return from your account order history.',
  },
  {
    question: 'Do you offer financing or payment plans?',
    answer:
      'We currently accept standard payment methods at checkout. If you have a specific financing question, our support team can help.',
  },
  {
    question: 'How is a refurbished device different from a used one?',
    answer:
      'Refurbished devices go through professional inspection, testing, and repair before sale, and are backed by a warranty. A used device sold as-is typically has none of that.',
  },
];

export default function SupportPage() {
  return (
    <section className={cn(spacing.containerPadding, spacing.sectionMargin, 'mx-auto max-w-[1440px]')}>
      <h1 className="text-h1 font-heading font-bold text-neutral-white">Help &amp; FAQ</h1>
      <p className="mt-4 max-w-2xl text-body-lg font-body text-neutral-light-gray">
        Find answers below, or jump straight to shipping, returns, warranty, or our contact options.
      </p>

      <div className={cn(grid.fourCol, 'mt-10')}>
        {SUPPORT_LINKS.map(({ title, description, href, Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(cardVariants.base, accessibility.focusRing, 'block transition-colors duration-300 hover:border-accent-primary/40')}
          >
            <Icon size={24} className="text-accent-primary" aria-hidden="true" />
            <h2 className="mt-4 text-h5 font-heading font-semibold text-neutral-white">{title}</h2>
            <p className="mt-2 text-body-sm font-body text-neutral-silver">{description}</p>
          </Link>
        ))}
      </div>

      <div className="mt-16 max-w-3xl">
        <h2 className="text-h3 font-heading font-bold text-neutral-white">Frequently Asked Questions</h2>
        <dl className="mt-6 flex flex-col divide-y divide-neutral-titanium/20">
          {FAQS.map((faq) => (
            <div key={faq.question} className="py-5">
              <dt className="text-body-md font-body font-semibold text-neutral-white">{faq.question}</dt>
              <dd className="mt-2 text-body-md font-body text-neutral-light-gray">{faq.answer}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
