export type CustomerAuthProvider = 'google' | 'apple' | 'microsoft' | 'email';

export interface CustomerAccount {
  id: string;
  email: string;
  /** Empty string for accounts created via OAuth/email-link — see authProvider. Password login always fails closed on an empty hash (see verifyPasswordHash). */
  passwordHash: string;
  name: string;
  emailVerified: boolean;
  createdAt: string;
  /** Set only for accounts created via social/email-link sign-in rather than the password form — the provider already verified the email, so these are created with emailVerified: true. Undefined means password-based. */
  authProvider?: CustomerAuthProvider;
  /** Stripe Customer ID, created on first checkout and reused after — lets Stripe offer a saved payment method on return visits instead of asking for card details again. */
  stripeCustomerId?: string;
}

export interface SavedAddress {
  id: string;
  email: string;
  label: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  zip: string;
  isDefault: boolean;
}
