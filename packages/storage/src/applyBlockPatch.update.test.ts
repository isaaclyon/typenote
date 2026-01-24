/**
 * block.update operation tests for applyBlockPatch.
 * Tests content and meta updates, validation, and preserving unchanged fields.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  type TestContext,
  createTestContext,
  cleanupTestContext,
  createTestBlock,
  createTestObject,
  getBlockById,
  applyBlockPatch,
  type ApplyBlockPatchInput,
} from './applyBlockPatch.test-helpers.js';
import { getObject } from './objectService.js';

describe('applyBlockPatch - block.update', () => {
  let ctx: TestContext;

  beforeEach(() => {
    ctx = createTestContext();
  });

  afterEach(() => {
    cleanupTestContext(ctx);
  });

  describe('basic updates', () => {
    it('updates block content', () => {
      const blockId = createTestBlock(ctx.db, ctx.objectId, null, 'a0', 'paragraph', {
        inline: [{ t: 'text', text: 'Original' }],
      });

      const input: ApplyBlockPatchInput = {
        apiVersion: 'v1',
        objectId: ctx.objectId,
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

      const result = applyBlockPatch(ctx.db, input);

      expect(result.success).toBe(true);
      const block = getBlockById(ctx.db, blockId);
      const content = JSON.parse(block?.content ?? '{}');
      expect(content.inline[0].text).toBe('Updated');
    });

    it('updates block meta', () => {
      const blockId = createTestBlock(ctx.db, ctx.objectId, null, 'a0', 'paragraph', {
        inline: [],
      });

      const input: ApplyBlockPatchInput = {
        apiVersion: 'v1',
        objectId: ctx.objectId,
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

      const result = applyBlockPatch(ctx.db, input);

      expect(result.success).toBe(true);
      const block = getBlockById(ctx.db, blockId);
      const meta = JSON.parse(block?.meta ?? '{}');
      expect(meta.collapsed).toBe(true);
    });

    it('updates both content and meta in single op', () => {
      const blockId = createTestBlock(ctx.db, ctx.objectId, null, 'a0', 'paragraph', {
        inline: [{ t: 'text', text: 'Original' }],
      });

      const input: ApplyBlockPatchInput = {
        apiVersion: 'v1',
        objectId: ctx.objectId,
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

      const result = applyBlockPatch(ctx.db, input);

      expect(result.success).toBe(true);
      const block = getBlockById(ctx.db, blockId);
      const content = JSON.parse(block?.content ?? '{}');
      const meta = JSON.parse(block?.meta ?? '{}');
      expect(content.inline[0].text).toBe('Updated');
      expect(meta.collapsed).toBe(true);
    });

    it('preserves unchanged fields when updating content only', () => {
      const blockId = createTestBlock(ctx.db, ctx.objectId, null, 'a0', 'paragraph', {
        inline: [{ t: 'text', text: 'Original' }],
      });
      // Set meta
      ctx.db.run('UPDATE blocks SET meta = ? WHERE id = ?', [
        JSON.stringify({ collapsed: true }),
        blockId,
      ]);

      const input: ApplyBlockPatchInput = {
        apiVersion: 'v1',
        objectId: ctx.objectId,
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

      const result = applyBlockPatch(ctx.db, input);

      expect(result.success).toBe(true);
      const block = getBlockById(ctx.db, blockId);
      const meta = JSON.parse(block?.meta ?? '{}');
      expect(meta.collapsed).toBe(true); // Meta preserved
    });

    it('preserves unchanged fields when updating meta only', () => {
      const blockId = createTestBlock(ctx.db, ctx.objectId, null, 'a0', 'paragraph', {
        inline: [{ t: 'text', text: 'Original' }],
      });

      const input: ApplyBlockPatchInput = {
        apiVersion: 'v1',
        objectId: ctx.objectId,
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

      const result = applyBlockPatch(ctx.db, input);

      expect(result.success).toBe(true);
      const block = getBlockById(ctx.db, blockId);
      const content = JSON.parse(block?.content ?? '{}');
      expect(content.inline[0].text).toBe('Original'); // Content preserved
    });
  });

  describe('block existence', () => {
    it('returns NOT_FOUND_BLOCK for non-existent block', () => {
      const input: ApplyBlockPatchInput = {
        apiVersion: 'v1',
        objectId: ctx.objectId,
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

      const result = applyBlockPatch(ctx.db, input);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('NOT_FOUND_BLOCK');
      }
    });

    it('returns NOT_FOUND_BLOCK for deleted block', () => {
      const blockId = createTestBlock(ctx.db, ctx.objectId, null, 'a0', 'paragraph', {
        inline: [],
      });
      // Soft-delete the block
      ctx.db.run('UPDATE blocks SET deleted_at = ? WHERE id = ?', [Date.now(), blockId]);

      const input: ApplyBlockPatchInput = {
        apiVersion: 'v1',
        objectId: ctx.objectId,
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

      const result = applyBlockPatch(ctx.db, input);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('NOT_FOUND_BLOCK');
      }
    });

    it('returns INVARIANT_CROSS_OBJECT for block in different object', () => {
      const otherObjectId = createTestObject(ctx.db, ctx.typeId, 'Other Page');
      const otherBlockId = createTestBlock(ctx.db, otherObjectId, null, 'a0', 'paragraph', {
        inline: [],
      });

      const input: ApplyBlockPatchInput = {
        apiVersion: 'v1',
        objectId: ctx.objectId,
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

      const result = applyBlockPatch(ctx.db, input);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('INVARIANT_CROSS_OBJECT');
      }
    });
  });

  describe('block type change', () => {
    it('returns VALIDATION error when attempting to change block type', () => {
      const blockId = createTestBlock(ctx.db, ctx.objectId, null, 'a0', 'paragraph', {
        inline: [],
      });

      const input: ApplyBlockPatchInput = {
        apiVersion: 'v1',
        objectId: ctx.objectId,
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

      const result = applyBlockPatch(ctx.db, input);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('VALIDATION');
        expect(result.error.message).toContain('block type');
      }
    });

    it('succeeds when blockType in patch matches existing type', () => {
      const blockId = createTestBlock(ctx.db, ctx.objectId, null, 'a0', 'paragraph', {
        inline: [],
      });

      const input: ApplyBlockPatchInput = {
        apiVersion: 'v1',
        objectId: ctx.objectId,
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

      const result = applyBlockPatch(ctx.db, input);

      expect(result.success).toBe(true);
    });
  });

  describe('content validation', () => {
    it('validates new content against block type schema', () => {
      const blockId = createTestBlock(ctx.db, ctx.objectId, null, 'a0', 'heading', {
        level: 1,
        inline: [],
      });

      const input: ApplyBlockPatchInput = {
        apiVersion: 'v1',
        objectId: ctx.objectId,
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

      const result = applyBlockPatch(ctx.db, input);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('VALIDATION');
      }
    });

    it('accepts valid content for block type', () => {
      const blockId = createTestBlock(ctx.db, ctx.objectId, null, 'a0', 'heading', {
        level: 1,
        inline: [],
      });

      const input: ApplyBlockPatchInput = {
        apiVersion: 'v1',
        objectId: ctx.objectId,
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

      const result = applyBlockPatch(ctx.db, input);

      expect(result.success).toBe(true);
      const block = getBlockById(ctx.db, blockId);
      const content = JSON.parse(block?.content ?? '{}');
      expect(content.level).toBe(2);
    });
  });

  describe('result tracking', () => {
    it('includes blockId in applied.updatedBlockIds', () => {
      const blockId = createTestBlock(ctx.db, ctx.objectId, null, 'a0', 'paragraph', {
        inline: [],
      });

      const input: ApplyBlockPatchInput = {
        apiVersion: 'v1',
        objectId: ctx.objectId,
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

      const result = applyBlockPatch(ctx.db, input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.result.applied.updatedBlockIds).toContain(blockId);
      }
    });

    it('tracks multiple updates', () => {
      const blockId1 = createTestBlock(ctx.db, ctx.objectId, null, 'a0', 'paragraph', {
        inline: [],
      });
      const blockId2 = createTestBlock(ctx.db, ctx.objectId, null, 'a1', 'paragraph', {
        inline: [],
      });

      const input: ApplyBlockPatchInput = {
        apiVersion: 'v1',
        objectId: ctx.objectId,
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

      const result = applyBlockPatch(ctx.db, input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.result.applied.updatedBlockIds).toContain(blockId1);
        expect(result.result.applied.updatedBlockIds).toContain(blockId2);
      }
    });
  });

  describe('updatedAt timestamp', () => {
    it('updates the updatedAt timestamp on block update', () => {
      const blockId = createTestBlock(ctx.db, ctx.objectId, null, 'a0', 'paragraph', {
        inline: [],
      });

      const blockBefore = getBlockById(ctx.db, blockId);
      const updatedAtBefore = blockBefore?.updatedAt?.getTime() ?? 0;

      const input: ApplyBlockPatchInput = {
        apiVersion: 'v1',
        objectId: ctx.objectId,
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

      const result = applyBlockPatch(ctx.db, input);

      expect(result.success).toBe(true);
      const blockAfter = getBlockById(ctx.db, blockId);
      const updatedAtAfter = blockAfter?.updatedAt?.getTime() ?? 0;
      expect(updatedAtAfter).toBeGreaterThanOrEqual(updatedAtBefore);
    });

    it('updates the object updatedAt timestamp on patch', () => {
      const blockId = createTestBlock(ctx.db, ctx.objectId, null, 'a0', 'paragraph', {
        inline: [],
      });
      const objectBefore = getObject(ctx.db, ctx.objectId);
      const updatedAtBefore = objectBefore?.updatedAt?.getTime() ?? 0;

      const startedAt = Date.now();
      const input: ApplyBlockPatchInput = {
        apiVersion: 'v1',
        objectId: ctx.objectId,
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

      const result = applyBlockPatch(ctx.db, input);

      expect(result.success).toBe(true);
      const objectAfter = getObject(ctx.db, ctx.objectId);
      const updatedAtAfter = objectAfter?.updatedAt?.getTime() ?? 0;

      expect(updatedAtAfter).toBeGreaterThanOrEqual(updatedAtBefore);
      expect(updatedAtAfter).toBeGreaterThanOrEqual(startedAt - 2000);
      expect(updatedAtAfter).toBeLessThanOrEqual(Date.now() + 2000);
    });
  });
});
