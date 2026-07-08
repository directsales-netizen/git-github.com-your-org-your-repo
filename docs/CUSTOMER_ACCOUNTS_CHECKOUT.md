# Customer Accounts, Cart, Checkout & Payments

## New environment variables

| Variable | Required for | Effect when unset |
|---|---|---|
| `STRIPE_SECRET_KEY` | Real payments | `POST /api/checkout/session` and the webhook return 503 "Payments are not configured yet." — no crash. |
| `STRIPE_WEBHOOK_SECRET` | Order fulfillment | `POST /api/webhooks/stripe` returns 503 — no order/stock/points side effects occur. |
| `RESEND_API_KEY` | Verification/confirmation email | `sendEmail` no-ops with a console warning; registration/checkout still succeed. |
| `RESEND_FROM_EMAIL` | Sending address | Falls back to Resend's shared `onboarding@resend.dev` sandbox address. |

`SESSION_SECRET` (already required by admin auth) is reused for customer
sessions too — no new secret needed.

## Getting real payments/email working

1. Create a Stripe account (test mode is fine), copy the secret key into
   `STRIPE_SECRET_KEY`.
2. Run `stripe listen --forward-to localhost:3000/api/webhooks/stripe` (Stripe
   CLI) — it prints a `whsec_...` value; put that in `STRIPE_WEBHOOK_SECRET`.
   This sandbox has no publicly reachable URL, so this local-forwarding step
   is required for testing here; a real deployment would point a Stripe
   webhook endpoint at the deployed URL instead.
3. Create a Resend account, verify a sending domain (or use the sandbox
   address for testing), put the API key in `RESEND_API_KEY` and the from
   address in `RESEND_FROM_EMAIL`.
4. Restart the dev server so the new env vars are picked up.

## What was verified this session (no real keys available)

- `/shop`, `/`, `/login`, `/register` all render; product cards show an
  availability badge, never a raw stock count (grepped the HTML for
  `"stock":<number>` — no matches).
- Registered a real test account via `POST /api/customer/auth/register` →
  `/account` renders with name and a Rewards section.
- `POST /api/checkout/session`: invalid product id → 400; quantity exceeding
  real stock → 400 with the real stock count; valid item with
  `STRIPE_SECRET_KEY` unset → clean 503, not a crash.
- `POST /api/webhooks/stripe` with no config → clean 503.
- `/admin` still redirects to `/admin/login` (unaffected by any of the above).
- Existing `/api/chat` "track my order" flow still works unchanged.
- `npx tsc --noEmit` and `npm run build` both pass.
- **Not verified** (needs real keys + this environment isn't reachable from
  the internet): an actual Stripe Checkout redirect, a delivered webhook, a
  delivered email, and the admin Customers page visually reflecting a new
  signup (would require the real `ADMIN_PASSWORD_HASH` password, which
  wasn't available to this session — confirmed via code review instead:
  `addCustomerRecord` is called synchronously during registration).

## Architecture summary

See `/Users/ixyclaudssoundscloud.com/.claude/plans/silly-toasting-stardust.md`
for the full design rationale. Short version:

- Customer auth is a parallel, independent system to admin auth — separate
  cookie (`ptn_customer_session`), separate session codec
  (`src/lib/customer/session.ts`), same audited password hashing
  (`src/lib/security/password.ts`, extracted from admin auth this session).
- Cart is client-only (`src/lib/cart/CartContext.tsx`, React Context +
  localStorage) — its prices are a display cache only.
- The **only** place price/stock/product-id are trusted from is
  `src/app/api/checkout/session/route.ts`'s per-item catalog lookup
  (`getProductById`) — the request body has no price field to even ignore.
- Stripe Checkout is hosted/redirect-based (no card data touches this app).
  Order creation, stock decrement, rewards points, CRM lifetime-value update,
  and the confirmation email all happen from the signature-verified,
  idempotent webhook handler — never from the success-page redirect, since
  that isn't proof of payment.

## New files

Security/shared: `src/lib/security/password.ts`, `src/lib/security/rateLimit.ts`

Customer auth: `src/types/customer.ts`, `src/lib/customer/{store,session,getSession,auth,emailVerification,addresses}.ts`,
`src/app/api/customer/auth/{register,login,logout,verify-email}/route.ts`,
`src/app/api/customer/addresses/{route.ts,[id]/route.ts}`,
`src/app/(storefront)/{login,register}/page.tsx` + form components,
`src/app/(storefront)/account/{layout,page}.tsx`, `.../orders/page.tsx`, `.../addresses/{page,AddressesClient}.tsx`,
`LogoutButton.tsx`, `VerifiedBanner.tsx`

Email: `src/lib/email/resend.ts`

Cart: `src/types/cart.ts`, `src/lib/cart/CartContext.tsx`, `src/app/(storefront)/cart/{page,CartClient}.tsx`

Checkout/Stripe: `src/lib/stripe/client.ts`, `src/lib/checkout/{pendingCheckouts,processedEvents}.ts`,
`src/app/api/checkout/session/route.ts`, `src/app/api/webhooks/stripe/route.ts`,
`src/app/(storefront)/checkout/{page,CheckoutClient}.tsx`, `.../success/{page,ClearCartOnMount}.tsx`, `.../cancel/page.tsx`

## Changed files

`src/lib/admin/auth.ts` (refactored onto shared password module, behavior-preserving),
`src/app/api/admin/auth/login/route.ts` (uses shared rate limiter),
`src/types/admin.ts` + `src/lib/admin/settings.ts` + `SettingsClient.tsx` (`requireAccountForCheckout` toggle),
`src/lib/admin/customers.ts` (`addCustomerRecord`, `recordCustomerOrder`),
`src/lib/admin/rewards.ts` (`findOrCreateLoyaltyMember`, `awardPointsByEmail`, `getLoyaltyMemberByEmail`),
`src/lib/chat/orders.ts` (`createOrder`, `getOrdersByEmail`), `src/types/chat.ts` (optional `quantity`/`productId` on order items),
`src/proxy.ts` (added `/account` + `/api/customer` gate, parallel to the admin gate),
`src/app/(storefront)/layout.tsx` (wraps in `CartProvider`, passes auth state),
`src/components/Navigation.tsx` (real cart count, My Account/Log Out when signed in),
`src/components/shop/ProductCard.tsx` (Quick Add wired to the cart), `src/lib/api.ts` (`getProductById`),
`package.json` (added `stripe`, `resend`).
