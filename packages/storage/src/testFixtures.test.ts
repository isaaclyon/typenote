import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createTestDb, closeDb, type TypenoteDb } from './db.js';
import {
  createTestObjectType,
  createTestObject,
  createTestBlock,
  getBlockById,
  getAllBlocks,
} from './testFixtures.js';

describe('test fixtures', () => {
  let db: TypenoteDb;

  beforeEach(() => {
    db = createTestDb();
  });

  afterEach(() => {
    closeDb(db);
  });

  describe('createTestObjectType', () => {
    it('creates object type and returns id', () => {
      const typeId = createTestObjectType(db, 'page');

      expect(typeId).toMatch(/^[0-9A-HJKMNP-TV-Z]{26}$/); // ULID format
    });

    it('creates object type with correct key', () => {
      const typeId = createTestObjectType(db, 'dailynote');

      const result = db.all<{ id: string; key: string }>(
        'SELECT id, key FROM object_types WHERE id = ?',
        [typeId]
      );
      expect(result).toHaveLength(1);
      expect(result[0]?.key).toBe('dailynote');
    });
  });

  describe('createTestObject', () => {
    it('creates object with type and returns id', () => {
      const typeId = createTestObjectType(db, 'page');
      const objectId = createTestObject(db, typeId, 'Test Page');

      expect(objectId).toMatch(/^[0-9A-HJKMNP-TV-Z]{26}$/);
    });

    it('creates object with docVersion 0', () => {
      const typeId = createTestObjectType(db, 'page');
      const objectId = createTestObject(db, typeId, 'Test Page');

      const result = db.all<{ doc_version: number }>(
        'SELECT doc_version FROM objects WHERE id = ?',
        [objectId]
      );
      expect(result[0]?.doc_version).toBe(0);
    });

    it('creates object with correct title', () => {
      const typeId = createTestObjectType(db, 'page');
      const objectId = createTestObject(db, typeId, 'My Title');

      const result = db.all<{ title: string }>('SELECT title FROM objects WHERE id = ?', [
        objectId,
      ]);
      expect(result[0]?.title).toBe('My Title');
    });
  });

  describe('createTestBlock', () => {
    it('creates block and returns id', () => {
      const typeId = createTestObjectType(db, 'page');
      const objectId = createTestObject(db, typeId, 'Test Page');

      const blockId = createTestBlock(db, objectId, null, 'a', 'paragraph', {
        inline: [],
      });

      expect(blockId).toMatch(/^[0-9A-HJKMNP-TV-Z]{26}$/);
    });

    it('creates block with correct objectId', () => {
      const typeId = createTestObjectType(db, 'page');
      const objectId = createTestObject(db, typeId, 'Test Page');
      const blockId = createTestBlock(db, objectId, null, 'a', 'paragraph', {
        inline: [],
      });

      const result = db.all<{ object_id: string }>('SELECT object_id FROM blocks WHERE id = ?', [
        blockId,
      ]);
      expect(result[0]?.object_id).toBe(objectId);
    });

    it('creates block with null parentBlockId for root', () => {
      const typeId = createTestObjectType(db, 'page');
      const objectId = createTestObject(db, typeId, 'Test Page');
      const blockId = createTestBlock(db, objectId, null, 'a', 'paragraph', {
        inline: [],
      });

      const result = db.all<{ parent_block_id: string | null }>(
        'SELECT parent_block_id FROM blocks WHERE id = ?',
        [blockId]
      );
      expect(result[0]?.parent_block_id).toBeNull();
    });

    it('creates child block with parentBlockId', () => {
      const typeId = createTestObjectType(db, 'page');
      const objectId = createTestObject(db, typeId, 'Test Page');
      const rootId = createTestBlock(db, objectId, null, 'a', 'paragraph', {
        inline: [],
      });
      const childId = createTestBlock(db, objectId, rootId, 'a', 'paragraph', {
        inline: [],
      });

      const result = db.all<{ parent_block_id: string | null }>(
        'SELECT parent_block_id FROM blocks WHERE id = ?',
        [childId]
      );
      expect(result[0]?.parent_block_id).toBe(rootId);
    });

    it('stores content as JSON', () => {
      const typeId = createTestObjectType(db, 'page');
      const objectId = createTestObject(db, typeId, 'Test Page');
      const content = { inline: [{ t: 'text', text: 'Hello' }] };
      const blockId = createTestBlock(db, objectId, null, 'a', 'paragraph', content);

      const result = db.all<{ content: string }>('SELECT content FROM blocks WHERE id = ?', [
        blockId,
      ]);
      expect(JSON.parse(result[0]?.content ?? '{}')).toEqual(content);
    });
  });

  describe('getBlockById', () => {
    it('returns block when exists', () => {
      const typeId = createTestObjectType(db, 'page');
      const objectId = createTestObject(db, typeId, 'Test Page');
      const blockId = createTestBlock(db, objectId, null, 'a', 'paragraph', {
        inline: [],
      });

      const block = getBlockById(db, blockId);

      expect(block).not.toBeNull();
      expect(block?.id).toBe(blockId);
      expect(block?.objectId).toBe(objectId);
      expect(block?.blockType).toBe('paragraph');
    });

    it('returns null when block does not exist', () => {
      const block = getBlockById(db, '01NONEXISTENT00000000000');

      expect(block).toBeNull();
    });
  });

  describe('getAllBlocks', () => {
    it('returns empty array for object with no blocks', () => {
      const typeId = createTestObjectType(db, 'page');
      const objectId = createTestObject(db, typeId, 'Empty Page');

      const blocks = getAllBlocks(db, objectId);

      expect(blocks).toEqual([]);
    });

    it('returns all blocks for object', () => {
      const typeId = createTestObjectType(db, 'page');
      const objectId = createTestObject(db, typeId, 'Test Page');
      const block1 = createTestBlock(db, objectId, null, 'a', 'paragraph', {
        inline: [],
      });
      const block2 = createTestBlock(db, objectId, null, 'b', 'paragraph', {
        inline: [],
      });

      const blocks = getAllBlocks(db, objectId);

      expect(blocks).toHaveLength(2);
      expect(blocks.map((b) => b.id).sort()).toEqual([block1, block2].sort());
    });

    it('excludes deleted blocks', () => {
      const typeId = createTestObjectType(db, 'page');
      const objectId = createTestObject(db, typeId, 'Test Page');
      const block1 = createTestBlock(db, objectId, null, 'a', 'paragraph', {
        inline: [],
      });
      createTestBlock(db, objectId, null, 'b', 'paragraph', { inline: [] });

      // Soft-delete one block
      db.run('UPDATE blocks SET deleted_at = ? WHERE id = ?', [Date.now(), block1]);

      const blocks = getAllBlocks(db, objectId);

      expect(blocks).toHaveLength(1);
    });
  });
});
