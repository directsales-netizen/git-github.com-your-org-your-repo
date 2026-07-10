import type { ChatRole, OrderSummary } from './chat';
import type { ReviewStatus, RiskLevel } from './fraud';

export type PaymentProvider = 'stripe' | 'paypal';

export interface ShippingAddress {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  zip: string;
}

export type ReturnStatus = 'none' | 'requested' | 'approved' | 'rejected' | 'completed';
export type WarrantyStatus = 'none' | 'claimed' | 'approved' | 'rejected' | 'resolved';

/** Derived from refundedAmount vs. order total and whether an active dispute exists — never stored, see getPaymentStatus() in src/lib/chat/orders.ts. */
export type PaymentStatus = 'paid' | 'partially_refunded' | 'refunded' | 'disputed';

/** Admin-only view of an order — adds the fields needed to issue a refund, review a fraud flag, and manage fulfillment, never sent to customer-facing pages. */
export interface AdminOrderSummary extends OrderSummary {
  email: string;
  shippingAddress?: ShippingAddress;
  paymentProvider?: PaymentProvider;
  providerReference?: string;
  refundedAmount?: number;
  reviewStatus: ReviewStatus;
  riskScore?: number;
  riskLevel?: RiskLevel;
  riskReasons?: string[];
  clientIp?: string;
  customerNotes?: string;
  internalNotes?: string;
  returnStatus: ReturnStatus;
  warrantyStatus: WarrantyStatus;
}

export interface ActivityLogEntry {
  id: string;
  actor: string;
  action: string;
  target: string;
  detail?: string;
  createdAt: string;
  /** Optional — populated by call sites that already have request context (e.g. security-settings changes, login/logout). Absent on older/simpler log entries; existing callers are unaffected. */
  ip?: string | null;
  device?: string;
  success?: boolean;
  previousValue?: string;
  newValue?: string;
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
  /** When true, /api/checkout/session is disabled and checkout submits a PurchaseInquiry instead — a SuperAdmin must approve it before a Stripe payment link is issued. Independent of ordersPaused: the cart and checkout form still work, only the payment step is gated. */
  inquiryOnlyMode: boolean;
}

export interface PasswordPolicy {
  minLength: number;
  requireNumber: boolean;
  requireSymbol: boolean;
  requireUppercase: boolean;
}

export interface SecuritySettings {
  passwordPolicy: PasswordPolicy;
  loginRateLimit: { maxAttempts: number; windowMinutes: number };
  /** Access-token lifetime for newly-issued sessions. Changing this never affects already-signed tokens — their exp is baked in at signing time. */
  sessionTtlMinutes: number;
  /** When non-empty, only these IPs/CIDRs (IPv4 CIDR supported; IPv6 is exact-match only) may reach /admin or /api/admin. */
  ipAllowList: string[];
  /** These IPs/CIDRs are always denied, even if also present in ipAllowList. */
  ipBlockList: string[];
  alertOnNewRememberDevice: boolean;
  alertOnRateLimitTripped: boolean;
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
  | 'return_request'
  | 'refund_request'
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
  /** Set when this request originated from a customer's order-detail page (return/refund/warranty/support) — lets the admin Requests view link back to the order, and lets updateVisitorRequest mirror status changes onto the order's returnStatus/warrantyStatus. */
  orderId?: string;
  /** Free-text label, not a real account — this app has no multi-admin auth (see src/lib/admin/users.ts). */
  assignedTo?: string;
  read: boolean;
  createdAt: string;
  updatedAt: string;
  deliveries: NotificationDelivery[];
}

// --- Purchase Inquiries (inquiryOnlyMode): a customer's cart submission
// awaiting SuperAdmin approval before a real Stripe payment link is issued.
// See src/lib/checkout/inquiries.ts and src/app/api/admin/purchase-inquiries. ---

export type PurchaseInquiryStatus = 'pending' | 'approved' | 'rejected' | 'converted';

export interface PurchaseInquiryItem {
  productId: string;
  title: string;
  price: number;
  quantity: number;
}

export interface PurchaseInquiryShippingAddress {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  zip: string;
}

export interface PurchaseInquiry {
  id: string;
  status: PurchaseInquiryStatus;
  email: string;
  name: string;
  items: PurchaseInquiryItem[];
  shippingAddress: PurchaseInquiryShippingAddress;
  subtotal: number;
  createdAt: string;
  updatedAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
  rejectionReason?: string;
  stripeCheckoutSessionId?: string;
  stripeCheckoutUrl?: string;
}
