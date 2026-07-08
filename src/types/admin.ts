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

export type AdminRole = 'SuperAdmin' | 'admin' | 'editor' | 'viewer';

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
  /** When true, /api/checkout/session requires a customer session; guest checkout is disabled. */
  requireAccountForCheckout: boolean;
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

// --- Visitor Analytics & Intelligence (SuperAdmin-only) ---

export type DeviceType = 'desktop' | 'mobile' | 'tablet';

export interface VisitorPageView {
  path: string;
  title?: string;
  visitedAt: string;
}

export interface VisitorLocation {
  country: string | null;
  region: string | null;
  city: string | null;
  /** Full or masked depending on VISITOR_ANALYTICS_STORE_IP — see docs/VISITOR_ANALYTICS.md. */
  ip: string | null;
  isp: string | null;
}

export interface VisitorSession {
  /** Anonymous, randomly generated — never derived from PII. */
  id: string;
  isReturning: boolean;
  firstSeenAt: string;
  lastSeenAt: string;
  location: VisitorLocation;
  browser: string;
  os: string;
  deviceType: DeviceType;
  screen: string | null;
  language: string | null;
  timeZone: string | null;
  referrer: string | null;
  landingPage: string;
  pages: VisitorPageView[];
  durationSeconds: number;
}

export interface ChatbotInteractionEvent {
  id: string;
  visitorId: string;
  status: 'ok' | 'error';
  detail?: string;
  createdAt: string;
}

export interface ContactSubmissionEvent {
  id: string;
  visitorId: string;
  kind: 'appointment' | 'contact';
  summary: string;
  createdAt: string;
}
