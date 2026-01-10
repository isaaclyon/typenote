/**
 * TypeNote Design System - Typography Tokens
 * IBM Plex Sans + Mono with 7-level scale
 */

export const typography = {
  fontFamily: {
    sans: "'IBM Plex Sans', system-ui, -apple-system, sans-serif",
    mono: "'IBM Plex Mono', ui-monospace, 'SF Mono', monospace",
  },

  fontSize: {
    xs: '12px', // Fine print, timestamps
    sm: '13px', // Labels, metadata
    base: '15px', // Body text, editor
    lg: '17px', // Subheadings
    xl: '20px', // Section titles
    '2xl': '24px', // Page titles
    '3xl': '30px', // Hero headings (rare)
  },

  fontWeight: {
    normal: 400, // Body text
    medium: 500, // Labels, emphasis
    semibold: 600, // Headings, buttons
  },

  lineHeight: {
    tight: 1.25, // Headings
    normal: 1.5, // Body text
    relaxed: 1.625, // Long-form reading
  },

  letterSpacing: {
    tight: '-0.025em',
    normal: '0',
    wide: '0.025em',
  },
} as const;

export type Typography = typeof typography;
