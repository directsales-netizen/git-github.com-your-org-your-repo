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
  /** Rendered only for guest checkout (not authenticated, account not required) — logged-in customers use their account's name/email instead. */
  guestContact?: { name: string; email: string; onNameChange: (v: string) => void; onEmailChange: (v: string) => void };
}

export default function ShippingSection({ address, onChange, phone, onPhoneChange, onContinue, canContinue, guestContact }: Props) {
  return (
    <div className="flex flex-col gap-5">
      {guestContact && (
        <div className="grid grid-cols-1 gap-4 tablet:grid-cols-2">
          <div>
            <label htmlFor="shipping-guest-name" className="mb-1.5 block text-label-md font-body text-neutral-light-gray">
              Full name
            </label>
            <input
              id="shipping-guest-name"
              required
              autoComplete="name"
              value={guestContact.name}
              onChange={(e) => guestContact.onNameChange(e.target.value)}
              className={inputVariants.base}
            />
          </div>
          <div>
            <label htmlFor="shipping-guest-email" className="mb-1.5 block text-label-md font-body text-neutral-light-gray">
              Email
            </label>
            <input
              id="shipping-guest-email"
              type="email"
              required
              autoComplete="email"
              value={guestContact.email}
              onChange={(e) => guestContact.onEmailChange(e.target.value)}
              className={inputVariants.base}
            />
          </div>
        </div>
      )}
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
