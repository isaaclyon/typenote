/**
 * Option color palette for multiselect pills and tags.
 * 12 colors: 6 base colors × 2 variants (light/regular)
 */

export const OPTION_COLORS = {
  blue: {
    light: 'bg-blue-50 text-blue-700',
    regular: 'bg-blue-100 text-blue-800',
  },
  green: {
    light: 'bg-green-50 text-green-700',
    regular: 'bg-green-100 text-green-800',
  },
  amber: {
    light: 'bg-amber-50 text-amber-700',
    regular: 'bg-amber-100 text-amber-800',
  },
  red: {
    light: 'bg-red-50 text-red-700',
    regular: 'bg-red-100 text-red-800',
  },
  purple: {
    light: 'bg-violet-50 text-violet-700',
    regular: 'bg-violet-100 text-violet-800',
  },
  gray: {
    light: 'bg-gray-100 text-gray-600',
    regular: 'bg-gray-200 text-gray-700',
  },
} as const;

/**
 * Swatch background colors for the color picker.
 * These must be defined statically for Tailwind to generate the CSS.
 * Each swatch uses the pill's text color as a solid background.
 */
export const SWATCH_COLORS = {
  blue: {
    light: 'bg-blue-700',
    regular: 'bg-blue-800',
  },
  green: {
    light: 'bg-green-700',
    regular: 'bg-green-800',
  },
  amber: {
    light: 'bg-amber-700',
    regular: 'bg-amber-800',
  },
  red: {
    light: 'bg-red-700',
    regular: 'bg-red-800',
  },
  purple: {
    light: 'bg-violet-700',
    regular: 'bg-violet-800',
  },
  gray: {
    light: 'bg-gray-600',
    regular: 'bg-gray-700',
  },
} as const;

export type OptionColor = keyof typeof OPTION_COLORS;
export type OptionColorVariant = 'light' | 'regular';

export const OPTION_COLOR_NAMES: OptionColor[] = [
  'blue',
  'green',
  'amber',
  'red',
  'purple',
  'gray',
];

/**
 * Get Tailwind classes for an option color.
 * @param color - The color name (defaults to 'gray')
 * @param variant - 'light' or 'regular' (defaults to 'light')
 */
export function getOptionColorClasses(
  color: OptionColor = 'gray',
  variant: OptionColorVariant = 'light'
): string {
  return OPTION_COLORS[color][variant];
}

/**
 * Get swatch background class for the color picker.
 * Uses statically-defined classes so Tailwind can generate the CSS.
 *
 * e.g., pill with 'text-blue-700' → swatch with 'bg-blue-700'
 */
export function getSwatchColorClass(
  color: OptionColor = 'gray',
  variant: OptionColorVariant = 'light'
): string {
  return SWATCH_COLORS[color][variant];
}
