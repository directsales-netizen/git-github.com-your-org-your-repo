import type { FraudBlocklists } from '@/types/fraud';
import { globalBox } from '@/lib/globalStore';

const blocklistsBox = globalBox('fraudBlocklists', (): FraudBlocklists => ({ blockedIps: [], blockedCardCountries: [] }));

export async function getFraudBlocklists(): Promise<FraudBlocklists> {
  return blocklistsBox.current;
}

export async function updateFraudBlocklists(patch: Partial<FraudBlocklists>): Promise<FraudBlocklists> {
  blocklistsBox.current = { ...blocklistsBox.current, ...patch };
  return blocklistsBox.current;
}

export async function isIpBlocked(ip: string): Promise<boolean> {
  return blocklistsBox.current.blockedIps.includes(ip);
}

export async function isCardCountryBlocked(countryCode: string | null | undefined): Promise<boolean> {
  if (!countryCode) return false;
  return blocklistsBox.current.blockedCardCountries.includes(countryCode.toUpperCase());
}
