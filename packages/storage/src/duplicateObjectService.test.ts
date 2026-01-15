import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createTestDb, closeDb, type TypenoteDb } from './db.js';
import { seedBuiltInTypes, createObjectType } from './objectTypeService.js';
import { createObject } from './objectService.js';
import { applyBlockPatch } from './applyBlockPatch.js';
import { getDocument } from './getDocument.js';
import { duplicateObject } from './duplicateObjectService.js';
import { generateId } from '@typenote/core';

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
});
