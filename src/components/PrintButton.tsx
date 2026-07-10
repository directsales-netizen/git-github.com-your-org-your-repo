'use client';

import { Printer } from 'lucide-react';
import { buttonVariants, cn, spacing, accessibility } from '@/design';

/** Shared by every printable document page (admin packing slip/invoice/shipping label, customer invoice/receipt) — hidden itself when actually printing. */
export default function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className={cn(buttonVariants.primary, spacing.buttonPadding, accessibility.focusRing, 'print:hidden mb-6 flex items-center gap-2 text-body-sm')}
    >
      <Printer size={16} aria-hidden="true" />
      Print / Save as PDF
    </button>
  );
}
