import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createTestDb, closeDb, type TypenoteDb } from './db.js';
import { refs } from './schema.js';
import {
  updateRefsForBlock,
  updateFtsForBlock,
  deleteRefsForBlocks,
  deleteFtsForBlocks,
} from './indexing.js';
import { eq } from 'drizzle-orm';

describe('indexing', () => {
  let db: TypenoteDb;
  const now = Date.now();

  // Helper to set up required data
  function setupTestData() {
    db.run(
      `INSERT INTO object_types (id, key, name, built_in, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)`,
      ['type1', 'Page', 'Page', 0, now, now]
    );
    db.run(
      `INSERT INTO objects (id, type_id, title, doc_version, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)`,
      ['obj1', 'type1', 'Test Object', 0, now, now]
    );
    db.run(
      `INSERT INTO objects (id, type_id, title, doc_version, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)`,
      ['obj2', 'type1', 'Target Object', 0, now, now]
    );
    db.run(
      `INSERT INTO blocks (id, object_id, parent_block_id, order_key, block_type, content, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      ['block1', 'obj1', null, 'a', 'paragraph', '{}', now, now]
    );
  }

  beforeEach(() => {
    db = createTestDb();
    setupTestData();
  });

  afterEach(() => {
    closeDb(db);
  });

  describe('updateRefsForBlock', () => {
    it('inserts refs for block with object references', () => {
      const content = {
        inline: [
          { t: 'text', text: 'Hello ' },
          { t: 'ref', mode: 'link', target: { kind: 'object', objectId: 'obj2' } },
        ],
      };

      updateRefsForBlock(db, 'block1', 'obj1', 'paragraph', content);

      const refsResult = db.select().from(refs).where(eq(refs.sourceBlockId, 'block1')).all();
      expect(refsResult).toHaveLength(1);
      expect(refsResult[0]?.targetObjectId).toBe('obj2');
      expect(refsResult[0]?.targetBlockId).toBeNull();
    });

    it('inserts refs for block with block references', () => {
      const content = {
        inline: [
          {
            t: 'ref',
            mode: 'link',
            target: { kind: 'block', objectId: 'obj2', blockId: 'block2' },
          },
        ],
      };

      updateRefsForBlock(db, 'block1', 'obj1', 'paragraph', content);

      const refsResult = db.select().from(refs).where(eq(refs.sourceBlockId, 'block1')).all();
      expect(refsResult).toHaveLength(1);
      expect(refsResult[0]?.targetObjectId).toBe('obj2');
      expect(refsResult[0]?.targetBlockId).toBe('block2');
    });

    it('deletes old refs and inserts new ones on update', () => {
      // Initial content with ref to obj2
      const content1 = {
        inline: [{ t: 'ref', mode: 'link', target: { kind: 'object', objectId: 'obj2' } }],
      };
      updateRefsForBlock(db, 'block1', 'obj1', 'paragraph', content1);

      // Create another object to reference
      db.run(
        `INSERT INTO objects (id, type_id, title, doc_version, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)`,
        ['obj3', 'type1', 'Another Object', 0, now, now]
      );

      // Update with ref to obj3 instead
      const content2 = {
        inline: [{ t: 'ref', mode: 'link', target: { kind: 'object', objectId: 'obj3' } }],
      };
      updateRefsForBlock(db, 'block1', 'obj1', 'paragraph', content2);

      const refsResult = db.select().from(refs).where(eq(refs.sourceBlockId, 'block1')).all();
      expect(refsResult).toHaveLength(1);
      expect(refsResult[0]?.targetObjectId).toBe('obj3');
    });

    it('handles content with no refs', () => {
      const content = {
        inline: [{ t: 'text', text: 'Hello world' }],
      };

      updateRefsForBlock(db, 'block1', 'obj1', 'paragraph', content);

      const refsResult = db.select().from(refs).where(eq(refs.sourceBlockId, 'block1')).all();
      expect(refsResult).toHaveLength(0);
    });

    it('handles multiple refs in same block', () => {
      const content = {
        inline: [
          { t: 'ref', mode: 'link', target: { kind: 'object', objectId: 'obj2' } },
          { t: 'text', text: ' and ' },
          { t: 'ref', mode: 'link', target: { kind: 'object', objectId: 'obj2' } },
        ],
      };

      updateRefsForBlock(db, 'block1', 'obj1', 'paragraph', content);

      const refsResult = db.select().from(refs).where(eq(refs.sourceBlockId, 'block1')).all();
      expect(refsResult).toHaveLength(2);
    });
  });

  describe('updateFtsForBlock', () => {
    it('inserts FTS entry for block with text', () => {
      const content = {
        inline: [{ t: 'text', text: 'Hello world' }],
      };

      updateFtsForBlock(db, 'block1', 'obj1', 'paragraph', content);

      const ftsResult = db.all<{ block_id: string }>(
        `SELECT block_id FROM fts_blocks WHERE fts_blocks MATCH 'Hello'`
      );
      expect(ftsResult).toHaveLength(1);
      expect(ftsResult[0]?.block_id).toBe('block1');
    });

    it('updates FTS entry on content change', () => {
      // Initial content
      const content1 = { inline: [{ t: 'text', text: 'Hello world' }] };
      updateFtsForBlock(db, 'block1', 'obj1', 'paragraph', content1);

      // Update content
      const content2 = { inline: [{ t: 'text', text: 'Goodbye world' }] };
      updateFtsForBlock(db, 'block1', 'obj1', 'paragraph', content2);

      // Should not find old content
      const oldResult = db.all<{ block_id: string }>(
        `SELECT block_id FROM fts_blocks WHERE fts_blocks MATCH 'Hello'`
      );
      expect(oldResult).toHaveLength(0);

      // Should find new content
      const newResult = db.all<{ block_id: string }>(
        `SELECT block_id FROM fts_blocks WHERE fts_blocks MATCH 'Goodbye'`
      );
      expect(newResult).toHaveLength(1);
    });

    it('handles empty content', () => {
      const content = { inline: [] };

      updateFtsForBlock(db, 'block1', 'obj1', 'paragraph', content);

      const ftsResult = db.all<{ block_id: string }>(
        `SELECT block_id FROM fts_blocks WHERE block_id = 'block1'`
      );
      expect(ftsResult).toHaveLength(0);
    });
  });

  describe('deleteRefsForBlocks', () => {
    it('deletes refs for multiple blocks', () => {
      // Add another block
      db.run(
        `INSERT INTO blocks (id, object_id, parent_block_id, order_key, block_type, content, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        ['block2', 'obj1', null, 'b', 'paragraph', '{}', now, now]
      );

      // Add refs for both blocks
      const content = {
        inline: [{ t: 'ref', mode: 'link', target: { kind: 'object', objectId: 'obj2' } }],
      };
      updateRefsForBlock(db, 'block1', 'obj1', 'paragraph', content);
      updateRefsForBlock(db, 'block2', 'obj1', 'paragraph', content);

      // Delete refs for both
      deleteRefsForBlocks(db, ['block1', 'block2']);

      const refsResult = db.select().from(refs).all();
      expect(refsResult).toHaveLength(0);
    });

    it('handles empty array', () => {
      // Should not throw
      deleteRefsForBlocks(db, []);
    });
  });

  describe('deleteFtsForBlocks', () => {
    it('deletes FTS entries for multiple blocks', () => {
      // Add another block
      db.run(
        `INSERT INTO blocks (id, object_id, parent_block_id, order_key, block_type, content, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        ['block2', 'obj1', null, 'b', 'paragraph', '{}', now, now]
      );

      // Add FTS for both blocks
      const content = { inline: [{ t: 'text', text: 'Hello world' }] };
      updateFtsForBlock(db, 'block1', 'obj1', 'paragraph', content);
      updateFtsForBlock(db, 'block2', 'obj1', 'paragraph', content);

      // Delete FTS for both
      deleteFtsForBlocks(db, ['block1', 'block2']);

      const ftsResult = db.all<{ block_id: string }>(
        `SELECT block_id FROM fts_blocks WHERE fts_blocks MATCH 'Hello'`
      );
      expect(ftsResult).toHaveLength(0);
    });

    it('handles empty array', () => {
      // Should not throw
      deleteFtsForBlocks(db, []);
    });
  });

  describe('transaction rollback', () => {
    it('rolls back refs changes on error', () => {
      const content = {
        inline: [{ t: 'ref', mode: 'link', target: { kind: 'object', objectId: 'obj2' } }],
      };

      expect(() => {
        db.atomic(() => {
          updateRefsForBlock(db, 'block1', 'obj1', 'paragraph', content);
          throw new Error('Simulated failure');
        });
      }).toThrow('Simulated failure');

      // Refs should not be persisted
      const refsResult = db.select().from(refs).where(eq(refs.sourceBlockId, 'block1')).all();
      expect(refsResult).toHaveLength(0);
    });

    it('rolls back FTS changes on error', () => {
      const content = { inline: [{ t: 'text', text: 'Hello world' }] };

      expect(() => {
        db.atomic(() => {
          updateFtsForBlock(db, 'block1', 'obj1', 'paragraph', content);
          throw new Error('Simulated failure');
        });
      }).toThrow('Simulated failure');

      // FTS should not be persisted
      const ftsResult = db.all<{ block_id: string }>(
        `SELECT block_id FROM fts_blocks WHERE fts_blocks MATCH 'Hello'`
      );
      expect(ftsResult).toHaveLength(0);
    });
  });
});
