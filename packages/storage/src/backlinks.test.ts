import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createTestDb, closeDb, type TypenoteDb } from './db.js';
import { getBacklinks } from './backlinks.js';
import { updateRefsForBlock } from './indexing.js';

describe('getBacklinks', () => {
  let db: TypenoteDb;
  const now = Date.now();

  function setupTestData() {
    db.run(
      `INSERT INTO object_types (id, key, name, built_in, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)`,
      ['type1', 'Page', 'Page', 0, now, now]
    );
    // Create target object
    db.run(
      `INSERT INTO objects (id, type_id, title, doc_version, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)`,
      ['target', 'type1', 'Target Object', 0, now, now]
    );
    // Create source object
    db.run(
      `INSERT INTO objects (id, type_id, title, doc_version, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)`,
      ['source', 'type1', 'Source Object', 0, now, now]
    );
  }

  beforeEach(() => {
    db = createTestDb();
    setupTestData();
  });

  afterEach(() => {
    closeDb(db);
  });

  it('returns empty array when no backlinks exist', () => {
    const result = getBacklinks(db, 'target');
    expect(result).toHaveLength(0);
  });

  it('returns backlinks from blocks referencing the object', () => {
    // Create a block that references target
    db.run(
      `INSERT INTO blocks (id, object_id, parent_block_id, order_key, block_type, content, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      ['block1', 'source', null, 'a', 'paragraph', '{}', now, now]
    );

    const content = {
      inline: [{ t: 'ref', mode: 'link', target: { kind: 'object', objectId: 'target' } }],
    };
    updateRefsForBlock(db, 'block1', 'source', 'paragraph', content);

    const result = getBacklinks(db, 'target');
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      sourceBlockId: 'block1',
      sourceObjectId: 'source',
      sourceObjectTitle: 'Source Object',
      targetBlockId: null,
    });
  });

  it('returns multiple backlinks from different blocks', () => {
    // Create two blocks that reference target
    db.run(
      `INSERT INTO blocks (id, object_id, parent_block_id, order_key, block_type, content, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      ['block1', 'source', null, 'a', 'paragraph', '{}', now, now]
    );
    db.run(
      `INSERT INTO blocks (id, object_id, parent_block_id, order_key, block_type, content, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      ['block2', 'source', null, 'b', 'paragraph', '{}', now, now]
    );

    const content = {
      inline: [{ t: 'ref', mode: 'link', target: { kind: 'object', objectId: 'target' } }],
    };
    updateRefsForBlock(db, 'block1', 'source', 'paragraph', content);
    updateRefsForBlock(db, 'block2', 'source', 'paragraph', content);

    const result = getBacklinks(db, 'target');
    expect(result).toHaveLength(2);
  });

  it('excludes backlinks from deleted blocks', () => {
    // Create a block that references target
    db.run(
      `INSERT INTO blocks (id, object_id, parent_block_id, order_key, block_type, content, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      ['block1', 'source', null, 'a', 'paragraph', '{}', now, now]
    );

    const content = {
      inline: [{ t: 'ref', mode: 'link', target: { kind: 'object', objectId: 'target' } }],
    };
    updateRefsForBlock(db, 'block1', 'source', 'paragraph', content);

    // Soft-delete the block
    db.run('UPDATE blocks SET deleted_at = ? WHERE id = ?', [now, 'block1']);

    const result = getBacklinks(db, 'target');
    expect(result).toHaveLength(0);
  });

  it('includes block-level reference targets', () => {
    // Create a block in target object
    db.run(
      `INSERT INTO blocks (id, object_id, parent_block_id, order_key, block_type, content, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      ['targetBlock', 'target', null, 'a', 'paragraph', '{}', now, now]
    );

    // Create a block that references the specific block
    db.run(
      `INSERT INTO blocks (id, object_id, parent_block_id, order_key, block_type, content, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      ['block1', 'source', null, 'a', 'paragraph', '{}', now, now]
    );

    const content = {
      inline: [
        {
          t: 'ref',
          mode: 'link',
          target: { kind: 'block', objectId: 'target', blockId: 'targetBlock' },
        },
      ],
    };
    updateRefsForBlock(db, 'block1', 'source', 'paragraph', content);

    const result = getBacklinks(db, 'target');
    expect(result).toHaveLength(1);
    expect(result[0]?.targetBlockId).toBe('targetBlock');
  });

  it('returns backlinks from different source objects', () => {
    // Create another source object
    db.run(
      `INSERT INTO objects (id, type_id, title, doc_version, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)`,
      ['source2', 'type1', 'Another Source', 0, now, now]
    );

    // Create blocks in different objects that reference target
    db.run(
      `INSERT INTO blocks (id, object_id, parent_block_id, order_key, block_type, content, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      ['block1', 'source', null, 'a', 'paragraph', '{}', now, now]
    );
    db.run(
      `INSERT INTO blocks (id, object_id, parent_block_id, order_key, block_type, content, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      ['block2', 'source2', null, 'a', 'paragraph', '{}', now, now]
    );

    const content = {
      inline: [{ t: 'ref', mode: 'link', target: { kind: 'object', objectId: 'target' } }],
    };
    updateRefsForBlock(db, 'block1', 'source', 'paragraph', content);
    updateRefsForBlock(db, 'block2', 'source2', 'paragraph', content);

    const result = getBacklinks(db, 'target');
    expect(result).toHaveLength(2);

    const sourceObjectIds = result.map((r) => r.sourceObjectId).sort();
    expect(sourceObjectIds).toEqual(['source', 'source2']);
  });
});
