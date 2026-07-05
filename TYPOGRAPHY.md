# Premium TechNoir Typography Guidelines

Comprehensive typography standards for Premium TechNoir. This guide defines font families, type scales, hierarchy, spacing, and usage patterns across all digital products.

---

## Table of Contents

1. [Font Families](#font-families)
2. [Type Scale](#type-scale)
3. [Typography Hierarchy](#typography-hierarchy)
4. [Font Weights & Styles](#font-weights--styles)
5. [Line Height & Letter Spacing](#line-height--letter-spacing)
6. [Component Typography](#component-typography)
7. [Responsive Typography](#responsive-typography)
8. [Accessibility](#accessibility)
9. [Common Patterns](#common-patterns)
10. [Implementation](#implementation)

---

## Font Families

### Primary Typeface: Inter
- **Purpose:** Body text, UI labels, all paragraph content
- **Weights:** 400 (Regular), 500 (Medium), 600 (Semibold)
- **Characteristics:** Clean, highly readable, universal appeal, excellent screen rendering
- **Use Cases:** Body copy, buttons, form labels, navigation, metadata
- **License:** Open source (SIL Open Font License)
- **Download:** https://fonts.google.com/specimen/Inter

### Secondary Typeface (Headings): Space Grotesk
- **Purpose:** All headings and display text
- **Weights:** 600 (Semibold), 700 (Bold)
- **Characteristics:** Modern, geometric, tech-forward, distinctive personality
- **Use Cases:** Page titles, section headings, hero text, emphasis
- **License:** Open source (SIL Open Font License)
- **Download:** https://fonts.google.com/specimen/Space+Grotesk

### Tertiary Typeface (Headings): Sora
- **Purpose:** Alternative heading typeface when Space Grotesk doesn't fit
- **Weights:** 600 (Semibold), 700 (Bold)
- **Characteristics:** Clean, geometric, slightly more approachable than Space Grotesk
- **Use Cases:** Secondary headings, alternative heading hierarchy
- **License:** Open source (SIL Open Font License)
- **Download:** https://fonts.google.com/specimen/Sora

### Font Loading Strategy

```html
<!-- Use Google Fonts with optimized display strategy -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link 
  href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Space+Grotesk:wght@600;700&display=swap" 
  rel="stylesheet"
>
```

**Font Display Strategy:**
- `display=swap` – Show fallback font while web font loads, swap when ready
- Prevents layout shift and improves perceived performance
- Ensures readability from first paint

### Fallback Font Stacks

**Headings (Space Grotesk):**
```
'Space Grotesk', 'Sora', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif
```

**Body (Inter):**
```
'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif
```

---

## Type Scale

The type scale is designed to provide clear visual hierarchy while maintaining readability across all screen sizes. All sizes are measured in pixels at 16px base size.

### Display & Hero Text

| Name | Size | Line Height | Weight | Usage |
|------|------|-----------|--------|-------|
| **Display 1** | 72px | 1.2 (86px) | 700 | Large hero headlines, major page titles |
| **Display 2** | 60px | 1.2 (72px) | 700 | Hero sections, prominent announcements |

### Headings

| Name | Size | Line Height | Weight | Usage |
|------|------|-----------|--------|-------|
| **H1** | 48px | 1.3 (62px) | 700 | Page titles, major sections |
| **H2** | 40px | 1.3 (52px) | 700 | Section titles, main groupings |
| **H3** | 32px | 1.4 (45px) | 600 | Subsections, card titles |
| **H4** | 24px | 1.4 (34px) | 600 | Minor headings, component titles |
| **H5** | 20px | 1.5 (30px) | 600 | Subheadings, group labels |
| **H6** | 16px | 1.5 (24px) | 600 | Small headings, tertiary labels |

### Body Text

| Name | Size | Line Height | Weight | Usage |
|------|------|-----------|--------|-------|
| **Body Large** | 18px | 1.6 (29px) | 400 | Lead paragraphs, introductory text |
| **Body Medium** | 16px | 1.6 (26px) | 400 | Standard body copy, main content |
| **Body Small** | 14px | 1.5 (21px) | 400 | Secondary text, reduced emphasis |
| **Body XS** | 12px | 1.5 (18px) | 400 | Tertiary text, minimal emphasis |

### UI Labels & Captions

| Name | Size | Line Height | Weight | Usage |
|------|------|-----------|--------|-------|
| **Label Medium** | 14px | 1.5 (21px) | 500 | Form labels, button text, UI labels |
| **Label Small** | 12px | 1.5 (18px) | 500 | Small UI text, helper text |
| **Label XS** | 11px | 1.4 (15px) | 600 | Badges, tags, tiny UI text |
| **Caption** | 12px | 1.4 (16px) | 400 | Metadata, timestamps, footnotes |

### Type Scale Ratios

The scale uses a 1.25 ratio between most sizes (minor third) for harmonic progression:

```
Display 1: 72px
Display 2: 60px (÷ 1.2)
H1: 48px (÷ 1.25)
H2: 40px (÷ 1.2)
H3: 32px (÷ 1.25)
H4: 24px (÷ 1.33)
H5: 20px (÷ 1.2)
H6: 16px (÷ 1.25)
Body Large: 18px
Body Medium: 16px (÷ 1.125)
Body Small: 14px (÷ 1.14)
```

This creates a predictable, balanced hierarchy.

---

## Typography Hierarchy

### Visual Hierarchy Principles

**Headings → Subheadings → Body Text → Labels → Captions**

Each level should be clearly distinct from the others through size, weight, or color change.

### Hierarchy in Practice

```
H1 Page Title (48px, bold)
├─ H2 Section (40px, bold)
│  ├─ H3 Subsection (32px, semibold)
│  └─ Body Medium (16px, regular)
│     └─ Caption (12px, regular) — metadata
└─ Body Medium (16px, regular)
   └─ Label Small (12px, medium) — action text
```

### Emphasis Techniques

**Option 1: Size**
Larger text is naturally more prominent
```
Heading: 32px
Body: 16px
```

**Option 2: Weight**
Bolder text draws attention
```
Body Regular: 16px, 400 weight
Body Bold: 16px, 600 weight
```

**Option 3: Color**
Lighter/darker colors create hierarchy
```
Primary Text: White (#FFFFFF)
Secondary Text: Light Gray (#E0E0E0)
Tertiary Text: Silver (#C5CBD3)
```

**Option 4: Combination**
Combine multiple techniques for maximum emphasis
```
Prominent: 20px, 600 weight, White (#FFFFFF)
Secondary: 14px, 400 weight, Silver (#C5CBD3)
```

### Never Do This
❌ Use all caps for readability (breaks screen reader optimization)
❌ Use all lowercase for headings (reduces scannability)
❌ Use more than 2 heading sizes on one page
❌ Skip heading levels (e.g., H1 → H3, skip H2)

---

## Font Weights & Styles

### Weight Usage

| Weight | Name | Usage |
|--------|------|-------|
| **400** | Regular | Body text, paragraphs, standard content |
| **500** | Medium | Form labels, button text, UI elements |
| **600** | Semibold | Subheadings, emphasis, moderate weight |
| **700** | Bold | Main headings, maximum emphasis |

### Weight Hierarchy

```
Headings (H1-H6): 600-700 weight
  ↓
UI Elements (buttons, labels): 500-600 weight
  ↓
Body Text: 400 weight
  ↓
Reduced Emphasis: 400 weight + lighter color
```

### Font Styles

- **Italic:** Use sparingly for emphasis or citations
  - Not recommended for body text on dark backgrounds
  - Use for: quotes, definitions, variable names in code
  
- **Underline:** Only for links
  - Never use for emphasis (confuses with links)
  - Keep underline on hover to indicate interactivity

---

## Line Height & Letter Spacing

### Line Height Guidelines

Line height (leading) improves readability and visual comfort:

```
Display (72px, 60px):      1.2 line height (tight, for drama)
Headings (48px - 16px):    1.3-1.5 line height (proportional to size)
Body Text (18px - 12px):   1.5-1.6 line height (generous for readability)
UI Labels (14px - 11px):   1.5 line height (tight, space-constrained)
```

**Why?** Larger text can handle tighter spacing; smaller text needs more breathing room.

### Recommended Line Heights by Size

| Font Size | Min Line Height | Max Line Height |
|-----------|-----------------|-----------------|
| 72px+ | 1.1 | 1.3 |
| 40px - 48px | 1.2 | 1.4 |
| 24px - 32px | 1.3 | 1.5 |
| 16px - 20px | 1.4 | 1.6 |
| 12px - 14px | 1.4 | 1.5 |

### Letter Spacing (Tracking)

Letter spacing should be minimal on body text (most fonts are kerned well):

```
Display & Headings: 0 to -0.02em (very tight)
Body Text:          0 to 0.01em (normal to slight)
UI Labels:          0 to 0.05em (slightly wider)
```

**Example:** H1 at 48px with -0.02em letter spacing:
```
-0.02em × 48px = -0.96px (slightly tighter spacing)
```

### Paragraph Spacing

Vertical rhythm is crucial for readability:

```
Heading → Body Paragraph:   1.5× line height gap (24px for 16px body)
Paragraph → Paragraph:      1× line height gap (16px for 16px body)
Paragraph → Subheading:     2× line height gap (32px)
```

**In CSS:**
```css
h1 {
  margin-bottom: 1.5rem; /* Below heading */
}

p {
  margin-bottom: 1rem; /* Between paragraphs */
  line-height: 1.6;
}

p + p {
  margin-top: 0; /* Collapse adjacent margins */
}
```

---

## Component Typography

### Navigation & Header

**Primary Navigation**
- Size: 14px (Label Medium)
- Weight: 500
- Color: White (#FFFFFF)
- Line Height: 1.5

**Secondary Navigation**
- Size: 12px (Label Small)
- Weight: 500
- Color: Silver (#C5CBD3)
- Line Height: 1.5

### Buttons

**Button Text (All Variants)**
- Size: 14px (Label Medium)
- Weight: 600
- Color: Inherit or override per variant
- Line Height: 1.5
- Letter Spacing: 0

```html
<button class="text-label-md font-semibold">Button Label</button>
```

### Form Labels & Inputs

**Form Label**
- Size: 14px (Label Medium)
- Weight: 500
- Color: White (#FFFFFF)
- Line Height: 1.5

**Input Placeholder**
- Size: 14px (Body Small)
- Weight: 400
- Color: Silver (#C5CBD3) @ 60% opacity
- Line Height: 1.5

**Form Error Text**
- Size: 12px (Body XS)
- Weight: 400
- Color: Error Red (#EF4444)
- Line Height: 1.5
- Margin Top: 4px

**Form Helper Text**
- Size: 12px (Body XS)
- Weight: 400
- Color: Silver (#C5CBD3)
- Line Height: 1.5
- Margin Top: 4px

### Cards & Content Containers

**Card Heading**
- Size: 20px (H5)
- Weight: 600
- Color: White (#FFFFFF)
- Line Height: 1.5

**Card Description**
- Size: 14px (Body Small)
- Weight: 400
- Color: Light Gray (#E0E0E0)
- Line Height: 1.6

**Card Metadata**
- Size: 12px (Caption)
- Weight: 400
- Color: Silver (#C5CBD3)
- Line Height: 1.4

### Product Listings

**Product Title**
- Size: 16px (Body Medium)
- Weight: 600
- Color: White (#FFFFFF)
- Line Height: 1.5

**Product Price**
- Size: 18px (Body Large)
- Weight: 600
- Color: Aqua (#2FE7F2)
- Line Height: 1.5

**Product Description**
- Size: 14px (Body Small)
- Weight: 400
- Color: Light Gray (#E0E0E0)
- Line Height: 1.6

**Product Condition Grade**
- Size: 12px (Label Small)
- Weight: 600
- Color: Electric Blue (#007BFF)
- Line Height: 1.4

### Alerts & Messages

**Alert Heading**
- Size: 16px (Body Medium)
- Weight: 600
- Color: White (#FFFFFF)
- Line Height: 1.5

**Alert Message**
- Size: 14px (Body Small)
- Weight: 400
- Color: Light Gray (#E0E0E0)
- Line Height: 1.6

---

## Responsive Typography

### Mobile-First Scaling

Adjust type sizes on smaller screens to maintain readability without overwhelming the viewport:

```
Display 1: 72px (desktop) → 48px (tablet) → 36px (mobile)
Display 2: 60px (desktop) → 40px (tablet) → 32px (mobile)
H1:        48px (desktop) → 36px (tablet) → 28px (mobile)
H2:        40px (desktop) → 32px (tablet) → 24px (mobile)
H3:        32px (desktop) → 24px (tablet) → 20px (mobile)
Body Lg:   18px (desktop) → 16px (tablet) → 16px (mobile)
Body Md:   16px (all)
Body Sm:   14px (all)
```

### Responsive Type Scale in Tailwind

```jsx
// Display heading
<h1 className="text-3xl tablet:text-5xl desktop:text-7xl">
  Responsive Display
</h1>

// Section heading
<h2 className="text-2xl tablet:text-4xl desktop:text-5xl">
  Responsive Section
</h2>

// Body text (same on all sizes)
<p className="text-body-md">
  Standard body text
</p>
```

### Line Height Adjustments

Tighter line height on larger screens, more generous on mobile:

```
Mobile (small viewport, tighter line height):
  Heading: 1.2 line height
  Body: 1.5 line height

Desktop (more space, standard line height):
  Heading: 1.3 line height
  Body: 1.6 line height
```

### Margin & Spacing Adjustments

```
Mobile:
  Paragraph bottom margin: 1rem (16px)
  Heading bottom margin: 1.25rem (20px)

Desktop:
  Paragraph bottom margin: 1.5rem (24px)
  Heading bottom margin: 2rem (32px)
```

---

## Accessibility

### Readability Standards

**WCAG 2.1 Level AA Requirements:**

- ✅ Minimum font size 12px (avoid smaller)
- ✅ Line height minimum 1.5× font size
- ✅ Letter spacing at least 0.12× font size
- ✅ Paragraph width maximum 80 characters (reasonable)
- ✅ Color contrast 4.5:1 for normal text, 3:1 for large text

### Color Contrast for Text

**Pass (WCAG AA):**
- White (#FFFFFF) on Matte Black (#0D1117) = 21:1 ✅
- Light Gray (#E0E0E0) on Midnight Navy (#08131F) = 11.5:1 ✅
- Aqua (#2FE7F2) on Matte Black (#0D1117) = 9.3:1 ✅

**Fail (Below WCAG AA):**
- ❌ Silver (#C5CBD3) on Midnight Navy (#08131F) = 2.9:1
  - **Fix:** Use Light Gray instead or increase size to 18px+

### Screen Reader Optimization

**Semantic Heading Structure:**
```html
<!-- Good -->
<h1>Page Title</h1>        <!-- One H1 per page -->
<h2>Section One</h2>
<h3>Subsection</h3>
<h2>Section Two</h2>       <!-- Back to H2 -->

<!-- Bad -->
<h1>Page Title</h1>
<h3>Subsection</h3>        <!-- Skips H2 -->
<h2>Later Section</h2>     <!-- Out of order -->
```

**Skip Heading Levels:** Never jump heading levels (H1 → H3). Always follow hierarchical order.

### Focus & Interactive Text

**Links:**
- Must be underlined (not just color)
- Color: Aqua (#2FE7F2)
- Underline on hover
- Focus outline 2px Aqua with 2px offset

```html
<a href="#" class="text-accent-primary underline focus-visible:outline-2 focus-visible:outline-offset-2">
  Link text
</a>
```

### Dyslexia-Friendly Recommendations

- Avoid all-caps (harder to read)
- Use sans-serif fonts (Inter is good)
- Generous line spacing (1.5+)
- Left-aligned text (not justified)
- Good color contrast (4.5:1+)

### Motion Preferences

Respect `prefers-reduced-motion` for any text animations:

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Common Patterns

### Page Title with Subtitle

```html
<div class="mb-8">
  <h1 class="text-h1 font-heading font-bold text-white mb-2">
    Main Page Title
  </h1>
  <p class="text-body-lg text-neutral-light-gray">
    Supporting description or subtitle
  </p>
</div>
```

### Section with Multiple Paragraphs

```html
<section class="mb-12">
  <h2 class="text-h2 font-heading font-bold text-white mb-6">
    Section Title
  </h2>
  <p class="text-body-md text-neutral-light-gray mb-4 leading-relaxed">
    First paragraph text goes here...
  </p>
  <p class="text-body-md text-neutral-light-gray mb-4 leading-relaxed">
    Second paragraph text goes here...
  </p>
</section>
```

### Product Card with Hierarchy

```html
<div class="bg-bg-secondary rounded-lg p-6">
  <h3 class="text-h5 font-heading font-semibold text-white mb-2">
    Product Name
  </h3>
  <p class="text-body-sm text-neutral-silver mb-4">
    Brief product description
  </p>
  <div class="flex items-center justify-between">
    <span class="text-body-lg font-semibold text-accent-primary">
      $1,299
    </span>
    <span class="text-label-sm font-semibold text-secondary-primary">
      Condition: Grade A
    </span>
  </div>
</div>
```

### Form with Labels

```html
<form class="space-y-6">
  <div>
    <label for="email" class="text-label-md font-medium text-white block mb-2">
      Email Address
    </label>
    <input
      id="email"
      type="email"
      class="w-full px-4 py-3 bg-bg-primary border border-neutral-titanium text-white rounded-md text-body-sm placeholder-neutral-silver/60 focus-visible:border-accent-primary"
      placeholder="you@example.com"
    />
    <p class="text-body-xs text-neutral-silver mt-2">
      We'll never share your email
    </p>
  </div>
</form>
```

### List with Hierarchy

```html
<ul class="space-y-3">
  <li>
    <strong class="text-white text-body-md">Primary Item</strong>
    <p class="text-body-sm text-neutral-light-gray mt-1">
      Supporting details about this item
    </p>
  </li>
  <li>
    <strong class="text-white text-body-md">Another Item</strong>
    <p class="text-body-sm text-neutral-light-gray mt-1">
      More details here
    </p>
  </li>
</ul>
```

---

## Implementation

### Tailwind CSS Classes

All typography sizes are available as Tailwind classes:

```jsx
// Display
<h1 className="text-display-1">Display Heading</h1>

// Headings
<h2 className="text-h1 font-heading font-bold">Heading 1</h2>
<h3 className="text-h3 font-heading font-semibold">Heading 3</h3>

// Body
<p className="text-body-md">Body Medium</p>
<p className="text-body-sm">Body Small</p>

// Labels
<label className="text-label-md font-medium">Label</label>

// Utilities
<p className="text-white leading-relaxed">
  Text with better line height
</p>
```

### CSS Variables

All typography settings available as CSS variables:

```css
/* Typography */
--font-heading: 'Space Grotesk', 'Sora', sans-serif;
--font-body: 'Inter', sans-serif;

/* Font sizes (via Tailwind) */
--text-display-1: 72px / 1.2 / 700;
--text-h1: 48px / 1.3 / 700;

/* Use in custom CSS */
.custom-heading {
  font-family: var(--font-heading);
  font-size: 48px;
  font-weight: 700;
  line-height: 1.3;
}
```

### Font Loading (Next.js)

```typescript
// In next.config.js or layout
import { Inter, Space_Grotesk, Sora } from 'next/font/google';

const inter = Inter({ subsets: ['latin'], display: 'swap' });
const spaceGrotesk = Space_Grotesk({ 
  subsets: ['latin'], 
  display: 'swap',
  weight: ['600', '700']
});
const sora = Sora({ 
  subsets: ['latin'], 
  display: 'swap',
  weight: ['600', '700']
});

export const metadata = {
  title: 'Premium TechNoir',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable} ${sora.variable}`}>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
```

### CSS Reset & Base Styles

```css
/* Global typography */
body {
  font-family: var(--font-body);
  font-size: 16px;
  line-height: 1.6;
  color: var(--color-white);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Headings */
h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-heading);
  font-weight: 700;
  line-height: 1.3;
  margin-bottom: 1rem;
}

/* Paragraphs */
p {
  margin-bottom: 1rem;
  line-height: 1.6;
}

/* Lists */
ul, ol {
  margin-bottom: 1rem;
  padding-left: 2rem;
}

li {
  margin-bottom: 0.5rem;
}

/* Links */
a {
  color: var(--color-accent-primary);
  text-decoration: underline;
  transition: color 300ms;
}

a:hover {
  color: var(--color-accent-light);
}

/* Code blocks */
code, pre {
  font-family: 'Menlo', 'Courier New', monospace;
  font-size: 0.875em;
  background: var(--color-bg-secondary);
  padding: 0.125em 0.25em;
  border-radius: 4px;
}

/* Quotes */
blockquote {
  border-left: 4px solid var(--color-accent-primary);
  padding-left: 1rem;
  margin-left: 0;
  margin-bottom: 1.5rem;
  font-style: italic;
  color: var(--color-neutral-light-gray);
}
```

### Testing Typography

**Checklist before shipping:**

- [ ] All headings follow hierarchy (H1 → H2 → H3, etc.)
- [ ] Body text legible at smallest breakpoint
- [ ] Line height minimum 1.5× font size
- [ ] Color contrast 4.5:1 for all text
- [ ] No text smaller than 12px (except captions)
- [ ] Links underlined and distinct
- [ ] Focus states visible on all interactive text
- [ ] Responsive sizes tested on mobile/tablet/desktop
- [ ] Screen reader announces headings correctly
- [ ] Font loads without layout shift
- [ ] Performance Lighthouse score > 90

---

## Quick Reference

### Font Families
- **Headings:** Space Grotesk (or Sora)
- **Body:** Inter
- **Code:** Menlo, Courier New, monospace

### Type Scale Quick Reference
```
Display 1: 72px/1.2/700
Display 2: 60px/1.2/700
H1: 48px/1.3/700
H2: 40px/1.3/700
H3: 32px/1.4/600
H4: 24px/1.4/600
H5: 20px/1.5/600
H6: 16px/1.5/600
Body Lg: 18px/1.6/400
Body Md: 16px/1.6/400
Body Sm: 14px/1.5/400
Label: 14px/1.5/500
Caption: 12px/1.4/400
```

### Colors for Text
- **Primary:** White (#FFFFFF)
- **Secondary:** Light Gray (#E0E0E0)
- **Tertiary:** Silver (#C5CBD3)
- **Accent:** Aqua (#2FE7F2)
- **Error:** Red (#EF4444)

### Spacing Defaults
- **Heading → Body:** 1.5× line height gap
- **Paragraph → Paragraph:** 1× line height gap
- **Section → Section:** 2× line height gap

---

## References

- [Google Fonts: Inter](https://fonts.google.com/specimen/Inter)
- [Google Fonts: Space Grotesk](https://fonts.google.com/specimen/Space+Grotesk)
- [WCAG 2.1 Text Readability](https://www.w3.org/WAI/WCAG21/Understanding/visual-presentation.html)
- [WebAIM: Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [Tailwind CSS Typography Plugin](https://tailwindcss.com/docs/typography-plugin)
