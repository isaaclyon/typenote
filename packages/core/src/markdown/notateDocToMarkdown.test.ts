import { describe, it, expect } from 'vitest';
import type { DocumentBlock, PropertyDefinition } from '@typenote/api';
import { notateDocToMarkdown } from './notateDocToMarkdown.js';
import type { MarkdownExportInput } from './types.js';

const baseDates = {
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-02T00:00:00.000Z'),
};

const paragraphBlock: DocumentBlock = {
  id: '01BLOCK00000000000000000001',
  parentBlockId: null,
  orderKey: 'a0',
  blockType: 'paragraph',
  content: { inline: [{ t: 'text', text: 'Hello world' }] },
  meta: null,
  children: [],
};

const propertyDefinitions: PropertyDefinition[] = [
  {
    key: 'status',
    name: 'Status',
    type: 'select',
    required: false,
    options: ['Draft', 'Published'],
  },
  {
    key: 'owner',
    name: 'Owner',
    type: 'ref',
    required: false,
  },
];

describe('notateDocToMarkdown', () => {
  it('serializes frontmatter, title, and base blocks', () => {
    const input: MarkdownExportInput = {
      object: {
        id: '01OBJ000000000000000000001',
        typeKey: 'Page',
        title: 'Sample Page',
        ...baseDates,
        properties: {
          status: 'Draft',
          owner: '01REF000000000000000000001',
        },
        propertyDefinitions,
      },
      document: [paragraphBlock],
      refLookup: {
        '01REF000000000000000000001': { title: 'Alice' },
      },
    };

    const result = notateDocToMarkdown(input);

    const expected = [
      '---',
      'id: "01OBJ000000000000000000001"',
      'type: "Page"',
      'title: "Sample Page"',
      'createdAt: "2026-01-01T00:00:00.000Z"',
      'updatedAt: "2026-01-02T00:00:00.000Z"',
      'status: "Draft"',
      'owner: "[[Alice]]"',
      '---',
      '# Sample Page',
      '',
      'Hello world ^01BLOCK00000000000000000001',
    ].join('\n');

    expect(result.markdown).toBe(expected);
    expect(result.assets).toEqual([]);
    expect(result.warnings).toEqual([]);
  });

  it('serializes inline marks, links, tags, and missing refs', () => {
    const inlineBlock: DocumentBlock = {
      id: '01INLINE0000000000000000001',
      parentBlockId: null,
      orderKey: 'a0',
      blockType: 'paragraph',
      content: {
        inline: [
          { t: 'text', text: 'Bold', marks: ['strong'] },
          { t: 'text', text: ' and ' },
          { t: 'text', text: 'italic', marks: ['em'] },
          { t: 'hard_break' },
          {
            t: 'link',
            href: 'https://example.com',
            children: [{ t: 'text', text: 'Link' }],
          },
          { t: 'text', text: ' ' },
          { t: 'tag', value: 'project' },
          { t: 'text', text: ' ' },
          {
            t: 'ref',
            mode: 'link',
            target: { kind: 'object', objectId: '01MISSING00000000000000001' },
            alias: 'Alias',
          },
        ],
      },
      meta: null,
      children: [],
    };

    const input: MarkdownExportInput = {
      object: {
        id: '01OBJINLINE000000000000001',
        typeKey: 'Page',
        title: 'Inline Sample',
        ...baseDates,
        properties: {},
      },
      document: [inlineBlock],
    };

    const result = notateDocToMarkdown(input);

    const expected = [
      '---',
      'id: "01OBJINLINE000000000000001"',
      'type: "Page"',
      'title: "Inline Sample"',
      'createdAt: "2026-01-01T00:00:00.000Z"',
      'updatedAt: "2026-01-02T00:00:00.000Z"',
      '---',
      '# Inline Sample',
      '',
      '**Bold** and *italic*  ',
      '[Link](https://example.com) #project [[01MISSING00000000000000001|Alias]] ^01INLINE0000000000000000001',
    ].join('\n');

    expect(result.markdown).toBe(expected);
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0]?.code).toBe('MISSING_REF_TITLE');
  });

  it('serializes lists and attachments with asset output', () => {
    const listBlock: DocumentBlock = {
      id: '01LIST00000000000000000001',
      parentBlockId: null,
      orderKey: 'a0',
      blockType: 'list',
      content: { kind: 'task', tight: true },
      meta: null,
      children: [
        {
          id: '01ITEM00000000000000000001',
          parentBlockId: '01LIST00000000000000000001',
          orderKey: 'a0',
          blockType: 'list_item',
          content: { inline: [{ t: 'text', text: 'Done' }], checked: true },
          meta: null,
          children: [],
        },
        {
          id: '01ITEM00000000000000000002',
          parentBlockId: '01LIST00000000000000000001',
          orderKey: 'a1',
          blockType: 'list_item',
          content: { inline: [{ t: 'text', text: 'Next' }], checked: false },
          meta: null,
          children: [],
        },
      ],
    };

    const attachmentBlock: DocumentBlock = {
      id: '01ATTBLOCK0000000000000001',
      parentBlockId: null,
      orderKey: 'a1',
      blockType: 'attachment',
      content: {
        attachmentId: '01ATTACH000000000000000001',
        alt: 'Logo',
        caption: 'Brand',
      },
      meta: null,
      children: [],
    };

    const input: MarkdownExportInput = {
      object: {
        id: '01OBJLIST0000000000000001',
        typeKey: 'Page',
        title: 'List Sample',
        ...baseDates,
        properties: {},
      },
      document: [listBlock, attachmentBlock],
      attachments: {
        '01ATTACH000000000000000001': {
          filename: 'logo.png',
          mimeType: 'image/png',
        },
      },
    };

    const result = notateDocToMarkdown(input);

    const expected = [
      '---',
      'id: "01OBJLIST0000000000000001"',
      'type: "Page"',
      'title: "List Sample"',
      'createdAt: "2026-01-01T00:00:00.000Z"',
      'updatedAt: "2026-01-02T00:00:00.000Z"',
      '---',
      '# List Sample',
      '',
      '- [x] Done ^01ITEM00000000000000000001',
      '- [ ] Next ^01ITEM00000000000000000002',
      '^01LIST00000000000000000001',
      '',
      '![Logo](attachments/logo.png "Brand") ^01ATTBLOCK0000000000000001',
    ].join('\n');

    expect(result.markdown).toBe(expected);
    expect(result.assets).toEqual([
      {
        attachmentId: '01ATTACH000000000000000001',
        filename: 'logo.png',
        relativePath: 'attachments/logo.png',
        mimeType: 'image/png',
      },
    ]);
  });
});
