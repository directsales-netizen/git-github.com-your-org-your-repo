import Link from 'next/link';
import { BadgeDollarSign, ShieldCheck, Lock, BadgeCheck, Headset, Mail, Phone, Clock } from 'lucide-react';

const BADGES = [
  { Icon: BadgeDollarSign, label: '30-Day Money-Back Guarantee', href: '/returns-policy' },
  { Icon: ShieldCheck, label: 'Minimum 30-Day Warranty', href: '/warranty-policy' },
  { Icon: Lock, label: 'Encrypted connection', href: undefined },
] as const;

interface Props {
  supportEmail: string;
  supportPhone?: string;
  businessHours?: string;
  inquiryOnlyMode: boolean;
  stripeEnabled: boolean;
  paypalEnabled: boolean;
}

/** Shared trust/security reassurance block, rendered inside the order summary panel. Every claim here is grounded in a real, published policy — no fabricated reviews, urgency, or countdowns. */
export default function TrustBadges({ supportEmail, supportPhone, businessHours, inquiryOnlyMode, stripeEnabled, paypalEnabled }: Props) {
  const badges = inquiryOnlyMode
    ? [...BADGES, { Icon: BadgeCheck, label: 'Reviewed before payment', href: undefined }]
    : BADGES;
  const acceptedMethods = [
    ...(stripeEnabled ? ['Visa', 'Mastercard', 'Amex', 'Discover', 'Apple Pay', 'Google Pay'] : []),
    ...(paypalEnabled ? ['PayPal'] : []),
  ];
  return (
    <div className="flex flex-col gap-5 border-t border-neutral-titanium/10 pt-5">
      <div className="grid grid-cols-2 gap-2" aria-label="Purchase protections">
        {badges.map(({ Icon, label, href }) => {
          const content = (
            <div className="flex h-full flex-col items-start gap-1.5 rounded-md border border-neutral-titanium/20 px-3 py-2.5 text-caption font-body text-neutral-light-gray transition-colors duration-300 hover:border-accent-primary/40">
              <Icon size={16} className="shrink-0 text-accent-primary" aria-hidden="true" />
              <span>{label}</span>
            </div>
          );
          return href ? (
            <Link key={label} href={href}>
              {content}
            </Link>
          ) : (
            <div key={label}>{content}</div>
          );
        })}
      </div>

      {acceptedMethods.length > 0 && (
        <div className="flex flex-wrap gap-2" aria-label="Accepted payment methods">
          {acceptedMethods.map((method) => (
            <span key={method} className="rounded-full border border-neutral-titanium/30 px-3 py-1 text-caption font-body text-neutral-silver">
              {method}
            </span>
          ))}
        </div>
      )}

      <div className="flex flex-col gap-2 rounded-md bg-bg-primary/60 px-4 py-3 text-body-sm font-body text-neutral-light-gray">
        <div className="flex items-center gap-2 font-heading font-semibold text-neutral-white">
          <Headset size={16} className="shrink-0 text-accent-primary" aria-hidden="true" />
          <span>Questions before you buy?</span>
        </div>
        <a href={`mailto:${supportEmail}`} className="flex items-center gap-2 hover:text-neutral-white">
          <Mail size={14} className="shrink-0 text-neutral-silver" aria-hidden="true" />
          <span>{supportEmail}</span>
        </a>
        {supportPhone && (
          <a href={`tel:${supportPhone.replace(/[^\d+]/g, '')}`} className="flex items-center gap-2 hover:text-neutral-white">
            <Phone size={14} className="shrink-0 text-neutral-silver" aria-hidden="true" />
            <span>{supportPhone}</span>
          </a>
        )}
        {businessHours && (
          <div className="flex items-center gap-2 text-neutral-silver">
            <Clock size={14} className="shrink-0" aria-hidden="true" />
            <span>{businessHours}</span>
          </div>
        )}
        <p className="text-caption text-neutral-silver">Or chat with us now using the icon in the corner of your screen.</p>
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-1 text-caption font-body text-neutral-silver">
        <Link href="/returns-policy" className="hover:text-neutral-light-gray">Return Policy</Link>
        <Link href="/warranty-policy" className="hover:text-neutral-light-gray">Warranty Policy</Link>
        <Link href="/privacy" className="hover:text-neutral-light-gray">Privacy Policy</Link>
        <Link href="/terms" className="hover:text-neutral-light-gray">Terms of Service</Link>
      </div>
    </div>
  );
}
