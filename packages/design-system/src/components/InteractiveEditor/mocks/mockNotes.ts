/**
 * Represents a note/document that can be linked via wiki-links.
 */
export interface MockNote {
  /** Unique identifier for the note */
  id: string;
  /** Display title of the note */
  title: string;
  /** Type/category of the note */
  type: 'note' | 'project' | 'task' | 'person' | 'resource';
}

/**
 * Mock notes for wiki-link autocomplete in the InteractiveEditor.
 * These appear when typing "[[" to create internal links.
 */
export const mockNotes: MockNote[] = [
  // Notes (general documentation)
  { id: '1', title: 'Getting Started Guide', type: 'note' },
  { id: '2', title: 'Meeting Notes - Weekly Standup', type: 'note' },
  { id: '3', title: 'Architecture Decision Records', type: 'note' },
  { id: '4', title: 'Onboarding Checklist', type: 'note' },
  { id: '5', title: 'API Design Guidelines', type: 'note' },

  // Projects
  { id: '6', title: 'Q1 Product Roadmap', type: 'project' },
  { id: '7', title: 'Website Redesign', type: 'project' },
  { id: '8', title: 'Mobile App Launch', type: 'project' },
  { id: '9', title: 'Database Migration', type: 'project' },

  // Tasks
  { id: '10', title: 'Review pull requests', type: 'task' },
  { id: '11', title: 'Update dependencies', type: 'task' },
  { id: '12', title: 'Write unit tests for auth module', type: 'task' },
  { id: '13', title: 'Fix navigation bug', type: 'task' },

  // People
  { id: '14', title: 'Sarah Chen', type: 'person' },
  { id: '15', title: 'Marcus Johnson', type: 'person' },
  { id: '16', title: 'Elena Rodriguez', type: 'person' },
  { id: '17', title: 'David Kim', type: 'person' },

  // Resources (external references, documentation)
  { id: '18', title: 'React Documentation', type: 'resource' },
  { id: '19', title: 'TypeScript Handbook', type: 'resource' },
  { id: '20', title: 'Design System Figma', type: 'resource' },
];

/**
 * Filter notes by search query.
 * Matches against the note title (case-insensitive).
 */
export function filterNotes(query: string): MockNote[] {
  if (!query.trim()) {
    return mockNotes;
  }

  const lowerQuery = query.toLowerCase();

  return mockNotes.filter((note) => note.title.toLowerCase().includes(lowerQuery));
}
