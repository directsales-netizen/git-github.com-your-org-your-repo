import type { CustomerAccount } from '@/types/customer';
import { globalSingleton, globalBox } from '@/lib/globalStore';

// In-memory customer account store — same convention as every other mock
// store in this app (src/lib/globalStore.ts). Resets on server restart.
const ACCOUNTS = globalSingleton('customerAccounts', (): CustomerAccount[] => []);
const nextIdBox = globalBox('nextCustomerAccountId', () => 1);

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export async function findCustomerAccountByEmail(email: string): Promise<CustomerAccount | null> {
  const normalized = normalizeEmail(email);
  return ACCOUNTS.find((a) => a.email === normalized) ?? null;
}

export async function createCustomerAccount(input: { email: string; passwordHash: string; name: string }): Promise<CustomerAccount> {
  const account: CustomerAccount = {
    id: `cust-acct-${nextIdBox.current++}`,
    email: normalizeEmail(input.email),
    passwordHash: input.passwordHash,
    name: input.name,
    emailVerified: false,
    createdAt: new Date().toISOString(),
  };
  ACCOUNTS.push(account);
  return account;
}

export async function markEmailVerified(email: string): Promise<void> {
  const account = ACCOUNTS.find((a) => a.email === normalizeEmail(email));
  if (account) account.emailVerified = true;
}
