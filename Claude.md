# CLAUDE.md - Premium TechNoir Development Guide

This document is the authoritative guide for all development work on Premium TechNoir. Every feature, component, and line of code should align with these principles.

---

## Part 1: Company Context

### About Premium TechNoir

**Mission:** To make technology accessible, affordable, and sustainable through responsible sourcing, refurbishment, resale, and recycling.

**Vision:** To become a trusted leader in sustainable technology commerce by delivering premium products, exceptional service, and lasting customer relationships.

**Tagline:** Premium Technology. Smarter Value. Sustainable Impact.

**Business Model:** B2C ecommerce specializing in professionally tested, responsibly sourced refurbished electronics.

**Target Customer:** Tech-savvy, environmentally conscious, value-minded individuals aged 25-55 seeking quality devices at affordable prices.

**Core Values:**
- Sustainability
- Integrity
- Innovation
- Value
- Community

---

## Part 2: Brand Identity

### Brand Personality

How Premium TechNoir should feel to customers:

- Professional and reliable
- Innovative and forward-thinking
- Transparent and honest
- Customer-first and helpful
- Long-term focused on relationships
- Community-oriented

**Core Feeling:** "I trust these people. They know what they're doing. They're transparent and will help me."

### Brand Voice

All written content (website, emails, support, social media) should sound:

- **Honest** – No exaggeration or greenwashing
- **Helpful** – Solution-oriented, not salesy
- **Knowledgeable** – Expert without condescension
- **Professional** – Competent and credible
- **Friendly** – Approachable and warm
- **Clear** – Easy to understand, no jargon

### Brand Messaging

**Primary Message:** "Premium Technology. Smarter Value. Sustainable Impact."

**Hidden Message:** "Extending the life of technology responsibly."

This should come through in:
- Product descriptions
- Marketing copy
- Customer support responses
- Email communications
- Social media posts
- About page content
- Sustainability reporting

---

## Part 3: Design System

### Color Palette

**Background Colors:**
- Matte Black: #0D1117
- Midnight Navy: #08131F

**Primary Accent:**
- Aqua: #2FE7F2

**Secondary Accent:**
- Electric Blue: #007BFF

**Neutral Colors:**
- Silver: #C5CBD3
- Titanium Gray: #6C757D

**Text Colors:**
- White: #FFFFFF
- Light Gray: #E0E0E0

### Typography

**Headings:** Space Grotesk (primary) or Sora (secondary)
- Font weights: 600-700 (semi-bold to bold)

**Body Text:** Inter
- Font weights: 400-500 (regular to medium)

### Visual Style

- Modern and premium
- Minimal and clean
- Apple-inspired
- High-end and tech-focused
- Strong visual hierarchy
- Generous whitespace

### UI Components

- Rounded corners: 8-16px radius
- Spacing grid: 8px
- Shadows: subtle, depth-creating
- Transitions: 300-500ms
- Contrast: WCAG AA minimum

### Responsive Design

Breakpoints:
- Mobile: 375px
- Tablet: 768px
- Desktop: 1024px
- Wide: 1440px

**Mobile-first approach required.**

### Accessibility

- WCAG 2.1 AA compliance (minimum)
- Semantic HTML
- ARIA labels where needed
- Keyboard navigation support
- Color contrast ≥ 4.5:1 for text
- Alt text for all images
- Focus indicators visible

---

## Part 4: Product Categories & Specifications

### Primary Categories

1. **MacBooks** – Laptops (Air, Pro, M1/M2/M3)
2. **iMacs** – Desktop computers
3. **iPads** – Tablets and iPad Pros
4. **iPhones** – Smartphones
5. **Windows PCs** – Laptops and desktops
6. **Accessories** – Chargers, cables, cases
7. **Parts** – Storage, RAM, batteries
8. **Refurbished** – Our refurbishment process showcase
9. **Clearance** – Limited-time deals

### Device Grading System

**Grade A (Like New):**
- Minimal signs of use
- Battery health > 85%
- Screen perfect/near-perfect
- Full functionality
- Includes original accessories
- Price: Near retail

**Grade B (Good):**
- Light signs of use (small scratches, minor marks)
- Battery health 75-85%
- Screen excellent condition
- Full functionality
- Some accessories may be missing
- Price: 20-30% discount

**Grade C (Fair):**
- Visible signs of use (scratches, wear)
- Battery health 65-74%
- Screen good, may have minor damage
- Full functionality
- Limited accessories
- Price: 40-50% discount

**Grade D (Acceptable):**
- Heavy signs of use (significant scratches, marks)
- Battery health 50-64%
- Screen usable, may have cosmetic damage
- Full functionality
- Minimal accessories
- Price: 50-60% discount

### Product Information Required

Every product listing must include:

**Basic Info:**
- Title and model number
- Brand and category
- Serial number (if applicable)
- Grade/condition rating
- Price and any discounts

**Specifications:**
- Processor/CPU
- RAM
- Storage capacity
- Display size and resolution
- Graphics card (if applicable)
- Connectivity ports
- Weight and dimensions
- Color and finish
- Year manufactured

**Condition Details:**
- Detailed condition description
- Physical inspection notes
- Battery health percentage
- Screen condition
- Keyboard/touchpad condition
- All ports functional status
- Complete testing checklist

**What's Included:**
- Device itself
- Original charger
- Original cables
- Original box
- Original accessories
- Any third-party items

**Warranty & Support:**
- Warranty period (standard minimum: 30 days)
- What's covered
- Extended warranty options
- Support contact information
- Return policy details

**Images:**
- Minimum 6 high-quality photos
- Front, back, sides, ports
- Show condition clearly
- Consistent lighting
- No distracting backgrounds

---

## Part 5: AI Assistant Specifications

### Purpose

The AI assistant is Premium TechNoir's primary customer touchpoint. It should reflect the brand personality and provide genuine value while driving conversions.

### Voice & Tone

The assistant should sound:
- Professional but warm
- Helpful without being pushy
- Knowledgeable but accessible
- Solution-oriented
- Honest about limitations

### Initial Greeting

> "Hi! Welcome to Premium TechNoir. I'm here to help you find the right device, answer questions about our inventory, or assist with your order. What can I help you with today?"

### Core Responsibilities

**Product Selection & Information:**
- Understand customer needs
- Recommend appropriate devices
- Explain specifications and features
- Compare products objectively
- Answer technical questions
- Suggest compatible accessories

**Shopping Assistance:**
- Help with filtering and search
- Explain condition grades
- Answer warranty questions
- Discuss pricing
- Help add items to cart

**Order Support:**
- Track order status
- Answer shipping questions
- Provide delivery timeframes
- Help with delivery logistics
- Assist with order modifications

**Account Management:**
- Help with account setup
- Explain loyalty program
- Guide through registration
- Assist with preferences

**Warranty & Returns:**
- Explain warranty coverage
- Guide through warranty claims
- Answer return questions
- Troubleshoot basic issues

**FAQ & General:**
- Answer company questions
- Explain sustainability practices
- Provide company information
- Clarify policies

### Escalation Triggers

Immediately escalate to human support when:
- Customer is frustrated or angry
- Complex technical issues arise
- Warranty claims need investigation
- Payment/billing disputes occur
- Customer explicitly requests human support
- Issue is outside AI capabilities after 2-3 exchanges

### Safety Guidelines

**Never:**
- Make guarantees beyond warranty
- Promise specific delivery dates without confirmation
- Collect payment information
- Bypass security protocols
- Agree to policy exceptions
- Engage in price negotiations

**Always:**
- Be honest about inventory
- Acknowledge limitations
- Offer to escalate when uncertain
- Maintain privacy and security
- Follow company policies
- Admit when you don't know something

---

## Part 6: Customer Experience Standards

### Before Purchase

- Clear product information
- Honest condition grading
- Easy navigation and search
- Responsive design
- Fast page loads
- AI assistant available
- FAQs accessible
- Customer testimonials visible

### During Purchase

- Simple, intuitive checkout
- Clear pricing (no hidden fees)
- Multiple payment options
- Secure payment processing
- Order confirmation immediate
- Clear communication

### After Purchase

- Tracking information provided
- Estimated delivery visible
- Fulfillment notifications
- Easy returns/exchanges
- Responsive support
- Warranty information accessible
- Follow-up surveys
- Loyalty rewards

### Long-term Relationship

- Personalized recommendations
- Loyalty program benefits
- Exclusive member offers
- Birthday rewards
- Referral incentives
- Community engagement
- Sustainability updates
- Long-term support

---

## Part 7: Sustainability Principles

### How to Communicate Sustainability

**Always:**
- Use factual, measurable claims
- Show specific numbers (devices saved, CO2 prevented, water saved)
- Compare to new device production
- Tell customer stories
- Show refurbishment process
- Highlight transparency

**Never:**
- Use vague claims ("saving the planet")
- Overstate environmental impact
- Use guilt-based messaging
- Make unsubstantiated claims
- Greenwash

### Messaging Framework

"By choosing a refurbished device from Premium TechNoir, you're extending the life of technology responsibly."

Explain:
- How many years of life we're adding
- How much e-waste we're preventing
- Environmental impact of manufacturing new vs. refurbished
- What happens to recycled components

---

## Part 8: Development Standards

### Code Quality

**Language:** TypeScript (strict mode required)
**Framework:** Next.js 14+
**Styling:** Tailwind CSS
**Components:** shadcn/ui
**Testing:** Jest + React Testing Library
**Code Quality:** ESLint + Prettier

### Architecture Principles

**Clean Architecture:**
- Separation of concerns
- Single Responsibility Principle
- Dependency Injection
- Testable code

**Scalability:**
- Modular component structure
- Database optimization
- API rate limiting
- Caching strategies
- CDN for static assets

**Security:**
- Environment variables for secrets
- Input validation
- SQL injection prevention (Prisma)
- XSS protection
- CSRF protection
- Secure password hashing
- PCI DSS compliance

**Performance:**
- Lighthouse score > 90
- Page load < 2 seconds
- API response < 200ms (p95)
- Image optimization
- Code splitting
- Lazy loading

### Coding Conventions

**File Structure:**
```
src/
  components/
    ui/              (shadcn/ui components)
    shared/          (reusable components)
    sections/        (page sections)
  pages/
  api/
  lib/
  styles/
  types/
  hooks/
  utils/
```

**Component Naming:**
- Use PascalCase for component files
- Use descriptive names
- Example: `ProductCard.tsx`, `CheckoutForm.tsx`

**Type Safety:**
- Always type function parameters
- Use interfaces for complex objects
- Avoid `any` type
- Use strict null checking

**Comments:**
- Comment the "why", not the "what"
- Keep comments current with code
- Use JSDoc for public functions

---

## Part 9: Testing Standards

### Unit Tests
- Test business logic
- Test utility functions
- Target: 70% coverage

### Integration Tests
- Test API routes
- Test database interactions
- Test critical user flows

### E2E Tests
- Test critical user journeys
- Test checkout flow
- Test product search
- Test account creation

### Testing Checklist

- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] E2E tests pass
- [ ] Manual testing on mobile
- [ ] Manual testing on desktop
- [ ] Accessibility audit
- [ ] Performance audit

---

## Part 10: Deployment & Operations

### Hosting
- Frontend: Vercel
- Database: Supabase or AWS RDS
- Images: Cloudinary CDN

### Environment Variables
- `.env.local` – Local development
- `.env.production` – Production
- Never commit secrets

### Monitoring
- Sentry for error tracking
- LogRocket for session replay
- Mixpanel or Plausible for analytics
- Uptime monitoring

### Backups
- Database backups daily
- Image backups to S3
- Code backups to GitHub

### Deployments
- Main branch auto-deploys to production
- Staging environment for testing
- Rollback procedure documented

---

## Part 11: Documentation

### README
- Project overview
- Setup instructions
- Development environment
- Build and deploy commands
- Contributing guidelines

### API Documentation
- OpenAPI/Swagger spec
- Endpoint descriptions
- Request/response examples
- Error codes
- Authentication method

### Architecture Decisions
- Document major decisions
- Explain trade-offs
- Link to alternatives considered

### Component Library
- Storybook stories
- Usage examples
- Props documentation
- Accessibility notes

---

## Part 12: Success Metrics

### Business Metrics
- Conversion rate (target: 2-3%)
- Average order value
- Customer lifetime value
- Return rate (target: < 5%)
- Net Promoter Score (target: > 50)

### Technical Metrics
- Uptime (target: 99.9%)
- Page load time (target: < 2s)
- API response time (target: < 200ms)
- Error rate (target: < 0.1%)
- Lighthouse score (target: > 90)

### User Engagement
- Cart abandonment rate
- Search refinement rate
- AI chat engagement
- Customer support response time
- Social media engagement

---

## Part 13: Legal & Compliance

### Required Policies
- Privacy Policy
- Terms of Service
- Return Policy
- Warranty Policy
- Shipping Policy

### Compliance Requirements
- GDPR (EU customers)
- CCPA (California residents)
- PCI DSS (payment processing)
- ADA (accessibility)
- State-specific consumer laws

### Data Protection
- Encryption at rest and in transit
- Regular backups
- Data retention policies
- User consent for marketing
- Right to delete personal data

---

## Part 14: Getting Started

### For New Developers

1. Read this entire document
2. Read Claude.md (company brand)
3. Read PRD.md (feature specifications)
4. Read DESIGN_SYSTEM.md (visual design)
5. Read AI_ASSISTANT_SPECS.md (chatbot behavior)
6. Read ROADMAP.md (development timeline)
7. Clone the repository
8. Follow setup instructions
9. Read the contributing guidelines

### Questions About This Document

- **Brand decisions:** Refer to Claude.md
- **Feature specifications:** Refer to PRD.md
- **Visual design:** Refer to DESIGN_SYSTEM.md
- **Development timeline:** Refer to ROADMAP.md
- **AI behavior:** Refer to AI_ASSISTANT_SPECS.md

---

## Part 15: Change Log

- **2026-07-04:** Initial CLAUDE.md creation with complete development guide
