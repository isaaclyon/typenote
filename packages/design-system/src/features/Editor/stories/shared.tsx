/**
 * Shared mock data and utilities for Editor stories.
 */

import type { JSONContent } from '@tiptap/core';
import type { RefSuggestionItem, TagSuggestionItem } from '../types.js';

// ============================================================================
// Mock data for ref suggestions
// ============================================================================

export const mockObjects: RefSuggestionItem[] = [
  {
    objectId: '01J1234567890123456789A',
    objectType: 'Page',
    title: 'Getting Started Guide',
    color: '#6366F1',
  },
  {
    objectId: '01J1234567890123456789B',
    objectType: 'Page',
    title: 'Project Roadmap',
    color: '#6366F1',
  },
  {
    objectId: '01J1234567890123456789C',
    objectType: 'Person',
    title: 'Alice Johnson',
    color: '#EC4899',
  },
  {
    objectId: '01J1234567890123456789D',
    objectType: 'Person',
    title: 'Bob Smith',
    color: '#EC4899',
  },
  {
    objectId: '01J1234567890123456789E',
    objectType: 'DailyNote',
    title: '2026-01-19',
    color: '#F59E0B',
  },
  {
    objectId: '01J1234567890123456789F',
    objectType: 'Event',
    title: 'Team Standup',
    color: '#8B5CF6',
  },
  {
    objectId: '01J1234567890123456789G',
    objectType: 'Place',
    title: 'San Francisco Office',
    color: '#10B981',
  },
  {
    objectId: '01J1234567890123456789H',
    objectType: 'Task',
    title: 'Fix login bug',
    color: '#EF4444',
  },
];

export const mockRefSearch = async (query: string): Promise<RefSuggestionItem[]> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 100));

  if (!query) return mockObjects.slice(0, 5);

  const lower = query.toLowerCase();
  return mockObjects.filter(
    (obj) => obj.title.toLowerCase().includes(lower) || obj.objectType.toLowerCase().includes(lower)
  );
};

export const mockRefCreate = async (title: string): Promise<RefSuggestionItem> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 200));

  return {
    objectId: `01J${Date.now()}`,
    objectType: 'Page',
    title,
    color: '#6366F1',
  };
};

// ============================================================================
// Mock data for tag suggestions
// ============================================================================

export const mockTags: TagSuggestionItem[] = [
  { tagId: '01TAG00000000000000001', name: 'important', color: '#EF4444' },
  { tagId: '01TAG00000000000000002', name: 'idea', color: '#8B5CF6' },
  { tagId: '01TAG00000000000000003', name: 'todo', color: '#F59E0B' },
  { tagId: '01TAG00000000000000004', name: 'work', color: '#6366F1' },
  { tagId: '01TAG00000000000000005', name: 'personal', color: '#10B981' },
  { tagId: '01TAG00000000000000006', name: 'meeting', color: '#EC4899' },
  { tagId: '01TAG00000000000000007', name: 'research', color: '#06B6D4' },
];

export const mockTagSearch = async (query: string): Promise<TagSuggestionItem[]> => {
  await new Promise((resolve) => setTimeout(resolve, 100));

  if (!query) return mockTags.slice(0, 5);

  const lower = query.toLowerCase();
  return mockTags.filter((tag) => tag.name.toLowerCase().includes(lower));
};

export const mockTagCreate = async (name: string): Promise<TagSuggestionItem> => {
  await new Promise((resolve) => setTimeout(resolve, 200));

  return {
    tagId: `01TAG${Date.now()}`,
    name: name.toLowerCase().replace(/\s+/g, '-'),
    color: '#71717A',
  };
};

// ============================================================================
// Sample content
// ============================================================================

export const basicContent: JSONContent = {
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
        { type: 'text', marks: [{ type: 'bold' }], text: 'block-based' },
        { type: 'text', text: ' editor built on TipTap.' },
      ],
    },
    {
      type: 'paragraph',
      content: [
        { type: 'text', text: 'It supports ' },
        { type: 'text', marks: [{ type: 'italic' }], text: 'rich text formatting' },
        { type: 'text', text: ' with keyboard shortcuts.' },
      ],
    },
  ],
};

export const longContent: JSONContent = {
  type: 'doc',
  content: [
    {
      type: 'heading',
      attrs: { level: 1 },
      content: [{ type: 'text', text: 'Long Document' }],
    },
    ...Array.from({ length: 10 }, (_, i) => ({
      type: 'paragraph' as const,
      content: [
        {
          type: 'text' as const,
          text: `Paragraph ${i + 1}: Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.`,
        },
      ],
    })),
  ],
};
