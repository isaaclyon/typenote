/**
 * Type Metadata Configuration
 *
 * Single source of truth for built-in object type icons and default colors.
 * Used across sidebar, command palette, and other UI components.
 */

import { FileText, CalendarDays, CheckSquare, User, MapPin, type LucideIcon } from 'lucide-react';

export interface TypeMetadata {
  icon: LucideIcon;
  defaultColor?: string; // Hex color (overridden by DB if set)
}

/**
 * Built-in type metadata
 *
 * Icons: Lucide components for compile-time safety
 * Colors: Default hex colors (DB values take precedence)
 */
export const TYPE_METADATA: Record<string, TypeMetadata> = {
  Page: { icon: FileText, defaultColor: '#6B7280' }, // Gray-500 (matches backend)
  DailyNote: { icon: CalendarDays, defaultColor: '#F59E0B' }, // Amber-500 (matches backend)
  Task: { icon: CheckSquare, defaultColor: '#EF4444' }, // Red-500 (matches backend)
  Person: { icon: User, defaultColor: '#3B82F6' }, // Blue-500 (matches backend)
  Event: { icon: CalendarDays, defaultColor: '#8B5CF6' }, // Purple-500 (matches backend)
  Place: { icon: MapPin, defaultColor: '#10B981' }, // Green-500 (matches backend)
};

/**
 * Get icon component for a type key
 * Falls back to FileText for unknown types
 */
export function getIconForType(typeKey: string): LucideIcon {
  return TYPE_METADATA[typeKey]?.icon ?? FileText;
}

/**
 * Get color for a type key
 * Prefers DB color over default color
 */
export function getColorForType(typeKey: string, dbColor?: string | null): string | undefined {
  // DB color overrides default
  return dbColor ?? TYPE_METADATA[typeKey]?.defaultColor;
}
