import type { VisitorRequest, RequestKind, RequestPriority, NotificationDelivery } from '@/types/admin';
import { globalSingleton, globalBox } from '@/lib/globalStore';
import { redis, isRedisConfigured } from '@/lib/redis';

/**
 * The admin Requests inbox — every contact-form/support/order-question
 * submission a customer sends. Backed by Redis when configured (durable
 * across Vercel's serverless instances, which do NOT share the in-memory
 * store below); falls back to the original in-memory globalSingleton
 * otherwise, same "disabled until configured" convention as
 * src/lib/email/resend.ts. The in-memory path is known-lossy in production
 * (see src/lib/globalStore.ts's header comment) — it exists so local dev
 * and any deploy that hasn't provisioned Redis yet keep working, not as a
 * long-term storage strategy.
 */
const REQUESTS = globalSingleton('visitorRequests', (): VisitorRequest[] => []);
const nextIdBox = globalBox('nextVisitorRequestId', () => 1);

function formatId(n: number): string {
  return `REQ-${String(n).padStart(5, '0')}`;
}

function itemKey(id: string): string {
  return `requests:item:${id}`;
}
const INDEX_KEY = 'requests:index';
function emailIndexKey(email: string): string {
  return `requests:by-email:${email.trim().toLowerCase()}`;
}

export interface CreateRequestInput {
  kind: RequestKind;
  priority?: RequestPriority;
  clientName?: string;
  companyName?: string;
  email?: string;
  phone?: string;
  source: string;
  message: string;
  orderId?: string;
}

export async function createVisitorRequest(input: CreateRequestInput): Promise<VisitorRequest> {
  if (isRedisConfigured()) {
    const n = await redis.incr('requests:nextId');
    const request: VisitorRequest = {
      id: formatId(n),
      kind: input.kind,
      priority: input.priority ?? 'normal',
      status: 'new',
      clientName: input.clientName,
      companyName: input.companyName,
      email: input.email,
      phone: input.phone,
      source: input.source,
      message: input.message,
      orderId: input.orderId,
      read: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      deliveries: [],
    };
    await Promise.all([
      redis.set(itemKey(request.id), request),
      redis.lpush(INDEX_KEY, request.id),
      request.email ? redis.lpush(emailIndexKey(request.email), request.id) : Promise.resolve(),
    ]);
    return request;
  }

  console.warn('[admin/requests] Redis is not configured — visitor requests are stored in memory only and may be lost. See src/lib/redis.ts.');
  const request: VisitorRequest = {
    id: formatId(nextIdBox.current++),
    kind: input.kind,
    priority: input.priority ?? 'normal',
    status: 'new',
    clientName: input.clientName,
    companyName: input.companyName,
    email: input.email,
    phone: input.phone,
    source: input.source,
    message: input.message,
    orderId: input.orderId,
    read: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deliveries: [],
  };
  REQUESTS.unshift(request);
  return request;
}

async function getManyByIds(ids: string[]): Promise<VisitorRequest[]> {
  if (ids.length === 0) return [];
  const items = await redis.mget<(VisitorRequest | null)[]>(...ids.map(itemKey));
  return items.filter((r): r is VisitorRequest => r !== null);
}

export async function getAllVisitorRequests(): Promise<VisitorRequest[]> {
  if (isRedisConfigured()) {
    const ids = await redis.lrange<string>(INDEX_KEY, 0, -1);
    const requests = await getManyByIds(ids);
    return requests.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
  return [...REQUESTS].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

/** Customer-facing: Support Tickets and Warranty History pages filter by the session's own email — never exposes other customers' requests. */
export async function getVisitorRequestsByEmail(email: string): Promise<VisitorRequest[]> {
  const normalized = email.trim().toLowerCase();
  if (isRedisConfigured()) {
    const ids = await redis.lrange<string>(emailIndexKey(normalized), 0, -1);
    const requests = await getManyByIds(ids);
    return requests.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
  return REQUESTS.filter((r) => r.email?.trim().toLowerCase() === normalized).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getVisitorRequestById(id: string): Promise<VisitorRequest | null> {
  if (isRedisConfigured()) {
    return (await redis.get<VisitorRequest>(itemKey(id))) ?? null;
  }
  return REQUESTS.find((r) => r.id === id) ?? null;
}

export async function updateVisitorRequest(
  id: string,
  patch: Partial<Pick<VisitorRequest, 'status' | 'assignedTo' | 'read' | 'priority'>>
): Promise<VisitorRequest | null> {
  if (isRedisConfigured()) {
    const existing = await redis.get<VisitorRequest>(itemKey(id));
    if (!existing) return null;
    const updated: VisitorRequest = { ...existing, ...patch, updatedAt: new Date().toISOString() };
    await redis.set(itemKey(id), updated);
    return updated;
  }
  const request = REQUESTS.find((r) => r.id === id);
  if (!request) return null;
  Object.assign(request, patch, { updatedAt: new Date().toISOString() });
  return request;
}

export async function recordDelivery(id: string, delivery: NotificationDelivery): Promise<void> {
  if (isRedisConfigured()) {
    const existing = await redis.get<VisitorRequest>(itemKey(id));
    if (!existing) return;
    const deliveries = [...existing.deliveries];
    const existingIndex = deliveries.findIndex((d) => d.channel === delivery.channel);
    if (existingIndex >= 0) deliveries[existingIndex] = delivery;
    else deliveries.push(delivery);
    await redis.set(itemKey(id), { ...existing, deliveries });
    return;
  }
  const request = REQUESTS.find((r) => r.id === id);
  if (!request) return;
  const existingIndex = request.deliveries.findIndex((d) => d.channel === delivery.channel);
  if (existingIndex >= 0) request.deliveries[existingIndex] = delivery;
  else request.deliveries.push(delivery);
}
