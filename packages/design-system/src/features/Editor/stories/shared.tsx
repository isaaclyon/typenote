/**
 * Shared mock data and utilities for Editor stories.
 */

import type { JSONContent } from '@tiptap/core';
import type { RefSuggestionItem, TagSuggestionItem } from '../types.js';
import type { HeadingSuggestionItem, BlockSuggestionItem } from '../extensions/RefSuggestion.js';

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
// Mock data for heading suggestions
// ============================================================================

/** Mock headings for "Getting Started Guide" */
const mockHeadingsForGettingStarted: HeadingSuggestionItem[] = [
  { level: 1, text: 'Getting Started' },
  { level: 2, text: 'Installation' },
  { level: 3, text: 'System Requirements' },
  { level: 3, text: 'Download' },
  { level: 2, text: 'Quick Start' },
  { level: 2, text: 'Configuration' },
  { level: 3, text: 'Basic Setup' },
  { level: 3, text: 'Advanced Options' },
];

/** Mock headings for "Project Roadmap" */
const mockHeadingsForRoadmap: HeadingSuggestionItem[] = [
  { level: 1, text: 'Project Roadmap' },
  { level: 2, text: 'Q1 Goals' },
  { level: 2, text: 'Q2 Goals' },
  { level: 2, text: 'Future Plans' },
];

export const mockHeadingSearch = async (
  objectId: string,
  query: string
): Promise<HeadingSuggestionItem[]> => {
  await new Promise((resolve) => setTimeout(resolve, 100));

  // Get headings based on object
  let headings: HeadingSuggestionItem[] = [];
  if (objectId === '01J1234567890123456789A') {
    headings = mockHeadingsForGettingStarted;
  } else if (objectId === '01J1234567890123456789B') {
    headings = mockHeadingsForRoadmap;
  } else {
    // Default headings for any other object
    headings = [
      { level: 1, text: 'Overview' },
      { level: 2, text: 'Details' },
      { level: 2, text: 'Summary' },
    ];
  }

  // Filter by query
  if (!query) return headings;
  const lower = query.toLowerCase();
  return headings.filter((h) => h.text.toLowerCase().includes(lower));
};

// ============================================================================
// Mock data for block suggestions
// ============================================================================

/** Mock blocks for "Getting Started Guide" */
const mockBlocksForGettingStarted: BlockSuggestionItem[] = [
  {
    ksuid: '2NxK7vPq001',
    preview: 'Welcome to TypeNote, your local-first knowledge app.',
    blockType: 'paragraph',
  },
  { ksuid: '2NxK7vPq002', preview: 'Getting Started', blockType: 'heading' },
  {
    ksuid: '2NxK7vPq003',
    preview: 'Before installing, ensure your system meets these requirements.',
    blockType: 'paragraph',
  },
  { ksuid: '2NxK7vPq004', preview: 'Installation', blockType: 'heading' },
  {
    ksuid: '2NxK7vPq005',
    alias: 'install-cmd',
    preview: 'npm install typenote',
    blockType: 'code_block',
  },
  {
    ksuid: '2NxK7vPq006',
    preview: 'TypeNote is designed for power users who value data ownership.',
    blockType: 'paragraph',
  },
  {
    ksuid: '2NxK7vPq007',
    alias: 'key-insight',
    preview: 'Your data never leaves your device.',
    blockType: 'blockquote',
  },
];

/** Mock blocks for "Project Roadmap" */
const mockBlocksForRoadmap: BlockSuggestionItem[] = [
  { ksuid: '2NxK7vPr001', preview: 'Project Roadmap', blockType: 'heading' },
  {
    ksuid: '2NxK7vPr002',
    preview: 'This document outlines our development priorities.',
    blockType: 'paragraph',
  },
  {
    ksuid: '2NxK7vPr003',
    alias: 'q1-summary',
    preview: 'Q1: Foundation and core features',
    blockType: 'paragraph',
  },
  { ksuid: '2NxK7vPr004', preview: 'Complete block-based editor', blockType: 'list_item' },
  { ksuid: '2NxK7vPr005', preview: 'Implement reference system', blockType: 'list_item' },
];

export const mockBlockSearch = async (
  objectId: string,
  query: string
): Promise<BlockSuggestionItem[]> => {
  await new Promise((resolve) => setTimeout(resolve, 100));

  // Get blocks based on object
  let blocks: BlockSuggestionItem[] = [];
  if (objectId === '01J1234567890123456789A') {
    blocks = mockBlocksForGettingStarted;
  } else if (objectId === '01J1234567890123456789B') {
    blocks = mockBlocksForRoadmap;
  } else {
    // Default blocks for any other object
    blocks = [
      { ksuid: '2NxK7vPz001', preview: 'Sample paragraph content.', blockType: 'paragraph' },
      { ksuid: '2NxK7vPz002', preview: 'Another block of text.', blockType: 'paragraph' },
    ];
  }

  // Filter by query
  if (!query) return blocks;
  const lower = query.toLowerCase();
  return blocks.filter(
    (b) =>
      b.preview.toLowerCase().includes(lower) || (b.alias && b.alias.toLowerCase().includes(lower))
  );
};

/** Mock callback for when a new block ID is inserted */
export const mockBlockIdInsert = (objectId: string, blockKsuid: string, newAlias: string): void => {
  console.log(
    `[Mock] Insert BlockIdNode: objectId=${objectId}, blockKsuid=${blockKsuid}, alias=${newAlias}`
  );
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
