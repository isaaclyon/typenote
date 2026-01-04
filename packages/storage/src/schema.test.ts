import { describe, expect, it } from 'vitest';
import {
  objectTypes,
  objects,
  blocks,
  refs,
  idempotency,
  FTS_BLOCKS_TABLE_NAME,
  FTS_BLOCKS_CREATE_SQL,
} from './schema.js';

describe('object_types table', () => {
  it('exports objectTypes table with required columns', () => {
    // Table must exist
    expect(objectTypes).toBeDefined();

    // Required columns from bootstrap plan
    const columns = Object.keys(objectTypes);
    expect(columns).toContain('id'); // ULID primary key
    expect(columns).toContain('key'); // e.g., 'DailyNote', 'Page'
    expect(columns).toContain('name'); // Display name
    expect(columns).toContain('icon'); // Optional icon
    expect(columns).toContain('schema'); // JSON schema for properties
    expect(columns).toContain('builtIn'); // Is this a built-in type?
    expect(columns).toContain('createdAt');
    expect(columns).toContain('updatedAt');
  });
});

describe('objects table', () => {
  it('exports objects table with required columns', () => {
    expect(objects).toBeDefined();

    const columns = Object.keys(objects);
    expect(columns).toContain('id'); // ULID primary key
    expect(columns).toContain('typeId'); // FK to object_types
    expect(columns).toContain('title'); // Object title
    expect(columns).toContain('properties'); // JSON properties per type schema
    expect(columns).toContain('docVersion'); // Document version for optimistic concurrency
    expect(columns).toContain('createdAt');
    expect(columns).toContain('updatedAt');
    expect(columns).toContain('deletedAt'); // Soft delete
  });
});

describe('blocks table', () => {
  it('exports blocks table with required columns', () => {
    expect(blocks).toBeDefined();

    const columns = Object.keys(blocks);
    expect(columns).toContain('id'); // ULID primary key
    expect(columns).toContain('objectId'); // FK to objects
    expect(columns).toContain('parentBlockId'); // FK to blocks (nullable for root)
    expect(columns).toContain('orderKey'); // Lexicographic ordering key
    expect(columns).toContain('blockType'); // paragraph, heading, etc.
    expect(columns).toContain('content'); // JSON content per block type
    expect(columns).toContain('meta'); // JSON metadata (collapsed, etc.)
    expect(columns).toContain('createdAt');
    expect(columns).toContain('updatedAt');
    expect(columns).toContain('deletedAt'); // Soft delete
  });
});

describe('refs table', () => {
  it('exports refs table with required columns', () => {
    expect(refs).toBeDefined();

    const columns = Object.keys(refs);
    expect(columns).toContain('id'); // Primary key
    expect(columns).toContain('sourceBlockId'); // Block containing the reference
    expect(columns).toContain('sourceObjectId'); // Object containing the source block
    expect(columns).toContain('targetObjectId'); // Referenced object
    expect(columns).toContain('targetBlockId'); // Referenced block (optional)
    expect(columns).toContain('createdAt');
  });
});

describe('idempotency table', () => {
  it('exports idempotency table with required columns', () => {
    expect(idempotency).toBeDefined();

    const columns = Object.keys(idempotency);
    expect(columns).toContain('objectId'); // Object the key applies to
    expect(columns).toContain('key'); // Idempotency key
    expect(columns).toContain('resultJson'); // Cached result
    expect(columns).toContain('createdAt');
  });
});

describe('fts_blocks FTS5 virtual table', () => {
  it('exports FTS table name constant', () => {
    expect(FTS_BLOCKS_TABLE_NAME).toBe('fts_blocks');
  });

  it('exports CREATE VIRTUAL TABLE SQL for FTS5', () => {
    expect(FTS_BLOCKS_CREATE_SQL).toBeDefined();
    expect(FTS_BLOCKS_CREATE_SQL).toContain('CREATE VIRTUAL TABLE');
    expect(FTS_BLOCKS_CREATE_SQL).toContain('fts_blocks');
    expect(FTS_BLOCKS_CREATE_SQL).toContain('fts5');
    // Must include searchable content columns
    expect(FTS_BLOCKS_CREATE_SQL).toContain('block_id');
    expect(FTS_BLOCKS_CREATE_SQL).toContain('object_id');
    expect(FTS_BLOCKS_CREATE_SQL).toContain('content_text');
  });
});
