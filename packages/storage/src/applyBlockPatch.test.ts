import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createTestDb, closeDb, type TypenoteDb } from './db.js';
import {
  createTestObjectType,
  createTestObject,
  createTestBlock,
  getBlockById,
} from './testFixtures.js';
import { generateId } from '@typenote/core';
import { applyBlockPatch } from './applyBlockPatch.js';
import type { ApplyBlockPatchInput } from '@typenote/api';

describe('applyBlockPatch - framework', () => {
  let db: TypenoteDb;
  let typeId: string;
  let objectId: string;

  beforeEach(() => {
    db = createTestDb();
    typeId = createTestObjectType(db, 'page');
    objectId = createTestObject(db, typeId, 'Test Page');
  });

  afterEach(() => {
    closeDb(db);
  });

  describe('input validation', () => {
    it('returns validation error for invalid apiVersion', () => {
      const input = {
        apiVersion: 'v2' as 'v1', // wrong version
        objectId,
        ops: [],
      };

      const result = applyBlockPatch(db, input);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('VALIDATION');
      }
    });

    it('returns validation error for invalid objectId format', () => {
      const input: ApplyBlockPatchInput = {
        apiVersion: 'v1',
        objectId: 'not-a-ulid',
        ops: [],
      };

      const result = applyBlockPatch(db, input);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('VALIDATION');
      }
    });
  });

  describe('object existence', () => {
    it('returns NOT_FOUND_OBJECT for non-existent object', () => {
      const input: ApplyBlockPatchInput = {
        apiVersion: 'v1',
        objectId: '01HGW2N7XYZABCDEFGHJKMNPQR', // Valid ULID format, doesn't exist
        ops: [],
      };

      const result = applyBlockPatch(db, input);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('NOT_FOUND_OBJECT');
      }
    });

    it('returns NOT_FOUND_OBJECT for deleted object', () => {
      db.run('UPDATE objects SET deleted_at = ? WHERE id = ?', [Date.now(), objectId]);

      const input: ApplyBlockPatchInput = {
        apiVersion: 'v1',
        objectId,
        ops: [],
      };

      const result = applyBlockPatch(db, input);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('NOT_FOUND_OBJECT');
      }
    });
  });

  describe('version conflict', () => {
    it('succeeds when baseDocVersion matches current', () => {
      const input: ApplyBlockPatchInput = {
        apiVersion: 'v1',
        objectId,
        baseDocVersion: 0,
        ops: [],
      };

      const result = applyBlockPatch(db, input);

      expect(result.success).toBe(true);
    });

    it('returns CONFLICT_VERSION when baseDocVersion does not match', () => {
      const input: ApplyBlockPatchInput = {
        apiVersion: 'v1',
        objectId,
        baseDocVersion: 5, // Object has version 0
        ops: [],
      };

      const result = applyBlockPatch(db, input);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('CONFLICT_VERSION');
        expect(result.error.details).toEqual({ expected: 5, actual: 0 });
      }
    });

    it('succeeds without baseDocVersion (last-writer-wins)', () => {
      const input: ApplyBlockPatchInput = {
        apiVersion: 'v1',
        objectId,
        ops: [],
      };

      const result = applyBlockPatch(db, input);

      expect(result.success).toBe(true);
    });
  });

  describe('idempotency', () => {
    it('returns cached result for same idempotencyKey', () => {
      const input: ApplyBlockPatchInput = {
        apiVersion: 'v1',
        objectId,
        idempotencyKey: 'test-key-1',
        ops: [],
      };

      // First call
      const result1 = applyBlockPatch(db, input);
      expect(result1.success).toBe(true);

      // Second call with same key
      const result2 = applyBlockPatch(db, input);
      expect(result2.success).toBe(true);

      if (result1.success && result2.success) {
        // Should return same result
        expect(result2.result.previousDocVersion).toBe(result1.result.previousDocVersion);
        expect(result2.result.newDocVersion).toBe(result1.result.newDocVersion);
      }
    });

    it('applies patch when idempotencyKey is new', () => {
      const input1: ApplyBlockPatchInput = {
        apiVersion: 'v1',
        objectId,
        idempotencyKey: 'key-1',
        ops: [],
      };

      const input2: ApplyBlockPatchInput = {
        apiVersion: 'v1',
        objectId,
        idempotencyKey: 'key-2',
        ops: [],
      };

      const result1 = applyBlockPatch(db, input1);
      const result2 = applyBlockPatch(db, input2);

      expect(result1.success).toBe(true);
      expect(result2.success).toBe(true);

      if (result1.success && result2.success) {
        // Each should increment version
        expect(result1.result.newDocVersion).toBe(1);
        expect(result2.result.newDocVersion).toBe(2);
      }
    });

    it('works without idempotencyKey', () => {
      const input: ApplyBlockPatchInput = {
        apiVersion: 'v1',
        objectId,
        ops: [],
      };

      const result = applyBlockPatch(db, input);

      expect(result.success).toBe(true);
    });
  });

  describe('version increment', () => {
    it('increments docVersion by 1 on success', () => {
      const input: ApplyBlockPatchInput = {
        apiVersion: 'v1',
        objectId,
        ops: [],
      };

      const result = applyBlockPatch(db, input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.result.previousDocVersion).toBe(0);
        expect(result.result.newDocVersion).toBe(1);
      }

      // Verify in database
      const obj = db.all<{ doc_version: number }>('SELECT doc_version FROM objects WHERE id = ?', [
        objectId,
      ]);
      expect(obj[0]?.doc_version).toBe(1);
    });

    it('returns previous and new version in result', () => {
      // Set initial version to 5
      db.run('UPDATE objects SET doc_version = 5 WHERE id = ?', [objectId]);

      const input: ApplyBlockPatchInput = {
        apiVersion: 'v1',
        objectId,
        ops: [],
      };

      const result = applyBlockPatch(db, input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.result.previousDocVersion).toBe(5);
        expect(result.result.newDocVersion).toBe(6);
      }
    });
  });

  describe('empty ops', () => {
    it('succeeds with empty ops array (increments version)', () => {
      const input: ApplyBlockPatchInput = {
        apiVersion: 'v1',
        objectId,
        ops: [],
      };

      const result = applyBlockPatch(db, input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.result.applied.insertedBlockIds).toEqual([]);
        expect(result.result.applied.updatedBlockIds).toEqual([]);
        expect(result.result.applied.movedBlockIds).toEqual([]);
        expect(result.result.applied.deletedBlockIds).toEqual([]);
      }
    });
  });

  describe('result structure', () => {
    it('returns correct result structure', () => {
      const input: ApplyBlockPatchInput = {
        apiVersion: 'v1',
        objectId,
        ops: [],
      };

      const result = applyBlockPatch(db, input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.result.apiVersion).toBe('v1');
        expect(result.result.objectId).toBe(objectId);
        expect(typeof result.result.previousDocVersion).toBe('number');
        expect(typeof result.result.newDocVersion).toBe('number');
        expect(result.result.applied).toBeDefined();
      }
    });
  });
});

describe('applyBlockPatch - block.insert', () => {
  let db: TypenoteDb;
  let typeId: string;
  let objectId: string;

  beforeEach(() => {
    db = createTestDb();
    typeId = createTestObjectType(db, 'page');
    objectId = createTestObject(db, typeId, 'Test Page');
  });

  afterEach(() => {
    closeDb(db);
  });

  describe('basic insertion', () => {
    it('inserts root block with place: end', () => {
      const blockId = generateId();
      const input: ApplyBlockPatchInput = {
        apiVersion: 'v1',
        objectId,
        ops: [
          {
            op: 'block.insert',
            blockId,
            parentBlockId: null,
            place: { where: 'end' },
            blockType: 'paragraph',
            content: { inline: [{ t: 'text', text: 'Hello' }] },
          },
        ],
      };

      const result = applyBlockPatch(db, input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.result.applied.insertedBlockIds).toContain(blockId);
      }

      // Verify block exists in database
      const block = getBlockById(db, blockId);
      expect(block).not.toBeNull();
      expect(block?.blockType).toBe('paragraph');
      expect(block?.parentBlockId).toBeNull();
    });

    it('inserts child block under parent', () => {
      const parentId = createTestBlock(db, objectId, null, 'a', 'paragraph', {
        inline: [],
      });
      const childId = generateId();

      const input: ApplyBlockPatchInput = {
        apiVersion: 'v1',
        objectId,
        ops: [
          {
            op: 'block.insert',
            blockId: childId,
            parentBlockId: parentId,
            place: { where: 'end' },
            blockType: 'paragraph',
            content: { inline: [] },
          },
        ],
      };

      const result = applyBlockPatch(db, input);

      expect(result.success).toBe(true);
      const block = getBlockById(db, childId);
      expect(block?.parentBlockId).toBe(parentId);
    });

    it('uses explicit orderKey when provided', () => {
      const blockId = generateId();
      const input: ApplyBlockPatchInput = {
        apiVersion: 'v1',
        objectId,
        ops: [
          {
            op: 'block.insert',
            blockId,
            parentBlockId: null,
            orderKey: 'custom-order-key',
            blockType: 'paragraph',
            content: { inline: [] },
          },
        ],
      };

      const result = applyBlockPatch(db, input);

      expect(result.success).toBe(true);
      const block = getBlockById(db, blockId);
      expect(block?.orderKey).toBe('custom-order-key');
    });

    it('stores content as JSON', () => {
      const blockId = generateId();
      const content = { inline: [{ t: 'text', text: 'Test content' }] };
      const input: ApplyBlockPatchInput = {
        apiVersion: 'v1',
        objectId,
        ops: [
          {
            op: 'block.insert',
            blockId,
            parentBlockId: null,
            place: { where: 'end' },
            blockType: 'paragraph',
            content,
          },
        ],
      };

      const result = applyBlockPatch(db, input);

      expect(result.success).toBe(true);
      const block = getBlockById(db, blockId);
      expect(JSON.parse(block?.content ?? '{}')).toEqual(content);
    });

    it('stores meta as JSON', () => {
      const blockId = generateId();
      const input: ApplyBlockPatchInput = {
        apiVersion: 'v1',
        objectId,
        ops: [
          {
            op: 'block.insert',
            blockId,
            parentBlockId: null,
            place: { where: 'end' },
            blockType: 'paragraph',
            content: { inline: [] },
            meta: { collapsed: true },
          },
        ],
      };

      const result = applyBlockPatch(db, input);

      expect(result.success).toBe(true);
      const block = getBlockById(db, blockId);
      expect(JSON.parse(block?.meta ?? '{}')).toEqual({ collapsed: true });
    });
  });

  describe('placement hints', () => {
    it('inserts at start before existing siblings', () => {
      const existing = createTestBlock(db, objectId, null, 'a1', 'paragraph', {
        inline: [],
      });
      const newBlockId = generateId();

      const input: ApplyBlockPatchInput = {
        apiVersion: 'v1',
        objectId,
        ops: [
          {
            op: 'block.insert',
            blockId: newBlockId,
            parentBlockId: null,
            place: { where: 'start' },
            blockType: 'paragraph',
            content: { inline: [] },
          },
        ],
      };

      const result = applyBlockPatch(db, input);

      expect(result.success).toBe(true);
      const newBlock = getBlockById(db, newBlockId);
      const existingBlock = getBlockById(db, existing);
      expect(newBlock).not.toBeNull();
      expect(existingBlock).not.toBeNull();
      // New block should come before existing
      const newKey = newBlock?.orderKey ?? '';
      const existingKey = existingBlock?.orderKey ?? '';
      expect(newKey < existingKey).toBe(true);
    });

    it('inserts before specified sibling', () => {
      const block1 = createTestBlock(db, objectId, null, 'a0', 'paragraph', {
        inline: [],
      });
      const block2 = createTestBlock(db, objectId, null, 'a2', 'paragraph', {
        inline: [],
      });
      const newBlockId = generateId();

      const input: ApplyBlockPatchInput = {
        apiVersion: 'v1',
        objectId,
        ops: [
          {
            op: 'block.insert',
            blockId: newBlockId,
            parentBlockId: null,
            place: { where: 'before', siblingBlockId: block2 },
            blockType: 'paragraph',
            content: { inline: [] },
          },
        ],
      };

      const result = applyBlockPatch(db, input);

      expect(result.success).toBe(true);
      const newBlock = getBlockById(db, newBlockId);
      const b1 = getBlockById(db, block1);
      const b2 = getBlockById(db, block2);
      expect(newBlock).not.toBeNull();
      expect(b1).not.toBeNull();
      expect(b2).not.toBeNull();
      // New block should be between block1 and block2
      const newKey = newBlock?.orderKey ?? '';
      const key1 = b1?.orderKey ?? '';
      const key2 = b2?.orderKey ?? '';
      expect(newKey > key1).toBe(true);
      expect(newKey < key2).toBe(true);
    });

    it('inserts after specified sibling', () => {
      const block1 = createTestBlock(db, objectId, null, 'a0', 'paragraph', {
        inline: [],
      });
      const block2 = createTestBlock(db, objectId, null, 'a2', 'paragraph', {
        inline: [],
      });
      const newBlockId = generateId();

      const input: ApplyBlockPatchInput = {
        apiVersion: 'v1',
        objectId,
        ops: [
          {
            op: 'block.insert',
            blockId: newBlockId,
            parentBlockId: null,
            place: { where: 'after', siblingBlockId: block1 },
            blockType: 'paragraph',
            content: { inline: [] },
          },
        ],
      };

      const result = applyBlockPatch(db, input);

      expect(result.success).toBe(true);
      const newBlock = getBlockById(db, newBlockId);
      const b1 = getBlockById(db, block1);
      const b2 = getBlockById(db, block2);
      expect(newBlock).not.toBeNull();
      expect(b1).not.toBeNull();
      expect(b2).not.toBeNull();
      // New block should be between block1 and block2
      const newKey = newBlock?.orderKey ?? '';
      const key1 = b1?.orderKey ?? '';
      const key2 = b2?.orderKey ?? '';
      expect(newKey > key1).toBe(true);
      expect(newKey < key2).toBe(true);
    });

    it('returns NOT_FOUND_BLOCK for non-existent sibling in before', () => {
      const input: ApplyBlockPatchInput = {
        apiVersion: 'v1',
        objectId,
        ops: [
          {
            op: 'block.insert',
            blockId: generateId(),
            parentBlockId: null,
            place: { where: 'before', siblingBlockId: '01HGW2N7XYZABCDEFGHJKMNPQR' },
            blockType: 'paragraph',
            content: { inline: [] },
          },
        ],
      };

      const result = applyBlockPatch(db, input);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('NOT_FOUND_BLOCK');
      }
    });
  });

  describe('tree invariants', () => {
    it('returns NOT_FOUND_BLOCK for non-existent parent', () => {
      const input: ApplyBlockPatchInput = {
        apiVersion: 'v1',
        objectId,
        ops: [
          {
            op: 'block.insert',
            blockId: generateId(),
            parentBlockId: '01HGW2N7XYZABCDEFGHJKMNPQR',
            place: { where: 'end' },
            blockType: 'paragraph',
            content: { inline: [] },
          },
        ],
      };

      const result = applyBlockPatch(db, input);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('NOT_FOUND_BLOCK');
      }
    });

    it('returns INVARIANT_PARENT_DELETED for deleted parent', () => {
      const parent = createTestBlock(db, objectId, null, 'a', 'paragraph', {
        inline: [],
      });
      // Soft-delete the parent
      db.run('UPDATE blocks SET deleted_at = ? WHERE id = ?', [Date.now(), parent]);

      const input: ApplyBlockPatchInput = {
        apiVersion: 'v1',
        objectId,
        ops: [
          {
            op: 'block.insert',
            blockId: generateId(),
            parentBlockId: parent,
            place: { where: 'end' },
            blockType: 'paragraph',
            content: { inline: [] },
          },
        ],
      };

      const result = applyBlockPatch(db, input);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('INVARIANT_PARENT_DELETED');
      }
    });

    it('returns INVARIANT_CROSS_OBJECT for parent in different object', () => {
      const otherObjectId = createTestObject(db, typeId, 'Other Page');
      const otherParent = createTestBlock(db, otherObjectId, null, 'a', 'paragraph', {
        inline: [],
      });

      const input: ApplyBlockPatchInput = {
        apiVersion: 'v1',
        objectId,
        ops: [
          {
            op: 'block.insert',
            blockId: generateId(),
            parentBlockId: otherParent,
            place: { where: 'end' },
            blockType: 'paragraph',
            content: { inline: [] },
          },
        ],
      };

      const result = applyBlockPatch(db, input);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('INVARIANT_CROSS_OBJECT');
      }
    });
  });

  describe('content validation', () => {
    it('validates paragraph content schema', () => {
      const blockId = generateId();
      const input: ApplyBlockPatchInput = {
        apiVersion: 'v1',
        objectId,
        ops: [
          {
            op: 'block.insert',
            blockId,
            parentBlockId: null,
            place: { where: 'end' },
            blockType: 'paragraph',
            content: { inline: [{ t: 'text', text: 'Valid' }] },
          },
        ],
      };

      const result = applyBlockPatch(db, input);

      expect(result.success).toBe(true);
    });

    it('returns VALIDATION error for invalid content', () => {
      const input: ApplyBlockPatchInput = {
        apiVersion: 'v1',
        objectId,
        ops: [
          {
            op: 'block.insert',
            blockId: generateId(),
            parentBlockId: null,
            place: { where: 'end' },
            blockType: 'heading',
            content: { inline: [] }, // Missing required 'level' field
          },
        ],
      };

      const result = applyBlockPatch(db, input);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('VALIDATION');
      }
    });
  });

  describe('result tracking', () => {
    it('includes blockId in applied.insertedBlockIds', () => {
      const blockId = generateId();
      const input: ApplyBlockPatchInput = {
        apiVersion: 'v1',
        objectId,
        ops: [
          {
            op: 'block.insert',
            blockId,
            parentBlockId: null,
            place: { where: 'end' },
            blockType: 'paragraph',
            content: { inline: [] },
          },
        ],
      };

      const result = applyBlockPatch(db, input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.result.applied.insertedBlockIds).toEqual([blockId]);
      }
    });

    it('tracks multiple inserts', () => {
      const blockId1 = generateId();
      const blockId2 = generateId();
      const input: ApplyBlockPatchInput = {
        apiVersion: 'v1',
        objectId,
        ops: [
          {
            op: 'block.insert',
            blockId: blockId1,
            parentBlockId: null,
            place: { where: 'end' },
            blockType: 'paragraph',
            content: { inline: [] },
          },
          {
            op: 'block.insert',
            blockId: blockId2,
            parentBlockId: null,
            place: { where: 'end' },
            blockType: 'paragraph',
            content: { inline: [] },
          },
        ],
      };

      const result = applyBlockPatch(db, input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.result.applied.insertedBlockIds).toContain(blockId1);
        expect(result.result.applied.insertedBlockIds).toContain(blockId2);
      }
    });
  });
});

describe('applyBlockPatch - block.update', () => {
  let db: TypenoteDb;
  let typeId: string;
  let objectId: string;

  beforeEach(() => {
    db = createTestDb();
    typeId = createTestObjectType(db, 'page');
    objectId = createTestObject(db, typeId, 'Test Page');
  });

  afterEach(() => {
    closeDb(db);
  });

  describe('basic updates', () => {
    it('updates block content', () => {
      const blockId = createTestBlock(db, objectId, null, 'a0', 'paragraph', {
        inline: [{ t: 'text', text: 'Original' }],
      });

      const input: ApplyBlockPatchInput = {
        apiVersion: 'v1',
        objectId,
        ops: [
          {
            op: 'block.update',
            blockId,
            patch: {
              content: { inline: [{ t: 'text', text: 'Updated' }] },
            },
          },
        ],
      };

      const result = applyBlockPatch(db, input);

      expect(result.success).toBe(true);
      const block = getBlockById(db, blockId);
      const content = JSON.parse(block?.content ?? '{}');
      expect(content.inline[0].text).toBe('Updated');
    });

    it('updates block meta', () => {
      const blockId = createTestBlock(db, objectId, null, 'a0', 'paragraph', {
        inline: [],
      });

      const input: ApplyBlockPatchInput = {
        apiVersion: 'v1',
        objectId,
        ops: [
          {
            op: 'block.update',
            blockId,
            patch: {
              meta: { collapsed: true },
            },
          },
        ],
      };

      const result = applyBlockPatch(db, input);

      expect(result.success).toBe(true);
      const block = getBlockById(db, blockId);
      const meta = JSON.parse(block?.meta ?? '{}');
      expect(meta.collapsed).toBe(true);
    });

    it('updates both content and meta in single op', () => {
      const blockId = createTestBlock(db, objectId, null, 'a0', 'paragraph', {
        inline: [{ t: 'text', text: 'Original' }],
      });

      const input: ApplyBlockPatchInput = {
        apiVersion: 'v1',
        objectId,
        ops: [
          {
            op: 'block.update',
            blockId,
            patch: {
              content: { inline: [{ t: 'text', text: 'Updated' }] },
              meta: { collapsed: true },
            },
          },
        ],
      };

      const result = applyBlockPatch(db, input);

      expect(result.success).toBe(true);
      const block = getBlockById(db, blockId);
      const content = JSON.parse(block?.content ?? '{}');
      const meta = JSON.parse(block?.meta ?? '{}');
      expect(content.inline[0].text).toBe('Updated');
      expect(meta.collapsed).toBe(true);
    });

    it('preserves unchanged fields when updating content only', () => {
      const blockId = createTestBlock(db, objectId, null, 'a0', 'paragraph', {
        inline: [{ t: 'text', text: 'Original' }],
      });
      // Set meta
      db.run('UPDATE blocks SET meta = ? WHERE id = ?', [
        JSON.stringify({ collapsed: true }),
        blockId,
      ]);

      const input: ApplyBlockPatchInput = {
        apiVersion: 'v1',
        objectId,
        ops: [
          {
            op: 'block.update',
            blockId,
            patch: {
              content: { inline: [{ t: 'text', text: 'Updated' }] },
            },
          },
        ],
      };

      const result = applyBlockPatch(db, input);

      expect(result.success).toBe(true);
      const block = getBlockById(db, blockId);
      const meta = JSON.parse(block?.meta ?? '{}');
      expect(meta.collapsed).toBe(true); // Meta preserved
    });

    it('preserves unchanged fields when updating meta only', () => {
      const blockId = createTestBlock(db, objectId, null, 'a0', 'paragraph', {
        inline: [{ t: 'text', text: 'Original' }],
      });

      const input: ApplyBlockPatchInput = {
        apiVersion: 'v1',
        objectId,
        ops: [
          {
            op: 'block.update',
            blockId,
            patch: {
              meta: { collapsed: true },
            },
          },
        ],
      };

      const result = applyBlockPatch(db, input);

      expect(result.success).toBe(true);
      const block = getBlockById(db, blockId);
      const content = JSON.parse(block?.content ?? '{}');
      expect(content.inline[0].text).toBe('Original'); // Content preserved
    });
  });

  describe('block existence', () => {
    it('returns NOT_FOUND_BLOCK for non-existent block', () => {
      const input: ApplyBlockPatchInput = {
        apiVersion: 'v1',
        objectId,
        ops: [
          {
            op: 'block.update',
            blockId: '01HGW2N7XYZABCDEFGHJKMNPQR',
            patch: {
              content: { inline: [] },
            },
          },
        ],
      };

      const result = applyBlockPatch(db, input);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('NOT_FOUND_BLOCK');
      }
    });

    it('returns NOT_FOUND_BLOCK for deleted block', () => {
      const blockId = createTestBlock(db, objectId, null, 'a0', 'paragraph', {
        inline: [],
      });
      // Soft-delete the block
      db.run('UPDATE blocks SET deleted_at = ? WHERE id = ?', [Date.now(), blockId]);

      const input: ApplyBlockPatchInput = {
        apiVersion: 'v1',
        objectId,
        ops: [
          {
            op: 'block.update',
            blockId,
            patch: {
              content: { inline: [{ t: 'text', text: 'Updated' }] },
            },
          },
        ],
      };

      const result = applyBlockPatch(db, input);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('NOT_FOUND_BLOCK');
      }
    });

    it('returns INVARIANT_CROSS_OBJECT for block in different object', () => {
      const otherObjectId = createTestObject(db, typeId, 'Other Page');
      const otherBlockId = createTestBlock(db, otherObjectId, null, 'a0', 'paragraph', {
        inline: [],
      });

      const input: ApplyBlockPatchInput = {
        apiVersion: 'v1',
        objectId,
        ops: [
          {
            op: 'block.update',
            blockId: otherBlockId,
            patch: {
              content: { inline: [{ t: 'text', text: 'Updated' }] },
            },
          },
        ],
      };

      const result = applyBlockPatch(db, input);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('INVARIANT_CROSS_OBJECT');
      }
    });
  });

  describe('block type change', () => {
    it('returns VALIDATION error when attempting to change block type', () => {
      const blockId = createTestBlock(db, objectId, null, 'a0', 'paragraph', {
        inline: [],
      });

      const input: ApplyBlockPatchInput = {
        apiVersion: 'v1',
        objectId,
        ops: [
          {
            op: 'block.update',
            blockId,
            patch: {
              blockType: 'heading',
              content: { level: 1, inline: [] },
            },
          },
        ],
      };

      const result = applyBlockPatch(db, input);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('VALIDATION');
        expect(result.error.message).toContain('block type');
      }
    });

    it('succeeds when blockType in patch matches existing type', () => {
      const blockId = createTestBlock(db, objectId, null, 'a0', 'paragraph', {
        inline: [],
      });

      const input: ApplyBlockPatchInput = {
        apiVersion: 'v1',
        objectId,
        ops: [
          {
            op: 'block.update',
            blockId,
            patch: {
              blockType: 'paragraph', // Same as existing
              content: { inline: [{ t: 'text', text: 'Updated' }] },
            },
          },
        ],
      };

      const result = applyBlockPatch(db, input);

      expect(result.success).toBe(true);
    });
  });

  describe('content validation', () => {
    it('validates new content against block type schema', () => {
      const blockId = createTestBlock(db, objectId, null, 'a0', 'heading', {
        level: 1,
        inline: [],
      });

      const input: ApplyBlockPatchInput = {
        apiVersion: 'v1',
        objectId,
        ops: [
          {
            op: 'block.update',
            blockId,
            patch: {
              content: { inline: [] }, // Missing required 'level' for heading
            },
          },
        ],
      };

      const result = applyBlockPatch(db, input);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('VALIDATION');
      }
    });

    it('accepts valid content for block type', () => {
      const blockId = createTestBlock(db, objectId, null, 'a0', 'heading', {
        level: 1,
        inline: [],
      });

      const input: ApplyBlockPatchInput = {
        apiVersion: 'v1',
        objectId,
        ops: [
          {
            op: 'block.update',
            blockId,
            patch: {
              content: { level: 2, inline: [{ t: 'text', text: 'Updated' }] },
            },
          },
        ],
      };

      const result = applyBlockPatch(db, input);

      expect(result.success).toBe(true);
      const block = getBlockById(db, blockId);
      const content = JSON.parse(block?.content ?? '{}');
      expect(content.level).toBe(2);
    });
  });

  describe('result tracking', () => {
    it('includes blockId in applied.updatedBlockIds', () => {
      const blockId = createTestBlock(db, objectId, null, 'a0', 'paragraph', {
        inline: [],
      });

      const input: ApplyBlockPatchInput = {
        apiVersion: 'v1',
        objectId,
        ops: [
          {
            op: 'block.update',
            blockId,
            patch: {
              content: { inline: [{ t: 'text', text: 'Updated' }] },
            },
          },
        ],
      };

      const result = applyBlockPatch(db, input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.result.applied.updatedBlockIds).toContain(blockId);
      }
    });

    it('tracks multiple updates', () => {
      const blockId1 = createTestBlock(db, objectId, null, 'a0', 'paragraph', {
        inline: [],
      });
      const blockId2 = createTestBlock(db, objectId, null, 'a1', 'paragraph', {
        inline: [],
      });

      const input: ApplyBlockPatchInput = {
        apiVersion: 'v1',
        objectId,
        ops: [
          {
            op: 'block.update',
            blockId: blockId1,
            patch: { content: { inline: [{ t: 'text', text: 'One' }] } },
          },
          {
            op: 'block.update',
            blockId: blockId2,
            patch: { content: { inline: [{ t: 'text', text: 'Two' }] } },
          },
        ],
      };

      const result = applyBlockPatch(db, input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.result.applied.updatedBlockIds).toContain(blockId1);
        expect(result.result.applied.updatedBlockIds).toContain(blockId2);
      }
    });
  });

  describe('updatedAt timestamp', () => {
    it('updates the updatedAt timestamp on block update', () => {
      const blockId = createTestBlock(db, objectId, null, 'a0', 'paragraph', {
        inline: [],
      });

      const blockBefore = getBlockById(db, blockId);
      const updatedAtBefore = blockBefore?.updatedAt?.getTime() ?? 0;

      const input: ApplyBlockPatchInput = {
        apiVersion: 'v1',
        objectId,
        ops: [
          {
            op: 'block.update',
            blockId,
            patch: {
              content: { inline: [{ t: 'text', text: 'Updated' }] },
            },
          },
        ],
      };

      const result = applyBlockPatch(db, input);

      expect(result.success).toBe(true);
      const blockAfter = getBlockById(db, blockId);
      const updatedAtAfter = blockAfter?.updatedAt?.getTime() ?? 0;
      expect(updatedAtAfter).toBeGreaterThanOrEqual(updatedAtBefore);
    });
  });
});

describe('applyBlockPatch - block.move', () => {
  let db: TypenoteDb;
  let typeId: string;
  let objectId: string;

  beforeEach(() => {
    db = createTestDb();
    typeId = createTestObjectType(db, 'page');
    objectId = createTestObject(db, typeId, 'Test Page');
  });

  afterEach(() => {
    closeDb(db);
  });

  describe('basic moves', () => {
    it('moves block to a new parent', () => {
      const parent1 = createTestBlock(db, objectId, null, 'a0', 'paragraph', {
        inline: [],
      });
      const parent2 = createTestBlock(db, objectId, null, 'a1', 'paragraph', {
        inline: [],
      });
      const child = createTestBlock(db, objectId, parent1, 'a0', 'paragraph', {
        inline: [],
      });

      const input: ApplyBlockPatchInput = {
        apiVersion: 'v1',
        objectId,
        ops: [
          {
            op: 'block.move',
            blockId: child,
            newParentBlockId: parent2,
            place: { where: 'end' },
          },
        ],
      };

      const result = applyBlockPatch(db, input);

      expect(result.success).toBe(true);
      const movedBlock = getBlockById(db, child);
      expect(movedBlock?.parentBlockId).toBe(parent2);
    });

    it('moves block to root (null parent)', () => {
      const parent = createTestBlock(db, objectId, null, 'a0', 'paragraph', {
        inline: [],
      });
      const child = createTestBlock(db, objectId, parent, 'a0', 'paragraph', {
        inline: [],
      });

      const input: ApplyBlockPatchInput = {
        apiVersion: 'v1',
        objectId,
        ops: [
          {
            op: 'block.move',
            blockId: child,
            newParentBlockId: null,
            place: { where: 'end' },
          },
        ],
      };

      const result = applyBlockPatch(db, input);

      expect(result.success).toBe(true);
      const movedBlock = getBlockById(db, child);
      expect(movedBlock?.parentBlockId).toBeNull();
    });

    it('updates orderKey on move', () => {
      const parent = createTestBlock(db, objectId, null, 'a0', 'paragraph', {
        inline: [],
      });
      const sibling = createTestBlock(db, objectId, parent, 'a1', 'paragraph', {
        inline: [],
      });
      const toMove = createTestBlock(db, objectId, null, 'a2', 'paragraph', {
        inline: [],
      });

      const input: ApplyBlockPatchInput = {
        apiVersion: 'v1',
        objectId,
        ops: [
          {
            op: 'block.move',
            blockId: toMove,
            newParentBlockId: parent,
            place: { where: 'before', siblingBlockId: sibling },
          },
        ],
      };

      const result = applyBlockPatch(db, input);

      expect(result.success).toBe(true);
      const movedBlock = getBlockById(db, toMove);
      const siblingBlock = getBlockById(db, sibling);
      // Moved block should be before sibling (lexicographic comparison)
      const movedKey = movedBlock?.orderKey ?? '';
      const siblingKey = siblingBlock?.orderKey ?? '';
      expect(movedKey < siblingKey).toBe(true);
    });

    it('uses explicit orderKey when provided', () => {
      const parent = createTestBlock(db, objectId, null, 'a0', 'paragraph', {
        inline: [],
      });
      const toMove = createTestBlock(db, objectId, null, 'a1', 'paragraph', {
        inline: [],
      });

      const input: ApplyBlockPatchInput = {
        apiVersion: 'v1',
        objectId,
        ops: [
          {
            op: 'block.move',
            blockId: toMove,
            newParentBlockId: parent,
            orderKey: 'explicit-key',
          },
        ],
      };

      const result = applyBlockPatch(db, input);

      expect(result.success).toBe(true);
      const movedBlock = getBlockById(db, toMove);
      expect(movedBlock?.orderKey).toBe('explicit-key');
    });
  });

  describe('block existence', () => {
    it('returns NOT_FOUND_BLOCK for non-existent block', () => {
      const input: ApplyBlockPatchInput = {
        apiVersion: 'v1',
        objectId,
        ops: [
          {
            op: 'block.move',
            blockId: '01HGW2N7XYZABCDEFGHJKMNPQR',
            newParentBlockId: null,
            place: { where: 'end' },
          },
        ],
      };

      const result = applyBlockPatch(db, input);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('NOT_FOUND_BLOCK');
      }
    });

    it('returns NOT_FOUND_BLOCK for deleted block', () => {
      const blockId = createTestBlock(db, objectId, null, 'a0', 'paragraph', {
        inline: [],
      });
      db.run('UPDATE blocks SET deleted_at = ? WHERE id = ?', [Date.now(), blockId]);

      const input: ApplyBlockPatchInput = {
        apiVersion: 'v1',
        objectId,
        ops: [
          {
            op: 'block.move',
            blockId,
            newParentBlockId: null,
            place: { where: 'end' },
          },
        ],
      };

      const result = applyBlockPatch(db, input);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('NOT_FOUND_BLOCK');
      }
    });

    it('returns INVARIANT_CROSS_OBJECT for block in different object', () => {
      const otherObjectId = createTestObject(db, typeId, 'Other Page');
      const otherBlockId = createTestBlock(db, otherObjectId, null, 'a0', 'paragraph', {
        inline: [],
      });

      const input: ApplyBlockPatchInput = {
        apiVersion: 'v1',
        objectId,
        ops: [
          {
            op: 'block.move',
            blockId: otherBlockId,
            newParentBlockId: null,
            place: { where: 'end' },
          },
        ],
      };

      const result = applyBlockPatch(db, input);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('INVARIANT_CROSS_OBJECT');
      }
    });
  });

  describe('parent validation', () => {
    it('returns NOT_FOUND_BLOCK for non-existent new parent', () => {
      const blockId = createTestBlock(db, objectId, null, 'a0', 'paragraph', {
        inline: [],
      });

      const input: ApplyBlockPatchInput = {
        apiVersion: 'v1',
        objectId,
        ops: [
          {
            op: 'block.move',
            blockId,
            newParentBlockId: '01HGW2N7XYZABCDEFGHJKMNPQR',
            place: { where: 'end' },
          },
        ],
      };

      const result = applyBlockPatch(db, input);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('NOT_FOUND_BLOCK');
      }
    });

    it('returns INVARIANT_PARENT_DELETED for deleted new parent', () => {
      const parent = createTestBlock(db, objectId, null, 'a0', 'paragraph', {
        inline: [],
      });
      const blockId = createTestBlock(db, objectId, null, 'a1', 'paragraph', {
        inline: [],
      });
      db.run('UPDATE blocks SET deleted_at = ? WHERE id = ?', [Date.now(), parent]);

      const input: ApplyBlockPatchInput = {
        apiVersion: 'v1',
        objectId,
        ops: [
          {
            op: 'block.move',
            blockId,
            newParentBlockId: parent,
            place: { where: 'end' },
          },
        ],
      };

      const result = applyBlockPatch(db, input);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('INVARIANT_PARENT_DELETED');
      }
    });

    it('returns INVARIANT_CROSS_OBJECT for new parent in different object', () => {
      const otherObjectId = createTestObject(db, typeId, 'Other Page');
      const otherParent = createTestBlock(db, otherObjectId, null, 'a0', 'paragraph', {
        inline: [],
      });
      const blockId = createTestBlock(db, objectId, null, 'a0', 'paragraph', {
        inline: [],
      });

      const input: ApplyBlockPatchInput = {
        apiVersion: 'v1',
        objectId,
        ops: [
          {
            op: 'block.move',
            blockId,
            newParentBlockId: otherParent,
            place: { where: 'end' },
          },
        ],
      };

      const result = applyBlockPatch(db, input);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('INVARIANT_CROSS_OBJECT');
      }
    });
  });

  describe('cycle detection', () => {
    it('returns INVARIANT_CYCLE when moving block under itself', () => {
      const blockId = createTestBlock(db, objectId, null, 'a0', 'paragraph', {
        inline: [],
      });

      const input: ApplyBlockPatchInput = {
        apiVersion: 'v1',
        objectId,
        ops: [
          {
            op: 'block.move',
            blockId,
            newParentBlockId: blockId,
            place: { where: 'end' },
          },
        ],
      };

      const result = applyBlockPatch(db, input);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('INVARIANT_CYCLE');
      }
    });

    it('returns INVARIANT_CYCLE when moving block under its descendant', () => {
      const grandparent = createTestBlock(db, objectId, null, 'a0', 'paragraph', { inline: [] });
      const parent = createTestBlock(db, objectId, grandparent, 'a0', 'paragraph', { inline: [] });
      const child = createTestBlock(db, objectId, parent, 'a0', 'paragraph', {
        inline: [],
      });

      const input: ApplyBlockPatchInput = {
        apiVersion: 'v1',
        objectId,
        ops: [
          {
            op: 'block.move',
            blockId: grandparent,
            newParentBlockId: child,
            place: { where: 'end' },
          },
        ],
      };

      const result = applyBlockPatch(db, input);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('INVARIANT_CYCLE');
      }
    });

    it('allows moving to sibling (no cycle)', () => {
      const parent = createTestBlock(db, objectId, null, 'a0', 'paragraph', {
        inline: [],
      });
      const sibling1 = createTestBlock(db, objectId, parent, 'a0', 'paragraph', {
        inline: [],
      });
      const sibling2 = createTestBlock(db, objectId, parent, 'a1', 'paragraph', {
        inline: [],
      });

      const input: ApplyBlockPatchInput = {
        apiVersion: 'v1',
        objectId,
        ops: [
          {
            op: 'block.move',
            blockId: sibling1,
            newParentBlockId: sibling2,
            place: { where: 'end' },
          },
        ],
      };

      const result = applyBlockPatch(db, input);

      expect(result.success).toBe(true);
      const movedBlock = getBlockById(db, sibling1);
      expect(movedBlock?.parentBlockId).toBe(sibling2);
    });
  });

  describe('result tracking', () => {
    it('includes blockId in applied.movedBlockIds', () => {
      const blockId = createTestBlock(db, objectId, null, 'a0', 'paragraph', {
        inline: [],
      });
      const newParent = createTestBlock(db, objectId, null, 'a1', 'paragraph', {
        inline: [],
      });

      const input: ApplyBlockPatchInput = {
        apiVersion: 'v1',
        objectId,
        ops: [
          {
            op: 'block.move',
            blockId,
            newParentBlockId: newParent,
            place: { where: 'end' },
          },
        ],
      };

      const result = applyBlockPatch(db, input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.result.applied.movedBlockIds).toContain(blockId);
      }
    });

    it('tracks multiple moves', () => {
      const newParent = createTestBlock(db, objectId, null, 'a0', 'paragraph', {
        inline: [],
      });
      const block1 = createTestBlock(db, objectId, null, 'a1', 'paragraph', {
        inline: [],
      });
      const block2 = createTestBlock(db, objectId, null, 'a2', 'paragraph', {
        inline: [],
      });

      const input: ApplyBlockPatchInput = {
        apiVersion: 'v1',
        objectId,
        ops: [
          {
            op: 'block.move',
            blockId: block1,
            newParentBlockId: newParent,
            place: { where: 'end' },
          },
          {
            op: 'block.move',
            blockId: block2,
            newParentBlockId: newParent,
            place: { where: 'end' },
          },
        ],
      };

      const result = applyBlockPatch(db, input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.result.applied.movedBlockIds).toContain(block1);
        expect(result.result.applied.movedBlockIds).toContain(block2);
      }
    });
  });

  describe('subtree behavior', () => {
    it('children remain attached to moved parent', () => {
      const parent = createTestBlock(db, objectId, null, 'a0', 'paragraph', {
        inline: [],
      });
      const child = createTestBlock(db, objectId, parent, 'a0', 'paragraph', {
        inline: [],
      });
      const newGrandparent = createTestBlock(db, objectId, null, 'a1', 'paragraph', { inline: [] });

      const input: ApplyBlockPatchInput = {
        apiVersion: 'v1',
        objectId,
        ops: [
          {
            op: 'block.move',
            blockId: parent,
            newParentBlockId: newGrandparent,
            place: { where: 'end' },
          },
        ],
      };

      const result = applyBlockPatch(db, input);

      expect(result.success).toBe(true);
      // Parent moved under newGrandparent
      const movedParent = getBlockById(db, parent);
      expect(movedParent?.parentBlockId).toBe(newGrandparent);
      // Child still attached to parent
      const childBlock = getBlockById(db, child);
      expect(childBlock?.parentBlockId).toBe(parent);
    });
  });
});

describe('applyBlockPatch - block.delete', () => {
  let db: TypenoteDb;
  let typeId: string;
  let objectId: string;

  beforeEach(() => {
    db = createTestDb();
    typeId = createTestObjectType(db, 'page');
    objectId = createTestObject(db, typeId, 'Test Page');
  });

  afterEach(() => {
    closeDb(db);
  });

  describe('basic deletes', () => {
    it('soft-deletes a block (sets deletedAt)', () => {
      const blockId = createTestBlock(db, objectId, null, 'a0', 'paragraph', {
        inline: [],
      });

      const input: ApplyBlockPatchInput = {
        apiVersion: 'v1',
        objectId,
        ops: [
          {
            op: 'block.delete',
            blockId,
          },
        ],
      };

      const result = applyBlockPatch(db, input);

      expect(result.success).toBe(true);
      const block = getBlockById(db, blockId);
      expect(block?.deletedAt).not.toBeNull();
    });

    it('deletes block without affecting siblings', () => {
      const sibling1 = createTestBlock(db, objectId, null, 'a0', 'paragraph', {
        inline: [],
      });
      const toDelete = createTestBlock(db, objectId, null, 'a1', 'paragraph', {
        inline: [],
      });
      const sibling2 = createTestBlock(db, objectId, null, 'a2', 'paragraph', {
        inline: [],
      });

      const input: ApplyBlockPatchInput = {
        apiVersion: 'v1',
        objectId,
        ops: [
          {
            op: 'block.delete',
            blockId: toDelete,
          },
        ],
      };

      const result = applyBlockPatch(db, input);

      expect(result.success).toBe(true);
      // Deleted block has deletedAt set
      const deletedBlock = getBlockById(db, toDelete);
      expect(deletedBlock?.deletedAt).not.toBeNull();
      // Siblings unchanged
      const sib1 = getBlockById(db, sibling1);
      const sib2 = getBlockById(db, sibling2);
      expect(sib1?.deletedAt).toBeNull();
      expect(sib2?.deletedAt).toBeNull();
    });
  });

  describe('subtree deletion', () => {
    it('with subtree: true, deletes all descendants', () => {
      const parent = createTestBlock(db, objectId, null, 'a0', 'paragraph', {
        inline: [],
      });
      const child = createTestBlock(db, objectId, parent, 'a0', 'paragraph', {
        inline: [],
      });
      const grandchild = createTestBlock(db, objectId, child, 'a0', 'paragraph', {
        inline: [],
      });

      const input: ApplyBlockPatchInput = {
        apiVersion: 'v1',
        objectId,
        ops: [
          {
            op: 'block.delete',
            blockId: parent,
            subtree: true,
          },
        ],
      };

      const result = applyBlockPatch(db, input);

      expect(result.success).toBe(true);
      // All blocks should be deleted
      expect(getBlockById(db, parent)?.deletedAt).not.toBeNull();
      expect(getBlockById(db, child)?.deletedAt).not.toBeNull();
      expect(getBlockById(db, grandchild)?.deletedAt).not.toBeNull();
    });

    it('without subtree, only deletes the block itself', () => {
      const parent = createTestBlock(db, objectId, null, 'a0', 'paragraph', {
        inline: [],
      });
      const child = createTestBlock(db, objectId, parent, 'a0', 'paragraph', {
        inline: [],
      });

      const input: ApplyBlockPatchInput = {
        apiVersion: 'v1',
        objectId,
        ops: [
          {
            op: 'block.delete',
            blockId: parent,
          },
        ],
      };

      const result = applyBlockPatch(db, input);

      expect(result.success).toBe(true);
      // Parent deleted
      expect(getBlockById(db, parent)?.deletedAt).not.toBeNull();
      // Child NOT deleted (orphaned)
      expect(getBlockById(db, child)?.deletedAt).toBeNull();
    });

    it('subtree deletion includes multiple levels', () => {
      const root = createTestBlock(db, objectId, null, 'a0', 'paragraph', {
        inline: [],
      });
      const level1a = createTestBlock(db, objectId, root, 'a0', 'paragraph', {
        inline: [],
      });
      const level1b = createTestBlock(db, objectId, root, 'a1', 'paragraph', {
        inline: [],
      });
      const level2 = createTestBlock(db, objectId, level1a, 'a0', 'paragraph', {
        inline: [],
      });

      const input: ApplyBlockPatchInput = {
        apiVersion: 'v1',
        objectId,
        ops: [
          {
            op: 'block.delete',
            blockId: root,
            subtree: true,
          },
        ],
      };

      const result = applyBlockPatch(db, input);

      expect(result.success).toBe(true);
      expect(getBlockById(db, root)?.deletedAt).not.toBeNull();
      expect(getBlockById(db, level1a)?.deletedAt).not.toBeNull();
      expect(getBlockById(db, level1b)?.deletedAt).not.toBeNull();
      expect(getBlockById(db, level2)?.deletedAt).not.toBeNull();
    });
  });

  describe('block existence', () => {
    it('returns NOT_FOUND_BLOCK for non-existent block', () => {
      const input: ApplyBlockPatchInput = {
        apiVersion: 'v1',
        objectId,
        ops: [
          {
            op: 'block.delete',
            blockId: '01HGW2N7XYZABCDEFGHJKMNPQR',
          },
        ],
      };

      const result = applyBlockPatch(db, input);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('NOT_FOUND_BLOCK');
      }
    });

    it('is idempotent for already deleted block', () => {
      const blockId = createTestBlock(db, objectId, null, 'a0', 'paragraph', {
        inline: [],
      });
      // Pre-delete the block
      db.run('UPDATE blocks SET deleted_at = ? WHERE id = ?', [Date.now(), blockId]);

      const input: ApplyBlockPatchInput = {
        apiVersion: 'v1',
        objectId,
        ops: [
          {
            op: 'block.delete',
            blockId,
          },
        ],
      };

      const result = applyBlockPatch(db, input);

      // Should succeed (idempotent)
      expect(result.success).toBe(true);
      if (result.success) {
        // Block should still be tracked as deleted
        expect(result.result.applied.deletedBlockIds).toContain(blockId);
      }
    });

    it('returns INVARIANT_CROSS_OBJECT for block in different object', () => {
      const otherObjectId = createTestObject(db, typeId, 'Other Page');
      const otherBlockId = createTestBlock(db, otherObjectId, null, 'a0', 'paragraph', {
        inline: [],
      });

      const input: ApplyBlockPatchInput = {
        apiVersion: 'v1',
        objectId,
        ops: [
          {
            op: 'block.delete',
            blockId: otherBlockId,
          },
        ],
      };

      const result = applyBlockPatch(db, input);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('INVARIANT_CROSS_OBJECT');
      }
    });
  });

  describe('result tracking', () => {
    it('includes blockId in applied.deletedBlockIds', () => {
      const blockId = createTestBlock(db, objectId, null, 'a0', 'paragraph', {
        inline: [],
      });

      const input: ApplyBlockPatchInput = {
        apiVersion: 'v1',
        objectId,
        ops: [
          {
            op: 'block.delete',
            blockId,
          },
        ],
      };

      const result = applyBlockPatch(db, input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.result.applied.deletedBlockIds).toContain(blockId);
      }
    });

    it('tracks all deleted blocks in subtree deletion', () => {
      const parent = createTestBlock(db, objectId, null, 'a0', 'paragraph', {
        inline: [],
      });
      const child = createTestBlock(db, objectId, parent, 'a0', 'paragraph', {
        inline: [],
      });

      const input: ApplyBlockPatchInput = {
        apiVersion: 'v1',
        objectId,
        ops: [
          {
            op: 'block.delete',
            blockId: parent,
            subtree: true,
          },
        ],
      };

      const result = applyBlockPatch(db, input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.result.applied.deletedBlockIds).toContain(parent);
        expect(result.result.applied.deletedBlockIds).toContain(child);
      }
    });

    it('tracks multiple deletes', () => {
      const block1 = createTestBlock(db, objectId, null, 'a0', 'paragraph', {
        inline: [],
      });
      const block2 = createTestBlock(db, objectId, null, 'a1', 'paragraph', {
        inline: [],
      });

      const input: ApplyBlockPatchInput = {
        apiVersion: 'v1',
        objectId,
        ops: [
          {
            op: 'block.delete',
            blockId: block1,
          },
          {
            op: 'block.delete',
            blockId: block2,
          },
        ],
      };

      const result = applyBlockPatch(db, input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.result.applied.deletedBlockIds).toContain(block1);
        expect(result.result.applied.deletedBlockIds).toContain(block2);
      }
    });
  });
});

describe('applyBlockPatch - integration tests', () => {
  let db: TypenoteDb;
  let typeId: string;
  let objectId: string;

  beforeEach(() => {
    db = createTestDb();
    typeId = createTestObjectType(db, 'page');
    objectId = createTestObject(db, typeId, 'Test Page');
  });

  afterEach(() => {
    closeDb(db);
  });

  describe('multi-op patches', () => {
    it('insert, update, move in single patch', () => {
      const existingBlock = createTestBlock(db, objectId, null, 'a0', 'paragraph', {
        inline: [{ t: 'text', text: 'Existing' }],
      });

      const newBlockId = generateId();
      const input: ApplyBlockPatchInput = {
        apiVersion: 'v1',
        objectId,
        ops: [
          // Insert new block
          {
            op: 'block.insert',
            blockId: newBlockId,
            parentBlockId: null,
            place: { where: 'end' },
            blockType: 'paragraph',
            content: { inline: [{ t: 'text', text: 'New block' }] },
          },
          // Update existing block
          {
            op: 'block.update',
            blockId: existingBlock,
            patch: {
              content: { inline: [{ t: 'text', text: 'Updated' }] },
            },
          },
          // Move new block under existing
          {
            op: 'block.move',
            blockId: newBlockId,
            newParentBlockId: existingBlock,
            place: { where: 'end' },
          },
        ],
      };

      const result = applyBlockPatch(db, input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.result.applied.insertedBlockIds).toContain(newBlockId);
        expect(result.result.applied.updatedBlockIds).toContain(existingBlock);
        expect(result.result.applied.movedBlockIds).toContain(newBlockId);
      }

      // Verify state
      const movedBlock = getBlockById(db, newBlockId);
      expect(movedBlock?.parentBlockId).toBe(existingBlock);

      const updatedBlock = getBlockById(db, existingBlock);
      const content = JSON.parse(updatedBlock?.content ?? '{}');
      expect(content.inline[0].text).toBe('Updated');
    });

    it('insert and delete in same patch', () => {
      const toDelete = createTestBlock(db, objectId, null, 'a0', 'paragraph', {
        inline: [],
      });

      const newBlockId = generateId();
      const input: ApplyBlockPatchInput = {
        apiVersion: 'v1',
        objectId,
        ops: [
          {
            op: 'block.insert',
            blockId: newBlockId,
            parentBlockId: null,
            place: { where: 'end' },
            blockType: 'paragraph',
            content: { inline: [{ t: 'text', text: 'New' }] },
          },
          {
            op: 'block.delete',
            blockId: toDelete,
          },
        ],
      };

      const result = applyBlockPatch(db, input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.result.applied.insertedBlockIds).toContain(newBlockId);
        expect(result.result.applied.deletedBlockIds).toContain(toDelete);
      }

      // Verify new block exists
      expect(getBlockById(db, newBlockId)).not.toBeNull();
      // Verify old block is deleted
      expect(getBlockById(db, toDelete)?.deletedAt).not.toBeNull();
    });

    it('move and update in same patch', () => {
      const parent = createTestBlock(db, objectId, null, 'a0', 'paragraph', {
        inline: [],
      });
      const child = createTestBlock(db, objectId, null, 'a1', 'paragraph', {
        inline: [{ t: 'text', text: 'Original' }],
      });

      const input: ApplyBlockPatchInput = {
        apiVersion: 'v1',
        objectId,
        ops: [
          {
            op: 'block.move',
            blockId: child,
            newParentBlockId: parent,
            place: { where: 'end' },
          },
          {
            op: 'block.update',
            blockId: child,
            patch: {
              content: { inline: [{ t: 'text', text: 'Updated' }] },
            },
          },
        ],
      };

      const result = applyBlockPatch(db, input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.result.applied.movedBlockIds).toContain(child);
        expect(result.result.applied.updatedBlockIds).toContain(child);
      }

      const block = getBlockById(db, child);
      expect(block?.parentBlockId).toBe(parent);
      const content = JSON.parse(block?.content ?? '{}');
      expect(content.inline[0].text).toBe('Updated');
    });
  });

  describe('version handling', () => {
    it('increments version once per patch, not per op', () => {
      const block1 = createTestBlock(db, objectId, null, 'a0', 'paragraph', {
        inline: [],
      });

      const input: ApplyBlockPatchInput = {
        apiVersion: 'v1',
        objectId,
        ops: [
          {
            op: 'block.update',
            blockId: block1,
            patch: { content: { inline: [{ t: 'text', text: 'One' }] } },
          },
          {
            op: 'block.insert',
            blockId: generateId(),
            parentBlockId: null,
            place: { where: 'end' },
            blockType: 'paragraph',
            content: { inline: [] },
          },
          {
            op: 'block.insert',
            blockId: generateId(),
            parentBlockId: null,
            place: { where: 'end' },
            blockType: 'paragraph',
            content: { inline: [] },
          },
        ],
      };

      const result = applyBlockPatch(db, input);

      expect(result.success).toBe(true);
      if (result.success) {
        // Version should only increment by 1, not by 3
        expect(result.result.previousDocVersion).toBe(0);
        expect(result.result.newDocVersion).toBe(1);
      }
    });

    it('consecutive patches increment version sequentially', () => {
      const input1: ApplyBlockPatchInput = {
        apiVersion: 'v1',
        objectId,
        ops: [],
      };
      const input2: ApplyBlockPatchInput = {
        apiVersion: 'v1',
        objectId,
        ops: [],
      };
      const input3: ApplyBlockPatchInput = {
        apiVersion: 'v1',
        objectId,
        ops: [],
      };

      const result1 = applyBlockPatch(db, input1);
      const result2 = applyBlockPatch(db, input2);
      const result3 = applyBlockPatch(db, input3);

      expect(result1.success).toBe(true);
      expect(result2.success).toBe(true);
      expect(result3.success).toBe(true);

      if (result1.success && result2.success && result3.success) {
        expect(result1.result.newDocVersion).toBe(1);
        expect(result2.result.newDocVersion).toBe(2);
        expect(result3.result.newDocVersion).toBe(3);
      }
    });
  });

  describe('full workflow', () => {
    it('create tree, edit, rearrange, delete', () => {
      // Step 1: Create initial tree structure
      const rootId = generateId();
      const child1Id = generateId();
      const child2Id = generateId();

      const createResult = applyBlockPatch(db, {
        apiVersion: 'v1',
        objectId,
        ops: [
          {
            op: 'block.insert',
            blockId: rootId,
            parentBlockId: null,
            place: { where: 'end' },
            blockType: 'heading',
            content: { level: 1, inline: [{ t: 'text', text: 'Title' }] },
          },
          {
            op: 'block.insert',
            blockId: child1Id,
            parentBlockId: rootId,
            place: { where: 'end' },
            blockType: 'paragraph',
            content: { inline: [{ t: 'text', text: 'First paragraph' }] },
          },
          {
            op: 'block.insert',
            blockId: child2Id,
            parentBlockId: rootId,
            place: { where: 'end' },
            blockType: 'paragraph',
            content: { inline: [{ t: 'text', text: 'Second paragraph' }] },
          },
        ],
      });

      expect(createResult.success).toBe(true);
      if (createResult.success) {
        expect(createResult.result.applied.insertedBlockIds).toHaveLength(3);
        expect(createResult.result.newDocVersion).toBe(1);
      }

      // Step 2: Edit the title
      const editResult = applyBlockPatch(db, {
        apiVersion: 'v1',
        objectId,
        baseDocVersion: 1,
        ops: [
          {
            op: 'block.update',
            blockId: rootId,
            patch: {
              content: { level: 1, inline: [{ t: 'text', text: 'Updated Title' }] },
            },
          },
        ],
      });

      expect(editResult.success).toBe(true);
      if (editResult.success) {
        expect(editResult.result.newDocVersion).toBe(2);
      }

      // Step 3: Rearrange - move child2 before child1
      const rearrangeResult = applyBlockPatch(db, {
        apiVersion: 'v1',
        objectId,
        baseDocVersion: 2,
        ops: [
          {
            op: 'block.move',
            blockId: child2Id,
            newParentBlockId: rootId,
            place: { where: 'before', siblingBlockId: child1Id },
          },
        ],
      });

      expect(rearrangeResult.success).toBe(true);
      if (rearrangeResult.success) {
        expect(rearrangeResult.result.newDocVersion).toBe(3);
      }

      // Verify order: child2 should now come before child1
      const c1 = getBlockById(db, child1Id);
      const c2 = getBlockById(db, child2Id);
      expect((c2?.orderKey ?? '') < (c1?.orderKey ?? '')).toBe(true);

      // Step 4: Delete child1
      const deleteResult = applyBlockPatch(db, {
        apiVersion: 'v1',
        objectId,
        baseDocVersion: 3,
        ops: [
          {
            op: 'block.delete',
            blockId: child1Id,
          },
        ],
      });

      expect(deleteResult.success).toBe(true);
      if (deleteResult.success) {
        expect(deleteResult.result.newDocVersion).toBe(4);
      }

      // Verify final state
      expect(getBlockById(db, rootId)?.deletedAt).toBeNull();
      expect(getBlockById(db, child2Id)?.deletedAt).toBeNull();
      expect(getBlockById(db, child1Id)?.deletedAt).not.toBeNull();
    });

    it('handles complex nested operations', () => {
      // Create: root -> [section1 -> [para1, para2], section2 -> [para3]]
      const rootId = generateId();
      const section1Id = generateId();
      const section2Id = generateId();
      const para1Id = generateId();
      const para2Id = generateId();
      const para3Id = generateId();

      const createResult = applyBlockPatch(db, {
        apiVersion: 'v1',
        objectId,
        ops: [
          {
            op: 'block.insert',
            blockId: rootId,
            parentBlockId: null,
            place: { where: 'end' },
            blockType: 'heading',
            content: { level: 1, inline: [{ t: 'text', text: 'Document' }] },
          },
          {
            op: 'block.insert',
            blockId: section1Id,
            parentBlockId: rootId,
            place: { where: 'end' },
            blockType: 'heading',
            content: { level: 2, inline: [{ t: 'text', text: 'Section 1' }] },
          },
          {
            op: 'block.insert',
            blockId: para1Id,
            parentBlockId: section1Id,
            place: { where: 'end' },
            blockType: 'paragraph',
            content: { inline: [{ t: 'text', text: 'Para 1' }] },
          },
          {
            op: 'block.insert',
            blockId: para2Id,
            parentBlockId: section1Id,
            place: { where: 'end' },
            blockType: 'paragraph',
            content: { inline: [{ t: 'text', text: 'Para 2' }] },
          },
          {
            op: 'block.insert',
            blockId: section2Id,
            parentBlockId: rootId,
            place: { where: 'end' },
            blockType: 'heading',
            content: { level: 2, inline: [{ t: 'text', text: 'Section 2' }] },
          },
          {
            op: 'block.insert',
            blockId: para3Id,
            parentBlockId: section2Id,
            place: { where: 'end' },
            blockType: 'paragraph',
            content: { inline: [{ t: 'text', text: 'Para 3' }] },
          },
        ],
      });

      expect(createResult.success).toBe(true);

      // Move para2 from section1 to section2
      const moveResult = applyBlockPatch(db, {
        apiVersion: 'v1',
        objectId,
        ops: [
          {
            op: 'block.move',
            blockId: para2Id,
            newParentBlockId: section2Id,
            place: { where: 'end' },
          },
        ],
      });

      expect(moveResult.success).toBe(true);
      expect(getBlockById(db, para2Id)?.parentBlockId).toBe(section2Id);

      // Delete section1 with subtree
      const deleteResult = applyBlockPatch(db, {
        apiVersion: 'v1',
        objectId,
        ops: [
          {
            op: 'block.delete',
            blockId: section1Id,
            subtree: true,
          },
        ],
      });

      expect(deleteResult.success).toBe(true);
      if (deleteResult.success) {
        // section1 and para1 should be deleted
        expect(deleteResult.result.applied.deletedBlockIds).toContain(section1Id);
        expect(deleteResult.result.applied.deletedBlockIds).toContain(para1Id);
        // para2 was moved out, should NOT be in deleted list
        expect(deleteResult.result.applied.deletedBlockIds).not.toContain(para2Id);
      }

      // Verify para2 is still alive (it was moved before delete)
      expect(getBlockById(db, para2Id)?.deletedAt).toBeNull();
    });
  });
});
