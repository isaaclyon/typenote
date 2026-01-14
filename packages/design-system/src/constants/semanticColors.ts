/**
 * Semantic color constants for components that need hex values.
 * Used by Toast, Badge, and other components that require inline styles.
 */

export const SEMANTIC_COLORS = {
  success: '#81c784',
  successDark: '#2e7d32',
  warning: '#ffb74d',
  warningDark: '#e65100',
  error: '#e57373',
  errorDark: '#d32f2f',
  info: '#6495ED',
  infoDark: '#3d5fc2',
} as const;

export type SemanticColor = keyof typeof SEMANTIC_COLORS;
