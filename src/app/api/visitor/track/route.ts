import { NextResponse, type NextRequest } from 'next/server';
import { randomUUID } from 'node:crypto';
import { parseUserAgent, lookupIpGeo, getRequestIp, maskIpForStorage } from '@/lib/admin/visitorIntel';
import { recordVisit } from '@/lib/admin/visitorAnalytics';

export const runtime = 'nodejs';

export const VISITOR_ID_COOKIE = 'ptn_visitor_id';

interface TrackRequestBody {
  path?: string;
  title?: string;
  referrer?: string | null;
  screen?: string | null;
  language?: string | null;
  timeZone?: string | null;
  /** Client only sends real tracking data once the consent banner is accepted. */
  consent?: boolean;
}

/**
 * Public, unauthenticated beacon used by the storefront's VisitorTracker
 * component — never mounted on /admin. Writes to the same in-memory store
 * every other mock-data module in this app uses; nothing here reads or
 * returns visitor data (that's exclusively the SuperAdmin-gated
 * /api/admin/visitor-analytics routes).
 */
export async function POST(request: NextRequest) {
  let body: TrackRequestBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  if (!body.consent || !body.path) {
    return NextResponse.json({ ok: true, tracked: false });
  }

  const visitorId = request.cookies.get(VISITOR_ID_COOKIE)?.value ?? randomUUID();
  const ip = getRequestIp(request.headers);
  const { browser, os, deviceType } = parseUserAgent(request.headers.get('user-agent'));
  const geo = await lookupIpGeo(ip);

  await recordVisit({
    visitorId,
    path: body.path,
    title: body.title,
    referrer: body.referrer ?? null,
    screen: body.screen ?? null,
    language: body.language ?? null,
    timeZone: body.timeZone ?? null,
    browser,
    os,
    deviceType,
    country: geo.country,
    region: geo.region,
    city: geo.city,
    ip: maskIpForStorage(ip),
    isp: geo.isp,
  });

  const response = NextResponse.json({ ok: true, tracked: true });
  response.cookies.set(VISITOR_ID_COOKIE, visitorId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
  });
  return response;
}
