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
  { id: '1', value: 'in-progress', color: '#3B82F6' },
  { id: '2', value: 'done', color: '#22C55E' },
  { id: '3', value: 'blocked', color: '#EF4444' },
  { id: '4', value: 'on-hold', color: '#6B7280' },
  { id: '5', value: 'review', color: '#8B5CF6' },

  // Priority tags
  { id: '6', value: 'high-priority', color: '#F59E0B' },
  { id: '7', value: 'low-priority', color: '#94A3B8' },
  { id: '8', value: 'urgent', color: '#DC2626' },

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
