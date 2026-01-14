import { DEMO_TYPE_COLORS } from '../../../constants/demoColors.js';

/**
 * Represents a tag that can be applied to notes/content.
 */
export interface MockTag {
  /** Unique identifier for the tag */
  id: string;
  /** The tag value (without the # prefix) */
  value: string;
  /** Optional color for visual distinction (hex format) */
  color?: string;
}

/**
 * Mock tags for tag autocomplete in the InteractiveEditor.
 * These appear when typing "#" to insert tags.
 */
export const mockTags: MockTag[] = [
  // Status tags
  { id: '1', value: 'in-progress', color: DEMO_TYPE_COLORS.pending },
  { id: '2', value: 'done', color: DEMO_TYPE_COLORS.active },
  { id: '3', value: 'blocked', color: DEMO_TYPE_COLORS.bug },
  { id: '4', value: 'on-hold', color: DEMO_TYPE_COLORS.inactive },
  { id: '5', value: 'review', color: DEMO_TYPE_COLORS.design },

  // Priority tags
  { id: '6', value: 'high-priority', color: DEMO_TYPE_COLORS.feature },
  { id: '7', value: 'low-priority', color: DEMO_TYPE_COLORS.lowPriority },
  { id: '8', value: 'urgent', color: DEMO_TYPE_COLORS.urgent },

  // Topic/category tags
  { id: '9', value: 'frontend' },
  { id: '10', value: 'backend' },
  { id: '11', value: 'design' },
  { id: '12', value: 'infrastructure' },
  { id: '13', value: 'documentation' },

  // Context tags
  { id: '14', value: 'meeting' },
  { id: '15', value: 'idea' },
];

/**
 * Filter tags by search query.
 * Matches against the tag value (case-insensitive).
 */
export function filterTags(query: string): MockTag[] {
  if (!query.trim()) {
    return mockTags;
  }

  const lowerQuery = query.toLowerCase();

  return mockTags.filter((tag) => tag.value.toLowerCase().includes(lowerQuery));
}
