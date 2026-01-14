/**
 * Demo/story data color palette.
 * Used for consistent mock data across Ladle stories.
 */

export const DEMO_TYPE_COLORS = {
  // Primary types (sidebar, type icons)
  notes: '#6495ED', // Cornflower blue (accent)
  tasks: '#81c784', // Success green
  events: '#ffb74d', // Warning amber
  people: '#8B5CF6', // Violet
  places: '#F59E0B', // Amber
  projects: '#e57373', // Light red
  resources: '#91a7ff', // Light blue

  // Status colors
  active: '#22C55E', // Green
  inactive: '#6B7280', // Gray
  urgent: '#EF4444', // Red
  pending: '#3B82F6', // Blue
  lowPriority: '#94A3B8', // Slate

  // Semantic colors
  success: '#10B981', // Emerald (checkmarks, completed)
  ideas: '#EC4899', // Pink (lightbulb, creative)
  dailyNote: '#F59E0B', // Amber (calendar)
  page: '#6B7280', // Gray (generic document)

  // Tags
  frontend: '#3B82F6',
  backend: '#22C55E',
  design: '#8B5CF6',
  bug: '#EF4444',
  feature: '#F59E0B',
  docs: '#6B7280',
} as const;

export type DemoTypeColor = keyof typeof DEMO_TYPE_COLORS;
