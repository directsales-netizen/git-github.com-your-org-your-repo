import type { Metadata } from 'next';
import { Mail, Phone, Clock } from 'lucide-react';
import { spacing, cardVariants, cn } from '@/design';
import { getBusinessSettings } from '@/lib/admin/settings';
import ContactRequestForm from './ContactRequestForm';

export const metadata: Metadata = {
  title: 'Contact Us — Premium TechNoir',
  description: 'Get in touch with Premium TechNoir support by email, phone, or our AI assistant.',
};

export default async function ContactPage() {
  const settings = await getBusinessSettings();

  return (
    <section className={cn(spacing.containerPadding, spacing.sectionMargin, 'mx-auto max-w-3xl')}>
      <h1 className="text-h1 font-heading font-bold text-neutral-white">Contact Us</h1>
      <p className="mt-4 text-body-lg font-body text-neutral-light-gray">
        {settings.ordersPaused
          ? 'Online ordering is temporarily paused. Email us or chat with our AI assistant (bottom-right corner) to place an order or ask a question — we’ll take it from there.'
          : 'Have a question about a device, an order, or anything else? Reach us directly or chat with our AI assistant (bottom-right corner).'}
      </p>

      <div className="mt-8 grid grid-cols-1 gap-4 tablet:grid-cols-2">
        <div className={cn(cardVariants.base, 'flex items-start gap-3')}>
          <Mail size={22} className="mt-1 shrink-0 text-accent-primary" aria-hidden="true" />
          <div>
            <p className="text-body-sm font-body text-neutral-silver">Email</p>
            <a href={`mailto:${settings.supportEmail}`} className="text-body-md font-body font-semibold text-neutral-white hover:text-accent-primary hover:underline">
              {settings.supportEmail}
            </a>
          </div>
        </div>

        <div className={cn(cardVariants.base, 'flex items-start gap-3')}>
          <Phone size={22} className="mt-1 shrink-0 text-accent-primary" aria-hidden="true" />
          <div>
            <p className="text-body-sm font-body text-neutral-silver">Phone</p>
            <a href={`tel:${settings.supportPhone}`} className="text-body-md font-body font-semibold text-neutral-white hover:text-accent-primary hover:underline">
              {settings.supportPhone}
            </a>
          </div>
        </div>

        <div className={cn(cardVariants.base, 'flex items-start gap-3 tablet:col-span-2')}>
          <Clock size={22} className="mt-1 shrink-0 text-accent-primary" aria-hidden="true" />
          <div>
            <p className="text-body-sm font-body text-neutral-silver">Business hours</p>
            <p className="text-body-md font-body font-semibold text-neutral-white">{settings.businessHours}</p>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <ContactRequestForm />
      </div>
    </section>
  );
}
