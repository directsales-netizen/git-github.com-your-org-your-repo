import { NextResponse, type NextRequest } from 'next/server';
import type { RequestKind } from '@/types/admin';
import { getCustomerSession } from '@/lib/customer/getSession';
import { getOrderForCustomer, setReturnStatus, setWarrantyStatus } from '@/lib/chat/orders';
import { createVisitorRequest } from '@/lib/admin/requests';
import { dispatchRequestNotification } from '@/lib/admin/notifyRequest';
import { createRateLimiter } from '@/lib/security/rateLimit';

export const runtime = 'nodejs';

const requestLimiter = createRateLimiter(10, 10 * 60 * 1000);

// Only these four — a customer can't file a general_inquiry or partnership
// request "about" an order through this route, same restricted-surface
// principle as every other customer-facing route in this app.
const VALID_KINDS: RequestKind[] = ['return_request', 'refund_request', 'warranty_repair', 'support'];

interface OrderRequestBody {
  kind?: string;
  message?: string;
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ip = request.headers.get('x-forwarded-for') ?? 'unknown';
  if (requestLimiter.isRateLimited(ip)) {
    return NextResponse.json({ error: 'Too many requests. Please try again shortly.' }, { status: 429 });
  }

  const session = await getCustomerSession();
  if (!session) {
    return NextResponse.json({ error: 'Please log in to do this.' }, { status: 401 });
  }

  const { id } = await params;

  // A customer may only file a request against their own order — never
  // trust the id alone, always re-check ownership by session email.
  const order = await getOrderForCustomer(id, session.sub);
  if (!order) {
    return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
  }

  let body: OrderRequestBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  const kind = VALID_KINDS.includes(body.kind as RequestKind) ? (body.kind as RequestKind) : null;
  if (!kind) {
    return NextResponse.json({ error: 'Please choose a valid request type.' }, { status: 400 });
  }
  if (!body.message?.trim()) {
    return NextResponse.json({ error: 'Please describe what you need.' }, { status: 400 });
  }

  const visitorRequest = await createVisitorRequest({
    kind,
    email: session.sub,
    source: 'account-order-detail',
    message: body.message.trim(),
    orderId: id,
  });

  if (kind === 'return_request' || kind === 'refund_request') {
    await setReturnStatus(id, 'requested');
  } else if (kind === 'warranty_repair') {
    await setWarrantyStatus(id, 'claimed');
  }

  await dispatchRequestNotification(visitorRequest);

  return NextResponse.json({ ok: true, id: visitorRequest.id });
}
