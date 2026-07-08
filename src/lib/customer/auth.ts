import { hashPassword, verifyPasswordHash } from '@/lib/security/password';
import { createCustomerAccount, findCustomerAccountByEmail } from './store';
import type { CustomerAccount } from '@/types/customer';

export type RegisterResult =
  | { ok: true; account: CustomerAccount }
  | { ok: false; error: 'email-taken' };

export async function registerCustomer(email: string, password: string, name: string): Promise<RegisterResult> {
  const existing = await findCustomerAccountByEmail(email);
  if (existing) return { ok: false, error: 'email-taken' };

  const account = await createCustomerAccount({ email, name, passwordHash: hashPassword(password) });
  return { ok: true, account };
}

export async function authenticateCustomer(email: string, password: string): Promise<CustomerAccount | null> {
  const account = await findCustomerAccountByEmail(email);
  if (!account) return null;
  if (!verifyPasswordHash(password, account.passwordHash)) return null;
  return account;
}
