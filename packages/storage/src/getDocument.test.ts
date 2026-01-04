import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createTestDb, closeDb, type TypenoteDb } from './db.js';
import { createTestObjectType, createTestObject, createTestBlock } from './testFixtures.js';
import { getDocument } from './getDocument.js';

describe('getDocument', () => {
  let db: TypenoteDb;
  let typeId: string;

  beforeEach(() => {
    db = createTestDb();
    typeId = createTestObjectType(db, 'page');
  });

  afterEach(() => {
    closeDb(db);
  });

  describe('basic retrieval', () => {
    it('returns empty blocks array for object with no blocks', () => {
      const objectId = createTestObject(db, typeId, 'Empty Page');

      const doc = getDocument(db, objectId);

      expect(doc.objectId).toBe(objectId);
      expect(doc.blocks).toEqual([]);
      expect(doc.docVersion).toBe(0);
    });

    it('returns single root block', () => {
      const objectId = createTestObject(db, typeId, 'Test Page');
      const blockId = createTestBlock(db, objectId, null, 'a', 'paragraph', {
        inline: [{ t: 'text', text: 'Hello' }],
      });

      const doc = getDocument(db, objectId);

      expect(doc.blocks).toHaveLength(1);
      expect(doc.blocks[0]?.id).toBe(blockId);
      expect(doc.blocks[0]?.blockType).toBe('paragraph');
      expect(doc.blocks[0]?.children).toEqual([]);
    });

    it('returns multiple root blocks ordered by orderKey', () => {
      const objectId = createTestObject(db, typeId, 'Test Page');
      const blockC = createTestBlock(db, objectId, null, 'c', 'paragraph', {
        inline: [],
      });
      const blockA = createTestBlock(db, objectId, null, 'a', 'paragraph', {
        inline: [],
      });
      const blockB = createTestBlock(db, objectId, null, 'b', 'paragraph', {
        inline: [],
      });

      const doc = getDocument(db, objectId);

      expect(doc.blocks).toHaveLength(3);
      // Should be sorted by orderKey: a, b, c
      expect(doc.blocks[0]?.id).toBe(blockA);
      expect(doc.blocks[1]?.id).toBe(blockB);
      expect(doc.blocks[2]?.id).toBe(blockC);
    });

    it('throws NOT_FOUND_OBJECT for non-existent object', () => {
      expect(() => getDocument(db, '01NONEXISTENT00000000000')).toThrow('NOT_FOUND_OBJECT');
    });

    it('throws NOT_FOUND_OBJECT for deleted object', () => {
      const objectId = createTestObject(db, typeId, 'Test Page');
      // Soft-delete the object
      db.run('UPDATE objects SET deleted_at = ? WHERE id = ?', [Date.now(), objectId]);

      expect(() => getDocument(db, objectId)).toThrow('NOT_FOUND_OBJECT');
    });
  });

  describe('tree structure', () => {
    it('builds correct parent-child relationships', () => {
      const objectId = createTestObject(db, typeId, 'Test Page');
      const root = createTestBlock(db, objectId, null, 'a', 'paragraph', {
        inline: [],
      });
      const child = createTestBlock(db, objectId, root, 'a', 'paragraph', {
        inline: [],
      });

      const doc = getDocument(db, objectId);

      expect(doc.blocks).toHaveLength(1);
      expect(doc.blocks[0]?.id).toBe(root);
      expect(doc.blocks[0]?.children).toHaveLength(1);
      expect(doc.blocks[0]?.children[0]?.id).toBe(child);
    });

    it('orders children by orderKey within each parent', () => {
      const objectId = createTestObject(db, typeId, 'Test Page');
      const root = createTestBlock(db, objectId, null, 'a', 'paragraph', {
        inline: [],
      });
      const childC = createTestBlock(db, objectId, root, 'c', 'paragraph', {
        inline: [],
      });
      const childA = createTestBlock(db, objectId, root, 'a', 'paragraph', {
        inline: [],
      });
      const childB = createTestBlock(db, objectId, root, 'b', 'paragraph', {
        inline: [],
      });

      const doc = getDocument(db, objectId);

      const children = doc.blocks[0]?.children ?? [];
      expect(children).toHaveLength(3);
      expect(children[0]?.id).toBe(childA);
      expect(children[1]?.id).toBe(childB);
      expect(children[2]?.id).toBe(childC);
    });

    it('handles deeply nested trees (3+ levels)', () => {
      const objectId = createTestObject(db, typeId, 'Test Page');
      const level1 = createTestBlock(db, objectId, null, 'a', 'paragraph', {
        inline: [],
      });
      const level2 = createTestBlock(db, objectId, level1, 'a', 'paragraph', {
        inline: [],
      });
      const level3 = createTestBlock(db, objectId, level2, 'a', 'paragraph', {
        inline: [],
      });
      const level4 = createTestBlock(db, objectId, level3, 'a', 'paragraph', {
        inline: [],
      });

      const doc = getDocument(db, objectId);

      expect(doc.blocks[0]?.id).toBe(level1);
      expect(doc.blocks[0]?.children[0]?.id).toBe(level2);
      expect(doc.blocks[0]?.children[0]?.children[0]?.id).toBe(level3);
      expect(doc.blocks[0]?.children[0]?.children[0]?.children[0]?.id).toBe(level4);
    });

    it('handles multiple subtrees', () => {
      const objectId = createTestObject(db, typeId, 'Test Page');
      const root1 = createTestBlock(db, objectId, null, 'a', 'paragraph', {
        inline: [],
      });
      const root2 = createTestBlock(db, objectId, null, 'b', 'paragraph', {
        inline: [],
      });
      const child1 = createTestBlock(db, objectId, root1, 'a', 'paragraph', {
        inline: [],
      });
      const child2 = createTestBlock(db, objectId, root2, 'a', 'paragraph', {
        inline: [],
      });

      const doc = getDocument(db, objectId);

      expect(doc.blocks).toHaveLength(2);
      expect(doc.blocks[0]?.children[0]?.id).toBe(child1);
      expect(doc.blocks[1]?.children[0]?.id).toBe(child2);
    });
  });

  describe('soft delete filtering', () => {
    it('excludes deleted blocks by default', () => {
      const objectId = createTestObject(db, typeId, 'Test Page');
      const block1 = createTestBlock(db, objectId, null, 'a', 'paragraph', {
        inline: [],
      });
      const block2 = createTestBlock(db, objectId, null, 'b', 'paragraph', {
        inline: [],
      });

      // Soft-delete block1
      db.run('UPDATE blocks SET deleted_at = ? WHERE id = ?', [Date.now(), block1]);

      const doc = getDocument(db, objectId);

      expect(doc.blocks).toHaveLength(1);
      expect(doc.blocks[0]?.id).toBe(block2);
    });

    it('excludes descendants of deleted blocks', () => {
      const objectId = createTestObject(db, typeId, 'Test Page');
      const root = createTestBlock(db, objectId, null, 'a', 'paragraph', {
        inline: [],
      });
      // Child block - not used directly but affects test outcome
      createTestBlock(db, objectId, root, 'a', 'paragraph', {
        inline: [],
      });

      // Soft-delete root (but not child - simulating partial state)
      db.run('UPDATE blocks SET deleted_at = ? WHERE id = ?', [Date.now(), root]);

      const doc = getDocument(db, objectId);

      // Root is deleted, so we shouldn't see it or orphaned children
      expect(doc.blocks).toHaveLength(0);
    });

    it('includes deleted blocks when includeDeleted=true', () => {
      const objectId = createTestObject(db, typeId, 'Test Page');
      const block1 = createTestBlock(db, objectId, null, 'a', 'paragraph', {
        inline: [],
      });
      // Second block - not used directly but affects test outcome
      createTestBlock(db, objectId, null, 'b', 'paragraph', {
        inline: [],
      });

      // Soft-delete block1
      db.run('UPDATE blocks SET deleted_at = ? WHERE id = ?', [Date.now(), block1]);

      const doc = getDocument(db, objectId, { includeDeleted: true });

      expect(doc.blocks).toHaveLength(2);
    });
  });

  describe('content parsing', () => {
    it('parses JSON content field', () => {
      const objectId = createTestObject(db, typeId, 'Test Page');
      const content = { inline: [{ t: 'text', text: 'Hello' }] };
      createTestBlock(db, objectId, null, 'a', 'paragraph', content);

      const doc = getDocument(db, objectId);

      expect(doc.blocks[0]?.content).toEqual(content);
    });

    it('parses JSON meta field', () => {
      const objectId = createTestObject(db, typeId, 'Test Page');
      const blockId = createTestBlock(db, objectId, null, 'a', 'paragraph', {
        inline: [],
      });
      // Update meta via raw SQL
      db.run('UPDATE blocks SET meta = ? WHERE id = ?', [
        JSON.stringify({ collapsed: true }),
        blockId,
      ]);

      const doc = getDocument(db, objectId);

      expect(doc.blocks[0]?.meta).toEqual({ collapsed: true });
    });

    it('returns docVersion from object', () => {
      const objectId = createTestObject(db, typeId, 'Test Page');
      // Increment doc_version
      db.run('UPDATE objects SET doc_version = 5 WHERE id = ?', [objectId]);

      const doc = getDocument(db, objectId);

      expect(doc.docVersion).toBe(5);
    });
  });
});
