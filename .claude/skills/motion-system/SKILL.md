---
name: motion-system
description: Use this skill whenever adding, extending, or applying animation/motion to any Premium TechNoir page or component — hero sections, cards, product pages, checkout, dashboards, nav, scroll effects, hover interactions, loading states, or anything else covered by MOTION_SYSTEM.md. Triggers on requests like "add motion to X", "animate X", "make X feel more premium/cinematic", "add a scroll reveal to X", "apply the motion system to X". Read this before writing any new animation code so the existing foundation is reused instead of re-implemented.
---

# Premium TechNoir Motion System

The full design spec lives in `MOTION_SYSTEM.md` at the repo root — read it for the
philosophy/requirements. This skill documents what's actually been **built** against
that spec, so new work extends it instead of duplicating it.

## Foundation (already built — reuse, don't recreate)

**Config** (`src/lib/`): `easing.ts` (paired Framer Motion cubic-bezier + GSAP
ease-string exports), `durations.ts` (seconds; `fast/base/slow` match the ms
tokens in `src/design/tokens.ts`, plus `reveal`/`cinematic` for page-level
motion), `motionPresets.ts` (`fadeVariants`, `scaleVariants`, `blurVariants`,
`maskVariants`, `staggerContainer`, and `withReducedMotion(variants, reduced)`
— every component below routes through this last one), `animationConfig.ts`
(`registerGsap()` — idempotent, client-only, dynamically imports ScrollTrigger;
`scrollTriggerDefaults`).

**Hooks** (`src/hooks/`): `useReducedMotion.ts` (the single source of truth —
`useSyncExternalStore` against `matchMedia`, not Framer Motion's own hook; use
this everywhere for consistency), `useMousePosition.ts` (normalized -1..1,
optionally scoped to a ref), `useMagnetic.ts` (GSAP button-follows-cursor),
`useParallax.ts` (GSAP ScrollTrigger scrub), `useScrollReveal.ts` (imperative
GSAP escape hatch for timelines/pinning that a Framer variant can't express).

**Components** (`src/components/animations/`): `Fade.tsx` (`variant`:
up/down/left/right/scale — covers FadeUp/FadeDown/FadeLeft/FadeRight/ScaleIn
via one component, not five), `Reveal.tsx` (`type`: mask/blur/text/image),
`HeroReveal.tsx` (`HeroReveal` + `HeroRevealItem` — mount-triggered staged
sequence for above-the-fold content; use this, not `Fade`, for hero-type
sections since `Fade` is scroll/`whileInView`-triggered), `MagneticButton.tsx`
(button wrapper; for a magnetic `<Link>`, call `useMagnetic` directly and
attach the ref), `GlassCard.tsx` (glassmorphism: hover lift + glow border +
shimmer sweep), `HoverTilt.tsx` (3D cursor-tilt wrapper), `PageTransition.tsx`
(route-change fade, mounted once in the storefront layout), `ScrollProgress.tsx`
(top progress bar, Framer `useScroll`, mounted once), `Counter.tsx` (animated
number, counts up on scroll-into-view), `Skeleton.tsx` (shimmer loading
placeholder, pure CSS, no hooks needed), `NavbarMotion.tsx` (exports
`useScrolled(threshold)` hook, not a wrapper component — Navigation.tsx keeps
owning its own `<header>`), `SmoothScrollProvider.tsx` (Lenis↔GSAP ticker
wiring; mounted once in the storefront layout only, never in `/admin`).

**Cinematic scroll additions** (`src/components/animations/`): `ScrollReveal.tsx`
(GSAP scroll-**scrubbed** reveal — progress tied continuously to scroll
position via `scrub: 1`, not a fixed-duration tween; use only when you
specifically want that continuously-driven feel, `Fade`/`Reveal` cover the
one-shot case used almost everywhere else), `ParallaxLayer.tsx` (declarative
wrapper around `useParallax`, `speed` prop -1..1, `children` optional for
purely decorative layers like a background glow), `PinSection.tsx` (pinned
scroll-driven step-scroller — render-prop `children: (activeStep) => ReactNode`,
quantizes to a step index so it doesn't re-render per scroll tick; renders all
steps stacked normally under reduced motion instead of pinning, since a
pinned viewport is a real accessibility trap, not just a comfort issue),
`MotionTimeline.tsx` (component form of `useScrollReveal` for composing a
real multi-step GSAP timeline), `TextReveal.tsx` (named wrapper over
`Reveal type="text"` — no separate implementation, word-stagger reveal is
already Framer Motion's job), `GlassReveal.tsx` (composes `ScrollReveal` +
the same glass styling `GlassCard` uses — for a scroll-scrubbed glass panel;
use `Fade`/`Reveal` + `GlassCard` instead for the one-shot version, which is
what the rest of the site uses), `FloatingElement.tsx` (the one primitive in
this system that's NOT scroll-driven — a plain infinite yoyo tween for
ambient glow orbs / floating glass panels; see Hero.tsx for the reference
usage, capped at two per section — atmosphere, not a focal point).

**Named 1:1 aliases** (`src/components/animations/`) — thin wrappers that
exist purely so imports match `MOTION_SYSTEM.md`'s naming exactly; the real
logic lives in the Foundation components above, not here: `FadeUp.tsx` /
`FadeDown.tsx` / `FadeLeft.tsx` / `FadeRight.tsx` (each `Fade` with `variant`
fixed), `ScaleReveal.tsx` (`Fade variant="scale"`), `BlurReveal.tsx` /
`ImageReveal.tsx` (`Reveal type="blur"` / `type="image"`), `Parallax.tsx`
(= `ParallaxLayer`), `ScrollTimeline.tsx` (= `MotionTimeline`). Prefer `Fade`/
`Reveal`/`ParallaxLayer`/`MotionTimeline` directly when writing new code — use
these named aliases only where the spec-exact name matters (e.g. matching a
design doc). `CardReveal.tsx` is the one name on the list with no prior
implementation: it names the `Fade variant="up"` + `GlassCard` pairing that
was already hand-composed per-card throughout the site (WhyChoose,
FeaturedProducts, Testimonials, sustainability grades/CTA) — safe to migrate
those call sites to it opportunistically, not yet done everywhere.

**Already wired**: `src/app/(storefront)/layout.tsx` mounts
`SmoothScrollProvider` + `ScrollProgress` once and wraps `{children}` in
`PageTransition`. `Hero.tsx` and `Navigation.tsx` are the reference
implementations for the Framer Motion side; `src/app/(storefront)/sustainability/RefurbishmentPinSection.tsx`
is the reference implementation for `PinSection` + `ParallaxLayer` (a real
pinned 4-step scroll-story, not a toy example) — read whichever is closer to
what you're building before writing new code.

## Conventions (follow these, don't reinvent)

- **Framer Motion vs GSAP split is deliberate**: Framer Motion for anything
  expressible as enter/exit variants or `whileInView` (fades, scales, hover
  states, layout/shared-element transitions via `layoutId`). GSAP+ScrollTrigger
  only for what Framer can't do — scroll-scrubbed parallax, pinned sections,
  multi-step imperative timelines. Don't reach for GSAP by default.
- **Every animation must respect reduced motion.** Use `@/hooks/useReducedMotion`
  (not framer-motion's own hook) and either route Framer variants through
  `withReducedMotion()` or early-return/no-op in GSAP hooks when `reduced` is
  true (see `useMagnetic.ts`/`useParallax.ts` for the pattern).
  `PageTransition`/`ScrollProgress` collapse to instant/hidden under reduced
  motion.
- **Never mutate a ref or call setState synchronously in a render body or a
  bare effect body** — this project's ESLint config (`react-hooks/set-state-in-effect`,
  `react-hooks/refs`) enforces the newer React Compiler rules. Use
  `useSyncExternalStore` for anything derived from external mutable state
  (scroll position, media queries, matchMedia) — see `useScrolled` in
  `NavbarMotion.tsx` or `useReducedMotion.ts` for the pattern. If you need a
  ref that tracks a changing callback without retriggering an effect, sync it
  inside a *separate* `useEffect` with no dependency array, never inline in
  the render body.
- **GSAP is Node/browser-only** — `registerGsap()` guards `typeof window`,
  dynamically imports `gsap/ScrollTrigger`. Never import `gsap/ScrollTrigger`
  statically at module top-level in a file that could be pulled into a Server
  Component's module graph.
- **Admin dashboard (`/admin/**`) stays motion-light on purpose** — no
  `SmoothScrollProvider`, no cinematic reveals. It's an operator tool, not a
  marketing surface; keep interactions snappy (Framer Motion micro-interactions
  are fine, e.g. `Counter.tsx` for stat tiles, but skip Lenis/parallax/hero-style
  staging there).
- **Glassmorphism styling** (`GlassCard`) uses the brand's aqua glow
  (`rgba(47,231,242,…)`) and existing `bg-bg-secondary/60 backdrop-blur-xl` —
  match this rather than inventing new glass tokens per component.

## Procedure for applying motion to a new page/component

1. Check `MOTION_SYSTEM.md`'s relevant section (Hero/Navigation/Scroll
   System/Cards/Product Experience/Checkout/Dashboard/AI Assistant) for what's
   actually requested there.
2. Pick primitives from the Foundation list above — don't write new Framer
   variants or GSAP tweens if an existing hook/component already covers it.
3. For a genuinely new primitive not covered, add it to
   `src/components/animations/` or `src/hooks/` following the existing file's
   shape (reduced-motion handling, prop naming), not inline in the consuming
   component — keep the foundation reusable.
4. Wire it into the target component, preserving all existing
   functionality/props (many pages here have CMS inline-editing, auth checks,
   or data-fetching logic already — motion is additive, never a rewrite).
5. Verify: `npx tsc --noEmit`, `npx eslint <changed files>`, `npm run build`,
   then a dev-server smoke test (`npm run dev`, curl or browser-check the
   affected route(s), grep the dev server log for errors). Check the reduced
   motion path explicitly if the effect is non-trivial.

## Not yet built (per prior scoping — greenfield, no existing pattern to follow)

`ProductReveal.tsx`, `CheckoutMotion.tsx`, `DashboardMotion.tsx` (page-specific,
named in `MOTION_SYSTEM.md` but never built), `MobileMenu.tsx`'s drawer
animation, mega menu transitions, and the nav search overlay (no search
functionality is wired up yet to animate). Building any of these is genuinely
new work — the Foundation primitives should still be reused where they fit
(e.g. `Fade`/`Reveal`/`GlassCard`/`Counter` inside a new `DashboardMotion.tsx`),
but there's no existing DashboardMotion-shaped file to extend.
