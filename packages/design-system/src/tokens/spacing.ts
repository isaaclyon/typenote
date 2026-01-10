/**
 * TypeNote Design System - Spacing Tokens
 * 4px base grid system
 */

export const spacing = {
  0: '0',
  1: '4px', // Micro gaps, icon spacing
  2: '8px', // Small spacing
  3: '12px', // Medium spacing
  4: '16px', // Standard padding
  5: '20px', // Comfortable gaps
  6: '24px', // Section spacing
  8: '32px', // Major separation
  10: '40px', // Large gaps
  12: '48px', // Page-level spacing
} as const;

export const borderRadius = {
  sm: '4px', // Default
  md: '6px', // Large elements
  lg: '8px', // Cards, modals
  full: '9999px', // Pills, circles
} as const;

export type Spacing = typeof spacing;
export type BorderRadius = typeof borderRadius;
