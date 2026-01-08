/**
 * Attachment block operation tests for applyBlockPatch.
 *
 * Tests that applyBlockPatch correctly handles attachment blocks:
 * - Links attachments when attachment blocks are inserted
 * - Validates attachmentId exists on insert
 * - Handles attachment changes on block.update
 * - Unlinks attachments when blocks are deleted
 * - Handles subtree delete with multiple attachment blocks
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createTestDb, closeDb, type TypenoteDb } from './db.js';
import { createTestObjectType, createTestObject } from './testFixtures.js';
import { applyBlockPatch } from './applyBlockPatch.js';
import { InMemoryFileService, type FileService } from './fileService.js';
import {
  uploadAttachment,
  getAttachment,
  getBlockAttachments,
  getAttachmentBlocks,
} from './attachmentService.js';
import { generateId } from '@typenote/core';
import type { ApplyBlockPatchInput } from '@typenote/api';

describe('applyBlockPatch - attachment blocks', () => {
  let db: TypenoteDb;
  let fileService: FileService;
  let typeId: string;
  let objectId: string;

  /**
   * Helper to create a test attachment.
   */
  function createTestAttachment(content = 'test content'): string {
    const fileData = Buffer.from(content);
    const result = uploadAttachment(db, fileService, {
      filename: 'test.png',
      mimeType: 'image/png',
      sizeBytes: fileData.length,
      fileData,
    });
    return result.attachmentId;
  }

  beforeEach(() => {
    db = createTestDb();
    fileService = new InMemoryFileService();

    // Create a test object type and object
    typeId = createTestObjectType(db, 'page');
    objectId = createTestObject(db, typeId, 'Test Page');
  });

  afterEach(() => {
    closeDb(db);
  });

  describe('block.insert with attachment type', () => {
    it('links attachment when inserting attachment block', () => {
      const attachmentId = createTestAttachment();
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
            blockType: 'attachment',
            content: { attachmentId },
          },
        ],
      };

      const result = applyBlockPatch(db, input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.result.applied.insertedBlockIds).toContain(blockId);
      }

      // Verify attachment is linked to the block
      const blockAttachments = getBlockAttachments(db, blockId);
      expect(blockAttachments).toHaveLength(1);
      expect(blockAttachments[0]?.id).toBe(attachmentId);

      // Verify block is tracked in attachment's references
      const attachmentBlocks = getAttachmentBlocks(db, attachmentId);
      expect(attachmentBlocks).toContain(blockId);
    });

    it('rejects insert with non-existent attachmentId', () => {
      const blockId = generateId();
      const fakeAttachmentId = generateId(); // Doesn't exist

      const input: ApplyBlockPatchInput = {
        apiVersion: 'v1',
        objectId,
        ops: [
          {
            op: 'block.insert',
            blockId,
            parentBlockId: null,
            place: { where: 'end' },
            blockType: 'attachment',
            content: { attachmentId: fakeAttachmentId },
          },
        ],
      };

      const result = applyBlockPatch(db, input);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('NOT_FOUND_ATTACHMENT');
      }
    });

    it('validates attachment content schema', () => {
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
            blockType: 'attachment',
            content: { invalid: 'content' }, // Missing attachmentId
          },
        ],
      };

      const result = applyBlockPatch(db, input);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('VALIDATION');
      }
    });

    it('stores attachment content with optional alt and caption', () => {
      const attachmentId = createTestAttachment();
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
            blockType: 'attachment',
            content: {
              attachmentId,
              alt: 'Screenshot of app',
              caption: 'Figure 1: Application screenshot',
            },
          },
        ],
      };

      const result = applyBlockPatch(db, input);

      expect(result.success).toBe(true);

      // Verify content is stored correctly
      const block = db.all<{ content: string }>('SELECT content FROM blocks WHERE id = ?', [
        blockId,
      ])[0];
      const content = JSON.parse(block?.content ?? '{}') as {
        attachmentId: string;
        alt?: string;
        caption?: string;
      };
      expect(content.attachmentId).toBe(attachmentId);
      expect(content.alt).toBe('Screenshot of app');
      expect(content.caption).toBe('Figure 1: Application screenshot');
    });

    it('clears orphan status when linking previously orphaned attachment', () => {
      // Create attachment and immediately orphan it
      const attachmentId = createTestAttachment();
      db.run('UPDATE attachments SET orphaned_at = ? WHERE id = ?', [Date.now(), attachmentId]);

      // Verify it's orphaned
      const beforeInsert = getAttachment(db, attachmentId);
      expect(beforeInsert?.orphanedAt).not.toBeNull();

      // Insert block referencing it
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
            blockType: 'attachment',
            content: { attachmentId },
          },
        ],
      };

      const result = applyBlockPatch(db, input);
      expect(result.success).toBe(true);

      // Verify orphan status cleared
      const afterInsert = getAttachment(db, attachmentId);
      expect(afterInsert?.orphanedAt).toBeNull();
    });
  });

  describe('block.update with attachment type', () => {
    it('unlinks old attachment and links new one when changing attachmentId', () => {
      const oldAttachmentId = createTestAttachment('old content');
      const newAttachmentId = createTestAttachment('new content');
      const blockId = generateId();

      // Insert block with old attachment
      const insertInput: ApplyBlockPatchInput = {
        apiVersion: 'v1',
        objectId,
        ops: [
          {
            op: 'block.insert',
            blockId,
            parentBlockId: null,
            place: { where: 'end' },
            blockType: 'attachment',
            content: { attachmentId: oldAttachmentId },
          },
        ],
      };
      applyBlockPatch(db, insertInput);

      // Verify old attachment is linked
      expect(getBlockAttachments(db, blockId)).toHaveLength(1);
      expect(getBlockAttachments(db, blockId)[0]?.id).toBe(oldAttachmentId);

      // Update to new attachment
      const updateInput: ApplyBlockPatchInput = {
        apiVersion: 'v1',
        objectId,
        ops: [
          {
            op: 'block.update',
            blockId,
            patch: {
              content: { attachmentId: newAttachmentId },
            },
          },
        ],
      };

      const result = applyBlockPatch(db, updateInput);
      expect(result.success).toBe(true);

      // Verify new attachment is linked
      const blockAttachments = getBlockAttachments(db, blockId);
      expect(blockAttachments).toHaveLength(1);
      expect(blockAttachments[0]?.id).toBe(newAttachmentId);

      // Verify old attachment is unlinked and orphaned
      const oldAttachment = getAttachment(db, oldAttachmentId);
      expect(oldAttachment?.orphanedAt).not.toBeNull();

      // Verify old attachment has no block references
      expect(getAttachmentBlocks(db, oldAttachmentId)).toHaveLength(0);
    });

    it('rejects update to non-existent attachmentId', () => {
      const attachmentId = createTestAttachment();
      const blockId = generateId();

      // Insert block
      const insertInput: ApplyBlockPatchInput = {
        apiVersion: 'v1',
        objectId,
        ops: [
          {
            op: 'block.insert',
            blockId,
            parentBlockId: null,
            place: { where: 'end' },
            blockType: 'attachment',
            content: { attachmentId },
          },
        ],
      };
      applyBlockPatch(db, insertInput);

      // Try to update to non-existent attachment
      const updateInput: ApplyBlockPatchInput = {
        apiVersion: 'v1',
        objectId,
        ops: [
          {
            op: 'block.update',
            blockId,
            patch: {
              content: { attachmentId: generateId() },
            },
          },
        ],
      };

      const result = applyBlockPatch(db, updateInput);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('NOT_FOUND_ATTACHMENT');
      }
    });

    it('does not change links when updating alt/caption only', () => {
      const attachmentId = createTestAttachment();
      const blockId = generateId();

      // Insert block
      const insertInput: ApplyBlockPatchInput = {
        apiVersion: 'v1',
        objectId,
        ops: [
          {
            op: 'block.insert',
            blockId,
            parentBlockId: null,
            place: { where: 'end' },
            blockType: 'attachment',
            content: { attachmentId },
          },
        ],
      };
      applyBlockPatch(db, insertInput);

      // Update alt/caption only (same attachmentId)
      const updateInput: ApplyBlockPatchInput = {
        apiVersion: 'v1',
        objectId,
        ops: [
          {
            op: 'block.update',
            blockId,
            patch: {
              content: {
                attachmentId,
                alt: 'New alt text',
                caption: 'New caption',
              },
            },
          },
        ],
      };

      const result = applyBlockPatch(db, updateInput);
      expect(result.success).toBe(true);

      // Attachment should still be linked (not orphaned)
      const attachment = getAttachment(db, attachmentId);
      expect(attachment?.orphanedAt).toBeNull();

      // Block should still reference the attachment
      const blockAttachments = getBlockAttachments(db, blockId);
      expect(blockAttachments).toHaveLength(1);
      expect(blockAttachments[0]?.id).toBe(attachmentId);
    });
  });

  describe('block.delete with attachment type', () => {
    it('unlinks attachment when deleting attachment block', () => {
      const attachmentId = createTestAttachment();
      const blockId = generateId();

      // Insert block
      const insertInput: ApplyBlockPatchInput = {
        apiVersion: 'v1',
        objectId,
        ops: [
          {
            op: 'block.insert',
            blockId,
            parentBlockId: null,
            place: { where: 'end' },
            blockType: 'attachment',
            content: { attachmentId },
          },
        ],
      };
      applyBlockPatch(db, insertInput);

      // Verify attached
      expect(getBlockAttachments(db, blockId)).toHaveLength(1);

      // Delete block
      const deleteInput: ApplyBlockPatchInput = {
        apiVersion: 'v1',
        objectId,
        ops: [
          {
            op: 'block.delete',
            blockId,
          },
        ],
      };

      const result = applyBlockPatch(db, deleteInput);
      expect(result.success).toBe(true);

      // Attachment should be orphaned (no more references)
      const attachment = getAttachment(db, attachmentId);
      expect(attachment?.orphanedAt).not.toBeNull();

      // No block references should remain
      expect(getAttachmentBlocks(db, attachmentId)).toHaveLength(0);
    });

    it('does not orphan attachment if other blocks reference it', () => {
      const attachmentId = createTestAttachment();
      const blockId1 = generateId();
      const blockId2 = generateId();

      // Insert two blocks referencing the same attachment
      const insertInput: ApplyBlockPatchInput = {
        apiVersion: 'v1',
        objectId,
        ops: [
          {
            op: 'block.insert',
            blockId: blockId1,
            parentBlockId: null,
            place: { where: 'end' },
            blockType: 'attachment',
            content: { attachmentId },
          },
          {
            op: 'block.insert',
            blockId: blockId2,
            parentBlockId: null,
            place: { where: 'end' },
            blockType: 'attachment',
            content: { attachmentId },
          },
        ],
      };
      applyBlockPatch(db, insertInput);

      // Delete first block
      const deleteInput: ApplyBlockPatchInput = {
        apiVersion: 'v1',
        objectId,
        ops: [
          {
            op: 'block.delete',
            blockId: blockId1,
          },
        ],
      };

      const result = applyBlockPatch(db, deleteInput);
      expect(result.success).toBe(true);

      // Attachment should NOT be orphaned (second block still references it)
      const attachment = getAttachment(db, attachmentId);
      expect(attachment?.orphanedAt).toBeNull();

      // Second block should still reference the attachment
      expect(getAttachmentBlocks(db, attachmentId)).toContain(blockId2);
    });
  });

  describe('subtree delete with attachment blocks', () => {
    it('unlinks all attachment blocks in deleted subtree', () => {
      const attachment1 = createTestAttachment('content 1');
      const attachment2 = createTestAttachment('content 2');
      const attachment3 = createTestAttachment('content 3');

      const parentBlockId = generateId();
      const childBlock1 = generateId();
      const childBlock2 = generateId();

      // Create parent with two child attachment blocks
      const insertInput: ApplyBlockPatchInput = {
        apiVersion: 'v1',
        objectId,
        ops: [
          {
            op: 'block.insert',
            blockId: parentBlockId,
            parentBlockId: null,
            place: { where: 'end' },
            blockType: 'attachment',
            content: { attachmentId: attachment1 },
          },
          {
            op: 'block.insert',
            blockId: childBlock1,
            parentBlockId: parentBlockId,
            place: { where: 'end' },
            blockType: 'attachment',
            content: { attachmentId: attachment2 },
          },
          {
            op: 'block.insert',
            blockId: childBlock2,
            parentBlockId: parentBlockId,
            place: { where: 'end' },
            blockType: 'attachment',
            content: { attachmentId: attachment3 },
          },
        ],
      };
      applyBlockPatch(db, insertInput);

      // Verify all attachments are linked
      expect(getBlockAttachments(db, parentBlockId)).toHaveLength(1);
      expect(getBlockAttachments(db, childBlock1)).toHaveLength(1);
      expect(getBlockAttachments(db, childBlock2)).toHaveLength(1);

      // Delete subtree starting from parent
      const deleteInput: ApplyBlockPatchInput = {
        apiVersion: 'v1',
        objectId,
        ops: [
          {
            op: 'block.delete',
            blockId: parentBlockId,
            subtree: true,
          },
        ],
      };

      const result = applyBlockPatch(db, deleteInput);
      expect(result.success).toBe(true);

      // All three attachments should be orphaned
      expect(getAttachment(db, attachment1)?.orphanedAt).not.toBeNull();
      expect(getAttachment(db, attachment2)?.orphanedAt).not.toBeNull();
      expect(getAttachment(db, attachment3)?.orphanedAt).not.toBeNull();

      // No block references should remain
      expect(getAttachmentBlocks(db, attachment1)).toHaveLength(0);
      expect(getAttachmentBlocks(db, attachment2)).toHaveLength(0);
      expect(getAttachmentBlocks(db, attachment3)).toHaveLength(0);
    });

    it('handles mixed subtree with attachment and non-attachment blocks', () => {
      const attachment1 = createTestAttachment();

      const paragraphParent = generateId();
      const attachmentChild = generateId();
      const paragraphChild = generateId();

      // Create parent (paragraph) with mixed children
      const insertInput: ApplyBlockPatchInput = {
        apiVersion: 'v1',
        objectId,
        ops: [
          {
            op: 'block.insert',
            blockId: paragraphParent,
            parentBlockId: null,
            place: { where: 'end' },
            blockType: 'paragraph',
            content: { inline: [{ t: 'text', text: 'Parent' }] },
          },
          {
            op: 'block.insert',
            blockId: attachmentChild,
            parentBlockId: paragraphParent,
            place: { where: 'end' },
            blockType: 'attachment',
            content: { attachmentId: attachment1 },
          },
          {
            op: 'block.insert',
            blockId: paragraphChild,
            parentBlockId: paragraphParent,
            place: { where: 'end' },
            blockType: 'paragraph',
            content: { inline: [{ t: 'text', text: 'Sibling' }] },
          },
        ],
      };
      applyBlockPatch(db, insertInput);

      // Delete subtree
      const deleteInput: ApplyBlockPatchInput = {
        apiVersion: 'v1',
        objectId,
        ops: [
          {
            op: 'block.delete',
            blockId: paragraphParent,
            subtree: true,
          },
        ],
      };

      const result = applyBlockPatch(db, deleteInput);
      expect(result.success).toBe(true);

      // Only the attachment should be orphaned
      expect(getAttachment(db, attachment1)?.orphanedAt).not.toBeNull();
      expect(getAttachmentBlocks(db, attachment1)).toHaveLength(0);
    });
  });

  describe('transaction atomicity', () => {
    it('rolls back attachment linking on subsequent operation failure', () => {
      const attachmentId = createTestAttachment();
      const blockId = generateId();

      // Try to insert attachment block and then an invalid operation
      const input: ApplyBlockPatchInput = {
        apiVersion: 'v1',
        objectId,
        ops: [
          {
            op: 'block.insert',
            blockId,
            parentBlockId: null,
            place: { where: 'end' },
            blockType: 'attachment',
            content: { attachmentId },
          },
          {
            op: 'block.insert',
            blockId: generateId(),
            parentBlockId: generateId(), // Non-existent parent - should fail
            place: { where: 'end' },
            blockType: 'paragraph',
            content: { inline: [] },
          },
        ],
      };

      const result = applyBlockPatch(db, input);
      expect(result.success).toBe(false);

      // The attachment should NOT be linked (transaction rolled back)
      expect(getBlockAttachments(db, blockId)).toHaveLength(0);
      expect(getAttachmentBlocks(db, attachmentId)).toHaveLength(0);
    });
  });
});
