import type { VisitorRequest, RequestKind, RequestPriority, NotificationDelivery } from '@/types/admin';
import { globalSingleton, globalBox } from '@/lib/globalStore';

// In-memory request inbox — same convention as every other mock store in
// this app (src/lib/globalStore.ts). Resets on server restart.
const REQUESTS = globalSingleton('visitorRequests', (): VisitorRequest[] => []);
const nextIdBox = globalBox('nextVisitorRequestId', () => 1);

function generateId(): string {
  return `REQ-${String(nextIdBox.current++).padStart(5, '0')}`;
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
  const request: VisitorRequest = {
    id: generateId(),
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

export async function getAllVisitorRequests(): Promise<VisitorRequest[]> {
  return [...REQUESTS].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getVisitorRequestById(id: string): Promise<VisitorRequest | null> {
  return REQUESTS.find((r) => r.id === id) ?? null;
}

export async function updateVisitorRequest(
  id: string,
  patch: Partial<Pick<VisitorRequest, 'status' | 'assignedTo' | 'read' | 'priority'>>
): Promise<VisitorRequest | null> {
  const request = REQUESTS.find((r) => r.id === id);
  if (!request) return null;
  Object.assign(request, patch, { updatedAt: new Date().toISOString() });
  return request;
}

export async function recordDelivery(id: string, delivery: NotificationDelivery): Promise<void> {
  const request = REQUESTS.find((r) => r.id === id);
  if (!request) return;
  const existingIndex = request.deliveries.findIndex((d) => d.channel === delivery.channel);
  if (existingIndex >= 0) request.deliveries[existingIndex] = delivery;
  else request.deliveries.push(delivery);
}
