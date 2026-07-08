/**
 * Next.js compiles Route Handlers and Server Component pages into separate
 * bundles ("layers"), which can each get their own module instance even
 * within the same Node process during dev (confirmed: writes made via
 * /api/admin/** routes were invisible to admin page reads until this fix).
 * Plain module-scope `let`/`const` mutable state — the pattern this repo's
 * pre-existing mock data modules (src/lib/api.ts, src/lib/chat/*) used
 * before the admin dashboard existed, when nothing ever wrote across that
 * boundary — is NOT guaranteed to be shared in that case.
 *
 * Storing state on `globalThis` instead guarantees a true process-wide
 * singleton. This is the same fix Next.js's own docs recommend for
 * dev-mode Prisma Client singletons, applied generally here.
 *
 * Real caveat this does NOT solve: on serverless deployments (e.g. Vercel
 * production), separate requests can be routed to entirely separate
 * function instances with no shared memory at all — so even with this fix,
 * "resets on restart" is optimistic in that environment; it may not even
 * persist between two consecutive requests. See docs/CHAT_ASSISTANT_ARCHITECTURE.md
 * and the admin dashboard summary for the same caveat on other mock stores.
 */

const registry = globalThis as unknown as Record<string, unknown>;

/** For state mutated in place (push/splice/property assignment) — arrays, Maps, Sets. */
export function globalSingleton<T>(key: string, create: () => T): T {
  const globalKey = `__ptn_${key}`;
  if (registry[globalKey] === undefined) {
    registry[globalKey] = create();
  }
  return registry[globalKey] as T;
}

/** For state that gets wholesale-reassigned (e.g. `settings = {...settings, ...patch}`). */
export interface Box<T> {
  current: T;
}

export function globalBox<T>(key: string, initial: () => T): Box<T> {
  return globalSingleton(key, () => ({ current: initial() }));
}
