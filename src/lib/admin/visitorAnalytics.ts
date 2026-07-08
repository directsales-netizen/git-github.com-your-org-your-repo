import type {
  ChatbotInteractionEvent,
  ContactSubmissionEvent,
  DeviceType,
  VisitorPageView,
  VisitorSession,
} from '@/types/admin';
import { globalSingleton, globalBox } from '@/lib/globalStore';

const ONLINE_WINDOW_MS = 5 * 60 * 1000;

function seedSession(input: {
  id: string;
  minutesAgoFirstSeen: number;
  minutesAgoLastSeen: number;
  isReturning: boolean;
  country: string | null;
  region: string | null;
  city: string | null;
  ip: string | null;
  isp: string | null;
  browser: string;
  os: string;
  deviceType: DeviceType;
  screen: string;
  language: string;
  timeZone: string;
  referrer: string | null;
  pages: { path: string; title?: string; minutesAgo: number }[];
}): VisitorSession {
  const now = Date.now();
  return {
    id: input.id,
    isReturning: input.isReturning,
    firstSeenAt: new Date(now - input.minutesAgoFirstSeen * 60 * 1000).toISOString(),
    lastSeenAt: new Date(now - input.minutesAgoLastSeen * 60 * 1000).toISOString(),
    location: { country: input.country, region: input.region, city: input.city, ip: input.ip, isp: input.isp },
    browser: input.browser,
    os: input.os,
    deviceType: input.deviceType,
    screen: input.screen,
    language: input.language,
    timeZone: input.timeZone,
    referrer: input.referrer,
    landingPage: input.pages[0]?.path ?? '/',
    pages: input.pages.map((p) => ({ path: p.path, title: p.title, visitedAt: new Date(now - p.minutesAgo * 60 * 1000).toISOString() })),
    durationSeconds: Math.max(0, (input.minutesAgoFirstSeen - input.minutesAgoLastSeen) * 60),
  };
}

/**
 * Seeded, clearly-labeled demo dataset (same honesty convention as
 * src/lib/admin/analytics.ts) so the dashboard has something to show before
 * any real visits come in via /api/visitor/track. Real traffic captured
 * during this server process is appended into the same store.
 */
const SESSIONS = globalSingleton('visitorSessions', (): Map<string, VisitorSession> => {
  const seeded = [
    seedSession({
      id: 'seed-visitor-1', minutesAgoFirstSeen: 2, minutesAgoLastSeen: 0, isReturning: false,
      country: 'US', region: 'Texas', city: 'Austin', ip: '203.0.113.0', isp: 'Spectrum',
      browser: 'Chrome', os: 'macOS', deviceType: 'desktop', screen: '1920x1080', language: 'en-US', timeZone: 'America/Chicago',
      referrer: 'https://www.google.com/', pages: [{ path: '/shop', minutesAgo: 2 }, { path: '/shop/macbooks', minutesAgo: 1 }],
    }),
    seedSession({
      id: 'seed-visitor-2', minutesAgoFirstSeen: 45, minutesAgoLastSeen: 40, isReturning: true,
      country: 'US', region: 'California', city: 'San Francisco', ip: '198.51.100.0', isp: 'Comcast',
      browser: 'Safari', os: 'iOS', deviceType: 'mobile', screen: '390x844', language: 'en-US', timeZone: 'America/Los_Angeles',
      referrer: 'https://www.instagram.com/', pages: [{ path: '/', minutesAgo: 45 }, { path: '/collections/best-sellers', minutesAgo: 42 }],
    }),
    seedSession({
      id: 'seed-visitor-3', minutesAgoFirstSeen: 1440, minutesAgoLastSeen: 1435, isReturning: false,
      country: 'CA', region: 'Ontario', city: 'Toronto', ip: '198.51.100.24', isp: 'Rogers Communications',
      browser: 'Firefox', os: 'Windows', deviceType: 'desktop', screen: '1366x768', language: 'en-CA', timeZone: 'America/Toronto',
      referrer: null, pages: [{ path: '/sustainability', minutesAgo: 1440 }],
    }),
    seedSession({
      id: 'seed-visitor-4', minutesAgoFirstSeen: 4300, minutesAgoLastSeen: 4295, isReturning: true,
      country: 'GB', region: 'England', city: 'London', ip: '203.0.113.55', isp: 'BT Group',
      browser: 'Edge', os: 'Windows', deviceType: 'desktop', screen: '1536x864', language: 'en-GB', timeZone: 'Europe/London',
      referrer: 'https://www.bing.com/', pages: [{ path: '/shop', minutesAgo: 4300 }, { path: '/shop/iphones', minutesAgo: 4298 }, { path: '/shop/product/iphone-13-pro', minutesAgo: 4296 }],
    }),
  ];
  return new Map(seeded.map((s) => [s.id, s]));
});

const CHATBOT_EVENTS = globalSingleton('visitorChatbotEvents', (): ChatbotInteractionEvent[] => [
  { id: 'chatevt-seed-1', visitorId: 'seed-visitor-1', status: 'ok', createdAt: new Date(Date.now() - 1000 * 60 * 1.5).toISOString() },
  { id: 'chatevt-seed-2', visitorId: 'seed-visitor-2', status: 'error', detail: 'Assistant stream aborted by client.', createdAt: new Date(Date.now() - 1000 * 60 * 41).toISOString() },
]);

const CONTACT_EVENTS = globalSingleton('visitorContactEvents', (): ContactSubmissionEvent[] => [
  { id: 'contactevt-seed-1', visitorId: 'seed-visitor-4', kind: 'appointment', summary: 'Requested a repair consultation.', createdAt: new Date(Date.now() - 1000 * 60 * 4297).toISOString() },
]);

const nextIdBox = globalBox('visitorEventNextId', () => 1);

export interface RecordVisitInput {
  visitorId: string;
  path: string;
  title?: string;
  referrer: string | null;
  screen: string | null;
  language: string | null;
  timeZone: string | null;
  browser: string;
  os: string;
  deviceType: DeviceType;
  country: string | null;
  region: string | null;
  city: string | null;
  ip: string | null;
  isp: string | null;
}

export async function recordVisit(input: RecordVisitInput): Promise<VisitorSession> {
  const now = new Date().toISOString();
  const existing = SESSIONS.get(input.visitorId);
  const page: VisitorPageView = { path: input.path, title: input.title, visitedAt: now };

  if (existing) {
    existing.lastSeenAt = now;
    existing.isReturning = true;
    existing.pages.push(page);
    existing.durationSeconds = Math.max(
      existing.durationSeconds,
      Math.round((Date.parse(now) - Date.parse(existing.firstSeenAt)) / 1000)
    );
    // Keep the freshest browser/device/location snapshot without discarding history.
    existing.browser = input.browser;
    existing.os = input.os;
    existing.deviceType = input.deviceType;
    existing.screen = input.screen ?? existing.screen;
    existing.language = input.language ?? existing.language;
    existing.timeZone = input.timeZone ?? existing.timeZone;
    if (input.country) existing.location = { country: input.country, region: input.region, city: input.city, ip: input.ip, isp: input.isp };
    return existing;
  }

  const created: VisitorSession = {
    id: input.visitorId,
    isReturning: false,
    firstSeenAt: now,
    lastSeenAt: now,
    location: { country: input.country, region: input.region, city: input.city, ip: input.ip, isp: input.isp },
    browser: input.browser,
    os: input.os,
    deviceType: input.deviceType,
    screen: input.screen,
    language: input.language,
    timeZone: input.timeZone,
    referrer: input.referrer,
    landingPage: input.path,
    pages: [page],
    durationSeconds: 0,
  };
  SESSIONS.set(input.visitorId, created);
  return created;
}

export async function recordChatbotEvent(visitorId: string, status: 'ok' | 'error', detail?: string): Promise<void> {
  CHATBOT_EVENTS.unshift({ id: `chatevt-${nextIdBox.current++}`, visitorId, status, detail, createdAt: new Date().toISOString() });
}

export async function recordContactSubmission(visitorId: string, kind: 'appointment' | 'contact', summary: string): Promise<void> {
  CONTACT_EVENTS.unshift({ id: `contactevt-${nextIdBox.current++}`, visitorId, kind, summary, createdAt: new Date().toISOString() });
}

export async function getAllVisitorSessions(): Promise<VisitorSession[]> {
  return [...SESSIONS.values()].sort((a, b) => b.lastSeenAt.localeCompare(a.lastSeenAt));
}

export async function getVisitorSession(id: string): Promise<VisitorSession | null> {
  return SESSIONS.get(id) ?? null;
}

export async function getOnlineVisitorCount(): Promise<number> {
  const cutoff = Date.now() - ONLINE_WINDOW_MS;
  return [...SESSIONS.values()].filter((s) => Date.parse(s.lastSeenAt) >= cutoff).length;
}

export async function getChatbotEventsForVisitor(visitorId: string): Promise<ChatbotInteractionEvent[]> {
  return CHATBOT_EVENTS.filter((e) => e.visitorId === visitorId);
}

export async function getContactSubmissionsForVisitor(visitorId: string): Promise<ContactSubmissionEvent[]> {
  return CONTACT_EVENTS.filter((e) => e.visitorId === visitorId);
}

export async function getAllChatbotEvents(): Promise<ChatbotInteractionEvent[]> {
  return [...CHATBOT_EVENTS].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getAllContactSubmissions(): Promise<ContactSubmissionEvent[]> {
  return [...CONTACT_EVENTS].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function sessionsToCsv(sessions: VisitorSession[]): string {
  const header = [
    'visitorId', 'firstSeenAt', 'lastSeenAt', 'isReturning', 'country', 'region', 'city', 'ip', 'isp',
    'browser', 'os', 'deviceType', 'screen', 'language', 'timeZone', 'referrer', 'landingPage', 'pageCount', 'durationSeconds',
  ];
  const escape = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const rows = sessions.map((s) => [
    s.id, s.firstSeenAt, s.lastSeenAt, s.isReturning, s.location.country, s.location.region, s.location.city, s.location.ip, s.location.isp,
    s.browser, s.os, s.deviceType, s.screen, s.language, s.timeZone, s.referrer, s.landingPage, s.pages.length, s.durationSeconds,
  ].map(escape).join(','));
  return [header.join(','), ...rows].join('\n');
}
