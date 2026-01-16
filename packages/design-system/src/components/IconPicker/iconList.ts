import * as LucideIcons from 'lucide-react';

/**
 * Exports from lucide-react that are NOT icons (internal components, types, etc.)
 */
const NON_ICON_EXPORTS = new Set([
  'createLucideIcon',
  'Icon',
  'icons',
  'default',
  'createElement',
  'Fragment',
  'lazy',
  'memo',
  'Suspense',
]);

/**
 * Get all available Lucide icon names.
 * Filters out non-icon exports and sorts alphabetically.
 */
export function getAllIconNames(): string[] {
  return Object.keys(LucideIcons)
    .filter((name) => !NON_ICON_EXPORTS.has(name))
    .sort((a, b) => a.localeCompare(b));
}

/**
 * Get a Lucide icon component by name.
 * Returns null if the icon doesn't exist.
 */
export function getIconByName(name: string): React.ComponentType<LucideIcons.LucideProps> | null {
  const icons = LucideIcons as Record<string, unknown>;
  const IconComponent = icons[name];

  if (typeof IconComponent === 'function') {
    return IconComponent as React.ComponentType<LucideIcons.LucideProps>;
  }

  return null;
}

/**
 * Search icons by name (case-insensitive).
 */
export function searchIcons(query: string): string[] {
  if (!query) {
    return getAllIconNames();
  }

  const lowerQuery = query.toLowerCase();
  return getAllIconNames().filter((name) => name.toLowerCase().includes(lowerQuery));
}
