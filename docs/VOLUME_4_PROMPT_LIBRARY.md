# Volume 4: Prompt Library

**Premium TechNoir Development Bible — Volume 4**

A complete library of structured prompts organized by development phase. Each prompt contains:
- Objective
- Business context
- Technical requirements
- Files to create/update
- Acceptance criteria
- Testing checklist

---

## How to Use This Prompt Library

### Before Starting Any Prompt

1. Read this document
2. Find your phase and prompt
3. Copy the prompt text (or reference it)
4. Read the full context section
5. Work through acceptance criteria systematically

### Prompt Structure

Each prompt follows this format:

```
### Prompt #X: [Task Name]

**Objective:** Clear goal

**Context:** Business/technical background

**Brand Requirements:** Design system, accessibility, performance

**Technical Requirements:** Stack, patterns, dependencies

**Files to Create/Update:** Exact paths

**Acceptance Criteria:**
- [ ] Criterion 1
- [ ] Criterion 2

**Testing Checklist:**
- [ ] Test 1
- [ ] Test 2

**Next Prompt:** What comes after this
```

### Important Notes

- ✅ Use the **exact prompt text** — don't paraphrase
- ✅ **Always include business context** — Claude needs to understand WHY
- ✅ **Reference existing code** — link to files Claude has already created
- ✅ **State assumptions** — be explicit about design decisions
- ✅ **Verify acceptance criteria** — don't move forward until complete

---

## PHASE 2: UI/UX Foundation (Weeks 3-8)

### Prompt 13: Create the Homepage

**Objective:** Build the Premium TechNoir homepage that showcases the brand, featured products, and AI assistant.

**Context:** 

Premium TechNoir is a premium technology company specializing in professionally tested and responsibly sourced refurbished electronics. The homepage is the customer's first impression—it must communicate trust, quality, and sustainability.

Reference [Volume 1: Company Foundation](./VOLUME_1_COMPANY_FOUNDATION.md) for brand values and messaging.

**Brand Requirements:**
- Use the Premium TechNoir shield logo prominently
- Follow [DESIGN_SYSTEM.md](../DESIGN_SYSTEM.md) — Matte Black (#0D1117), Midnight Navy, Aqua (#2FE7F2), Electric Blue
- Apply [TYPOGRAPHY.md](../TYPOGRAPHY.md) — Space Grotesk headings, Inter body text
- Follow [VISUAL_BRAND_GUIDELINES.md](../VISUAL_BRAND_GUIDELINES.md) for visual standards
- WCAG 2.1 AA accessibility compliance
- Mobile-first responsive design (375px, 768px, 1024px, 1440px)

**Technical Requirements:**

- Next.js 14+ (App Router)
- React 18+ with TypeScript (strict mode)
- Tailwind CSS with design tokens from `@/design`
- shadcn/ui for components
- Framer Motion for animations (subtle, respect prefers-reduced-motion)
- Image optimization with Next.js Image component
- No console errors or warnings

**Sections:**

1. **Navigation** (see Prompt 14 for detailed specs)
   - Premium TechNoir logo
   - Main navigation (Shop, About, Blog, Support)
   - Search icon
   - Cart icon
   - Login/Account

2. **Hero Section**
   - Full-width banner with background gradient
   - Headline: "Premium Technology. Smarter Value. Sustainable Impact."
   - Subheading: Brief value proposition
   - CTA button: "Shop Now"
   - Hero image or video (device showcase)

3. **Why Choose Premium TechNoir** (4 value propositions)
   - Professionally Tested (30-point checklist)
   - Responsibly Sourced (transparent supply chain)
   - Premium Experience (quality at fair price)
   - Sustainable Impact (measurable environmental benefit)
   - Each with icon, heading, description

4. **Featured Products Grid**
   - 6 featured devices (mix of MacBooks, iPhones, iPads)
   - Product card: image, title, price, condition grade, quick view
   - Responsive: 1 col mobile, 2 col tablet, 3 col desktop
   - Add to cart quick action

5. **Customer Testimonials Carousel**
   - 3-5 rotating testimonials with photos
   - Star ratings, quote, customer name
   - Auto-rotate, manual navigation arrows

6. **Sustainability Section**
   - Impact metrics (devices saved, e-waste prevented, CO2 reduced)
   - "Why Refurbished?" explanation
   - Link to full sustainability page (Prompt XX - future)
   - Measured, factual claims only

7. **Newsletter Signup**
   - Email input field
   - "Get exclusive deals and updates"
   - Privacy assurance ("We respect your privacy")
   - Submit button
   - Success/error feedback

8. **Footer** (see Prompt 15 for detailed specs)
   - Company info
   - Quick links
   - Customer support
   - Social media
   - Legal links

9. **AI Chat Widget**
   - Floating chat icon (bottom right)
   - Initial greeting: "Hi! Welcome to Premium TechNoir. I'm here to help you find the right device or answer questions about your order. What can I help you with?"
   - Persistent across pages
   - (Full implementation in Prompt 33; here just placeholder)

**Files to Create:**

```
src/
├── app/
│   ├── layout.tsx           # Root layout with nav/footer
│   ├── page.tsx             # Homepage
│   └── globals.css          # Global styles (already exists)
├── components/
│   ├── sections/
│   │   ├── Hero.tsx
│   │   ├── WhyChoose.tsx
│   │   ├── FeaturedProducts.tsx
│   │   ├── Testimonials.tsx
│   │   ├── Sustainability.tsx
│   │   └── NewsletterSignup.tsx
│   ├── Navigation.tsx        # See Prompt 14
│   └── Footer.tsx            # See Prompt 15
├── lib/
│   └── api.ts               # API client for featured products
└── types/
    ├── product.ts
    └── testimonial.ts
```

**Acceptance Criteria:**

- [ ] Homepage renders without errors
- [ ] All sections present and styled
- [ ] Navigation works (even if links go nowhere yet)
- [ ] Footer present at bottom
- [ ] Responsive on mobile (375px), tablet (768px), desktop (1024px+)
- [ ] All text uses proper heading hierarchy (H1, H2, H3)
- [ ] Images optimized with Next.js Image component
- [ ] Focus states visible on all interactive elements
- [ ] Color contrast meets WCAG AA (4.5:1 for text)
- [ ] Animations respect prefers-reduced-motion
- [ ] No console errors or warnings
- [ ] Lighthouse score > 90
- [ ] Page load < 2 seconds

**Testing Checklist:**

- [ ] Manual test on Chrome, Firefox, Safari
- [ ] Manual test on iPhone SE (375px), iPad (768px), Desktop (1440px)
- [ ] Keyboard navigation (Tab through all interactive elements)
- [ ] Screen reader test (NVDA or JAWS)
- [ ] Test alt text on all images
- [ ] Test focus indicators
- [ ] Run Lighthouse audit
- [ ] Check bundle size (JS < 250KB gzipped)

**Next Prompt:** [Prompt 14: Create Navigation](#prompt-14-create-navigation)

---

### Prompt 14: Create Navigation

**Objective:** Build the responsive navigation component for the Premium TechNoir website.

**Context:**

Navigation is the primary way customers discover and navigate the site. It must be intuitive, accessible, and always available (sticky header).

**Brand Requirements:**
- Logo placement (top left) links to homepage
- Use Aqua (#2FE7F2) for active states
- Follow [COMPONENT_GUIDELINES.md](../COMPONENT_GUIDELINES.md)
- Mobile hamburger menu for < 768px
- Desktop horizontal menu for >= 768px

**Technical Requirements:**
- React component with TypeScript
- Tailwind CSS styling
- Responsive (mobile-first)
- Sticky positioning (stays at top on scroll)
- Keyboard navigation (Tab, Escape)
- ARIA labels for screen readers

**Navigation Links (Phase 1):**
- Logo (homepage)
- Shop (all products)
- About (company info)
- Support (help/FAQ)
- Search (icon)
- Cart (icon with item count)
- Account (Login / User Menu if logged in)

**Files:**

```
src/
├── components/
│   ├── Navigation.tsx
│   └── MobileMenu.tsx
└── types/
    └── navigation.ts
```

**Acceptance Criteria:**

- [ ] Logo displayed and clickable
- [ ] Links to all sections
- [ ] Mobile hamburger menu at 375px
- [ ] Desktop horizontal menu at 768px+
- [ ] Sticky/sticky positioning
- [ ] Cart shows item count (placeholder initially)
- [ ] Search icon present (no functionality yet)
- [ ] Account dropdown (login link initially)
- [ ] Close hamburger menu on link click (mobile)
- [ ] No layout shift on scroll
- [ ] All links keyboard accessible
- [ ] ARIA labels for icons
- [ ] Mobile menu has overlay/backdrop
- [ ] Active link indicated (Aqua color)

**Testing Checklist:**

- [ ] Test on mobile (hamburger menu)
- [ ] Test on desktop (horizontal menu)
- [ ] Test keyboard (Tab, Enter, Escape)
- [ ] Test screen reader
- [ ] Test sticky positioning on scroll
- [ ] Test at 375px, 768px, 1024px, 1440px widths

**Next Prompt:** [Prompt 15: Create Footer](#prompt-15-create-footer)

---

### Prompt 15: Create Footer

**Objective:** Build the responsive footer component.

**Context:**

Footer provides secondary navigation, company information, legal links, and newsletter signup. Important for SEO and customer trust.

**Brand Requirements:**
- Follow [VISUAL_BRAND_GUIDELINES.md](../VISUAL_BRAND_GUIDELINES.md)
- Use Silver (#C5CBD3) for secondary text
- Premium, minimal design

**Footer Sections:**

1. **Company Info**
   - Premium TechNoir logo (small)
   - Tagline: "Premium Technology. Smarter Value. Sustainable Impact."
   - "© 2026 Premium TechNoir. All rights reserved."

2. **Quick Links**
   - Shop
   - About Us
   - Sustainability
   - Blog
   - Careers (future)

3. **Customer Support**
   - Help & FAQ
   - Contact Us
   - Shipping Info
   - Returns
   - Warranty

4. **Company**
   - About
   - Sustainability Report
   - Careers
   - Partnerships

5. **Legal**
   - Privacy Policy
   - Terms of Service
   - Return Policy
   - Warranty Policy
   - Accessibility Statement

6. **Social Media**
   - LinkedIn
   - Instagram
   - Twitter/X
   - YouTube

7. **Newsletter Signup** (optional here, can be on homepage only)

**Files:**

```
src/
└── components/
    └── Footer.tsx
```

**Acceptance Criteria:**

- [ ] All sections present
- [ ] Responsive (stacked on mobile, columns on desktop)
- [ ] All links clickable (even if placeholder pages)
- [ ] Social media icons present
- [ ] Copyright notice
- [ ] Logo present
- [ ] Accessible link structure
- [ ] Keyboard navigable

**Next Prompt:** [Prompt 16: Create Shop Page](#prompt-16-create-shop-page)

---

### Prompt 16: Create Shop Page

**Objective:** Build the main product shop/catalog page with filtering and search.

**Context:**

The shop page is where customers browse and discover products. It must support filtering by category, price, condition grade, and search.

**Technical Specs:**

- Grid layout (responsive)
- Product cards with image, name, price, condition grade
- Filters: Category, Price Range, Condition Grade
- Search functionality
- Sorting: Price (low-high, high-low), Newest, Popular
- Pagination (20 items per page)
- URL-based filters (for sharing/bookmarking)

**Files:**

```
src/app/shop/
├── page.tsx
└── layout.tsx
src/components/
├── ProductCard.tsx
├── Filters.tsx
├── SortDropdown.tsx
└── ProductGrid.tsx
```

**Next Prompt:** [Prompt 17: Create Collections Page](#prompt-17-create-collections-page)

---

## PHASE 3: Inventory & Admin (Weeks 9-12)

### Prompt 26: Design Inventory Database

**Objective:** Design the Prisma schema for product inventory management.

**Context:**

The inventory system must track refurbished devices with granular detail: condition grading, battery health, testing status, supplier info, pricing, and warranty.

**Database Tables:**

- Products (name, SKU, category, model)
- Inventory (stock level, condition grade, serial number, status)
- Testing (checklist items completed)
- Pricing (cost, retail, discounts)
- Suppliers (sourcing information)
- Warranties (coverage details)

**Files:**

```
prisma/
├── schema.prisma
└── migrations/
    └── 001_create_inventory_schema
```

**Next Prompt:** [Prompt 27: Build Inventory CRUD](#prompt-27-build-inventory-crud)

---

## PHASE 4: AI Assistant (Weeks 13-15)

### Prompt 33: Create Premium TechNoir AI Assistant

**Objective:** Build the 24/7 AI customer support assistant powered by Claude.

**Context:**

The AI assistant is the primary customer touchpoint for:
- Product recommendations
- Customer support
- Warranty help
- Inventory lookups
- Appointment booking
- Order tracking
- FAQ responses

**Personality:**

Professional, friendly, knowledgeable, never pushy, solution-oriented. A trusted advisor, not a sales bot.

**Initial Greeting:**

"Hi! Welcome to Premium TechNoir. I'm here to help you find the right device, answer questions about our inventory, or assist with your order. What can I help you with?"

**Capabilities (Phase 1):**

1. Product Recommendations
   - Understand customer needs
   - Recommend appropriate devices
   - Explain specifications

2. Inventory Lookup
   - Check product availability
   - Compare similar devices
   - Explain condition grades

3. FAQ & General
   - Answer company questions
   - Explain warranty terms
   - Describe return policy
   - Discuss sustainability

4. Escalation
   - Recognize when human help needed
   - Escalate to support team gracefully
   - Provide ticket reference

**Files:**

```
src/
├── components/
│   └── ChatAssistant.tsx
├── lib/
│   ├── claude-api.ts
│   ├── chat-prompts.ts
│   └── escalation-rules.ts
└── api/routes/
    └── chat.ts
```

**Full specs:** See [Volume 6: AI Assistant Manual](#volume-6-ai-assistant-manual)

**Next Prompt:** [Prompt 34: Create AI Prompt Library](#prompt-34-create-ai-prompt-library)

---

## PHASE 5-11: Expansion Phases

**Prompts 38-80** follow the same structured format.

**Phases:**
- **Phase 5:** Admin Portal (Prompts 38-43)
- **Phase 6:** Business Automation (Prompts 44-48)
- **Phase 7:** Payments (Prompts 49-52)
- **Phase 8:** Security (Prompts 53-58)
- **Phase 9:** SEO (Prompts 59-62)
- **Phase 10:** Deployment (Prompts 63-69)
- **Phase 11:** Growth (Prompts 71-80)

---

## How Prompts Connect

**Chain of Implementation:**

```
Prompt 13: Homepage
    ↓
Prompt 14: Navigation (used by Homepage)
    ↓
Prompt 15: Footer (used by Homepage)
    ↓
Prompt 16: Shop (uses Navigation + Footer)
    ↓
Prompt 17: Collections (uses Navigation + Footer)
    ↓
Prompt 18: Product Detail (uses Navigation + Footer)
    ↓
Prompt 19: Search (used by Shop)
    ↓
Prompt 20: Cart (uses Navigation)
    ↓
Prompt 21: Checkout (uses Navigation)
    ↓
... (continue through phases)
```

Each prompt builds on previous work. Don't skip ahead.

---

## Key Principle

**Each prompt assumes you've completed the previous one.**

When you copy a prompt, reference existing code:
- "Use the `Navigation` component you created in Prompt 14"
- "Follow the same styling pattern from the `ProductCard` component"
- "The cart state is managed in the hook you built in Prompt 20"

This creates a continuous, cumulative development flow.

---

## Next Steps

1. Start with [Prompt 13: Create the Homepage](#prompt-13-create-the-homepage)
2. Follow the sequence (Prompts 14-25)
3. Then move to Prompt 26 (Inventory)
4. Continue through Phases 4-11

**Estimated Timeline:** 16-20 weeks to MVP launch

---

**See Also:**
- [Volume 1: Company Foundation](./VOLUME_1_COMPANY_FOUNDATION.md)
- [Volume 2: Master Instruction](./VOLUME_2_CLAUDE_MASTER_INSTRUCTION.md)
- [Volume 3: Product Requirements](./VOLUME_3_PRDS.md)
