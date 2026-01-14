import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createTestDb, closeDb, type TypenoteDb } from './db.js';
import { searchBlocks } from './search.js';
import { updateFtsForBlock } from './indexing.js';

describe('searchBlocks', () => {
  let db: TypenoteDb;
  const now = Date.now();

  function setupTestData() {
    db.run(
      `INSERT INTO object_types (id, key, name, built_in, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)`,
      ['type1', 'Page', 'Page', 0, now, now]
    );
    db.run(
      `INSERT INTO objects (id, type_id, title, doc_version, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)`,
      ['obj1', 'type1', 'Object 1', 0, now, now]
    );
    db.run(
      `INSERT INTO objects (id, type_id, title, doc_version, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)`,
      ['obj2', 'type1', 'Object 2', 0, now, now]
    );
  }

  beforeEach(() => {
    db = createTestDb();
    setupTestData();
  });

  afterEach(() => {
    closeDb(db);
  });

  it('returns empty array when no matches', () => {
    const result = searchBlocks(db, 'nonexistent');
    expect(result).toHaveLength(0);
  });

  it('returns empty array for empty query', () => {
    const result = searchBlocks(db, '');
    expect(result).toHaveLength(0);
  });

  it('returns empty array for whitespace-only query', () => {
    const result = searchBlocks(db, '   ');
    expect(result).toHaveLength(0);
  });

  it('returns matching blocks', () => {
    // Create a block with searchable content
    db.run(
      `INSERT INTO blocks (id, object_id, parent_block_id, order_key, block_type, content, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      ['block1', 'obj1', null, 'a', 'paragraph', '{}', now, now]
    );

    const content = { inline: [{ t: 'text', text: 'Hello world' }] };
    updateFtsForBlock(db, 'block1', 'obj1', 'paragraph', content);

    const result = searchBlocks(db, 'Hello');
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      blockId: 'block1',
      objectId: 'obj1',
    });
  });

  it('returns multiple matching blocks', () => {
    // Create two blocks with matching content
    db.run(
      `INSERT INTO blocks (id, object_id, parent_block_id, order_key, block_type, content, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      ['block1', 'obj1', null, 'a', 'paragraph', '{}', now, now]
    );
    db.run(
      `INSERT INTO blocks (id, object_id, parent_block_id, order_key, block_type, content, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      ['block2', 'obj1', null, 'b', 'paragraph', '{}', now, now]
    );

    updateFtsForBlock(db, 'block1', 'obj1', 'paragraph', {
      inline: [{ t: 'text', text: 'Hello world' }],
    });
    updateFtsForBlock(db, 'block2', 'obj1', 'paragraph', {
      inline: [{ t: 'text', text: 'Hello there' }],
    });

    const result = searchBlocks(db, 'Hello');
    expect(result).toHaveLength(2);
  });

  it('respects objectId filter', () => {
    // Create blocks in different objects
    db.run(
      `INSERT INTO blocks (id, object_id, parent_block_id, order_key, block_type, content, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      ['block1', 'obj1', null, 'a', 'paragraph', '{}', now, now]
    );
    db.run(
      `INSERT INTO blocks (id, object_id, parent_block_id, order_key, block_type, content, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      ['block2', 'obj2', null, 'a', 'paragraph', '{}', now, now]
    );

    const content = { inline: [{ t: 'text', text: 'Hello world' }] };
    updateFtsForBlock(db, 'block1', 'obj1', 'paragraph', content);
    updateFtsForBlock(db, 'block2', 'obj2', 'paragraph', content);

    const result = searchBlocks(db, 'Hello', { objectId: 'obj1' });
    expect(result).toHaveLength(1);
    expect(result[0]?.objectId).toBe('obj1');
  });

  it('respects limit filter', () => {
    // Create multiple blocks
    for (let i = 1; i <= 5; i++) {
      db.run(
        `INSERT INTO blocks (id, object_id, parent_block_id, order_key, block_type, content, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [`block${i}`, 'obj1', null, String.fromCharCode(96 + i), 'paragraph', '{}', now, now]
      );
      updateFtsForBlock(db, `block${i}`, 'obj1', 'paragraph', {
        inline: [{ t: 'text', text: 'Hello world' }],
      });
    }

    const result = searchBlocks(db, 'Hello', { limit: 3 });
    expect(result).toHaveLength(3);
  });

  it('excludes deleted blocks', () => {
    // Create a block with searchable content
    db.run(
      `INSERT INTO blocks (id, object_id, parent_block_id, order_key, block_type, content, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      ['block1', 'obj1', null, 'a', 'paragraph', '{}', now, now]
    );

    const content = { inline: [{ t: 'text', text: 'Hello world' }] };
    updateFtsForBlock(db, 'block1', 'obj1', 'paragraph', content);

    // Soft-delete the block
    db.run('UPDATE blocks SET deleted_at = ? WHERE id = ?', [now, 'block1']);

    const result = searchBlocks(db, 'Hello');
    expect(result).toHaveLength(0);
  });

  it('uses default limit of 50', () => {
    // Create 60 blocks
    for (let i = 1; i <= 60; i++) {
      const id = `block${i.toString().padStart(2, '0')}`;
      db.run(
        `INSERT INTO blocks (id, object_id, parent_block_id, order_key, block_type, content, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, 'obj1', null, id, 'paragraph', '{}', now, now]
      );
      updateFtsForBlock(db, id, 'obj1', 'paragraph', {
        inline: [{ t: 'text', text: 'Hello world' }],
      });
    }

    const result = searchBlocks(db, 'Hello');
    expect(result).toHaveLength(50);
  });

  it('supports FTS5 query syntax', () => {
    // Create blocks with different content
    db.run(
      `INSERT INTO blocks (id, object_id, parent_block_id, order_key, block_type, content, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      ['block1', 'obj1', null, 'a', 'paragraph', '{}', now, now]
    );
    db.run(
      `INSERT INTO blocks (id, object_id, parent_block_id, order_key, block_type, content, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      ['block2', 'obj1', null, 'b', 'paragraph', '{}', now, now]
    );

    updateFtsForBlock(db, 'block1', 'obj1', 'paragraph', {
      inline: [{ t: 'text', text: 'Hello world' }],
    });
    updateFtsForBlock(db, 'block2', 'obj1', 'paragraph', {
      inline: [{ t: 'text', text: 'Goodbye world' }],
    });

    // Use FTS5 prefix search
    const result = searchBlocks(db, 'Hell*');
    expect(result).toHaveLength(1);
    expect(result[0]?.blockId).toBe('block1');
  });
});
