/**
 * Premium TechNoir Component Guidelines
 *
 * This file documents the design patterns and component composition rules
 * for building consistent UI components throughout the application.
 */

# Component Patterns & Guidelines

## Button Components

### Primary Button
- **Background:** Aqua (#2FE7F2)
- **Text Color:** Matte Black (#0D1117)
- **Padding:** 12px 24px
- **Border Radius:** 8px
- **Font Weight:** 600 (semi-bold)
- **Transition:** 300ms
- **Hover State:** Dark Aqua (#1FB8C4)
- **Active State:** Electric Blue (#007BFF)
- **Focus:** Outline 2px Aqua with 2px offset
- **Disabled:** 50% opacity

```jsx
<button className="px-6 py-3 bg-accent-primary text-bg-primary font-semibold rounded-md transition-colors duration-300 hover:bg-accent-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-primary disabled:opacity-50">
  Primary Action
</button>
```

### Secondary Button
- **Background:** Midnight Navy (#08131F)
- **Border:** 1px Electric Blue (#007BFF)
- **Text Color:** White (#FFFFFF)
- **Padding:** 12px 24px
- **Border Radius:** 8px
- **Hover State:** Electric Blue background with white text
- **Focus:** Outline 2px Electric Blue

```jsx
<button className="px-6 py-3 bg-bg-secondary border border-secondary-primary text-white font-semibold rounded-md transition-colors duration-300 hover:bg-secondary-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary-primary disabled:opacity-50">
  Secondary Action
</button>
```

### Ghost Button
- **Background:** Transparent
- **Border:** 1px Silver (#C5CBD3)
- **Text Color:** White (#FFFFFF)
- **Padding:** 12px 24px
- **Border Radius:** 8px
- **Hover State:** Silver border, slightly highlighted background

```jsx
<button className="px-6 py-3 border border-neutral-silver text-white font-semibold rounded-md transition-colors duration-300 hover:border-neutral-light-gray hover:bg-bg-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-primary disabled:opacity-50">
  Ghost Action
</button>
```

---

## Card Components

### Product Card
- **Background:** Midnight Navy (#08131F)
- **Border Radius:** 12px
- **Padding:** 16px
- **Box Shadow:** Subtle elevation shadow
- **Border:** Optional 1px Titanium Gray border for definition

```jsx
<div className="bg-bg-secondary rounded-lg p-4 shadow-md border border-neutral-titanium/10">
  {/* Card content */}
</div>
```

### Minimal Card (No Shadow)
- **Background:** Transparent or very subtle background
- **Border:** 1px Titanium Gray (#6C757D)
- **Border Radius:** 8px
- **Padding:** 16px

```jsx
<div className="border border-neutral-titanium rounded-md p-4">
  {/* Card content */}
</div>
```

---

## Form Elements

### Input Field
- **Background:** Matte Black (#0D1117)
- **Border:** 1px Titanium Gray (#6C757D)
- **Border Radius:** 8px
- **Padding:** 12px 16px
- **Text Color:** White (#FFFFFF)
- **Placeholder:** Silver (#C5CBD3) at 60% opacity
- **Focus:** 2px border Aqua (#2FE7F2)
- **Error:** 2px border Error Red (#EF4444)

```jsx
<input
  type="text"
  className="w-full px-4 py-3 bg-bg-primary border border-neutral-titanium text-white placeholder-neutral-silver/60 rounded-md focus-visible:border-accent-primary focus-visible:border-2 transition-colors duration-300"
  placeholder="Enter text..."
/>
```

### Select Field
Similar to input field, with icon indicator on right side

```jsx
<select className="w-full px-4 py-3 bg-bg-primary border border-neutral-titanium text-white rounded-md focus-visible:border-accent-primary focus-visible:border-2 appearance-none cursor-pointer">
  {/* Options */}
</select>
```

### Checkbox
- **Size:** 20px × 20px
- **Border Radius:** 4px
- **Unchecked:** Border 2px Titanium Gray
- **Checked:** Background Aqua, white checkmark
- **Focus:** Outline 2px Aqua offset

```jsx
<input
  type="checkbox"
  className="w-5 h-5 border-2 border-neutral-titanium rounded accent-accent-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-primary cursor-pointer"
/>
```

### Radio Button
- **Size:** 20px × 20px
- **Unchecked:** Border 2px Titanium Gray
- **Checked:** Border 2px Aqua with 6px filled center
- **Focus:** Outline 2px Aqua offset

---

## Typography Hierarchy

### Headings
```jsx
<h1 className="text-h1 font-heading font-bold text-white">Display Heading</h1>
<h2 className="text-h2 font-heading font-bold text-white">Major Section</h2>
<h3 className="text-h3 font-heading font-semibold text-white">Subsection</h3>
<h4 className="text-h4 font-heading font-semibold text-white">Minor Heading</h4>
```

### Body Text
```jsx
<p className="text-body-md font-body text-neutral-light-gray">Regular paragraph text</p>
<p className="text-body-sm font-body text-neutral-silver">Small caption text</p>
<p className="text-label-md font-body font-medium text-white">Label or UI text</p>
```

---

## Color Usage Guidelines

### Backgrounds
- **Primary (`bg-primary`):** Main page background
- **Secondary (`bg-secondary`):** Cards, containers, panels
- **Tertiary (`bg-tertiary`):** Deeper nested elements

### Accent Colors
- **Primary Aqua (`accent-primary`):** CTAs, highlights, interactive focus
- **Light Aqua (`accent-light`):** Hover states on accent elements
- **Dark Aqua (`accent-dark`):** Pressed/active states

### Text Colors
- **White:** Primary text on dark backgrounds
- **Light Gray:** Secondary text, reduced emphasis
- **Silver:** Tertiary text, subtle information
- **Titanium Gray:** Disabled text, borders

### Semantic Colors
- **Success (Green):** Positive messages, confirmations
- **Warning (Amber):** Cautions, warnings
- **Error (Red):** Errors, destructive actions
- **Info (Blue):** Informational messages

---

## Spacing Guidelines

Use the 8px spacing grid for consistency:

```jsx
// Padding
className="p-4"     // 16px
className="p-6"     // 24px
className="p-8"     // 32px

// Margin
className="m-4"     // 16px
className="mb-6"    // 24px bottom
className="mt-8"    // 32px top

// Gap (flexbox/grid)
className="gap-4"   // 16px
className="gap-6"   // 24px
```

---

## Accessibility Guidelines

### Color Contrast
- All text must meet WCAG AA standards (4.5:1 ratio)
- Use `text-white` or `text-neutral-light-gray` on dark backgrounds
- Verify contrast ratios with accessibility checker

### Interactive Elements
- Minimum touch target: 44px × 44px
- All interactive elements must be keyboard accessible
- Focus states must be clearly visible (2px outline)
- Use semantic HTML (`<button>`, `<input>`, `<a>`)

### ARIA Labels
```jsx
<button aria-label="Close dialog">
  <X />
</button>

<div aria-live="polite" aria-atomic="true">
  {message}
</div>
```

### Images
```jsx
<img src="device.jpg" alt="MacBook Pro M3 in silver, condition grade A" />
```

---

## Responsive Design

### Mobile-First Approach
Design for mobile first, then enhance for larger screens

```jsx
// Mobile: 1 column
// Tablet (768px+): 2 columns
// Desktop (1024px+): 3 columns
<div className="grid grid-cols-1 tablet:grid-cols-2 desktop:grid-cols-3 gap-4">
  {/* Grid items */}
</div>
```

### Breakpoint Usage
```jsx
// Mobile: 375px
// Tablet: 768px
// Desktop: 1024px
// Wide: 1440px

<p className="text-body-sm tablet:text-body-md desktop:text-body-lg">
  Responsive text
</p>
```

---

## Animation & Transitions

### Standard Durations
- **Fast:** 150ms (micro-interactions, hover states)
- **Base:** 300ms (standard animations)
- **Slow:** 500ms (modal transitions, page changes)

```jsx
className="transition-colors duration-300 hover:bg-accent-dark"
className="transition-all duration-500 ease-in-out"
```

### Easing Function
Use `cubic-bezier(0.4, 0, 0.2, 1)` (Material Design easing)

---

## Shadows & Depth

### Shadow Scale
- **`shadow-xs`:** Subtle borders between elements
- **`shadow-sm`:** Cards, subtle elevation
- **`shadow-md`:** Prominent cards, dropdown menus
- **`shadow-lg`:** Modals, important overlays
- **`shadow-elevation`:** Maximum depth, floating elements

```jsx
// Card with subtle shadow
<div className="bg-bg-secondary rounded-lg p-6 shadow-md">

// Modal with strong shadow
<div className="fixed inset-0 bg-black/50 shadow-lg z-modal">
```

---

## Disabled States

All interactive elements should have a disabled state:

```jsx
// Disabled button (50% opacity)
<button disabled className="opacity-50 cursor-not-allowed">

// Disabled input field
<input disabled className="opacity-60 cursor-not-allowed">
```

---

## Dark Mode

The entire design system is built for dark mode (no light mode currently).
If light mode is needed in future:
- Invert background and text colors
- Maintain Aqua and Electric Blue as accents
- Ensure contrast ratios are maintained
