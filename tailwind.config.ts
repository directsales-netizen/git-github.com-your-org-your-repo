import type { Config } from 'tailwindcss';
import tailwindcssAnimate from 'tailwindcss-animate';
import { designTokens } from './src/design/tokens';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/design/**/*.{js,ts,jsx,tsx,mdx}',
    './src/lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // Color System
      colors: {
        // Backgrounds
        'bg-primary': designTokens.colors.background.primary,
        'bg-secondary': designTokens.colors.background.secondary,
        'bg-tertiary': designTokens.colors.background.tertiary,

        // Primary Accent - Aqua
        'accent-primary': designTokens.colors.accent.primary,
        'accent-light': designTokens.colors.accent.light,
        'accent-dark': designTokens.colors.accent.dark,

        // Secondary Accent - Electric Blue
        'secondary-primary': designTokens.colors.secondary.primary,
        'secondary-light': designTokens.colors.secondary.light,
        'secondary-dark': designTokens.colors.secondary.dark,

        // Neutral
        'neutral-white': designTokens.colors.neutral.white,
        'neutral-light-gray': designTokens.colors.neutral.lightGray,
        'neutral-silver': designTokens.colors.neutral.silver,
        'neutral-gray': designTokens.colors.neutral.gray,
        'neutral-titanium': designTokens.colors.neutral.titanium,
        'neutral-dark-gray': designTokens.colors.neutral.darkGray,

        // Semantic
        'success': designTokens.colors.semantic.success,
        'warning': designTokens.colors.semantic.warning,
        'error': designTokens.colors.semantic.error,
        'info': designTokens.colors.semantic.info,
      },

      // Font Families
      fontFamily: {
        heading: `var(--font-space-grotesk), ${designTokens.typography.fontFamily.heading}`,
        body: `var(--font-inter), ${designTokens.typography.fontFamily.body}`,
      },

      // Font Sizes
      fontSize: {
        'display-1': [
          designTokens.typography.fontSize.display1.size,
          {
            lineHeight: designTokens.typography.fontSize.display1.lineHeight,
            fontWeight: designTokens.typography.fontSize.display1.weight,
          },
        ],
        'display-2': [
          designTokens.typography.fontSize.display2.size,
          {
            lineHeight: designTokens.typography.fontSize.display2.lineHeight,
            fontWeight: designTokens.typography.fontSize.display2.weight,
          },
        ],
        'h1': [
          designTokens.typography.fontSize.h1.size,
          {
            lineHeight: designTokens.typography.fontSize.h1.lineHeight,
            fontWeight: designTokens.typography.fontSize.h1.weight,
          },
        ],
        'h2': [
          designTokens.typography.fontSize.h2.size,
          {
            lineHeight: designTokens.typography.fontSize.h2.lineHeight,
            fontWeight: designTokens.typography.fontSize.h2.weight,
          },
        ],
        'h3': [
          designTokens.typography.fontSize.h3.size,
          {
            lineHeight: designTokens.typography.fontSize.h3.lineHeight,
            fontWeight: designTokens.typography.fontSize.h3.weight,
          },
        ],
        'h4': [
          designTokens.typography.fontSize.h4.size,
          {
            lineHeight: designTokens.typography.fontSize.h4.lineHeight,
            fontWeight: designTokens.typography.fontSize.h4.weight,
          },
        ],
        'h5': [
          designTokens.typography.fontSize.h5.size,
          {
            lineHeight: designTokens.typography.fontSize.h5.lineHeight,
            fontWeight: designTokens.typography.fontSize.h5.weight,
          },
        ],
        'h6': [
          designTokens.typography.fontSize.h6.size,
          {
            lineHeight: designTokens.typography.fontSize.h6.lineHeight,
            fontWeight: designTokens.typography.fontSize.h6.weight,
          },
        ],
        'body-lg': [
          designTokens.typography.fontSize.bodyLg.size,
          {
            lineHeight: designTokens.typography.fontSize.bodyLg.lineHeight,
            fontWeight: designTokens.typography.fontSize.bodyLg.weight,
          },
        ],
        'body-md': [
          designTokens.typography.fontSize.bodyMd.size,
          {
            lineHeight: designTokens.typography.fontSize.bodyMd.lineHeight,
            fontWeight: designTokens.typography.fontSize.bodyMd.weight,
          },
        ],
        'body-sm': [
          designTokens.typography.fontSize.bodySm.size,
          {
            lineHeight: designTokens.typography.fontSize.bodySm.lineHeight,
            fontWeight: designTokens.typography.fontSize.bodySm.weight,
          },
        ],
        'body-xs': [
          designTokens.typography.fontSize.bodyXs.size,
          {
            lineHeight: designTokens.typography.fontSize.bodyXs.lineHeight,
            fontWeight: designTokens.typography.fontSize.bodyXs.weight,
          },
        ],
        'label-md': [
          designTokens.typography.fontSize.labelMd.size,
          {
            lineHeight: designTokens.typography.fontSize.labelMd.lineHeight,
            fontWeight: designTokens.typography.fontSize.labelMd.weight,
          },
        ],
        'label-sm': [
          designTokens.typography.fontSize.labelSm.size,
          {
            lineHeight: designTokens.typography.fontSize.labelSm.lineHeight,
            fontWeight: designTokens.typography.fontSize.labelSm.weight,
          },
        ],
        'label-xs': [
          designTokens.typography.fontSize.labelXs.size,
          {
            lineHeight: designTokens.typography.fontSize.labelXs.lineHeight,
            fontWeight: designTokens.typography.fontSize.labelXs.weight,
          },
        ],
        'caption': [
          designTokens.typography.fontSize.caption.size,
          {
            lineHeight: designTokens.typography.fontSize.caption.lineHeight,
            fontWeight: designTokens.typography.fontSize.caption.weight,
          },
        ],
      },

      // Spacing
      spacing: designTokens.spacing,

      // Border Radius
      borderRadius: designTokens.borderRadius,

      // Box Shadows
      boxShadow: designTokens.shadow,

      // Transitions
      transitionDuration: {
        fast: designTokens.transition.fast.split(' ')[0],
        base: designTokens.transition.base.split(' ')[0],
        slow: designTokens.transition.slow.split(' ')[0],
      },

      // Z-Index
      zIndex: designTokens.zIndex,

      // Opacity
      opacity: designTokens.opacity,

      // Screens (Breakpoints)
      screens: {
        mobile: designTokens.breakpoints.mobile,
        tablet: designTokens.breakpoints.tablet,
        desktop: designTokens.breakpoints.desktop,
        wide: designTokens.breakpoints.wide,
        ultrawide: designTokens.breakpoints.ultrawide,
      },
    },
  },
  plugins: [tailwindcssAnimate],
};

export default config;
