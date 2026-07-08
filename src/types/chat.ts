import type { PublicProduct } from './product';

export type ChatRole = 'user' | 'assistant';

export interface OrderSummary {
  id: string;
  status: 'processing' | 'shipped' | 'out-for-delivery' | 'delivered';
  items: { title: string; price: number; quantity?: number; productId?: string }[];
  placedDate: string;
  estimatedDelivery: string;
  trackingNumber?: string;
  carrier?: string;
}

export type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

export interface AppointmentSummary {
  id: string;
  type: 'repair' | 'consultation' | 'callback';
  preferredWindow: string;
  contactMethod: string;
  status: AppointmentStatus;
  createdAt: string;
}

export interface MessageAttachment {
  name: string;
  size: number;
  type: string;
}

/** A block of structured content rendered inside a single assistant message bubble. */
export type ContentBlock =
  | { kind: 'products'; products: PublicProduct[]; heading?: string }
  | { kind: 'order-status'; order: OrderSummary }
  | { kind: 'appointment-confirmed'; appointment: AppointmentSummary }
  | { kind: 'quick-replies'; options: string[] }
  | { kind: 'escalate'; reason: string };

export interface ChatMessage {
  id: string;
  role: ChatRole;
  text: string;
  blocks: ContentBlock[];
  attachments?: MessageAttachment[];
  createdAt: number;
  /** True while an assistant message is still receiving stream chunks. */
  streaming?: boolean;
  /** True if generation was interrupted before completion (barge-in or stop button). */
  aborted?: boolean;
}

/** Events streamed from POST /api/chat, one JSON object per NDJSON line. */
export type ReplyEvent =
  | { type: 'text-delta'; delta: string }
  | { type: 'products'; products: PublicProduct[]; heading?: string }
  | { type: 'order-status'; order: OrderSummary }
  | { type: 'appointment-confirmed'; appointment: AppointmentSummary }
  | { type: 'quick-replies'; options: string[] }
  | { type: 'escalate'; reason: string }
  | { type: 'context'; context: ConversationContext }
  | { type: 'done' }
  | { type: 'error'; message: string };

export type ChatUIMode = 'closed' | 'open' | 'minimized' | 'fullscreen';

export interface PendingAppointmentDraft {
  step: 'type' | 'preferredWindow' | 'contactMethod';
  type?: 'repair' | 'consultation' | 'callback';
  preferredWindow?: string;
}

export interface PendingOrderLookupDraft {
  step: 'orderId' | 'secondaryId';
  orderId?: string;
}

export interface ConversationContext {
  unresolvedExchangeCount: number;
  pendingAppointment?: PendingAppointmentDraft;
  pendingOrderLookup?: PendingOrderLookupDraft;
}

export function createEmptyContext(): ConversationContext {
  return { unresolvedExchangeCount: 0 };
}
