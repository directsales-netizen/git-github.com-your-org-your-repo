export interface CustomerAccount {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  emailVerified: boolean;
  createdAt: string;
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
