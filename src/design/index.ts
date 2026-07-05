/**
 * Premium TechNoir Design System - Main Export
 *
 * Central export point for all design system utilities, tokens, and constants
 * Import from this file instead of individual design files
 */

// Design Tokens
export { designTokens } from './tokens';
export type { DesignTokens } from './tokens';

// Design Utilities
export {
  colors,
  typography,
  spacing,
  radius,
  shadows,
  transitions,
  buttonVariants,
  inputVariants,
  cardVariants,
  grid,
  flex,
  accessibility,
  responsiveText,
  animation,
  cn,
  responsivePadding,
  responsiveMargin,
} from './utilities';

export type { ButtonVariant, InputVariant, CardVariant } from './utilities';

/**
 * Usage Examples:
 *
 * import { buttonVariants, colors, cn } from '@/design'
 *
 * // In a React component
 * <button className={cn(buttonVariants.primary, 'w-full')}>
 *   Click me
 * </button>
 *
 * // Using color utilities
 * <div className={colors.bgSecondary}>
 *   {content}
 * </div>
 *
 * // Using typography
 * import { typography } from '@/design'
 * <h1 className={typography.headingLarge}>{title}</h1>
 */
