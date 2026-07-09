export interface CustomerAccount {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  emailVerified: boolean;
  createdAt: string;
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
