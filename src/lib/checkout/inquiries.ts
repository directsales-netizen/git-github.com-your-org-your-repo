import type { PurchaseInquiry, PurchaseInquiryItem, PurchaseInquiryShippingAddress } from '@/types/admin';
import { globalSingleton, globalBox } from '@/lib/globalStore';

// In-memory purchase-inquiry queue — same convention as every other mock
// store in this app (src/lib/globalStore.ts). Resets on server restart.
const INQUIRIES = globalSingleton('purchaseInquiries', (): PurchaseInquiry[] => []);
const nextIdBox = globalBox('nextPurchaseInquiryId', () => 1);

function generateId(): string {
  return `PINQ-${String(nextIdBox.current++).padStart(5, '0')}`;
}

export interface CreatePurchaseInquiryInput {
  email: string;
  name: string;
  items: PurchaseInquiryItem[];
  shippingAddress: PurchaseInquiryShippingAddress;
  subtotal: number;
}

export async function createPurchaseInquiry(input: CreatePurchaseInquiryInput): Promise<PurchaseInquiry> {
  const inquiry: PurchaseInquiry = {
    id: generateId(),
    status: 'pending',
    email: input.email,
    name: input.name,
    items: input.items,
    shippingAddress: input.shippingAddress,
    subtotal: input.subtotal,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  INQUIRIES.unshift(inquiry);
  return inquiry;
}

export async function getAllPurchaseInquiries(): Promise<PurchaseInquiry[]> {
  return [...INQUIRIES].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getPurchaseInquiryById(id: string): Promise<PurchaseInquiry | null> {
  return INQUIRIES.find((inquiry) => inquiry.id === id) ?? null;
}

export async function getPurchaseInquiriesByEmail(email: string): Promise<PurchaseInquiry[]> {
  return INQUIRIES.filter((inquiry) => inquiry.email === email).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function updatePurchaseInquiry(
  id: string,
  patch: Partial<
    Pick<
      PurchaseInquiry,
      'status' | 'reviewedBy' | 'reviewedAt' | 'rejectionReason' | 'stripeCheckoutSessionId' | 'stripeCheckoutUrl'
    >
  >
): Promise<PurchaseInquiry | null> {
  const inquiry = INQUIRIES.find((i) => i.id === id);
  if (!inquiry) return null;
  Object.assign(inquiry, patch, { updatedAt: new Date().toISOString() });
  return inquiry;
}
