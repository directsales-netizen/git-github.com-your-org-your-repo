import { buttonVariants, cn, inputVariants, spacing } from '@/design';
import AddressFields from './AddressFields';
import type { CheckoutAddress } from '../checkoutTypes';

interface Props {
  address: CheckoutAddress;
  onChange: (address: CheckoutAddress) => void;
  phone: string;
  onPhoneChange: (phone: string) => void;
  onContinue: () => void;
  canContinue: boolean;
}

export default function ShippingSection({ address, onChange, phone, onPhoneChange, onContinue, canContinue }: Props) {
  return (
    <div className="flex flex-col gap-5">
      <AddressFields idPrefix="shipping" address={address} onChange={onChange} />
      <div>
        <label htmlFor="shipping-phone" className="mb-1.5 block text-label-md font-body text-neutral-light-gray">
          Phone <span className="font-normal text-neutral-silver">(optional — for delivery updates)</span>
        </label>
        <input
          id="shipping-phone"
          type="tel"
          autoComplete="tel"
          placeholder="(555) 555-0100"
          value={phone}
          onChange={(e) => onPhoneChange(e.target.value)}
          className={inputVariants.base}
        />
      </div>
      <button
        type="button"
        disabled={!canContinue}
        onClick={onContinue}
        className={cn(buttonVariants.primary, spacing.buttonPadding, 'self-start text-body-sm')}
      >
        Continue to Billing
      </button>
    </div>
  );
}
