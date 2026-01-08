import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import {
  objectTypes,
  objects,
  blocks,
  refs,
  idempotency,
  attachments,
  blockAttachments,
  FTS_BLOCKS_TABLE_NAME,
  FTS_BLOCKS_CREATE_SQL,
} from './schema.js';
import { createTestDb, closeDb, type TypenoteDb } from './db.js';
import { seedBuiltInTypes } from './objectTypeService.js';
import { createObject } from './objectService.js';
import { applyBlockPatch } from './applyBlockPatch.js';
import type { ApplyBlockPatchInput } from '@typenote/api';
import { generateId } from '@typenote/core';
import { eq } from 'drizzle-orm';

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

// ============================================================================
// Attachments Tables (Phase 2 - TDD)
// ============================================================================

describe('attachments table', () => {
  it('exports attachments table with required columns', () => {
    // Table must exist
    expect(attachments).toBeDefined();

    // Required columns matching AttachmentSchema from packages/api/src/attachment.ts
    const columns = Object.keys(attachments);
    expect(columns).toContain('id'); // ULID primary key
    expect(columns).toContain('sha256'); // Content-addressed hash
    expect(columns).toContain('filename'); // Original filename
    expect(columns).toContain('mimeType'); // MIME type
    expect(columns).toContain('sizeBytes'); // File size
    expect(columns).toContain('lastReferencedAt'); // Last time referenced by a block
    expect(columns).toContain('orphanedAt'); // When attachment became orphaned (nullable)
    expect(columns).toContain('createdAt');
    expect(columns).toContain('updatedAt');
  });

  describe('database constraints', () => {
    let db: TypenoteDb;

    beforeEach(() => {
      db = createTestDb();
      seedBuiltInTypes(db);
    });

    afterEach(() => {
      closeDb(db);
    });

    it('has unique constraint on sha256', () => {
      const now = new Date();
      const sha256 = 'a'.repeat(64); // 64-char hex hash

      // First insert should succeed
      db.insert(attachments)
        .values({
          id: generateId(),
          sha256,
          filename: 'file1.png',
          mimeType: 'image/png',
          sizeBytes: 1024,
          lastReferencedAt: now,
          orphanedAt: null,
          createdAt: now,
          updatedAt: now,
        })
        .run();

      // Second insert with same sha256 should fail
      expect(() => {
        db.insert(attachments)
          .values({
            id: generateId(),
            sha256, // Same hash!
            filename: 'file2.png',
            mimeType: 'image/png',
            sizeBytes: 2048,
            lastReferencedAt: now,
            orphanedAt: null,
            createdAt: now,
            updatedAt: now,
          })
          .run();
      }).toThrow(/UNIQUE constraint failed/);
    });

    it('allows null orphanedAt', () => {
      const now = new Date();

      const result = db
        .insert(attachments)
        .values({
          id: generateId(),
          sha256: 'b'.repeat(64),
          filename: 'file.png',
          mimeType: 'image/png',
          sizeBytes: 1024,
          lastReferencedAt: now,
          orphanedAt: null,
          createdAt: now,
          updatedAt: now,
        })
        .run();

      expect(result.changes).toBe(1);
    });

    it('allows setting orphanedAt timestamp', () => {
      // Use a timestamp without milliseconds to match SQLite's integer storage
      const now = new Date(Math.floor(Date.now() / 1000) * 1000);
      const attachmentId = generateId();

      db.insert(attachments)
        .values({
          id: attachmentId,
          sha256: 'c'.repeat(64),
          filename: 'file.png',
          mimeType: 'image/png',
          sizeBytes: 1024,
          lastReferencedAt: now,
          orphanedAt: now, // Set orphaned timestamp
          createdAt: now,
          updatedAt: now,
        })
        .run();

      const found = db.select().from(attachments).where(eq(attachments.id, attachmentId)).get();
      expect(found?.['orphanedAt']).toEqual(now);
    });
  });
});

describe('block_attachments junction table', () => {
  it('exports blockAttachments table with required columns', () => {
    // Table must exist
    expect(blockAttachments).toBeDefined();

    // Required columns for junction table
    const columns = Object.keys(blockAttachments);
    expect(columns).toContain('blockId'); // FK to blocks
    expect(columns).toContain('attachmentId'); // FK to attachments
    expect(columns).toContain('createdAt');
  });

  describe('database constraints', () => {
    let db: TypenoteDb;

    beforeEach(() => {
      db = createTestDb();
      seedBuiltInTypes(db);
    });

    afterEach(() => {
      closeDb(db);
    });

    it('has composite primary key (blockId, attachmentId)', () => {
      const now = new Date();

      // Create an object and block
      const obj = createObject(db, 'Page', 'Test Page');
      const blockId = generateId();

      const input: ApplyBlockPatchInput = {
        apiVersion: 'v1',
        objectId: obj.id,
        ops: [
          {
            op: 'block.insert',
            blockId,
            parentBlockId: null,
            blockType: 'paragraph',
            content: { inline: [] },
          },
        ],
      };
      applyBlockPatch(db, input);

      // Create an attachment
      const attachmentId = generateId();
      db.insert(attachments)
        .values({
          id: attachmentId,
          sha256: 'd'.repeat(64),
          filename: 'file.png',
          mimeType: 'image/png',
          sizeBytes: 1024,
          lastReferencedAt: now,
          orphanedAt: null,
          createdAt: now,
          updatedAt: now,
        })
        .run();

      // First insert should succeed
      db.insert(blockAttachments)
        .values({
          blockId,
          attachmentId,
          createdAt: now,
        })
        .run();

      // Duplicate insert should fail (composite PK violation)
      expect(() => {
        db.insert(blockAttachments)
          .values({
            blockId,
            attachmentId,
            createdAt: now,
          })
          .run();
      }).toThrow(/UNIQUE constraint failed|PRIMARY KEY constraint failed/);
    });

    it('has foreign key to blocks table with cascade delete', () => {
      const now = new Date();

      // Create an object and block
      const obj = createObject(db, 'Page', 'Test Page');
      const blockId = generateId();

      const input: ApplyBlockPatchInput = {
        apiVersion: 'v1',
        objectId: obj.id,
        ops: [
          {
            op: 'block.insert',
            blockId,
            parentBlockId: null,
            blockType: 'paragraph',
            content: { inline: [] },
          },
        ],
      };
      applyBlockPatch(db, input);

      // Create an attachment
      const attachmentId = generateId();
      db.insert(attachments)
        .values({
          id: attachmentId,
          sha256: 'e'.repeat(64),
          filename: 'file.png',
          mimeType: 'image/png',
          sizeBytes: 1024,
          lastReferencedAt: now,
          orphanedAt: null,
          createdAt: now,
          updatedAt: now,
        })
        .run();

      // Create junction record
      db.insert(blockAttachments)
        .values({
          blockId,
          attachmentId,
          createdAt: now,
        })
        .run();

      // Verify junction exists
      const beforeDelete = db
        .select()
        .from(blockAttachments)
        .where(eq(blockAttachments.blockId, blockId))
        .all();
      expect(beforeDelete).toHaveLength(1);

      // Hard delete the block (cascade should remove junction)
      db.delete(blocks).where(eq(blocks.id, blockId)).run();

      // Junction should be deleted via cascade
      const afterDelete = db
        .select()
        .from(blockAttachments)
        .where(eq(blockAttachments.blockId, blockId))
        .all();
      expect(afterDelete).toHaveLength(0);

      // Attachment should still exist (not cascaded)
      const attachmentStillExists = db
        .select()
        .from(attachments)
        .where(eq(attachments.id, attachmentId))
        .get();
      expect(attachmentStillExists).toBeDefined();
    });

    it('has foreign key to attachments table with cascade delete', () => {
      const now = new Date();

      // Create an object and block
      const obj = createObject(db, 'Page', 'Test Page');
      const blockId = generateId();

      const input: ApplyBlockPatchInput = {
        apiVersion: 'v1',
        objectId: obj.id,
        ops: [
          {
            op: 'block.insert',
            blockId,
            parentBlockId: null,
            blockType: 'paragraph',
            content: { inline: [] },
          },
        ],
      };
      applyBlockPatch(db, input);

      // Create an attachment
      const attachmentId = generateId();
      db.insert(attachments)
        .values({
          id: attachmentId,
          sha256: 'f'.repeat(64),
          filename: 'file.png',
          mimeType: 'image/png',
          sizeBytes: 1024,
          lastReferencedAt: now,
          orphanedAt: null,
          createdAt: now,
          updatedAt: now,
        })
        .run();

      // Create junction record
      db.insert(blockAttachments)
        .values({
          blockId,
          attachmentId,
          createdAt: now,
        })
        .run();

      // Verify junction exists
      const beforeDelete = db
        .select()
        .from(blockAttachments)
        .where(eq(blockAttachments.attachmentId, attachmentId))
        .all();
      expect(beforeDelete).toHaveLength(1);

      // Delete the attachment (cascade should remove junction)
      db.delete(attachments).where(eq(attachments.id, attachmentId)).run();

      // Junction should be deleted via cascade
      const afterDelete = db
        .select()
        .from(blockAttachments)
        .where(eq(blockAttachments.attachmentId, attachmentId))
        .all();
      expect(afterDelete).toHaveLength(0);

      // Block should still exist (not cascaded)
      const blockStillExists = db.select().from(blocks).where(eq(blocks.id, blockId)).get();
      expect(blockStillExists).toBeDefined();
    });

    it('rejects insert with non-existent block', () => {
      const now = new Date();

      // Create an attachment
      const attachmentId = generateId();
      db.insert(attachments)
        .values({
          id: attachmentId,
          sha256: 'g'.repeat(64),
          filename: 'file.png',
          mimeType: 'image/png',
          sizeBytes: 1024,
          lastReferencedAt: now,
          orphanedAt: null,
          createdAt: now,
          updatedAt: now,
        })
        .run();

      // Try to create junction with non-existent block
      expect(() => {
        db.insert(blockAttachments)
          .values({
            blockId: generateId(), // Non-existent block
            attachmentId,
            createdAt: now,
          })
          .run();
      }).toThrow(/FOREIGN KEY constraint failed/);
    });

    it('rejects insert with non-existent attachment', () => {
      const now = new Date();

      // Create an object and block
      const obj = createObject(db, 'Page', 'Test Page');
      const blockId = generateId();

      const input: ApplyBlockPatchInput = {
        apiVersion: 'v1',
        objectId: obj.id,
        ops: [
          {
            op: 'block.insert',
            blockId,
            parentBlockId: null,
            blockType: 'paragraph',
            content: { inline: [] },
          },
        ],
      };
      applyBlockPatch(db, input);

      // Try to create junction with non-existent attachment
      expect(() => {
        db.insert(blockAttachments)
          .values({
            blockId,
            attachmentId: generateId(), // Non-existent attachment
            createdAt: now,
          })
          .run();
      }).toThrow(/FOREIGN KEY constraint failed/);
    });
  });
});
