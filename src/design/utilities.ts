/**
 * Premium TechNoir Design Utilities
 *
 * Helper functions and utilities for consistent styling and component creation
 */

// Color utilities
export const colors = {
  // Backgrounds
  bgPrimary: 'bg-bg-primary',
  bgSecondary: 'bg-bg-secondary',
  bgTertiary: 'bg-bg-tertiary',

  // Accent
  accentPrimary: 'bg-accent-primary',
  accentLight: 'bg-accent-light',
  accentDark: 'bg-accent-dark',

  // Secondary
  secondaryPrimary: 'bg-secondary-primary',
  secondaryLight: 'bg-secondary-light',
  secondaryDark: 'bg-secondary-dark',

  // Neutral
  white: 'text-neutral-white',
  lightGray: 'text-neutral-light-gray',
  silver: 'text-neutral-silver',
  gray: 'text-neutral-gray',
  titanium: 'text-neutral-titanium',
  darkGray: 'text-neutral-dark-gray',

  // Semantic
  success: 'text-success',
  warning: 'text-warning',
  error: 'text-error',
  info: 'text-info',
};

// Typography utilities
export const typography = {
  displayLarge: 'text-display-1 font-heading font-bold',
  displayMedium: 'text-display-2 font-heading font-bold',
  headingLarge: 'text-h1 font-heading font-bold',
  headingMedium: 'text-h2 font-heading font-bold',
  headingSmall: 'text-h3 font-heading font-semibold',
  bodyLarge: 'text-body-lg font-body',
  bodyMedium: 'text-body-md font-body',
  bodySmall: 'text-body-sm font-body',
  label: 'text-label-md font-body font-medium',
  caption: 'text-caption font-body',
};

// Spacing utilities
export const spacing = {
  containerPadding: 'px-6 tablet:px-8 desktop:px-12',
  sectionMargin: 'my-20 tablet:my-24 desktop:my-32',
  cardPadding: 'p-4 tablet:p-6',
  buttonPadding: 'px-6 py-3',
  inputPadding: 'px-4 py-3',
};

// Border radius utilities
export const radius = {
  none: 'rounded-none',
  small: 'rounded-sm',
  medium: 'rounded-md',
  large: 'rounded-lg',
  extraLarge: 'rounded-xl',
  full: 'rounded-full',
};

// Shadow utilities
export const shadows = {
  none: 'shadow-none',
  subtle: 'shadow-xs',
  small: 'shadow-sm',
  medium: 'shadow-md',
  large: 'shadow-lg',
  extraLarge: 'shadow-xl',
  elevation: 'shadow-elevation',
};

// Transition utilities
export const transitions = {
  fast: 'transition-all duration-150',
  base: 'transition-all duration-300',
  slow: 'transition-all duration-500',
  colors: 'transition-colors duration-300',
  opacity: 'transition-opacity duration-300',
};

// Button variants
export const buttonVariants = {
  primary: `${colors.accentPrimary} text-bg-primary font-semibold rounded-md transition-colors duration-300 hover:bg-accent-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-primary disabled:opacity-50 disabled:cursor-not-allowed`,

  secondary: `border border-secondary-primary text-neutral-white font-semibold rounded-md transition-colors duration-300 hover:bg-secondary-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary-primary disabled:opacity-50 disabled:cursor-not-allowed`,

  ghost: `border border-neutral-silver text-neutral-white font-semibold rounded-md transition-colors duration-300 hover:border-neutral-light-gray hover:bg-bg-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-primary disabled:opacity-50 disabled:cursor-not-allowed`,

  danger: `${colors.error} bg-error/10 font-semibold rounded-md transition-colors duration-300 hover:bg-error/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-error disabled:opacity-50 disabled:cursor-not-allowed`,
};

// Form input variants
export const inputVariants = {
  base: `w-full px-4 py-3 bg-bg-primary border border-neutral-titanium text-neutral-white placeholder-neutral-silver/60 rounded-md transition-colors duration-300 focus-visible:border-accent-primary focus-visible:border-2 focus-visible:outline-none disabled:opacity-60 disabled:cursor-not-allowed`,

  error: `w-full px-4 py-3 bg-bg-primary border-2 border-error text-neutral-white placeholder-neutral-silver/60 rounded-md transition-colors duration-300 focus-visible:border-error focus-visible:outline-none disabled:opacity-60 disabled:cursor-not-allowed`,

  success: `w-full px-4 py-3 bg-bg-primary border-2 border-success text-neutral-white placeholder-neutral-silver/60 rounded-md transition-colors duration-300 focus-visible:border-success focus-visible:outline-none disabled:opacity-60 disabled:cursor-not-allowed`,
};

// Card variants
export const cardVariants = {
  base: `bg-bg-secondary rounded-lg p-6 shadow-md border border-neutral-titanium/10`,
  minimal: `border border-neutral-titanium rounded-md p-4`,
  elevated: `bg-bg-secondary rounded-lg p-6 shadow-lg`,
};

// Grid utilities
export const grid = {
  container: 'grid gap-4 tablet:gap-6 desktop:gap-8',
  twoCol: 'grid grid-cols-1 tablet:grid-cols-2 gap-4 tablet:gap-6',
  threeCol: 'grid grid-cols-1 tablet:grid-cols-2 desktop:grid-cols-3 gap-4 tablet:gap-6',
  fourCol: 'grid grid-cols-1 tablet:grid-cols-2 desktop:grid-cols-4 gap-4 tablet:gap-6',
};

// Flexbox utilities
export const flex = {
  between: 'flex items-center justify-between',
  center: 'flex items-center justify-center',
  start: 'flex items-start justify-start',
  end: 'flex items-end justify-end',
};

// Accessibility utilities
export const accessibility = {
  srOnly: 'sr-only', // Tailwind's built-in screen reader only class
  focusRing: 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-primary',
  focusRingSecondary: 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary-primary',
};

// Responsive text sizes
export const responsiveText = {
  displayLarge: 'text-display-2 tablet:text-h1 desktop:text-display-1',
  headingLarge: 'text-h2 tablet:text-h1 desktop:text-display-1',
  headingMedium: 'text-h3 tablet:text-h2 desktop:text-h1',
  bodyLarge: 'text-body-md tablet:text-body-lg desktop:text-body-lg',
};

// Animation utilities
export const animation = {
  slideIn: 'animate-in fade-in slide-in-from-bottom-4 duration-300',
  fadeIn: 'animate-in fade-in duration-300',
  scaleIn: 'animate-in fade-in zoom-in-95 duration-300',
};

/**
 * Utility function to merge class names conditionally
 * Useful for combining design utility exports
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * Utility function for creating responsive padding
 */
export function responsivePadding(
  mobile: string,
  tablet?: string,
  desktop?: string
): string {
  return cn(
    `p-${mobile}`,
    tablet && `tablet:p-${tablet}`,
    desktop && `desktop:p-${desktop}`
  );
}

/**
 * Utility function for creating responsive margins
 */
export function responsiveMargin(
  mobile: string,
  tablet?: string,
  desktop?: string
): string {
  return cn(
    `m-${mobile}`,
    tablet && `tablet:m-${tablet}`,
    desktop && `desktop:m-${desktop}`
  );
}

// Type definitions for design system
export type ButtonVariant = keyof typeof buttonVariants;
export type InputVariant = keyof typeof inputVariants;
export type CardVariant = keyof typeof cardVariants;
