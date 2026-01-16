/**
 * Default color swatches for object types.
 * Based on TypeNote's design system palette.
 */
export const DEFAULT_TYPE_COLORS = [
  '#6495ED', // Cornflower Blue (accent)
  '#6B7280', // Gray-500
  '#F59E0B', // Amber-500
  '#EF4444', // Red-500
  '#3B82F6', // Blue-500
  '#8B5CF6', // Purple-500
  '#10B981', // Green-500
  '#F97316', // Orange-500
  '#EC4899', // Pink-500
  '#06B6D4', // Cyan-500
  '#84CC16', // Lime-500
  '#FBBF24', // Yellow-400
] as const;

/**
 * Validates a hex color string (#RRGGBB format).
 */
export function isValidHexColor(color: string): boolean {
  return /^#[0-9A-Fa-f]{6}$/.test(color);
}

/**
 * Normalizes a hex color to uppercase #RRGGBB format.
 */
export function normalizeHexColor(color: string): string {
  return color.toUpperCase();
}
