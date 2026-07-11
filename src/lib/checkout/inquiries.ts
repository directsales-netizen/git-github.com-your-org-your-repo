import type { PurchaseInquiry, PurchaseInquiryItem, PurchaseInquiryShippingAddress } from '@/types/admin';
import { globalSingleton, globalBox } from '@/lib/globalStore';
import { redis, isRedisConfigured } from '@/lib/redis';

/**
 * The purchase-inquiry queue (inquiryOnlyMode checkout requests awaiting
 * SuperAdmin approval). Same Redis-when-configured / in-memory-fallback
 * shape as src/lib/admin/requests.ts — see that file's header comment for
 * the full rationale.
 */
const INQUIRIES = globalSingleton('purchaseInquiries', (): PurchaseInquiry[] => []);
const nextIdBox = globalBox('nextPurchaseInquiryId', () => 1);

function formatId(n: number): string {
  return `PINQ-${String(n).padStart(5, '0')}`;
}

function itemKey(id: string): string {
  return `inquiries:item:${id}`;
}
const INDEX_KEY = 'inquiries:index';
function emailIndexKey(email: string): string {
  return `inquiries:by-email:${email.trim().toLowerCase()}`;
}

export interface CreatePurchaseInquiryInput {
  email: string;
  name: string;
  items: PurchaseInquiryItem[];
  shippingAddress: PurchaseInquiryShippingAddress;
  subtotal: number;
}

export async function createPurchaseInquiry(input: CreatePurchaseInquiryInput): Promise<PurchaseInquiry> {
  if (isRedisConfigured()) {
    const n = await redis.incr('inquiries:nextId');
    const inquiry: PurchaseInquiry = {
      id: formatId(n),
      status: 'pending',
      email: input.email,
      name: input.name,
      items: input.items,
      shippingAddress: input.shippingAddress,
      subtotal: input.subtotal,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await Promise.all([
      redis.set(itemKey(inquiry.id), inquiry),
      redis.lpush(INDEX_KEY, inquiry.id),
      redis.lpush(emailIndexKey(inquiry.email), inquiry.id),
    ]);
    return inquiry;
  }

  console.warn('[checkout/inquiries] Redis is not configured — purchase inquiries are stored in memory only and may be lost. See src/lib/redis.ts.');
  const inquiry: PurchaseInquiry = {
    id: formatId(nextIdBox.current++),
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

async function getManyByIds(ids: string[]): Promise<PurchaseInquiry[]> {
  if (ids.length === 0) return [];
  const items = await redis.mget<(PurchaseInquiry | null)[]>(...ids.map(itemKey));
  return items.filter((i): i is PurchaseInquiry => i !== null);
}

export async function getAllPurchaseInquiries(): Promise<PurchaseInquiry[]> {
  if (isRedisConfigured()) {
    const ids = await redis.lrange<string>(INDEX_KEY, 0, -1);
    const inquiries = await getManyByIds(ids);
    return inquiries.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
  return [...INQUIRIES].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getPurchaseInquiryById(id: string): Promise<PurchaseInquiry | null> {
  if (isRedisConfigured()) {
    return (await redis.get<PurchaseInquiry>(itemKey(id))) ?? null;
  }
  return INQUIRIES.find((inquiry) => inquiry.id === id) ?? null;
}

export async function getPurchaseInquiriesByEmail(email: string): Promise<PurchaseInquiry[]> {
  const normalized = email.trim().toLowerCase();
  if (isRedisConfigured()) {
    const ids = await redis.lrange<string>(emailIndexKey(normalized), 0, -1);
    const inquiries = await getManyByIds(ids);
    return inquiries.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
  return INQUIRIES.filter((inquiry) => inquiry.email === normalized).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
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
  if (isRedisConfigured()) {
    const existing = await redis.get<PurchaseInquiry>(itemKey(id));
    if (!existing) return null;
    const updated: PurchaseInquiry = { ...existing, ...patch, updatedAt: new Date().toISOString() };
    await redis.set(itemKey(id), updated);
    return updated;
  }
  const inquiry = INQUIRIES.find((i) => i.id === id);
  if (!inquiry) return null;
  Object.assign(inquiry, patch, { updatedAt: new Date().toISOString() });
  return inquiry;
}
