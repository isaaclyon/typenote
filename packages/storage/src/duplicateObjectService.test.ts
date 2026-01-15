import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createTestDb, closeDb, type TypenoteDb } from './db.js';
import { seedBuiltInTypes, createObjectType } from './objectTypeService.js';
import { createObject } from './objectService.js';
import { applyBlockPatch } from './applyBlockPatch.js';
import { getDocument } from './getDocument.js';
import { duplicateObject } from './duplicateObjectService.js';
import { generateId } from '@typenote/core';
import { objects } from './schema.js';
import { eq } from 'drizzle-orm';

describe('duplicateObject', () => {
  let db: TypenoteDb;

  beforeEach(() => {
    db = createTestDb();
  });

  afterEach(() => {
    closeDb(db);
  });

  it('creates new object with different ID', () => {
    seedBuiltInTypes(db);

    // Create source object
    const source = createObject(db, 'Page', 'Original Page');

    // Duplicate it
    const result = duplicateObject(db, source.id);

    // New object should have different ID
    expect(result.object.id).not.toBe(source.id);
    expect(result.object.id).toHaveLength(26); // ULID length
  });

  it('new object has " (Copy)" suffix in title', () => {
    seedBuiltInTypes(db);

    const source = createObject(db, 'Page', 'My Page');
    const result = duplicateObject(db, source.id);

    expect(result.object.title).toBe('My Page (Copy)');
  });

  it('new object preserves typeId and properties', () => {
    seedBuiltInTypes(db);

    // Create a custom type with properties
    const customType = createObjectType(db, {
      key: 'Project',
      name: 'Project',
      schema: {
        properties: [
          {
            key: 'status',
            name: 'Status',
            type: 'text',
            required: false,
          },
        ],
      },
    });

    const source = createObject(db, 'Project', 'Original Project', {
      status: 'active',
    });

    const result = duplicateObject(db, source.id);

    // TypeId should be the same
    expect(result.object.typeId).toBe(source.typeId);
    expect(result.object.typeId).toBe(customType.id);

    // Properties should be preserved
    expect(result.object.properties).toEqual({ status: 'active' });
  });

  it('new object has docVersion 0', () => {
    seedBuiltInTypes(db);

    // Create source with blocks (docVersion will be > 0)
    const source = createObject(db, 'Page', 'Source');

    // Add a block
    applyBlockPatch(db, {
      apiVersion: 'v1',
      objectId: source.id,
      ops: [
        {
          op: 'block.insert',
          blockId: generateId(),
          parentBlockId: null,
          place: { where: 'start' },
          blockType: 'paragraph',
          content: { inline: [{ t: 'text', text: 'Content' }] },
        },
      ],
    });

    const result = duplicateObject(db, source.id);

    // Duplicate should start with docVersion 0
    expect(result.object.docVersion).toBe(0);
  });

  it('all blocks are cloned with new IDs', () => {
    seedBuiltInTypes(db);

    const source = createObject(db, 'Page', 'Source');

    // Add multiple blocks
    const block1Id = generateId();
    const block2Id = generateId();
    const block3Id = generateId();

    applyBlockPatch(db, {
      apiVersion: 'v1',
      objectId: source.id,
      ops: [
        {
          op: 'block.insert',
          blockId: block1Id,
          parentBlockId: null,
          place: { where: 'start' },
          blockType: 'heading',
          content: { level: 1, inline: [{ t: 'text', text: 'Heading' }] },
        },
        {
          op: 'block.insert',
          blockId: block2Id,
          parentBlockId: null,
          place: { where: 'end' },
          blockType: 'paragraph',
          content: { inline: [{ t: 'text', text: 'Para 1' }] },
        },
        {
          op: 'block.insert',
          blockId: block3Id,
          parentBlockId: null,
          place: { where: 'end' },
          blockType: 'paragraph',
          content: { inline: [{ t: 'text', text: 'Para 2' }] },
        },
      ],
    });

    const result = duplicateObject(db, source.id);

    // Should report 3 blocks duplicated
    expect(result.blockCount).toBe(3);

    // Get the duplicated document
    const doc = getDocument(db, result.object.id);

    // Should have 3 blocks
    expect(doc.blocks).toHaveLength(3);

    // All blocks should have new IDs
    const blockIds = doc.blocks.map((b) => b.id);
    expect(blockIds).not.toContain(block1Id);
    expect(blockIds).not.toContain(block2Id);
    expect(blockIds).not.toContain(block3Id);
  });

  it('block tree structure (parentBlockId) is preserved', () => {
    seedBuiltInTypes(db);

    const source = createObject(db, 'Page', 'Source');

    // Create a nested structure
    const parentId = generateId();
    const child1Id = generateId();
    const child2Id = generateId();

    applyBlockPatch(db, {
      apiVersion: 'v1',
      objectId: source.id,
      ops: [
        {
          op: 'block.insert',
          blockId: parentId,
          parentBlockId: null,
          place: { where: 'start' },
          blockType: 'list',
          content: { kind: 'bullet' },
        },
        {
          op: 'block.insert',
          blockId: child1Id,
          parentBlockId: parentId,
          place: { where: 'start' },
          blockType: 'list_item',
          content: { inline: [{ t: 'text', text: 'Item 1' }] },
        },
        {
          op: 'block.insert',
          blockId: child2Id,
          parentBlockId: parentId,
          place: { where: 'end' },
          blockType: 'list_item',
          content: { inline: [{ t: 'text', text: 'Item 2' }] },
        },
      ],
    });

    const result = duplicateObject(db, source.id);

    // Get documents
    const sourceDoc = getDocument(db, source.id);
    const duplicateDoc = getDocument(db, result.object.id);

    // Tree structure should match
    expect(duplicateDoc.blocks).toHaveLength(1); // One root block (list)

    const duplicatedList = duplicateDoc.blocks[0];
    expect(duplicatedList).toBeDefined();
    expect(duplicatedList?.blockType).toBe('list');
    expect(duplicatedList?.children).toHaveLength(2); // Two list items

    // Original structure should be unchanged
    const originalList = sourceDoc.blocks[0];
    expect(originalList).toBeDefined();
    expect(originalList?.children).toHaveLength(2);
  });

  it('block content is preserved', () => {
    seedBuiltInTypes(db);

    const source = createObject(db, 'Page', 'Source');

    // Add block with rich content
    const blockId = generateId();
    applyBlockPatch(db, {
      apiVersion: 'v1',
      objectId: source.id,
      ops: [
        {
          op: 'block.insert',
          blockId,
          parentBlockId: null,
          place: { where: 'start' },
          blockType: 'paragraph',
          content: {
            inline: [
              { t: 'text', text: 'Bold ', marks: ['strong'] },
              { t: 'text', text: 'italic ', marks: ['em'] },
              { t: 'text', text: 'normal' },
            ],
          },
        },
      ],
    });

    const result = duplicateObject(db, source.id);

    const doc = getDocument(db, result.object.id);
    expect(doc.blocks).toHaveLength(1);

    const block = doc.blocks[0];
    expect(block).toBeDefined();
    if (!block) throw new Error('Expected block');

    expect(block.blockType).toBe('paragraph');
    expect(block.content).toEqual({
      inline: [
        { t: 'text', text: 'Bold ', marks: ['strong'] },
        { t: 'text', text: 'italic ', marks: ['em'] },
        { t: 'text', text: 'normal' },
      ],
    });
  });

  it('block orderKeys are preserved', () => {
    seedBuiltInTypes(db);

    const source = createObject(db, 'Page', 'Source');

    // Add blocks with specific order
    const block1Id = generateId();
    const block2Id = generateId();
    const block3Id = generateId();

    applyBlockPatch(db, {
      apiVersion: 'v1',
      objectId: source.id,
      ops: [
        {
          op: 'block.insert',
          blockId: block1Id,
          parentBlockId: null,
          place: { where: 'start' },
          blockType: 'paragraph',
          content: { inline: [{ t: 'text', text: 'First' }] },
        },
        {
          op: 'block.insert',
          blockId: block2Id,
          parentBlockId: null,
          place: { where: 'end' },
          blockType: 'paragraph',
          content: { inline: [{ t: 'text', text: 'Second' }] },
        },
        {
          op: 'block.insert',
          blockId: block3Id,
          parentBlockId: null,
          place: { where: 'end' },
          blockType: 'paragraph',
          content: { inline: [{ t: 'text', text: 'Third' }] },
        },
      ],
    });

    const result = duplicateObject(db, source.id);

    const sourceDoc = getDocument(db, source.id);
    const duplicateDoc = getDocument(db, result.object.id);

    // Order should be preserved
    expect(duplicateDoc.blocks).toHaveLength(3);

    const sourceTexts = sourceDoc.blocks.map(
      (b) => (b.content as { inline: Array<{ t: string; text: string }> }).inline[0]?.text
    );
    const duplicateTexts = duplicateDoc.blocks.map(
      (b) => (b.content as { inline: Array<{ t: string; text: string }> }).inline[0]?.text
    );

    expect(sourceTexts).toEqual(['First', 'Second', 'Third']);
    expect(duplicateTexts).toEqual(['First', 'Second', 'Third']);

    // OrderKeys should match
    const sourceKeys = sourceDoc.blocks.map((b) => b.orderKey);
    const duplicateKeys = duplicateDoc.blocks.map((b) => b.orderKey);

    expect(duplicateKeys).toEqual(sourceKeys);
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Phase 4: Internal Ref Remapping Tests
  // ─────────────────────────────────────────────────────────────────────────────

  describe('internal ref remapping', () => {
    it('remaps internal object ref to new object ID', () => {
      seedBuiltInTypes(db);

      const source = createObject(db, 'Page', 'Source');

      // Add block with internal object ref
      const blockId = generateId();
      applyBlockPatch(db, {
        apiVersion: 'v1',
        objectId: source.id,
        ops: [
          {
            op: 'block.insert',
            blockId,
            parentBlockId: null,
            place: { where: 'start' },
            blockType: 'paragraph',
            content: {
              inline: [
                { t: 'text', text: 'Link to self: ' },
                {
                  t: 'ref',
                  mode: 'link',
                  target: { kind: 'object', objectId: source.id },
                  alias: 'self',
                },
              ],
            },
          },
        ],
      });

      const result = duplicateObject(db, source.id);

      // Get the duplicated document
      const doc = getDocument(db, result.object.id);
      expect(doc.blocks).toHaveLength(1);

      const block = doc.blocks[0];
      expect(block).toBeDefined();
      if (!block) throw new Error('Expected block');

      // Content should have ref remapped to new object ID
      expect(block.content).toEqual({
        inline: [
          { t: 'text', text: 'Link to self: ' },
          {
            t: 'ref',
            mode: 'link',
            target: { kind: 'object', objectId: result.object.id },
            alias: 'self',
          },
        ],
      });
    });

    it('remaps internal block ref with both objectId and blockId', () => {
      seedBuiltInTypes(db);

      const source = createObject(db, 'Page', 'Source');

      // Add two blocks: one that references the other
      const targetBlockId = generateId();
      const refBlockId = generateId();

      applyBlockPatch(db, {
        apiVersion: 'v1',
        objectId: source.id,
        ops: [
          {
            op: 'block.insert',
            blockId: targetBlockId,
            parentBlockId: null,
            place: { where: 'start' },
            blockType: 'heading',
            content: { level: 2, inline: [{ t: 'text', text: 'Target Heading' }] },
          },
          {
            op: 'block.insert',
            blockId: refBlockId,
            parentBlockId: null,
            place: { where: 'end' },
            blockType: 'paragraph',
            content: {
              inline: [
                { t: 'text', text: 'See: ' },
                {
                  t: 'ref',
                  mode: 'link',
                  target: {
                    kind: 'block',
                    objectId: source.id,
                    blockId: targetBlockId,
                  },
                },
              ],
            },
          },
        ],
      });

      const result = duplicateObject(db, source.id);

      // Get the duplicated document
      const doc = getDocument(db, result.object.id);
      expect(doc.blocks).toHaveLength(2);

      // Find the paragraph block (second block)
      const refBlock = doc.blocks[1];
      expect(refBlock).toBeDefined();
      if (!refBlock) throw new Error('Expected ref block');

      // Find the heading block (first block)
      const targetBlock = doc.blocks[0];
      expect(targetBlock).toBeDefined();
      if (!targetBlock) throw new Error('Expected target block');

      // Content should have ref remapped to new IDs
      expect(refBlock.content).toEqual({
        inline: [
          { t: 'text', text: 'See: ' },
          {
            t: 'ref',
            mode: 'link',
            target: {
              kind: 'block',
              objectId: result.object.id, // New object ID
              blockId: targetBlock.id, // New block ID
            },
          },
        ],
      });

      // Original should be unchanged
      const sourceDoc = getDocument(db, source.id);
      const sourceRefBlock = sourceDoc.blocks[1];
      expect(sourceRefBlock?.content).toEqual({
        inline: [
          { t: 'text', text: 'See: ' },
          {
            t: 'ref',
            mode: 'link',
            target: {
              kind: 'block',
              objectId: source.id,
              blockId: targetBlockId,
            },
          },
        ],
      });
    });

    it('leaves external refs unchanged', () => {
      seedBuiltInTypes(db);

      // Create two objects
      const external = createObject(db, 'Page', 'External Page');
      const source = createObject(db, 'Page', 'Source');

      // Add block in source that refs external object
      const blockId = generateId();
      applyBlockPatch(db, {
        apiVersion: 'v1',
        objectId: source.id,
        ops: [
          {
            op: 'block.insert',
            blockId,
            parentBlockId: null,
            place: { where: 'start' },
            blockType: 'paragraph',
            content: {
              inline: [
                { t: 'text', text: 'Link to external: ' },
                {
                  t: 'ref',
                  mode: 'link',
                  target: { kind: 'object', objectId: external.id },
                  alias: 'external',
                },
              ],
            },
          },
        ],
      });

      const result = duplicateObject(db, source.id);

      // Get the duplicated document
      const doc = getDocument(db, result.object.id);
      expect(doc.blocks).toHaveLength(1);

      const block = doc.blocks[0];
      expect(block).toBeDefined();
      if (!block) throw new Error('Expected block');

      // External ref should be UNCHANGED
      expect(block.content).toEqual({
        inline: [
          { t: 'text', text: 'Link to external: ' },
          {
            t: 'ref',
            mode: 'link',
            target: { kind: 'object', objectId: external.id }, // Still external.id!
            alias: 'external',
          },
        ],
      });
    });

    it('handles mixed internal and external refs in same content', () => {
      seedBuiltInTypes(db);

      const external = createObject(db, 'Page', 'External Page');
      const source = createObject(db, 'Page', 'Source');

      // Add block with both internal and external refs
      const targetBlockId = generateId();
      const mixedBlockId = generateId();

      applyBlockPatch(db, {
        apiVersion: 'v1',
        objectId: source.id,
        ops: [
          {
            op: 'block.insert',
            blockId: targetBlockId,
            parentBlockId: null,
            place: { where: 'start' },
            blockType: 'heading',
            content: { level: 1, inline: [{ t: 'text', text: 'Internal Heading' }] },
          },
          {
            op: 'block.insert',
            blockId: mixedBlockId,
            parentBlockId: null,
            place: { where: 'end' },
            blockType: 'paragraph',
            content: {
              inline: [
                { t: 'text', text: 'Internal: ' },
                {
                  t: 'ref',
                  mode: 'link',
                  target: { kind: 'object', objectId: source.id },
                },
                { t: 'text', text: ', block ref: ' },
                {
                  t: 'ref',
                  mode: 'link',
                  target: {
                    kind: 'block',
                    objectId: source.id,
                    blockId: targetBlockId,
                  },
                },
                { t: 'text', text: ', external: ' },
                {
                  t: 'ref',
                  mode: 'link',
                  target: { kind: 'object', objectId: external.id },
                },
              ],
            },
          },
        ],
      });

      const result = duplicateObject(db, source.id);

      // Get the duplicated document
      const doc = getDocument(db, result.object.id);
      expect(doc.blocks).toHaveLength(2);

      const mixedBlock = doc.blocks[1];
      expect(mixedBlock).toBeDefined();
      if (!mixedBlock) throw new Error('Expected mixed block');

      const targetBlock = doc.blocks[0];
      expect(targetBlock).toBeDefined();
      if (!targetBlock) throw new Error('Expected target block');

      // Mixed content: internal refs remapped, external unchanged
      expect(mixedBlock.content).toEqual({
        inline: [
          { t: 'text', text: 'Internal: ' },
          {
            t: 'ref',
            mode: 'link',
            target: { kind: 'object', objectId: result.object.id }, // Remapped!
          },
          { t: 'text', text: ', block ref: ' },
          {
            t: 'ref',
            mode: 'link',
            target: {
              kind: 'block',
              objectId: result.object.id, // Remapped!
              blockId: targetBlock.id, // Remapped!
            },
          },
          { t: 'text', text: ', external: ' },
          {
            t: 'ref',
            mode: 'link',
            target: { kind: 'object', objectId: external.id }, // Unchanged!
          },
        ],
      });
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Phase 6: Edge Cases (TDD - RED → GREEN)
  // ─────────────────────────────────────────────────────────────────────────────

  describe('edge cases', () => {
    it('object with no blocks duplicates correctly', () => {
      seedBuiltInTypes(db);

      // Create object with no blocks
      const source = createObject(db, 'Page', 'Empty Page');

      // Verify source has no blocks
      const sourceDoc = getDocument(db, source.id);
      expect(sourceDoc.blocks).toHaveLength(0);

      // Duplicate it
      const result = duplicateObject(db, source.id);

      // Should succeed with blockCount: 0
      expect(result.blockCount).toBe(0);
      expect(result.object.id).not.toBe(source.id);
      expect(result.object.title).toBe('Empty Page (Copy)');
      expect(result.object.typeId).toBe(source.typeId);
      expect(result.object.docVersion).toBe(0);

      // Verify duplicate also has no blocks
      const duplicateDoc = getDocument(db, result.object.id);
      expect(duplicateDoc.blocks).toHaveLength(0);
    });

    it('object with deeply nested blocks (4 levels) preserves hierarchy', () => {
      seedBuiltInTypes(db);

      const source = createObject(db, 'Page', 'Deep Nesting');

      // Create 4-level hierarchy: Parent → Child → Grandchild → Great-grandchild
      const parentId = generateId();
      const childId = generateId();
      const grandchildId = generateId();
      const greatGrandchildId = generateId();

      applyBlockPatch(db, {
        apiVersion: 'v1',
        objectId: source.id,
        ops: [
          {
            op: 'block.insert',
            blockId: parentId,
            parentBlockId: null,
            place: { where: 'start' },
            blockType: 'list',
            content: { kind: 'bullet' },
          },
          {
            op: 'block.insert',
            blockId: childId,
            parentBlockId: parentId,
            place: { where: 'start' },
            blockType: 'list_item',
            content: { inline: [{ t: 'text', text: 'Level 1' }] },
          },
          {
            op: 'block.insert',
            blockId: grandchildId,
            parentBlockId: childId,
            place: { where: 'start' },
            blockType: 'list',
            content: { kind: 'bullet' },
          },
          {
            op: 'block.insert',
            blockId: greatGrandchildId,
            parentBlockId: grandchildId,
            place: { where: 'start' },
            blockType: 'list_item',
            content: { inline: [{ t: 'text', text: 'Level 2' }] },
          },
        ],
      });

      // Duplicate
      const result = duplicateObject(db, source.id);

      // Should report 4 blocks
      expect(result.blockCount).toBe(4);

      // Get duplicated document
      const doc = getDocument(db, result.object.id);

      // Verify 4-level hierarchy is preserved
      expect(doc.blocks).toHaveLength(1); // 1 root block

      const level0 = doc.blocks[0]; // Parent list
      expect(level0).toBeDefined();
      expect(level0?.blockType).toBe('list');
      expect(level0?.children).toHaveLength(1);

      const level1 = level0?.children[0]; // Child list_item
      expect(level1).toBeDefined();
      expect(level1?.blockType).toBe('list_item');
      expect(level1?.children).toHaveLength(1);

      const level2 = level1?.children[0]; // Grandchild list
      expect(level2).toBeDefined();
      expect(level2?.blockType).toBe('list');
      expect(level2?.children).toHaveLength(1);

      const level3 = level2?.children[0]; // Great-grandchild list_item
      expect(level3).toBeDefined();
      expect(level3?.blockType).toBe('list_item');
      expect(level3?.children).toHaveLength(0);

      // Verify content is preserved at deepest level
      expect(level3?.content).toEqual({
        inline: [{ t: 'text', text: 'Level 2' }],
      });

      // Verify all block IDs are different from source
      const allBlockIds = [level0?.id, level1?.id, level2?.id, level3?.id];
      expect(allBlockIds).not.toContain(parentId);
      expect(allBlockIds).not.toContain(childId);
      expect(allBlockIds).not.toContain(grandchildId);
      expect(allBlockIds).not.toContain(greatGrandchildId);
    });

    it('block with multiple internal refs in same content remaps all refs', () => {
      seedBuiltInTypes(db);

      const source = createObject(db, 'Page', 'Multi-Ref');

      // Create two target blocks and one block that refs both
      const target1Id = generateId();
      const target2Id = generateId();
      const refBlockId = generateId();

      applyBlockPatch(db, {
        apiVersion: 'v1',
        objectId: source.id,
        ops: [
          {
            op: 'block.insert',
            blockId: target1Id,
            parentBlockId: null,
            place: { where: 'start' },
            blockType: 'heading',
            content: { level: 2, inline: [{ t: 'text', text: 'First Target' }] },
          },
          {
            op: 'block.insert',
            blockId: target2Id,
            parentBlockId: null,
            place: { where: 'end' },
            blockType: 'heading',
            content: { level: 2, inline: [{ t: 'text', text: 'Second Target' }] },
          },
          {
            op: 'block.insert',
            blockId: refBlockId,
            parentBlockId: null,
            place: { where: 'end' },
            blockType: 'paragraph',
            content: {
              inline: [
                { t: 'text', text: 'See ' },
                {
                  t: 'ref',
                  mode: 'link',
                  target: {
                    kind: 'block',
                    objectId: source.id,
                    blockId: target1Id,
                  },
                },
                { t: 'text', text: ' and ' },
                {
                  t: 'ref',
                  mode: 'link',
                  target: {
                    kind: 'block',
                    objectId: source.id,
                    blockId: target2Id,
                  },
                },
              ],
            },
          },
        ],
      });

      // Duplicate
      const result = duplicateObject(db, source.id);

      // Get duplicated document
      const doc = getDocument(db, result.object.id);
      expect(doc.blocks).toHaveLength(3);

      // Find the duplicated blocks
      const duplicatedTarget1 = doc.blocks.find((b) => {
        const content = b.content as { level?: number; inline: Array<{ t: string; text: string }> };
        return content.inline?.[0]?.text === 'First Target';
      });
      const duplicatedTarget2 = doc.blocks.find((b) => {
        const content = b.content as { level?: number; inline: Array<{ t: string; text: string }> };
        return content.inline?.[0]?.text === 'Second Target';
      });
      const duplicatedRefBlock = doc.blocks.find((b) => {
        const content = b.content as { inline: Array<{ t: string; text?: string }> };
        return content.inline?.[0]?.text === 'See ';
      });

      expect(duplicatedTarget1).toBeDefined();
      expect(duplicatedTarget2).toBeDefined();
      expect(duplicatedRefBlock).toBeDefined();

      if (!duplicatedTarget1 || !duplicatedTarget2 || !duplicatedRefBlock) {
        throw new Error('Expected all blocks to exist');
      }

      // Verify both refs are remapped
      expect(duplicatedRefBlock.content).toEqual({
        inline: [
          { t: 'text', text: 'See ' },
          {
            t: 'ref',
            mode: 'link',
            target: {
              kind: 'block',
              objectId: result.object.id, // Remapped to new object
              blockId: duplicatedTarget1.id, // Remapped to new block
            },
          },
          { t: 'text', text: ' and ' },
          {
            t: 'ref',
            mode: 'link',
            target: {
              kind: 'block',
              objectId: result.object.id, // Remapped to new object
              blockId: duplicatedTarget2.id, // Remapped to new block
            },
          },
        ],
      });
    });

    it('blocks with empty content clone correctly', () => {
      seedBuiltInTypes(db);

      const source = createObject(db, 'Page', 'Empty Content');

      // Add blocks with empty inline arrays
      const emptyParagraphId = generateId();
      const emptyHeadingId = generateId();

      applyBlockPatch(db, {
        apiVersion: 'v1',
        objectId: source.id,
        ops: [
          {
            op: 'block.insert',
            blockId: emptyParagraphId,
            parentBlockId: null,
            place: { where: 'start' },
            blockType: 'paragraph',
            content: { inline: [] }, // Empty inline array
          },
          {
            op: 'block.insert',
            blockId: emptyHeadingId,
            parentBlockId: null,
            place: { where: 'end' },
            blockType: 'heading',
            content: { level: 1, inline: [] }, // Empty inline array
          },
        ],
      });

      // Duplicate
      const result = duplicateObject(db, source.id);

      // Should report 2 blocks
      expect(result.blockCount).toBe(2);

      // Get duplicated document
      const doc = getDocument(db, result.object.id);
      expect(doc.blocks).toHaveLength(2);

      // Verify empty content is preserved
      const paragraph = doc.blocks.find((b) => b.blockType === 'paragraph');
      const heading = doc.blocks.find((b) => b.blockType === 'heading');

      expect(paragraph).toBeDefined();
      expect(heading).toBeDefined();

      if (!paragraph || !heading) {
        throw new Error('Expected both blocks to exist');
      }

      // Both should have empty inline arrays
      expect(paragraph.content).toEqual({ inline: [] });
      expect(heading.content).toEqual({ level: 1, inline: [] });

      // Block IDs should be different
      expect(paragraph.id).not.toBe(emptyParagraphId);
      expect(heading.id).not.toBe(emptyHeadingId);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Phase 5: Error Cases (TDD - RED → GREEN)
  // ─────────────────────────────────────────────────────────────────────────────

  describe('error cases', () => {
    it('throws OBJECT_NOT_FOUND for non-existent object', () => {
      seedBuiltInTypes(db);

      const nonExistentId = generateId();

      expect(() => duplicateObject(db, nonExistentId)).toThrow();

      try {
        duplicateObject(db, nonExistentId);
        throw new Error('Expected function to throw');
      } catch (error) {
        const apiError = error as {
          apiVersion: string;
          code: string;
          message: string;
          details?: unknown;
        };
        expect(apiError.apiVersion).toBe('v1');
        expect(apiError.code).toBe('NOT_FOUND_OBJECT');
        expect(apiError.message).toContain(nonExistentId);
        expect(apiError.details).toEqual({ objectId: nonExistentId });
      }
    });

    it('throws OBJECT_DELETED for soft-deleted object', () => {
      seedBuiltInTypes(db);

      const source = createObject(db, 'Page', 'To Be Deleted');

      // Soft-delete the object
      db.update(objects).set({ deletedAt: new Date() }).where(eq(objects.id, source.id)).run();

      expect(() => duplicateObject(db, source.id)).toThrow();

      try {
        duplicateObject(db, source.id);
        throw new Error('Expected function to throw');
      } catch (error) {
        const apiError = error as {
          apiVersion: string;
          code: string;
          message: string;
          details?: unknown;
        };
        expect(apiError.apiVersion).toBe('v1');
        expect(apiError.code).toBe('NOT_FOUND_OBJECT');
        expect(apiError.message).toContain(source.id);
      }
    });

    it('throws DAILY_NOTE_NOT_DUPLICABLE for DailyNote type', () => {
      seedBuiltInTypes(db);

      // Create a DailyNote object
      const dailyNote = createObject(db, 'DailyNote', '2024-01-15', {
        date_key: '2024-01-15',
      });

      // Verify the object was created with DailyNote type
      expect(dailyNote).toBeDefined();
      expect(dailyNote.typeKey).toBe('DailyNote');

      // Try to duplicate and expect error
      try {
        duplicateObject(db, dailyNote.id);
        throw new Error('Expected function to throw');
      } catch (error) {
        const apiError = error as {
          apiVersion: string;
          code: string;
          message: string;
          details?: unknown;
        };
        expect(apiError.apiVersion).toBe('v1');
        expect(apiError.code).toBe('INVARIANT_DAILY_NOTE_NOT_DUPLICABLE');
        expect(apiError.message).toContain('Cannot duplicate DailyNote objects');
        expect(apiError.details).toEqual({ objectId: dailyNote.id });
      }
    });
  });
});
