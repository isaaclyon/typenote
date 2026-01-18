import type { MockNote, MockTag, WikiLinkProvider, WikiLinkItem } from '../types.js';

// ─────────────────────────────────────────────────────────────────────────────
// Mock Notes
// ─────────────────────────────────────────────────────────────────────────────

export const mockNotes: MockNote[] = [
  { id: '01HXYZ001', title: 'Project Roadmap', type: 'Page' },
  { id: '01HXYZ002', title: 'Meeting Notes', type: 'Page' },
  { id: '01HXYZ003', title: 'Design System Architecture', type: 'Page' },
  { id: '01HXYZ004', title: 'API Documentation', type: 'Page' },
  { id: '01HXYZ005', title: 'John Smith', type: 'Person' },
  { id: '01HXYZ006', title: 'Jane Doe', type: 'Person' },
  { id: '01HXYZ007', title: 'Team Standup', type: 'Event' },
  { id: '01HXYZ008', title: 'Product Launch', type: 'Event' },
  { id: '01HXYZ009', title: 'Fix authentication bug', type: 'Task' },
  { id: '01HXYZ010', title: 'Update dependencies', type: 'Task' },
  { id: '01HXYZ011', title: 'Office HQ', type: 'Place' },
  { id: '01HXYZ012', title: 'Coffee Shop', type: 'Place' },
];

// ─────────────────────────────────────────────────────────────────────────────
// Mock Tags
// ─────────────────────────────────────────────────────────────────────────────

export const mockTags: MockTag[] = [
  { id: 'tag-1', value: 'important', color: '#ef4444' },
  { id: 'tag-2', value: 'todo', color: '#f59e0b' },
  { id: 'tag-3', value: 'done', color: '#22c55e' },
  { id: 'tag-4', value: 'review', color: '#3b82f6' },
  { id: 'tag-5', value: 'blocked', color: '#ef4444' },
  { id: 'tag-6', value: 'idea', color: '#8b5cf6' },
];

// ─────────────────────────────────────────────────────────────────────────────
// Mock Wiki-Link Provider
// ─────────────────────────────────────────────────────────────────────────────

export const mockWikiLinkProvider: WikiLinkProvider = {
  search: (query: string): WikiLinkItem[] => {
    const normalizedQuery = query.toLowerCase();
    return mockNotes
      .filter((note) => note.title.toLowerCase().includes(normalizedQuery))
      .slice(0, 8)
      .map((note) => ({
        id: note.id,
        title: note.title,
        type: note.type,
      }));
  },
  create: async (title: string): Promise<WikiLinkItem | null> => {
    // Simulate creating a new note
    const newNote: WikiLinkItem = {
      id: `01HXYZ${Date.now()}`,
      title,
      type: 'Page',
    };
    return newNote;
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Mock Content
// ─────────────────────────────────────────────────────────────────────────────

export const mockEmptyContent = {
  type: 'doc',
  content: [
    {
      type: 'paragraph',
    },
  ],
};

export const mockBasicContent = {
  type: 'doc',
  content: [
    {
      type: 'heading',
      attrs: { level: 1 },
      content: [{ type: 'text', text: 'Welcome to TypeNote' }],
    },
    {
      type: 'paragraph',
      content: [
        { type: 'text', text: 'This is a ' },
        { type: 'text', text: 'rich text editor', marks: [{ type: 'bold' }] },
        { type: 'text', text: ' with support for:' },
      ],
    },
    {
      type: 'bulletList',
      content: [
        {
          type: 'listItem',
          content: [
            {
              type: 'paragraph',
              content: [
                { type: 'text', text: 'Bold', marks: [{ type: 'bold' }] },
                { type: 'text', text: ', ' },
                { type: 'text', text: 'italic', marks: [{ type: 'italic' }] },
                { type: 'text', text: ', and ' },
                { type: 'text', text: 'code', marks: [{ type: 'code' }] },
              ],
            },
          ],
        },
        {
          type: 'listItem',
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'text', text: 'Bullet and numbered lists' }],
            },
          ],
        },
        {
          type: 'listItem',
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'text', text: 'Headings and blockquotes' }],
            },
          ],
        },
      ],
    },
    {
      type: 'paragraph',
      content: [{ type: 'text', text: 'Try typing [[ to create a wiki-link!' }],
    },
  ],
};
