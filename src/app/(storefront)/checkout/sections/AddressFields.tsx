import { inputVariants } from '@/design';
import type { CheckoutAddress } from '../checkoutTypes';

interface Props {
  idPrefix: string;
  address: CheckoutAddress;
  onChange: (address: CheckoutAddress) => void;
}

/** Shared line1/line2/city/state/zip field group used by both Shipping and Billing sections. */
export default function AddressFields({ idPrefix, address, onChange }: Props) {
  return (
    <div className="grid grid-cols-1 gap-4">
      <div>
        <label htmlFor={`${idPrefix}-line1`} className="mb-1.5 block text-label-md font-body text-neutral-light-gray">
          Address line 1
        </label>
        <input
          id={`${idPrefix}-line1`}
          required
          autoComplete="address-line1"
          value={address.line1}
          onChange={(e) => onChange({ ...address, line1: e.target.value })}
          className={inputVariants.base}
        />
      </div>
      <div>
        <label htmlFor={`${idPrefix}-line2`} className="mb-1.5 block text-label-md font-body text-neutral-light-gray">
          Address line 2 (optional)
        </label>
        <input
          id={`${idPrefix}-line2`}
          autoComplete="address-line2"
          value={address.line2}
          onChange={(e) => onChange({ ...address, line2: e.target.value })}
          className={inputVariants.base}
        />
      </div>
      <div className="grid grid-cols-1 gap-4 tablet:grid-cols-3">
        <input
          aria-label="City"
          required
          placeholder="City"
          autoComplete="address-level2"
          value={address.city}
          onChange={(e) => onChange({ ...address, city: e.target.value })}
          className={inputVariants.base}
        />
        <input
          aria-label="State"
          required
          placeholder="State"
          autoComplete="address-level1"
          value={address.state}
          onChange={(e) => onChange({ ...address, state: e.target.value })}
          className={inputVariants.base}
        />
        <input
          aria-label="ZIP"
          required
          placeholder="ZIP"
          autoComplete="postal-code"
          value={address.zip}
          onChange={(e) => onChange({ ...address, zip: e.target.value })}
          className={inputVariants.base}
        />
      </div>
    </div>
  );
}
