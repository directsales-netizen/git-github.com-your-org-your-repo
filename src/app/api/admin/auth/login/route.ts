import { NextResponse, type NextRequest } from 'next/server';
import { verifyCredentials } from '@/lib/admin/auth';
import { signSession, ADMIN_SESSION_COOKIE, SESSION_TTL_SECONDS } from '@/lib/admin/session';
import { logActivity } from '@/lib/admin/activityLog';

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 10 * 60 * 1000;

// In-memory throttle — resets on server restart, same accepted limitation as
// the rest of this app's mock data. Good enough to blunt casual brute force.
const attempts = new Map<string, { count: number; windowStart: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = attempts.get(ip);
  if (!entry || now - entry.windowStart > WINDOW_MS) {
    attempts.set(ip, { count: 1, windowStart: now });
    return false;
  }
  entry.count += 1;
  return entry.count > MAX_ATTEMPTS;
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') ?? 'unknown';

  if (isRateLimited(ip)) {
    return NextResponse.json({ error: 'Too many attempts. Try again in a few minutes.' }, { status: 429 });
  }

  let body: { email?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  const { email, password } = body;
  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
  }

  if (!verifyCredentials(email, password)) {
    return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
  }

  const token = await signSession(email);
  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_TTL_SECONDS,
  });

  await logActivity({ actor: email, action: 'login', target: 'admin session' });

  return response;
}
