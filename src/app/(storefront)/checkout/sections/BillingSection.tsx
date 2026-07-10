import { buttonVariants, cn, spacing, accessibility } from '@/design';
import AddressFields from './AddressFields';
import type { CheckoutAddress } from '../checkoutTypes';

interface Props {
  sameAsShipping: boolean;
  onSameAsShippingChange: (value: boolean) => void;
  address: CheckoutAddress;
  onChange: (address: CheckoutAddress) => void;
  onContinue: () => void;
  canContinue: boolean;
  isSubmitting: boolean;
}

export default function BillingSection({ sameAsShipping, onSameAsShippingChange, address, onChange, onContinue, canContinue, isSubmitting }: Props) {
  return (
    <div className="flex flex-col gap-5">
      <label className={cn('flex items-center gap-3 text-body-sm font-body text-neutral-light-gray', accessibility.focusRing, 'rounded-md')}>
        <input
          type="checkbox"
          checked={sameAsShipping}
          onChange={(e) => onSameAsShippingChange(e.target.checked)}
          className="h-4 w-4 rounded border-neutral-titanium accent-accent-primary"
        />
        Billing address same as shipping
      </label>

      {!sameAsShipping && <AddressFields idPrefix="billing" address={address} onChange={onChange} />}

      <button
        type="button"
        disabled={!canContinue || isSubmitting}
        onClick={onContinue}
        className={cn(buttonVariants.primary, spacing.buttonPadding, 'self-start text-body-sm')}
      >
        {isSubmitting ? 'Preparing payment…' : 'Continue to Payment'}
      </button>
    </div>
  );
}
