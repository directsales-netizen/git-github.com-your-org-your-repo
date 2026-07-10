import type { CustomerAccount, CustomerAuthProvider } from '@/types/customer';
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

/**
 * Used by the OAuth callback bridge and the email-link login — both hand us
 * an email the provider (Google/Apple/Microsoft) or the inbox itself has
 * already verified ownership of, so unlike password registration there's no
 * separate verification step: the account is created pre-verified, and an
 * existing password-created account gets flipped to verified too.
 */
export async function findOrCreateVerifiedCustomerAccount(input: {
  email: string;
  name: string;
  provider: CustomerAuthProvider;
}): Promise<{ account: CustomerAccount; created: boolean }> {
  const normalized = normalizeEmail(input.email);
  const existing = ACCOUNTS.find((a) => a.email === normalized);
  if (existing) {
    if (!existing.emailVerified) existing.emailVerified = true;
    return { account: existing, created: false };
  }

  const account: CustomerAccount = {
    id: `cust-acct-${nextIdBox.current++}`,
    email: normalized,
    passwordHash: '',
    name: input.name || normalized.split('@')[0],
    emailVerified: true,
    authProvider: input.provider,
    createdAt: new Date().toISOString(),
  };
  ACCOUNTS.push(account);
  return { account, created: true };
}

export async function setStripeCustomerId(email: string, stripeCustomerId: string): Promise<void> {
  const account = ACCOUNTS.find((a) => a.email === normalizeEmail(email));
  if (account) account.stripeCustomerId = stripeCustomerId;
}
