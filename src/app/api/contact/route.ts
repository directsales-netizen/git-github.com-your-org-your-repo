import { NextResponse, type NextRequest } from 'next/server';
import type { RequestKind } from '@/types/admin';
import { createVisitorRequest } from '@/lib/admin/requests';
import { dispatchRequestNotification } from '@/lib/admin/notifyRequest';
import { createRateLimiter } from '@/lib/security/rateLimit';

export const runtime = 'nodejs';

const contactLimiter = createRateLimiter(5, 10 * 60 * 1000);

const VALID_KINDS: RequestKind[] = [
  'general_inquiry',
  'appointment',
  'consultation',
  'support',
  'sales',
  'service',
  'quote',
  'callback',
  'order_question',
  'technical_support',
  'warranty_repair',
  'complaint',
  'partnership',
  'other',
];

interface ContactRequestBody {
  kind?: string;
  clientName?: string;
  companyName?: string;
  email?: string;
  phone?: string;
  message?: string;
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') ?? 'unknown';
  if (contactLimiter.isRateLimited(ip)) {
    return NextResponse.json({ error: 'Too many requests. Please try again shortly.' }, { status: 429 });
  }

  let body: ContactRequestBody;
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
  if (!body.email?.trim() && !body.phone?.trim()) {
    return NextResponse.json({ error: 'Please provide an email or phone number so we can reach you.' }, { status: 400 });
  }

  const visitorRequest = await createVisitorRequest({
    kind,
    clientName: body.clientName?.trim() || undefined,
    companyName: body.companyName?.trim() || undefined,
    email: body.email?.trim() || undefined,
    phone: body.phone?.trim() || undefined,
    source: '/support/contact',
    message: body.message.trim(),
  });

  await dispatchRequestNotification(visitorRequest);

  return NextResponse.json({ ok: true, id: visitorRequest.id });
}
