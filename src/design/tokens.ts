/**
 * Premium TechNoir Design Tokens
 * Central source of truth for all design decisions
 * Used by Tailwind CSS, components, and documentation
 */

export const designTokens = {
  // Color System
  colors: {
    // Backgrounds
    background: {
      primary: '#0D1117', // Matte Black
      secondary: '#08131F', // Midnight Navy
      tertiary: '#1A1F2E', // Darker Navy
    },
    // Primary Accent - Used for CTAs, highlights, interactive elements
    accent: {
      primary: '#2FE7F2', // Aqua (main brand color)
      light: '#5EEFF8',
      dark: '#1FB8C4',
    },
    // Secondary Accent - Used for secondary actions, borders
    secondary: {
      primary: '#007BFF', // Electric Blue
      light: '#3391FF',
      dark: '#0056CC',
    },
    // Neutral Colors
    neutral: {
      white: '#FFFFFF',
      lightGray: '#E0E0E0',
      silver: '#C5CBD3',
      gray: '#A3A3A3',
      titanium: '#6C757D',
      darkGray: '#3D3D3D',
    },
    // Semantic Colors
    semantic: {
      success: '#10B981', // Green
      warning: '#F59E0B', // Amber
      error: '#EF4444', // Red
      info: '#3B82F6', // Blue
    },
  },

  // Typography
  typography: {
    fontFamily: {
      heading: '"Space Grotesk", "Sora", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      body: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    },
    fontSize: {
      // Display
      display1: { size: '72px', lineHeight: '1.2', weight: 700 }, // 72px, bold
      display2: { size: '60px', lineHeight: '1.2', weight: 700 }, // 60px, bold

      // Heading
      h1: { size: '48px', lineHeight: '1.3', weight: 700 }, // 48px, bold
      h2: { size: '40px', lineHeight: '1.3', weight: 700 }, // 40px, bold
      h3: { size: '32px', lineHeight: '1.4', weight: 600 }, // 32px, semi-bold
      h4: { size: '24px', lineHeight: '1.4', weight: 600 }, // 24px, semi-bold
      h5: { size: '20px', lineHeight: '1.5', weight: 600 }, // 20px, semi-bold
      h6: { size: '16px', lineHeight: '1.5', weight: 600 }, // 16px, semi-bold

      // Body
      bodyLg: { size: '18px', lineHeight: '1.6', weight: 400 }, // 18px, regular
      bodyMd: { size: '16px', lineHeight: '1.6', weight: 400 }, // 16px, regular
      bodySm: { size: '14px', lineHeight: '1.5', weight: 400 }, // 14px, regular
      bodyXs: { size: '12px', lineHeight: '1.5', weight: 400 }, // 12px, regular

      // Label/UI
      labelMd: { size: '14px', lineHeight: '1.5', weight: 500 }, // 14px, medium
      labelSm: { size: '12px', lineHeight: '1.5', weight: 500 }, // 12px, medium
      labelXs: { size: '11px', lineHeight: '1.4', weight: 600 }, // 11px, semi-bold

      // Caption
      caption: { size: '12px', lineHeight: '1.4', weight: 400 }, // 12px, regular
    },
  },

  // Spacing System (8px grid)
  spacing: {
    0: '0px',
    1: '4px',
    2: '8px',
    3: '12px',
    4: '16px',
    5: '20px',
    6: '24px',
    7: '28px',
    8: '32px',
    9: '36px',
    10: '40px',
    12: '48px',
    14: '56px',
    16: '64px',
    20: '80px',
    24: '96px',
    28: '112px',
    32: '128px',
    36: '144px',
    40: '160px',
    44: '176px',
    48: '192px',
    52: '208px',
    56: '224px',
    60: '240px',
    64: '256px',
  },

  // Border Radius
  borderRadius: {
    none: '0px',
    xs: '4px',
    sm: '6px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    full: '9999px',
  },

  // Shadows
  shadow: {
    none: 'none',
    xs: '0px 1px 2px rgba(0, 0, 0, 0.05)',
    sm: '0px 1px 3px rgba(0, 0, 0, 0.1), 0px 1px 2px rgba(0, 0, 0, 0.06)',
    md: '0px 4px 6px rgba(0, 0, 0, 0.1), 0px 2px 4px rgba(0, 0, 0, 0.06)',
    lg: '0px 10px 15px rgba(0, 0, 0, 0.1), 0px 4px 6px rgba(0, 0, 0, 0.05)',
    xl: '0px 20px 25px rgba(0, 0, 0, 0.1), 0px 10px 10px rgba(0, 0, 0, 0.04)',
    elevation: '0px 8px 24px rgba(0, 0, 0, 0.15)',
  },

  // Transitions
  transition: {
    fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
    base: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
    slow: '500ms cubic-bezier(0.4, 0, 0.2, 1)',
  },

  // Z-Index Scale
  zIndex: {
    hide: '-1',
    base: '0',
    dropdown: '1000',
    sticky: '1020',
    fixed: '1030',
    backdrop: '1040',
    modal: '1050',
    popover: '1060',
    tooltip: '1070',
  },

  // Breakpoints (Mobile-first)
  breakpoints: {
    mobile: '375px', // Small phones
    tablet: '768px', // Tablets
    desktop: '1024px', // Desktops
    wide: '1440px', // Wide screens
    ultrawide: '1920px', // Ultra-wide screens
  },

  // Opacity Scale
  opacity: {
    0: '0%',
    5: '5%',
    10: '10%',
    20: '20%',
    30: '30%',
    40: '40%',
    50: '50%',
    60: '60%',
    70: '70%',
    80: '80%',
    90: '90%',
    95: '95%',
    100: '100%',
  },
} as const;

export type DesignTokens = typeof designTokens;
