import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

// Every third-party origin this app's *browser-side* JS actually talks to —
// Stripe Elements/Checkout, the PayPal JS SDK, and (dev-only) Next.js's own
// HMR websocket. Server-to-server calls (Resend, Vonage, Anthropic, the
// Stripe/PayPal REST APIs) never touch the browser, so they don't belong in
// a Content-Security-Policy at all.
//
// 'unsafe-inline' on script-src is a deliberate, temporary weakening — Next.js
// injects its own inline RSC-hydration bootstrap scripts, and without this
// (or a per-request nonce threaded through src/proxy.ts's middleware) React
// never hydrates at all: every onClick across the entire site silently no-ops.
// Confirmed against both `next dev` and a real `next build && next start`.
// The correct long-term fix is nonce-based CSP generated in proxy.ts, applied
// site-wide — deliberately not done here since it requires careful surgery on
// that file's existing session-refresh/revocation logic and deserves its own
// reviewed pass, not a bundled side-fix. This CSP has never been deployed, so
// this is "broken -> working," not a regression on anything live.
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' https://js.stripe.com https://www.paypal.com https://www.paypalobjects.com${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https:",
  "font-src 'self' data:",
  `frame-src https://js.stripe.com https://hooks.stripe.com https://www.paypal.com`,
  `connect-src 'self' https://api.stripe.com https://m.stripe.com https://www.paypal.com${isDev ? " ws://localhost:* http://localhost:*" : ""}`,
  "form-action 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "frame-ancestors 'none'",
].join("; ");

const nextConfig: NextConfig = {
  // Removes the `X-Powered-By: Next.js` response header — a small but free
  // reduction in framework fingerprinting for an attacker doing recon.
  poweredByHeader: false,

  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.premiumtechnoir.org" }],
        destination: "https://premiumtechnoir.org/:path*",
        permanent: true,
      },
    ];
  },

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-DNS-Prefetch-Control", value: "off" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()",
          },
          // Vercel already adds a baseline HSTS header on custom domains,
          // but that's a platform default this app doesn't control or own
          // if it's ever deployed elsewhere — setting it explicitly here
          // also adds includeSubDomains + preload, which Vercel's default
          // doesn't. Safe unconditionally: this app is only ever served
          // over HTTPS (Vercel redirects HTTP -> HTTPS at the edge).
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
          { key: "Content-Security-Policy", value: csp },
        ],
      },
    ];
  },
};

export default nextConfig;
