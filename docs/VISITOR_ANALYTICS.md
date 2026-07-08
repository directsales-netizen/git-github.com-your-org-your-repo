# Visitor Analytics & Intelligence (SuperAdmin-only)

## Route

`/admin/visitor-analytics` — visible in the sidebar only to sessions with
`role === 'SuperAdmin'`; the page itself also checks the role server-side and
renders a restricted notice (not the data) for any other role. API routes
enforce the same check independently, so hiding the nav link is not the only
protection.

## Access control

This app has exactly one real login (`ADMIN_EMAIL` / `ADMIN_PASSWORD_HASH`,
see `src/lib/admin/auth.ts`) — there's no multi-account auth system. Role is
now part of the signed session (`src/lib/admin/session.ts`'s `SessionPayload.role`),
resolved at login time by `getConfiguredAdminRole()` (`src/lib/admin/auth.ts`),
which reads the new `ADMIN_ROLE` env var (`SuperAdmin | admin | editor | viewer`,
defaults to `SuperAdmin` since it's the only account able to sign in at all).
Sessions signed before this change carry no role and are treated as `admin`
(no visitor-analytics access) until the user logs in again.

- `requireSuperAdminSession()` (`src/lib/admin/getSession.ts`) gates the two
  new API routes, returning 403 for any non-SuperAdmin session.
- The dashboard's own admin-session gate (`src/app/admin/(dashboard)/layout.tsx`)
  is unchanged for every other module — only Visitor Analytics itself checks
  role, so admin/editor/viewer accounts keep full access to inventory, orders,
  customers, etc.
- Every SuperAdmin view or CSV export of this data calls `logActivity(...)`
  (`src/lib/admin/activityLog.ts`), visible in Admin → Activity Logs.

## Data source

There is no real analytics backend in this app (same honesty note as
`src/lib/admin/analytics.ts` and `CHAT_ASSISTANT_ARCHITECTURE.md`). This
feature is a hybrid:

1. **Seeded demo sessions** (`src/lib/admin/visitorAnalytics.ts`) so the
   dashboard isn't empty on first load — clearly the minority of what you'll
   see once real traffic accrues.
2. **Real, in-process capture** of actual visits to this server during its
   current run: a consent-gated client component
   (`src/components/VisitorTracker.tsx`, mounted once in the storefront root
   layout) beacons each pageview to `POST /api/visitor/track`, which resolves
   browser/OS/device from the request's real `User-Agent` header, best-effort
   IP geolocation (see below), and stores it in the same in-memory store as
   every other admin mock-data module (`globalSingleton`, see
   `src/lib/globalStore.ts`) — resets on server restart, and is not shared
   across separate serverless function instances in production. A real
   product would swap this store for a database and add a background purge
   job for retention.
3. **Chatbot + contact events**: `src/app/api/chat/route.ts` records an `ok`
   or `error` event per chat turn, and an appointment confirmation as a
   contact-submission event — both linked to the visitor's anonymous session
   id. This app has no dedicated "contact form"; the existing appointment/
   consultation booking flow (`src/lib/chat/appointments.ts`) is the closest
   equivalent and is what's wired up.

## What visitor data is available

Per visitor session (see the `VisitorSession` type in `src/types/admin.ts`
and the detail drawer in `VisitorAnalyticsClient.tsx`): country, region, city,
IP (masked or full — see Privacy below), ISP, browser, OS, device type, screen
size, language, time zone, referrer, landing page, full page-visit list,
session duration, new-vs-returning, first/last-seen timestamps. Plus,
dashboard-wide: real-time online count, chatbot ok/error events per visitor,
and contact/appointment submissions per visitor.

Dashboard features: text search (visitor id / browser / OS / referrer /
country), filters (country, device, referral source, date range), a 14-day
sessions trend chart, a "visitors by country" ranked breakdown, and CSV
export (`GET /api/admin/visitor-analytics/export`).

## Limitations

- **IP geolocation is optional and best-effort.** Without `IPINFO_TOKEN` set,
  `country`/`region`/`city`/`isp` are always `null` ("Unknown" in the UI) —
  no geo-IP database is bundled, and no paid service is called without an
  explicit token. See `src/lib/admin/visitorIntel.ts`.
- **No real IP access in Route Handlers.** IP is read from the
  `x-forwarded-for` / `x-real-ip` proxy headers, which some hosts don't set;
  when absent, IP/geo is simply unavailable for that visit.
- **No mapping library is bundled**, so "visitor location map" is implemented
  as a ranked "visitors by country" breakdown rather than a literal
  geographic map. Adding one (e.g. react-simple-maps) is a follow-up if a
  real map view is required.
- **In-memory store only** — resets on server restart, and does not persist
  across separate function instances on serverless hosting (same accepted
  limitation as every other admin mock-data module in this app).
- **UA parsing is regex-based**, not a full UA database — browser/OS/device
  are broad categories, not exact versions.

## Privacy & security

- **Consent-gated collection**: `VisitorTracker` shows a banner before
  sending any tracking beacon; declining means no cookie is ever set and no
  data is ever sent for that visitor. Accepting is remembered in
  `localStorage` (`ptn_analytics_consent`) so the banner doesn't reappear.
- **IP storage is masked by default.** `VISITOR_ANALYTICS_STORE_IP` (env var,
  default unset/`false`) controls whether the *exact* IP is persisted; when
  not `"true"`, only a masked form (last IPv4 octet / IPv6 suffix zeroed) is
  stored — geolocation still runs on the real IP at request time, but the
  identifying part of the address itself is never retained.
- **No sensitive content collected.** Chat events store only an
  ok/error status and a short, non-user-authored detail string — never chat
  message text, passwords, or payment data.
- **Anonymous by design.** Visitor/session ids are random (`crypto.randomUUID()`),
  never derived from IP, email, or any other identifying value.
- **Separate from customer-facing pages.** `VisitorTracker` no-ops on any
  `/admin` path; the tracking endpoint (`/api/visitor/track`) only ever
  writes data and never returns any visitor's data back to a caller.

## New environment variables

| Variable | Purpose | Default |
|---|---|---|
| `ADMIN_ROLE` | Role assigned to the single configured admin account at login (`SuperAdmin`\|`admin`\|`editor`\|`viewer`). | `SuperAdmin` |
| `IPINFO_TOKEN` | Enables best-effort IP → country/region/city/ISP lookups via ipinfo.io. Unset = no network call, all fields `null`. | unset |
| `VISITOR_ANALYTICS_STORE_IP` | Set to `"true"` to persist visitors' exact IP addresses. Default masks the last IPv4 octet / IPv6 suffix before storage. | unset (masked) |

## New files

- `src/lib/admin/visitorIntel.ts` — UA parsing, IP geolocation, IP masking, IP header extraction.
- `src/lib/admin/visitorAnalytics.ts` — in-memory data store + query/record functions + CSV export.
- `src/app/api/visitor/track/route.ts` — public, unauthenticated pageview beacon endpoint.
- `src/components/VisitorTracker.tsx` — consent banner + pageview beacon, mounted in `src/app/layout.tsx`.
- `src/app/api/admin/visitor-analytics/route.ts` — SuperAdmin-gated JSON read.
- `src/app/api/admin/visitor-analytics/export/route.ts` — SuperAdmin-gated CSV export.
- `src/app/admin/(dashboard)/visitor-analytics/page.tsx` + `VisitorAnalyticsClient.tsx` — the dashboard page.

## Changed files

- `src/types/admin.ts` — added `SuperAdmin` to `AdminRole`, added visitor analytics types.
- `src/lib/admin/session.ts` — `SessionPayload` now carries `role`; `signSession(email, role)`.
- `src/lib/admin/auth.ts` — added `getConfiguredAdminRole()`.
- `src/lib/admin/getSession.ts` — added `requireSuperAdminSession()`.
- `src/app/api/admin/auth/login/route.ts` — signs the resolved role into the session.
- `src/app/api/chat/route.ts` — records chatbot ok/error and appointment-confirmed events.
- `src/app/layout.tsx` — mounts `VisitorTracker`.
- `src/components/admin/AdminShell.tsx`, `AdminSidebar.tsx` — thread `adminRole` through to conditionally show the "Visitor Analytics" nav entry.
