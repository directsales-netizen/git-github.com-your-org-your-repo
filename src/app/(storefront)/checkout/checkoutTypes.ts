export interface CheckoutAddress {
  line1: string;
  line2: string;
  city: string;
  state: string;
  zip: string;
}

export const emptyAddress: CheckoutAddress = { line1: '', line2: '', city: '', state: '', zip: '' };

export function isAddressComplete(address: CheckoutAddress): boolean {
  return Boolean(address.line1.trim() && address.city.trim() && address.state.trim() && address.zip.trim());
}

export function formatAddress(address: CheckoutAddress): string {
  const parts = [address.line1, address.line2, `${address.city}, ${address.state} ${address.zip}`].filter(Boolean);
  return parts.join(', ');
}
