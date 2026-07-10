import { Truck } from 'lucide-react';
import type { CartItem } from '@/types/cart';
import { PRODUCT_GRADE_DESCRIPTIONS, PRODUCT_GRADE_LABELS } from '@/types/product';
import { cardVariants, cn } from '@/design';
import TrustBadges from './TrustBadges';

interface Props {
  items: CartItem[];
  subtotal: number;
  supportEmail: string;
  supportPhone?: string;
  businessHours?: string;
}

const currency = (value: number) => value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });

export default function OrderSummaryPanel({ items, subtotal, supportEmail, supportPhone, businessHours }: Props) {
  return (
    <div className={cn(cardVariants.base, 'flex flex-col gap-5 tablet:sticky tablet:top-24')}>
      <h2 className="text-h6 font-heading font-semibold text-neutral-white">Order Summary</h2>

      <ul className="flex flex-col gap-4">
        {items.map((item) => (
          <li key={item.productId} className="flex gap-3">
            <div
              aria-hidden="true"
              className={cn('h-16 w-16 shrink-0 rounded-md bg-gradient-to-br', item.imageColor)}
              role="img"
              title={item.imageAlt}
            />
            <div className="flex flex-1 flex-col gap-1">
              <div className="flex items-start justify-between gap-2">
                <p className="text-body-sm font-heading font-semibold text-neutral-white">{item.title}</p>
                <p className="shrink-0 text-body-sm font-body text-neutral-light-gray">{currency(item.price * item.quantity)}</p>
              </div>
              <p className="text-caption font-body text-neutral-silver">Qty {item.quantity} · {PRODUCT_GRADE_LABELS[item.grade]}</p>
            </div>
          </li>
        ))}
      </ul>

      <div className="flex flex-col gap-1 rounded-md bg-bg-primary/60 px-4 py-3 text-caption font-body text-neutral-silver">
        <p>{PRODUCT_GRADE_DESCRIPTIONS[items[0]?.grade ?? 'B']}</p>
        <p>Every device ships with a minimum 30-day Premium TechNoir warranty.</p>
      </div>

      <div className="flex flex-col gap-1 text-body-sm font-body text-neutral-light-gray">
        <div className="flex items-center gap-2">
          <Truck size={16} className="shrink-0 text-neutral-silver" aria-hidden="true" />
          <span>Free standard shipping — arrives in 3–5 business days</span>
        </div>
        <p className="pl-6 text-caption text-neutral-silver">We&apos;ll email your tracking number as soon as it ships.</p>
      </div>

      <dl className="flex flex-col gap-2 border-t border-neutral-titanium/10 pt-4 text-body-sm font-body">
        <div className="flex justify-between text-neutral-light-gray">
          <dt>Subtotal</dt>
          <dd>{currency(subtotal)}</dd>
        </div>
        <div className="flex justify-between text-neutral-light-gray">
          <dt>Shipping</dt>
          <dd>Free</dd>
        </div>
        <div className="flex justify-between text-neutral-light-gray">
          <dt>Tax</dt>
          <dd>Calculated at payment</dd>
        </div>
        <div className="flex justify-between border-t border-neutral-titanium/10 pt-2 text-body-md font-heading font-semibold text-neutral-white">
          <dt>Total</dt>
          <dd>{currency(subtotal)}</dd>
        </div>
      </dl>

      <TrustBadges supportEmail={supportEmail} supportPhone={supportPhone} businessHours={businessHours} />
    </div>
  );
}
