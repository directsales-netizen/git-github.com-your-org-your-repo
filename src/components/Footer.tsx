import Link from 'next/link';
import { Instagram, Linkedin, Twitter, Youtube } from 'lucide-react';
import Logo from '@/components/Logo';
import { accessibility, cn } from '@/design';

const FOOTER_COLUMNS = [
  {
    heading: 'Shop',
    links: [
      { label: 'MacBooks', href: '/shop?category=MacBooks' },
      { label: 'iPhones', href: '/shop?category=iPhones' },
      { label: 'iPads', href: '/shop?category=iPads' },
      { label: 'Clearance', href: '/shop?discounted=true' },
    ],
  },
  {
    heading: 'Support',
    links: [
      { label: 'Help & FAQ', href: '/support' },
      { label: 'Contact Us', href: '/support/contact' },
      { label: 'Shipping Info', href: '/support/shipping' },
      { label: 'Returns', href: '/support/returns' },
      { label: 'Warranty', href: '/support/warranty' },
    ],
  },
  {
    heading: 'Company',
    links: [
      { label: 'About Us', href: '/about' },
      { label: 'Sustainability', href: '/sustainability' },
      { label: 'Blog', href: '/blog' },
      { label: 'Careers', href: '/careers' },
      { label: 'Partnerships', href: '/partnerships' },
    ],
  },
];

const LEGAL_LINKS = [
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Terms of Service', href: '/terms' },
  { label: 'Return Policy', href: '/returns-policy' },
  { label: 'Warranty Policy', href: '/warranty-policy' },
  { label: 'Accessibility Statement', href: '/accessibility' },
];

const SOCIAL_LINKS = [
  { label: 'LinkedIn', href: 'https://linkedin.com', Icon: Linkedin },
  { label: 'Instagram', href: 'https://instagram.com', Icon: Instagram },
  { label: 'Twitter/X', href: 'https://twitter.com', Icon: Twitter },
  { label: 'YouTube', href: 'https://youtube.com', Icon: Youtube },
];

export default function Footer() {
  return (
    <footer className="border-t border-neutral-titanium/20 bg-bg-secondary">
      <div className="mx-auto max-w-[1440px] px-6 py-16 tablet:px-8 desktop:px-12">
        <div className="grid grid-cols-1 gap-10 tablet:grid-cols-2 desktop:grid-cols-4">
          <div>
            <Link href="/" className={cn(accessibility.focusRing, 'rounded-sm')}>
              <Logo variant="lockup" />
            </Link>
            <p className="mt-3 max-w-xs text-body-sm font-body text-neutral-light-gray">
              Premium Technology. Smarter Value. Sustainable Impact.
            </p>
            <div className="mt-5 flex items-center gap-1">
              {SOCIAL_LINKS.map(({ label, href, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className={cn('flex h-11 w-11 items-center justify-center rounded-md text-neutral-light-gray transition-colors duration-300 hover:text-accent-primary', accessibility.focusRing)}
                >
                  <Icon size={18} aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>

          {FOOTER_COLUMNS.map((column) => (
            <div key={column.heading}>
              <p className="text-label-md font-body font-semibold text-neutral-white">{column.heading}</p>
              <ul className="mt-4 flex flex-col gap-3">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className={cn('text-body-sm font-body text-neutral-light-gray transition-colors duration-300 hover:text-accent-primary', accessibility.focusRing, 'rounded-sm')}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-neutral-titanium/20 pt-6 text-body-xs font-body text-neutral-light-gray tablet:flex-row tablet:items-center tablet:justify-between">
          <p>&copy; {new Date().getFullYear()} Premium TechNoir. All rights reserved.</p>
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            {LEGAL_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn('hover:text-accent-primary', accessibility.focusRing, 'rounded-sm')}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
