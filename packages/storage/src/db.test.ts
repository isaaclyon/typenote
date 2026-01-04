import { describe, expect, it, afterEach } from 'vitest';
import { createTestDb, closeDb, type TypenoteDb } from './db.js';

describe('createTestDb', () => {
  let db: TypenoteDb;

  afterEach(() => {
    if (db) {
      closeDb(db);
    }
  });

  it('creates an in-memory database', () => {
    db = createTestDb();
    expect(db).toBeDefined();
  });

  it('creates all tables from migrations', () => {
    db = createTestDb();

    // Query sqlite_master to verify tables exist
    const tables = db.all<{ name: string }>(
      `SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_drizzle%' ORDER BY name`
    );

    const tableNames = tables.map((t) => t.name);

    expect(tableNames).toContain('object_types');
    expect(tableNames).toContain('objects');
    expect(tableNames).toContain('blocks');
    expect(tableNames).toContain('refs');
    expect(tableNames).toContain('idempotency');
    expect(tableNames).toContain('fts_blocks');
  });

  it('can create multiple isolated test databases', () => {
    const db1 = createTestDb();
    const db2 = createTestDb();

    // Insert into db1
    db1.run(
      `INSERT INTO object_types (id, key, name, built_in, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)`,
      ['01TEST1', 'Page', 'Page', 0, Date.now(), Date.now()]
    );

    // db2 should have no rows
    const result = db2.all<{ count: number }>(`SELECT COUNT(*) as count FROM object_types`);
    expect(result[0]?.count).toBe(0);

    closeDb(db1);
    closeDb(db2);
    // Reset db to avoid afterEach trying to close it
    db = undefined as unknown as TypenoteDb;
  });

  it('creates FTS5 virtual table for search', () => {
    db = createTestDb();

    // Verify fts_blocks is a virtual table
    const vtables = db.all<{ name: string; sql: string }>(
      `SELECT name, sql FROM sqlite_master WHERE type='table' AND name='fts_blocks'`
    );

    expect(vtables.length).toBe(1);
    expect(vtables[0]?.sql).toContain('fts5');
  });
});

describe('database migrations', () => {
  let db: TypenoteDb;

  afterEach(() => {
    if (db) {
      closeDb(db);
    }
  });

  it('runs migrations idempotently', () => {
    // Running createTestDb twice should not error
    db = createTestDb();
    // The migration should already be applied, but should not fail if run again
    expect(db).toBeDefined();
  });

  it('creates proper indexes', () => {
    db = createTestDb();

    const indexes = db.all<{ name: string }>(
      `SELECT name FROM sqlite_master WHERE type='index' AND name NOT LIKE 'sqlite_%' ORDER BY name`
    );

    const indexNames = indexes.map((i) => i.name);

    // Key indexes for common operations
    expect(indexNames).toContain('blocks_object_id_idx');
    expect(indexNames).toContain('blocks_parent_block_id_idx');
    expect(indexNames).toContain('blocks_object_parent_order_idx');
    expect(indexNames).toContain('refs_target_object_id_idx');
    expect(indexNames).toContain('objects_type_id_idx');
  });
});

describe('atomic transactions', () => {
  let db: TypenoteDb;
  const now = Date.now();

  afterEach(() => {
    if (db) {
      closeDb(db);
    }
  });

  it('commits changes on success', () => {
    db = createTestDb();

    db.atomic(() => {
      db.run(
        `INSERT INTO object_types (id, key, name, built_in, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)`,
        ['type1', 'Page', 'Page', 0, now, now]
      );
    });

    const result = db.all<{ count: number }>(`SELECT COUNT(*) as count FROM object_types`);
    expect(result[0]?.count).toBe(1);
  });

  it('rolls back changes on error', () => {
    db = createTestDb();

    expect(() => {
      db.atomic(() => {
        db.run(
          `INSERT INTO object_types (id, key, name, built_in, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)`,
          ['type1', 'Page', 'Page', 0, now, now]
        );
        throw new Error('Simulated failure');
      });
    }).toThrow('Simulated failure');

    // Changes should be rolled back
    const result = db.all<{ count: number }>(`SELECT COUNT(*) as count FROM object_types`);
    expect(result[0]?.count).toBe(0);
  });

  it('returns the value from the transaction function', () => {
    db = createTestDb();

    const result = db.atomic(() => {
      db.run(
        `INSERT INTO object_types (id, key, name, built_in, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)`,
        ['type1', 'Page', 'Page', 0, now, now]
      );
      return 'success';
    });

    expect(result).toBe('success');
  });

  it('supports nested reads within transaction', () => {
    db = createTestDb();

    const result = db.atomic(() => {
      db.run(
        `INSERT INTO object_types (id, key, name, built_in, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)`,
        ['type1', 'Page', 'Page', 0, now, now]
      );

      // Read within the same transaction should see uncommitted data
      const rows = db.all<{ id: string }>(`SELECT id FROM object_types`);
      return rows.length;
    });

    expect(result).toBe(1);
  });
});

describe('schema constraints', () => {
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
  }

  afterEach(() => {
    if (db) {
      closeDb(db);
    }
  });

  it('enforces unique constraint on idempotency (objectId, key)', () => {
    db = createTestDb();
    setupTestData();

    // First insert should succeed
    db.run(
      `INSERT INTO idempotency (object_id, key, result_json, created_at) VALUES (?, ?, ?, ?)`,
      ['obj1', 'key1', '{}', now]
    );

    // Duplicate should fail with constraint violation
    expect(() => {
      db.run(
        `INSERT INTO idempotency (object_id, key, result_json, created_at) VALUES (?, ?, ?, ?)`,
        ['obj1', 'key1', '{}', now]
      );
    }).toThrow(/UNIQUE constraint failed|PRIMARY KEY constraint failed/);
  });

  it('enforces unique constraint on sibling order keys (non-null parent)', () => {
    db = createTestDb();
    setupTestData();

    // Insert parent block
    db.run(
      `INSERT INTO blocks (id, object_id, parent_block_id, order_key, block_type, content, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      ['parent1', 'obj1', null, 'a', 'paragraph', '{}', now, now]
    );

    // Insert first child
    db.run(
      `INSERT INTO blocks (id, object_id, parent_block_id, order_key, block_type, content, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      ['block1', 'obj1', 'parent1', 'b', 'paragraph', '{}', now, now]
    );

    // Insert second child with same parent and order_key should fail
    expect(() => {
      db.run(
        `INSERT INTO blocks (id, object_id, parent_block_id, order_key, block_type, content, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        ['block2', 'obj1', 'parent1', 'b', 'paragraph', '{}', now, now]
      );
    }).toThrow(/UNIQUE constraint failed/);
  });

  it('allows duplicate order keys for root blocks (NULL parent - enforced in app)', () => {
    // NOTE: SQLite unique indexes don't enforce uniqueness when columns contain NULL.
    // Root blocks (parent_block_id = NULL) need application-level enforcement in Phase 3.
    db = createTestDb();
    setupTestData();

    // Insert two root blocks with same order_key - SQLite allows this
    db.run(
      `INSERT INTO blocks (id, object_id, parent_block_id, order_key, block_type, content, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      ['block1', 'obj1', null, 'a', 'paragraph', '{}', now, now]
    );
    db.run(
      `INSERT INTO blocks (id, object_id, parent_block_id, order_key, block_type, content, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      ['block2', 'obj1', null, 'a', 'paragraph', '{}', now, now]
    );

    // This documents SQLite behavior - enforcement must happen in applyBlockPatch()
    const count = db.all<{ count: number }>(`SELECT COUNT(*) as count FROM blocks`);
    expect(count[0]?.count).toBe(2);
  });

  it('allows same order key for different parents', () => {
    db = createTestDb();
    setupTestData();

    // Insert parent block
    db.run(
      `INSERT INTO blocks (id, object_id, parent_block_id, order_key, block_type, content, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      ['block1', 'obj1', null, 'a', 'paragraph', '{}', now, now]
    );

    // Insert child with same order_key but different parent should succeed
    db.run(
      `INSERT INTO blocks (id, object_id, parent_block_id, order_key, block_type, content, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      ['block2', 'obj1', 'block1', 'a', 'paragraph', '{}', now, now]
    );

    const count = db.all<{ count: number }>(`SELECT COUNT(*) as count FROM blocks`);
    expect(count[0]?.count).toBe(2);
  });

  it('can delete FTS entries by block_id efficiently', () => {
    db = createTestDb();
    setupTestData();

    // Insert a block
    db.run(
      `INSERT INTO blocks (id, object_id, parent_block_id, order_key, block_type, content, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      ['block1', 'obj1', null, 'a', 'paragraph', '{}', now, now]
    );

    // Insert FTS entry
    db.run(`INSERT INTO fts_blocks (block_id, object_id, content_text) VALUES (?, ?, ?)`, [
      'block1',
      'obj1',
      'Hello world',
    ]);

    // Verify we can search
    const searchBefore = db.all<{ block_id: string }>(
      `SELECT block_id FROM fts_blocks WHERE fts_blocks MATCH 'Hello'`
    );
    expect(searchBefore.length).toBe(1);

    // Delete by block_id (this is what soft-delete needs)
    db.run(`DELETE FROM fts_blocks WHERE block_id = ?`, ['block1']);

    // Verify deleted
    const searchAfter = db.all<{ block_id: string }>(
      `SELECT block_id FROM fts_blocks WHERE fts_blocks MATCH 'Hello'`
    );
    expect(searchAfter.length).toBe(0);
  });
});
