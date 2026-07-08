import type { SavedAddress } from '@/types/customer';
import { globalSingleton, globalBox } from '@/lib/globalStore';

const ADDRESSES = globalSingleton('customerAddresses', (): SavedAddress[] => []);
const nextIdBox = globalBox('nextAddressId', () => 1);

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export async function getAddressesForEmail(email: string): Promise<SavedAddress[]> {
  const normalized = normalizeEmail(email);
  return ADDRESSES.filter((a) => a.email === normalized);
}

export async function createAddress(input: Omit<SavedAddress, 'id' | 'email'> & { email: string }): Promise<SavedAddress> {
  const email = normalizeEmail(input.email);
  const address: SavedAddress = { id: `addr-${nextIdBox.current++}`, ...input, email };

  if (address.isDefault) {
    for (const a of ADDRESSES) if (a.email === email) a.isDefault = false;
  }

  ADDRESSES.push(address);
  return address;
}

export async function deleteAddress(email: string, id: string): Promise<boolean> {
  const normalized = normalizeEmail(email);
  const index = ADDRESSES.findIndex((a) => a.id === id && a.email === normalized);
  if (index === -1) return false;
  ADDRESSES.splice(index, 1);
  return true;
}
