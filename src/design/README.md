# Premium TechNoir Design System

A comprehensive, production-ready design system for Premium TechNoir. This directory contains all design tokens, utilities, and guidelines for building consistent, accessible, and beautiful user interfaces.

## Directory Structure

```
src/design/
├── tokens.ts              # Design tokens (colors, typography, spacing, etc.)
├── utilities.ts           # Design utility functions and class combinations
├── globals.css            # CSS variables and global styles
├── index.ts              # Main export file
└── README.md             # This file
```

## Quick Start

### 1. Using Design Utilities

Import utilities from the design system:

```typescript
import { buttonVariants, colors, typography, cn } from '@/design';

export function MyButton() {
  return (
    <button className={cn(buttonVariants.primary, 'w-full')}>
      Click me
    </button>
  );
}
```

### 2. Color System

Use color utilities for consistent coloring:

```typescript
// Backgrounds
<div className={colors.bgPrimary}>Primary background</div>
<div className={colors.bgSecondary}>Secondary background</div>

// Accent colors
<button className={colors.accentPrimary}>Primary action</button>

// Text colors
<p className={colors.white}>White text</p>
<p className={colors.silver}>Silver text</p>
```

### 3. Typography

Use typography utilities for consistent text styles:

```typescript
// Display heading
<h1 className={typography.displayLarge}>Display Heading</h1>

// Section heading
<h2 className={typography.headingMedium}>Section Title</h2>

// Body text
<p className={typography.bodyMedium}>Regular paragraph text</p>

// Labels
<label className={typography.label}>Input Label</label>
```

### 4. Button Variants

Pre-built button styles:

```typescript
import { buttonVariants } from '@/design';

// Primary button
<button className={buttonVariants.primary}>Primary Action</button>

// Secondary button
<button className={buttonVariants.secondary}>Secondary Action</button>

// Ghost button
<button className={buttonVariants.ghost}>Ghost Action</button>

// Danger button
<button className={buttonVariants.danger}>Delete</button>
```

### 5. Form Inputs

Pre-built input styles:

```typescript
import { inputVariants } from '@/design';

// Standard input
<input className={inputVariants.base} placeholder="Enter text..." />

// Error state
<input className={inputVariants.error} value="Invalid" />

// Success state
<input className={inputVariants.success} value="Valid" />
```

### 6. Card Variants

Pre-built card styles:

```typescript
import { cardVariants } from '@/design';

// Standard card
<div className={cardVariants.base}>Card content</div>

// Minimal card
<div className={cardVariants.minimal}>Minimal card</div>

// Elevated card
<div className={cardVariants.elevated}>Elevated card</div>
```

### 7. Spacing Utilities

Consistent spacing across components:

```typescript
import { spacing } from '@/design';

// Container padding
<div className={spacing.containerPadding}>Page content</div>

// Section margins
<section className={spacing.sectionMargin}>Section</section>

// Card padding
<div className={spacing.cardPadding}>Card content</div>
```

### 8. Grid System

Responsive grid layouts:

```typescript
import { grid } from '@/design';

// Two column grid
<div className={grid.twoCol}>
  <div>Column 1</div>
  <div>Column 2</div>
</div>

// Three column grid
<div className={grid.threeCol}>
  <div>Column 1</div>
  <div>Column 2</div>
  <div>Column 3</div>
</div>

// Four column grid
<div className={grid.fourCol}>
  {/* 4 items */}
</div>
```

### 9. Flexbox Utilities

Flex layout helpers:

```typescript
import { flex } from '@/design';

// Space between
<div className={flex.between}>
  <span>Left</span>
  <span>Right</span>
</div>

// Center
<div className={flex.center}>
  <Icon />
  <span>Centered content</span>
</div>
```

### 10. Responsive Design

Mobile-first responsive utilities:

```typescript
// Responsive text size
<p className={responsiveText.headingMedium}>
  Small on mobile, large on desktop
</p>

// Responsive grid
<div className="grid grid-cols-1 tablet:grid-cols-2 desktop:grid-cols-3 gap-4">
  {/* Items */}
</div>

// Responsive padding
<div className="px-4 tablet:px-6 desktop:px-8">
  Responsive container
</div>
```

## Design Tokens

All design tokens are defined in `tokens.ts` and include:

- **Colors:** Backgrounds, accents, neutrals, semantic
- **Typography:** Font families, sizes, weights
- **Spacing:** 8px grid system
- **Border Radius:** Rounded corners
- **Shadows:** Depth and elevation
- **Transitions:** Animation durations
- **Z-Index:** Layering scale
- **Opacity:** Transparency values
- **Breakpoints:** Responsive breakpoints

Access tokens directly:

```typescript
import { designTokens } from '@/design';

const primaryColor = designTokens.colors.accent.primary; // #2FE7F2
const bodyFont = designTokens.typography.fontFamily.body; // "Inter"
const spacing = designTokens.spacing['4']; // "16px"
```

## Tailwind CSS Integration

All design tokens are automatically integrated into Tailwind CSS via `tailwind.config.ts`.

Use Tailwind classes directly:

```jsx
// Color classes
<div className="bg-accent-primary text-bg-primary">Content</div>
<button className="bg-secondary-primary hover:bg-secondary-light">Button</button>

// Size classes
<h1 className="text-h1 font-heading font-bold">Heading</h1>
<p className="text-body-md font-body">Paragraph</p>

// Spacing classes
<div className="p-6 mb-8 gap-4">Content</div>

// Shadow classes
<div className="shadow-md rounded-lg">Card</div>

// Responsive classes
<div className="grid grid-cols-1 tablet:grid-cols-2 desktop:grid-cols-3">
  {/* Responsive grid */}
</div>
```

## CSS Variables

Global CSS variables are defined in `globals.css` and can be used in custom CSS:

```css
.custom-element {
  background-color: var(--color-bg-primary);
  color: var(--color-white);
  padding: var(--space-4);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-md);
  transition: var(--transition-base);
}
```

## Accessibility

The design system includes accessibility features:

- **WCAG AA Compliance:** Minimum 4.5:1 contrast ratio for text
- **Focus Indicators:** 2px Aqua outline with 2px offset
- **Semantic HTML:** Proper heading hierarchy, form labels
- **Keyboard Navigation:** All interactive elements keyboard accessible
- **Screen Reader Support:** ARIA labels and semantic elements
- **Motion Preferences:** Respects `prefers-reduced-motion` setting

Use accessibility utilities:

```typescript
import { accessibility } from '@/design';

// Screen reader only text
<span className={accessibility.srOnly}>Additional context</span>

// Focus ring
<button className={accessibility.focusRing}>Button</button>
```

## Breakpoints

Mobile-first responsive breakpoints:

```
mobile:   375px (small phones)
tablet:   768px (tablets)
desktop:  1024px (desktops)
wide:     1440px (wide screens)
ultrawide: 1920px (ultra-wide screens)
```

Use in Tailwind classes:

```jsx
<div className="text-body-sm tablet:text-body-md desktop:text-body-lg">
  Responsive text
</div>
```

## Color Palette

### Primary Colors
- **Aqua (#2FE7F2):** Primary accent, CTAs, focus states
- **Electric Blue (#007BFF):** Secondary actions, borders

### Background Colors
- **Matte Black (#0D1117):** Primary background
- **Midnight Navy (#08131F):** Secondary containers
- **Darker Navy (#1A1F2E):** Nested elements

### Neutral Colors
- **White (#FFFFFF):** Primary text
- **Light Gray (#E0E0E0):** Secondary text
- **Silver (#C5CBD3):** Tertiary text, borders
- **Titanium Gray (#6C757D):** Borders, disabled states

### Semantic Colors
- **Success (Green: #10B981):** Confirmations
- **Warning (Amber: #F59E0B):** Cautions
- **Error (Red: #EF4444):** Errors, destructive
- **Info (Blue: #3B82F6):** Information

## Typography

### Font Families
- **Headings:** Space Grotesk, Sora
- **Body:** Inter

### Sizes
- Display: 72px, 60px
- Headings: 48px → 16px
- Body: 18px → 12px
- Labels: 14px, 12px, 11px

## Common Patterns

### Product Card

```typescript
import { cardVariants, flex, typography } from '@/design';

export function ProductCard({ product }) {
  return (
    <div className={cardVariants.base}>
      <img src={product.image} alt={product.name} />
      <h3 className={typography.headingSmall}>{product.name}</h3>
      <p className={typography.bodySmall}>{product.price}</p>
    </div>
  );
}
```

### Form Group

```typescript
import { inputVariants, typography, accessibility } from '@/design';

export function FormGroup({ label, error }) {
  return (
    <div className="mb-6">
      <label className={typography.label}>{label}</label>
      <input
        className={error ? inputVariants.error : inputVariants.base}
        aria-label={label}
      />
      {error && <p className="text-error text-sm mt-2">{error}</p>}
    </div>
  );
}
```

### Modal

```typescript
import { cardVariants, shadows } from '@/design';

export function Modal({ isOpen, children }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-modal">
      <div className={`${cardVariants.elevated} max-w-md w-full mx-4`}>
        {children}
      </div>
    </div>
  );
}
```

## Best Practices

1. **Use Utility Exports:** Import from `@/design` instead of individual files
2. **Combine Classes:** Use `cn()` utility to conditionally combine classes
3. **Maintain Hierarchy:** Use typography utilities for consistent heading hierarchy
4. **Responsive First:** Always design mobile-first, enhance for larger screens
5. **Accessibility:** Always include alt text, labels, and focus indicators
6. **Contrast:** Verify color contrast with WCAG AA standards
7. **Consistency:** Use design tokens, never hardcode values
8. **Performance:** Use Tailwind's purge to remove unused styles

## Contributing

When adding new design tokens or utilities:

1. Update `src/design/tokens.ts` with new tokens
2. Add corresponding Tailwind config in `tailwind.config.ts`
3. Update CSS variables in `src/design/globals.css`
4. Add utilities to `src/design/utilities.ts` if needed
5. Export from `src/design/index.ts`
6. Document usage in this README

## References

- **Design System Details:** See [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md)
- **Component Guidelines:** See [COMPONENT_GUIDELINES.md](./COMPONENT_GUIDELINES.md)
- **Visual Brand:** See [VISUAL_BRAND_GUIDELINES.md](./VISUAL_BRAND_GUIDELINES.md)
- **Main Guidelines:** See [CLAUDE.md](./CLAUDE.md) Part 3

## Support

For questions about the design system:
- Check the documentation files above
- Review the design tokens in `src/design/tokens.ts`
- Look at component examples in the project
- Refer to Tailwind CSS documentation: https://tailwindcss.com
