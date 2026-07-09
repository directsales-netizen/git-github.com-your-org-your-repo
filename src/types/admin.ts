import type { ChatRole } from './chat';

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
  /** When true, browsing stays open but adding to cart and checkout are blocked — customers are directed to email/AI chat instead. Unlike maintenanceMode, the storefront itself stays up. */
  ordersPaused: boolean;
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

// --- Live Chat Takeover (SuperAdmin-only) ---

export type LiveChatMode = 'bot' | 'human';

export interface LiveChatMessage {
  id: string;
  role: ChatRole;
  text: string;
  authoredBy: 'visitor' | 'bot' | 'admin';
  createdAt: number;
}

export interface LiveConversation {
  visitorId: string;
  mode: LiveChatMode;
  escalated: boolean;
  escalatedAt?: number;
  takenOverBy?: string;
  takenOverAt?: number;
  createdAt: number;
  updatedAt: number;
  messages: LiveChatMessage[];
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

// --- Super Admin Notification Routing: every visitor-generated request
// (contact form, appointment/consultation, live chat escalation, quote,
// callback, warranty/repair, complaint, partnership inquiry, etc.) is
// recorded here and dispatched to SMS + email + this dashboard. See
// src/lib/admin/requests.ts and src/lib/admin/notifyRequest.ts. ---

export type RequestKind =
  | 'general_inquiry'
  | 'appointment'
  | 'consultation'
  | 'support'
  | 'live_chat'
  | 'sales'
  | 'service'
  | 'quote'
  | 'callback'
  | 'order_question'
  | 'technical_support'
  | 'warranty_repair'
  | 'complaint'
  | 'partnership'
  | 'other';

export type RequestPriority = 'low' | 'normal' | 'high' | 'urgent';
export type RequestStatus = 'new' | 'assigned' | 'in_progress' | 'completed' | 'archived';
export type NotificationChannel = 'sms' | 'email' | 'dashboard';
export type DeliveryStatus = 'sent' | 'failed' | 'not_configured';

export interface NotificationDelivery {
  channel: NotificationChannel;
  status: DeliveryStatus;
  attempts: number;
  lastAttemptAt: string;
  error?: string;
}

export interface VisitorRequest {
  id: string;
  kind: RequestKind;
  priority: RequestPriority;
  status: RequestStatus;
  clientName?: string;
  companyName?: string;
  email?: string;
  phone?: string;
  /** Page or service the request came from, e.g. '/support/contact', 'live-chat', 'ai-assistant'. */
  source: string;
  message: string;
  /** Free-text label, not a real account — this app has no multi-admin auth (see src/lib/admin/users.ts). */
  assignedTo?: string;
  read: boolean;
  createdAt: string;
  updatedAt: string;
  deliveries: NotificationDelivery[];
}
