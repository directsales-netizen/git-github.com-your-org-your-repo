export interface ActivityLogEntry {
  id: string;
  actor: string;
  action: string;
  target: string;
  detail?: string;
  createdAt: string;
}

export type CustomerStatus = 'active' | 'blocked';

export interface Customer {
  id: string;
  name: string;
  email: string;
  status: CustomerStatus;
  orders: number;
  lifetimeValue: number;
  joinedDate: string;
  location: string;
}

export type LoyaltyTier = 'Bronze' | 'Silver' | 'Gold' | 'Platinum';

export interface LoyaltyMember {
  id: string;
  name: string;
  email: string;
  points: number;
  tier: LoyaltyTier;
  joinedDate: string;
}

export interface LoyaltyRules {
  pointsPerDollar: number;
  tierThresholds: Record<LoyaltyTier, number>;
  redemptionRate: number; // dollars per 100 points
}

export type AdminRole = 'admin' | 'editor' | 'viewer';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  status: 'active' | 'invited' | 'suspended';
  lastActive?: string;
}

export interface BusinessSettings {
  businessName: string;
  supportEmail: string;
  supportPhone: string;
  businessHours: string;
  address: string;
  currency: string;
  taxRatePercent: number;
  maintenanceMode: boolean;
}

export interface SiteContentSettings {
  heroHeadline: string;
  heroSubheadline: string;
  heroCtaLabel: string;
  promoBannerEnabled: boolean;
  promoBannerText: string;
}

export interface ChatbotSettings {
  greetingEnabled: boolean;
  voiceEnabled: boolean;
  escalationEmail: string;
}
