/**
 * Tests for applyTemplateToObject.
 *
 * TDD: Write tests first, then implement the function.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import type { Template } from '@typenote/api';
import { generateId } from '@typenote/core';
import { createTestDb, closeDb, type TypenoteDb } from './db.js';
import { seedBuiltInTypes } from './objectTypeService.js';
import { createObject, getObject } from './objectService.js';
import { applyTemplateToObject, type ApplyTemplateContext } from './applyTemplateToObject.js';
import { getDocument } from './getDocument.js';

describe('applyTemplateToObject', () => {
  let db: TypenoteDb;

  beforeEach(() => {
    db = createTestDb();
    seedBuiltInTypes(db);
  });

  afterEach(() => {
    closeDb(db);
  });

  // ============================================================================
  // Basic Application
  // ============================================================================

  describe('basic template application', () => {
    it('should insert a single paragraph block from template', () => {
      // Create an object
      const obj = createObject(db, 'Page', 'Test Page');

      // Create a simple template
      const template: Template = {
        id: generateId(),
        objectTypeId: obj.typeId,
        name: 'Simple Template',
        content: {
          blocks: [
            {
              blockType: 'paragraph',
              content: { inline: [{ t: 'text', text: 'Hello from template' }] },
            },
          ],
        },
        isDefault: true,
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Apply template
      const context: ApplyTemplateContext = {
        title: obj.title,
        createdDate: obj.createdAt,
      };

      const result = applyTemplateToObject(db, obj.id, template, context);

      // Should succeed
      expect(result.success).toBe(true);
      if (!result.success) throw new Error('Expected success');

      // Should have inserted one block
      expect(result.result.applied.insertedBlockIds).toHaveLength(1);

      // Verify the block exists in the document
      const doc = getDocument(db, obj.id);
      expect(doc).not.toBeNull();
      if (!doc) throw new Error('Expected document');
      expect(doc.blocks).toHaveLength(1);

      const firstBlock = doc.blocks[0];
      expect(firstBlock).toBeDefined();
      if (!firstBlock) throw new Error('Expected first block');
      expect(firstBlock.blockType).toBe('paragraph');
    });

    it('should insert multiple blocks from template', () => {
      const obj = createObject(db, 'Page', 'Multi Block Page');

      const template: Template = {
        id: generateId(),
        objectTypeId: obj.typeId,
        name: 'Multi Block Template',
        content: {
          blocks: [
            {
              blockType: 'heading',
              content: { level: 1, inline: [{ t: 'text', text: 'Introduction' }] },
            },
            {
              blockType: 'paragraph',
              content: { inline: [{ t: 'text', text: 'First paragraph' }] },
            },
            {
              blockType: 'paragraph',
              content: { inline: [{ t: 'text', text: 'Second paragraph' }] },
            },
          ],
        },
        isDefault: true,
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const context: ApplyTemplateContext = {
        title: obj.title,
        createdDate: obj.createdAt,
      };

      const result = applyTemplateToObject(db, obj.id, template, context);

      expect(result.success).toBe(true);
      if (!result.success) throw new Error('Expected success');

      expect(result.result.applied.insertedBlockIds).toHaveLength(3);

      // Verify order
      const doc = getDocument(db, obj.id);
      expect(doc).not.toBeNull();
      if (!doc) throw new Error('Expected document');
      expect(doc.blocks).toHaveLength(3);

      const block0 = doc.blocks[0];
      const block1 = doc.blocks[1];
      const block2 = doc.blocks[2];
      expect(block0).toBeDefined();
      expect(block1).toBeDefined();
      expect(block2).toBeDefined();
      if (!block0 || !block1 || !block2) throw new Error('Expected blocks');

      expect(block0.blockType).toBe('heading');
      expect(block1.blockType).toBe('paragraph');
      expect(block2.blockType).toBe('paragraph');
    });

    it('should handle empty template (no blocks)', () => {
      const obj = createObject(db, 'Page', 'Empty Template Page');

      const template: Template = {
        id: generateId(),
        objectTypeId: obj.typeId,
        name: 'Empty Template',
        content: { blocks: [] },
        isDefault: true,
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const context: ApplyTemplateContext = {
        title: obj.title,
        createdDate: obj.createdAt,
      };

      const result = applyTemplateToObject(db, obj.id, template, context);

      expect(result.success).toBe(true);
      if (!result.success) throw new Error('Expected success');

      expect(result.result.applied.insertedBlockIds).toHaveLength(0);
    });
  });

  // ============================================================================
  // Placeholder Substitution
  // ============================================================================

  describe('placeholder substitution', () => {
    it('should substitute {{title}} placeholder', () => {
      const obj = createObject(db, 'Page', 'My Amazing Page');

      const template: Template = {
        id: generateId(),
        objectTypeId: obj.typeId,
        name: 'Title Template',
        content: {
          blocks: [
            {
              blockType: 'heading',
              content: { level: 1, inline: [{ t: 'text', text: '{{title}}' }] },
            },
          ],
        },
        isDefault: true,
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const context: ApplyTemplateContext = {
        title: obj.title,
        createdDate: obj.createdAt,
      };

      const result = applyTemplateToObject(db, obj.id, template, context);
      expect(result.success).toBe(true);

      const doc = getDocument(db, obj.id);
      expect(doc).not.toBeNull();
      if (!doc) throw new Error('Expected document');

      const heading = doc.blocks[0];
      expect(heading).toBeDefined();
      if (!heading) throw new Error('Expected heading block');
      expect(heading.blockType).toBe('heading');

      // The content should have the title substituted
      const content = heading.content as { level: number; inline: unknown[] };
      const firstInline = content.inline[0];
      expect(firstInline).toEqual({ t: 'text', text: 'My Amazing Page' });
    });

    it('should substitute {{created_date}} placeholder', () => {
      const obj = createObject(db, 'Page', 'Dated Page');

      const template: Template = {
        id: generateId(),
        objectTypeId: obj.typeId,
        name: 'Date Template',
        content: {
          blocks: [
            {
              blockType: 'paragraph',
              content: { inline: [{ t: 'text', text: 'Created on {{created_date}}' }] },
            },
          ],
        },
        isDefault: true,
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const context: ApplyTemplateContext = {
        title: obj.title,
        createdDate: obj.createdAt,
      };

      const result = applyTemplateToObject(db, obj.id, template, context);
      expect(result.success).toBe(true);

      const doc = getDocument(db, obj.id);
      expect(doc).not.toBeNull();
      if (!doc) throw new Error('Expected document');

      const para = doc.blocks[0];
      expect(para).toBeDefined();
      if (!para) throw new Error('Expected paragraph block');

      const content = para.content as { inline: Array<{ t: string; text: string }> };
      const firstInline = content.inline[0];
      expect(firstInline).toBeDefined();
      if (!firstInline) throw new Error('Expected inline node');

      // The date should be substituted in YYYY-MM-DD format
      const expectedDate = obj.createdAt.toISOString().split('T')[0];
      expect(firstInline.text).toBe(`Created on ${expectedDate}`);
    });

    it('should substitute {{date_key}} placeholder for DailyNote', () => {
      const obj = createObject(db, 'DailyNote', '2026-01-06', {
        date_key: '2026-01-06',
      });

      const template: Template = {
        id: generateId(),
        objectTypeId: obj.typeId,
        name: 'Daily Note Template',
        content: {
          blocks: [
            {
              blockType: 'heading',
              content: { level: 1, inline: [{ t: 'text', text: '📅 {{date_key}}' }] },
            },
          ],
        },
        isDefault: true,
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const context: ApplyTemplateContext = {
        title: obj.title,
        createdDate: obj.createdAt,
        dateKey: '2026-01-06',
      };

      const result = applyTemplateToObject(db, obj.id, template, context);
      expect(result.success).toBe(true);

      const doc = getDocument(db, obj.id);
      expect(doc).not.toBeNull();
      if (!doc) throw new Error('Expected document');

      const heading = doc.blocks[0];
      expect(heading).toBeDefined();
      if (!heading) throw new Error('Expected heading block');

      const content = heading.content as {
        level: number;
        inline: Array<{ t: string; text: string }>;
      };
      const firstInline = content.inline[0];
      expect(firstInline).toBeDefined();
      if (!firstInline) throw new Error('Expected inline node');

      expect(firstInline.text).toBe('📅 2026-01-06');
    });

    it('should substitute multiple placeholders in same block', () => {
      const obj = createObject(db, 'Page', 'Complex Page');

      const template: Template = {
        id: generateId(),
        objectTypeId: obj.typeId,
        name: 'Multi Placeholder Template',
        content: {
          blocks: [
            {
              blockType: 'paragraph',
              content: {
                inline: [{ t: 'text', text: '{{title}} - Created: {{created_date}}' }],
              },
            },
          ],
        },
        isDefault: true,
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const context: ApplyTemplateContext = {
        title: obj.title,
        createdDate: obj.createdAt,
      };

      const result = applyTemplateToObject(db, obj.id, template, context);
      expect(result.success).toBe(true);

      const doc = getDocument(db, obj.id);
      expect(doc).not.toBeNull();
      if (!doc) throw new Error('Expected document');

      const para = doc.blocks[0];
      expect(para).toBeDefined();
      if (!para) throw new Error('Expected paragraph block');

      const content = para.content as { inline: Array<{ t: string; text: string }> };
      const firstInline = content.inline[0];
      expect(firstInline).toBeDefined();
      if (!firstInline) throw new Error('Expected inline node');

      const expectedDate = obj.createdAt.toISOString().split('T')[0];
      expect(firstInline.text).toBe(`Complex Page - Created: ${expectedDate}`);
    });

    it('should preserve unknown placeholders unchanged', () => {
      const obj = createObject(db, 'Page', 'Unknown Placeholder Page');

      const template: Template = {
        id: generateId(),
        objectTypeId: obj.typeId,
        name: 'Unknown Placeholder Template',
        content: {
          blocks: [
            {
              blockType: 'paragraph',
              content: { inline: [{ t: 'text', text: 'Value: {{unknown_placeholder}}' }] },
            },
          ],
        },
        isDefault: true,
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const context: ApplyTemplateContext = {
        title: obj.title,
        createdDate: obj.createdAt,
      };

      const result = applyTemplateToObject(db, obj.id, template, context);
      expect(result.success).toBe(true);

      const doc = getDocument(db, obj.id);
      expect(doc).not.toBeNull();
      if (!doc) throw new Error('Expected document');

      const para = doc.blocks[0];
      expect(para).toBeDefined();
      if (!para) throw new Error('Expected paragraph block');

      const content = para.content as { inline: Array<{ t: string; text: string }> };
      const firstInline = content.inline[0];
      expect(firstInline).toBeDefined();
      if (!firstInline) throw new Error('Expected inline node');

      // Unknown placeholders remain as-is
      expect(firstInline.text).toBe('Value: {{unknown_placeholder}}');
    });
  });

  // ============================================================================
  // Nested Blocks (Children)
  // ============================================================================

  describe('nested blocks', () => {
    it('should insert blocks with children (list)', () => {
      const obj = createObject(db, 'Page', 'List Page');

      const template: Template = {
        id: generateId(),
        objectTypeId: obj.typeId,
        name: 'List Template',
        content: {
          blocks: [
            {
              blockType: 'list',
              content: { kind: 'bullet' },
              children: [
                {
                  blockType: 'list_item',
                  content: { inline: [{ t: 'text', text: 'Item 1' }] },
                },
                {
                  blockType: 'list_item',
                  content: { inline: [{ t: 'text', text: 'Item 2' }] },
                },
              ],
            },
          ],
        },
        isDefault: true,
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const context: ApplyTemplateContext = {
        title: obj.title,
        createdDate: obj.createdAt,
      };

      const result = applyTemplateToObject(db, obj.id, template, context);
      expect(result.success).toBe(true);
      if (!result.success) throw new Error('Expected success');

      // Should have 3 blocks: list + 2 list items
      expect(result.result.applied.insertedBlockIds).toHaveLength(3);

      // Verify structure
      const doc = getDocument(db, obj.id);
      expect(doc).not.toBeNull();
      if (!doc) throw new Error('Expected document');
      expect(doc.blocks).toHaveLength(1); // Top-level: just the list

      const list = doc.blocks[0];
      expect(list).toBeDefined();
      if (!list) throw new Error('Expected list block');
      expect(list.blockType).toBe('list');
      expect(list.children).toBeDefined();
      if (!list.children) throw new Error('Expected children');
      expect(list.children).toHaveLength(2);

      const item0 = list.children[0];
      const item1 = list.children[1];
      expect(item0).toBeDefined();
      expect(item1).toBeDefined();
      if (!item0 || !item1) throw new Error('Expected list items');

      expect(item0.blockType).toBe('list_item');
      expect(item1.blockType).toBe('list_item');
    });

    it('should substitute placeholders in nested children', () => {
      const obj = createObject(db, 'Page', 'Nested Placeholder Page');

      const template: Template = {
        id: generateId(),
        objectTypeId: obj.typeId,
        name: 'Nested Placeholder Template',
        content: {
          blocks: [
            {
              blockType: 'list',
              content: { kind: 'bullet' },
              children: [
                {
                  blockType: 'list_item',
                  content: { inline: [{ t: 'text', text: 'Title: {{title}}' }] },
                },
              ],
            },
          ],
        },
        isDefault: true,
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const context: ApplyTemplateContext = {
        title: obj.title,
        createdDate: obj.createdAt,
      };

      const result = applyTemplateToObject(db, obj.id, template, context);
      expect(result.success).toBe(true);

      const doc = getDocument(db, obj.id);
      expect(doc).not.toBeNull();
      if (!doc) throw new Error('Expected document');

      const list = doc.blocks[0];
      expect(list).toBeDefined();
      if (!list) throw new Error('Expected list block');
      expect(list.children).toBeDefined();
      if (!list.children) throw new Error('Expected children');

      const listItem = list.children[0];
      expect(listItem).toBeDefined();
      if (!listItem) throw new Error('Expected list item');

      const content = listItem.content as { inline: Array<{ t: string; text: string }> };
      const firstInline = content.inline[0];
      expect(firstInline).toBeDefined();
      if (!firstInline) throw new Error('Expected inline node');

      expect(firstInline.text).toBe('Title: Nested Placeholder Page');
    });

    it('should handle deeply nested blocks', () => {
      const obj = createObject(db, 'Page', 'Deep Nesting Page');

      // blockquote > list > list_item
      const template: Template = {
        id: generateId(),
        objectTypeId: obj.typeId,
        name: 'Deep Nesting Template',
        content: {
          blocks: [
            {
              blockType: 'blockquote',
              content: {},
              children: [
                {
                  blockType: 'list',
                  content: { kind: 'ordered', start: 1 },
                  children: [
                    {
                      blockType: 'list_item',
                      content: { inline: [{ t: 'text', text: 'Deep item' }] },
                    },
                  ],
                },
              ],
            },
          ],
        },
        isDefault: true,
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const context: ApplyTemplateContext = {
        title: obj.title,
        createdDate: obj.createdAt,
      };

      const result = applyTemplateToObject(db, obj.id, template, context);
      expect(result.success).toBe(true);
      if (!result.success) throw new Error('Expected success');

      // blockquote + list + list_item = 3 blocks
      expect(result.result.applied.insertedBlockIds).toHaveLength(3);

      const doc = getDocument(db, obj.id);
      expect(doc).not.toBeNull();
      if (!doc) throw new Error('Expected document');

      const blockquote = doc.blocks[0];
      expect(blockquote).toBeDefined();
      if (!blockquote) throw new Error('Expected blockquote');
      expect(blockquote.blockType).toBe('blockquote');
      expect(blockquote.children).toBeDefined();
      if (!blockquote.children) throw new Error('Expected children');
      expect(blockquote.children).toHaveLength(1);

      const list = blockquote.children[0];
      expect(list).toBeDefined();
      if (!list) throw new Error('Expected list');
      expect(list.blockType).toBe('list');
      expect(list.children).toBeDefined();
      if (!list.children) throw new Error('Expected list children');
      expect(list.children).toHaveLength(1);

      const listItem = list.children[0];
      expect(listItem).toBeDefined();
      if (!listItem) throw new Error('Expected list item');
      expect(listItem.blockType).toBe('list_item');
    });
  });

  // ============================================================================
  // Error Cases
  // ============================================================================

  describe('error cases', () => {
    it('should fail if object does not exist', () => {
      const nonExistentId = generateId();

      const template: Template = {
        id: generateId(),
        objectTypeId: generateId(),
        name: 'Some Template',
        content: {
          blocks: [
            {
              blockType: 'paragraph',
              content: { inline: [{ t: 'text', text: 'Test' }] },
            },
          ],
        },
        isDefault: true,
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const context: ApplyTemplateContext = {
        title: 'Test',
        createdDate: new Date(),
      };

      const result = applyTemplateToObject(db, nonExistentId, template, context);

      expect(result.success).toBe(false);
      if (result.success) throw new Error('Expected failure');
      expect(result.error.code).toBe('NOT_FOUND_OBJECT');
    });
  });

  // ============================================================================
  // Document Version
  // ============================================================================

  describe('document version', () => {
    it('should increment document version after applying template', () => {
      const obj = createObject(db, 'Page', 'Version Test Page');

      // Initial version should be 0
      const initialObj = getObject(db, obj.id);
      expect(initialObj).not.toBeNull();
      if (!initialObj) throw new Error('Expected object');
      expect(initialObj.docVersion).toBe(0);

      const template: Template = {
        id: generateId(),
        objectTypeId: obj.typeId,
        name: 'Version Template',
        content: {
          blocks: [
            {
              blockType: 'paragraph',
              content: { inline: [{ t: 'text', text: 'Versioned content' }] },
            },
          ],
        },
        isDefault: true,
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const context: ApplyTemplateContext = {
        title: obj.title,
        createdDate: obj.createdAt,
      };

      const result = applyTemplateToObject(db, obj.id, template, context);
      expect(result.success).toBe(true);
      if (!result.success) throw new Error('Expected success');

      // Version should have incremented
      expect(result.result.previousDocVersion).toBe(0);
      expect(result.result.newDocVersion).toBe(1);

      // Verify in database
      const updatedObj = getObject(db, obj.id);
      expect(updatedObj).not.toBeNull();
      if (!updatedObj) throw new Error('Expected object');
      expect(updatedObj.docVersion).toBe(1);
    });
  });
});
