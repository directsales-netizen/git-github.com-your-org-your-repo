'use client';

import { useMemo, useState } from 'react';
import { Users, Radio, Repeat, Clock, Download } from 'lucide-react';
import type { ChatbotInteractionEvent, ContactSubmissionEvent, VisitorSession } from '@/types/admin';
import { accessibility, buttonVariants, cardVariants, cn, inputVariants } from '@/design';
import StatCard from '@/components/admin/StatCard';
import DataTable, { type Column } from '@/components/admin/DataTable';
import Drawer from '@/components/admin/Drawer';
import StatusBadge from '@/components/admin/StatusBadge';

interface Props {
  initialSessions: VisitorSession[];
  initialOnlineCount: number;
  initialChatbotEvents: ChatbotInteractionEvent[];
  initialContactSubmissions: ContactSubmissionEvent[];
}

interface SessionRow {
  id: string;
  country: string;
  region: string;
  city: string;
  device: string;
  browser: string;
  os: string;
  referrer: string;
  landingPage: string;
  pageCount: number;
  durationLabel: string;
  visitorType: string;
  lastSeenAt: string;
  session: VisitorSession;
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
}

function toRow(session: VisitorSession): SessionRow {
  return {
    id: session.id,
    country: session.location.country ?? 'Unknown',
    region: session.location.region ?? '',
    city: session.location.city ?? '',
    device: session.deviceType,
    browser: session.browser,
    os: session.os,
    referrer: session.referrer ?? 'Direct',
    landingPage: session.landingPage,
    pageCount: session.pages.length,
    durationLabel: formatDuration(session.durationSeconds),
    visitorType: session.isReturning ? 'Returning' : 'New',
    lastSeenAt: session.lastSeenAt,
    session,
  };
}

const ALL = '__all__';

export default function VisitorAnalyticsClient({
  initialSessions,
  initialOnlineCount,
  initialChatbotEvents,
  initialContactSubmissions,
}: Props) {
  const [sessions] = useState(initialSessions);
  const [chatbotEvents] = useState(initialChatbotEvents);
  const [contactSubmissions] = useState(initialContactSubmissions);
  const [selected, setSelected] = useState<VisitorSession | null>(null);

  const [countryFilter, setCountryFilter] = useState(ALL);
  const [deviceFilter, setDeviceFilter] = useState(ALL);
  const [referrerFilter, setReferrerFilter] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const rows = useMemo(() => sessions.map(toRow), [sessions]);

  const countries = useMemo(() => [...new Set(rows.map((r) => r.country))].sort(), [rows]);
  const devices = useMemo(() => [...new Set(rows.map((r) => r.device))].sort(), [rows]);

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      if (countryFilter !== ALL && row.country !== countryFilter) return false;
      if (deviceFilter !== ALL && row.device !== deviceFilter) return false;
      if (referrerFilter.trim() && !row.referrer.toLowerCase().includes(referrerFilter.trim().toLowerCase())) return false;
      if (fromDate && row.lastSeenAt.slice(0, 10) < fromDate) return false;
      if (toDate && row.lastSeenAt.slice(0, 10) > toDate) return false;
      return true;
    });
  }, [rows, countryFilter, deviceFilter, referrerFilter, fromDate, toDate]);

  const returningCount = rows.filter((r) => r.visitorType === 'Returning').length;
  const avgDurationSeconds = rows.length ? Math.round(sessions.reduce((sum, s) => sum + s.durationSeconds, 0) / rows.length) : 0;

  const trend = useMemo(() => {
    const buckets = new Map<string, number>();
    for (const s of sessions) {
      const day = s.firstSeenAt.slice(0, 10);
      buckets.set(day, (buckets.get(day) ?? 0) + 1);
    }
    return [...buckets.entries()].sort(([a], [b]) => a.localeCompare(b)).slice(-14);
  }, [sessions]);

  const byCountry = useMemo(() => {
    const buckets = new Map<string, number>();
    for (const r of rows) buckets.set(r.country, (buckets.get(r.country) ?? 0) + 1);
    return [...buckets.entries()].sort(([, a], [, b]) => b - a).slice(0, 8);
  }, [rows]);

  const columns: Column<SessionRow>[] = [
    { key: 'id', header: 'Visitor', sortValue: (r) => r.id, render: (r) => <span className="font-mono text-caption text-neutral-light-gray">{r.id.slice(0, 8)}…</span> },
    { key: 'location', header: 'Location', render: (r) => <span>{[r.city, r.region, r.country].filter(Boolean).join(', ') || 'Unknown'}</span> },
    { key: 'device', header: 'Device', sortValue: (r) => r.device, render: (r) => <span className="capitalize">{r.device}</span> },
    { key: 'browserOs', header: 'Browser / OS', render: (r) => <span>{r.browser} / {r.os}</span> },
    { key: 'referrer', header: 'Referral source', sortValue: (r) => r.referrer },
    { key: 'pageCount', header: 'Pages', sortValue: (r) => r.pageCount },
    { key: 'durationLabel', header: 'Duration', sortValue: (r) => r.session.durationSeconds },
    {
      key: 'visitorType',
      header: 'Type',
      sortValue: (r) => r.visitorType,
      render: (r) => <StatusBadge tone={r.visitorType === 'Returning' ? 'info' : 'success'} label={r.visitorType} />,
    },
    { key: 'lastSeenAt', header: 'Last seen', sortValue: (r) => r.lastSeenAt, render: (r) => new Date(r.lastSeenAt).toLocaleString() },
  ];

  const maxTrend = Math.max(1, ...trend.map(([, count]) => count));
  const maxCountry = Math.max(1, ...byCountry.map(([, count]) => count));

  return (
    <>
      <div className="grid grid-cols-1 gap-4 tablet:grid-cols-2 desktop:grid-cols-4">
        <StatCard label="Online now" value={String(initialOnlineCount)} icon={Radio} />
        <StatCard label="Sessions tracked" value={String(rows.length)} icon={Users} />
        <StatCard label="Returning visitors" value={rows.length ? `${Math.round((returningCount / rows.length) * 100)}%` : '0%'} icon={Repeat} />
        <StatCard label="Avg. session duration" value={formatDuration(avgDurationSeconds)} icon={Clock} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 desktop:grid-cols-2">
        <div className={cardVariants.base}>
          <h3 className="text-h6 font-heading font-semibold text-neutral-white">Sessions, last 14 days</h3>
          <p className="mt-1 text-caption font-body text-neutral-silver">Includes seeded demo sessions until real traffic accrues.</p>
          <div className="mt-4 flex items-end gap-1.5" style={{ height: 120 }}>
            {trend.length === 0 && <p className="text-body-sm text-neutral-silver">No data yet.</p>}
            {trend.map(([day, count]) => (
              <div key={day} className="flex flex-1 flex-col items-center gap-1" title={`${day}: ${count}`}>
                <div className="w-full rounded-t bg-accent-primary/70" style={{ height: `${(count / maxTrend) * 100}px` }} />
                <span className="text-[10px] text-neutral-titanium">{day.slice(5)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className={cardVariants.base}>
          <h3 className="text-h6 font-heading font-semibold text-neutral-white">Visitors by country</h3>
          <p className="mt-1 text-caption font-body text-neutral-silver">
            No mapping library is bundled in this app, so location is shown as a ranked breakdown rather than a geographic map.
          </p>
          <div className="mt-4 flex flex-col gap-2">
            {byCountry.length === 0 && <p className="text-body-sm text-neutral-silver">No data yet.</p>}
            {byCountry.map(([country, count]) => (
              <div key={country} className="flex items-center gap-3">
                <span className="w-10 shrink-0 text-caption text-neutral-silver">{country}</span>
                <div className="h-2 flex-1 rounded-full bg-bg-primary">
                  <div className="h-2 rounded-full bg-accent-primary" style={{ width: `${(count / maxCountry) * 100}%` }} />
                </div>
                <span className="w-6 shrink-0 text-right text-caption text-neutral-silver">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={cn(cardVariants.base, 'mt-6')}>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-wrap items-end gap-3">
            <div>
              <label htmlFor="va-country" className="mb-1 block text-label-sm font-body text-neutral-silver">Country</label>
              <select id="va-country" value={countryFilter} onChange={(e) => setCountryFilter(e.target.value)} className={cn(inputVariants.base, 'w-auto py-2')}>
                <option value={ALL}>All countries</option>
                {countries.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="va-device" className="mb-1 block text-label-sm font-body text-neutral-silver">Device</label>
              <select id="va-device" value={deviceFilter} onChange={(e) => setDeviceFilter(e.target.value)} className={cn(inputVariants.base, 'w-auto py-2 capitalize')}>
                <option value={ALL}>All devices</option>
                {devices.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="va-referrer" className="mb-1 block text-label-sm font-body text-neutral-silver">Referral source</label>
              <input id="va-referrer" value={referrerFilter} onChange={(e) => setReferrerFilter(e.target.value)} placeholder="e.g. google" className={cn(inputVariants.base, 'w-40 py-2')} />
            </div>
            <div>
              <label htmlFor="va-from" className="mb-1 block text-label-sm font-body text-neutral-silver">From</label>
              <input id="va-from" type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className={cn(inputVariants.base, 'w-auto py-2')} />
            </div>
            <div>
              <label htmlFor="va-to" className="mb-1 block text-label-sm font-body text-neutral-silver">To</label>
              <input id="va-to" type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className={cn(inputVariants.base, 'w-auto py-2')} />
            </div>
          </div>

          <a
            href="/api/admin/visitor-analytics/export"
            className={cn(buttonVariants.secondary, accessibility.focusRing, 'flex items-center gap-2 px-4 py-2 text-body-sm')}
          >
            <Download size={16} aria-hidden="true" />
            Export CSV
          </a>
        </div>

        <div className="mt-5">
          <DataTable
            columns={columns}
            rows={filteredRows}
            getRowId={(r) => r.id}
            searchable
            searchPlaceholder="Search visitors by ID, browser, OS, referrer…"
            searchKeys={['id', 'browser', 'os', 'referrer', 'country']}
            emptyMessage="No visitor sessions match these filters."
            rowActions={(r) => (
              <button type="button" onClick={() => setSelected(r.session)} className={cn(buttonVariants.ghost, 'px-3 py-1.5 text-caption')}>
                View
              </button>
            )}
          />
        </div>
      </div>

      <Drawer isOpen={selected !== null} onClose={() => setSelected(null)} title={selected ? `Visitor ${selected.id.slice(0, 8)}…` : 'Visitor'}>
        {selected && <VisitorDetail session={selected} chatbotEvents={chatbotEvents} contactSubmissions={contactSubmissions} />}
      </Drawer>
    </>
  );
}

function VisitorDetail({
  session,
  chatbotEvents,
  contactSubmissions,
}: {
  session: VisitorSession;
  chatbotEvents: ChatbotInteractionEvent[];
  contactSubmissions: ContactSubmissionEvent[];
}) {
  const events = chatbotEvents.filter((e) => e.visitorId === session.id);
  const contacts = contactSubmissions.filter((c) => c.visitorId === session.id);

  const fields: [string, string][] = [
    ['Country', session.location.country ?? 'Unknown'],
    ['Region', session.location.region ?? 'Unknown'],
    ['City', session.location.city ?? 'Unknown'],
    ['IP address', session.location.ip ?? 'Unknown'],
    ['ISP', session.location.isp ?? 'Unknown'],
    ['Browser', session.browser],
    ['Operating system', session.os],
    ['Device type', session.deviceType],
    ['Screen size', session.screen ?? 'Unknown'],
    ['Language', session.language ?? 'Unknown'],
    ['Time zone', session.timeZone ?? 'Unknown'],
    ['Referral source', session.referrer ?? 'Direct'],
    ['Landing page', session.landingPage],
    ['Session duration', formatDuration(session.durationSeconds)],
    ['Visitor type', session.isReturning ? 'Returning' : 'New'],
    ['First seen', new Date(session.firstSeenAt).toLocaleString()],
    ['Last seen', new Date(session.lastSeenAt).toLocaleString()],
  ];

  return (
    <div className="flex flex-col gap-6">
      <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
        {fields.map(([label, value]) => (
          <div key={label}>
            <dt className="text-caption font-body text-neutral-silver">{label}</dt>
            <dd className="text-body-sm font-body text-neutral-white">{value}</dd>
          </div>
        ))}
      </dl>

      <div>
        <h4 className="mb-2 text-label-sm font-body font-semibold uppercase tracking-wide text-neutral-silver">Pages visited</h4>
        <ul className="flex flex-col gap-1.5">
          {session.pages.map((p, i) => (
            <li key={`${p.path}-${i}`} className="flex justify-between text-body-sm font-body text-neutral-light-gray">
              <span>{p.path}</span>
              <span className="text-neutral-silver">{new Date(p.visitedAt).toLocaleTimeString()}</span>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h4 className="mb-2 text-label-sm font-body font-semibold uppercase tracking-wide text-neutral-silver">Chatbot interactions</h4>
        {events.length === 0 ? (
          <p className="text-body-sm font-body text-neutral-silver">No chatbot activity for this visitor.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {events.map((e) => (
              <li key={e.id} className="flex items-start justify-between gap-3 text-body-sm font-body text-neutral-light-gray">
                <span>{e.detail ?? (e.status === 'ok' ? 'Conversation completed.' : 'Failed request.')}</span>
                <StatusBadge tone={e.status === 'ok' ? 'success' : 'error'} label={e.status} />
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <h4 className="mb-2 text-label-sm font-body font-semibold uppercase tracking-wide text-neutral-silver">Contact submissions</h4>
        {contacts.length === 0 ? (
          <p className="text-body-sm font-body text-neutral-silver">No contact or appointment submissions for this visitor.</p>
        ) : (
          <ul className="flex flex-col gap-1.5">
            {contacts.map((c) => (
              <li key={c.id} className="text-body-sm font-body text-neutral-light-gray">{c.summary}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
