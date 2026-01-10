/**
 * TypeNote Design System - Color Tokens
 * Warm neutrals (stone-based) + cornflower blue accent
 */

export const colors = {
  // White
  white: '#ffffff',

  // Warm Grayscale (stone-based, 11 tokens)
  gray: {
    50: '#fafaf9', // Subtle backgrounds, hover states
    100: '#f5f5f4', // Sidebars, secondary surfaces
    200: '#e7e5e4', // DEFAULT BORDERS
    300: '#d6d3d1', // Hover borders, stronger emphasis
    400: '#a8a29e', // Placeholder text
    500: '#78716c', // Muted/secondary text
    600: '#57534e', // Body text
    700: '#44403c', // PRIMARY TEXT
    800: '#292524', // Headlines
    900: '#1c1917', // Near-black emphasis
  },

  // Cornflower Blue Accent (8 tokens)
  accent: {
    50: '#f0f4ff', // Hover backgrounds
    100: '#dbe4ff', // Selection, highlights
    200: '#bac8ff', // Light accent
    300: '#91a7ff', // Secondary accent
    400: '#748ffc', // Hover states
    500: '#6495ED', // PRIMARY brand color
    600: '#5076d4', // Pressed states
    700: '#3d5fc2', // Dark accent
  },

  // Semantic Colors (4 tokens)
  error: '#e57373',
  success: '#81c784',
  warning: '#ffb74d',
  info: '#6495ED',
} as const;

export type Colors = typeof colors;
export type GrayScale = keyof typeof colors.gray;
export type AccentScale = keyof typeof colors.accent;
