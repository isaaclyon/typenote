/**
 * Demo/story data color palette.
 * Used for consistent mock data across Ladle stories.
 */

export const DEMO_TYPE_COLORS = {
  // Primary types
  notes: '#6495ED', // Cornflower blue (accent)
  tasks: '#81c784', // Success green
  events: '#ffb74d', // Warning amber
  people: '#8B5CF6', // Violet
  places: '#F59E0B', // Amber

  // Status colors
  active: '#22C55E', // Green
  inactive: '#6B7280', // Gray
  urgent: '#EF4444', // Red
  pending: '#3B82F6', // Blue

  // Tags
  frontend: '#3B82F6',
  backend: '#22C55E',
  design: '#8B5CF6',
  bug: '#EF4444',
  feature: '#F59E0B',
  docs: '#6B7280',
} as const;

export type DemoTypeColor = keyof typeof DEMO_TYPE_COLORS;
