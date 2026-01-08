/**
 * Attachment Service Tests.
 *
 * Tests for attachment CRUD, linking, orphan tracking, and cleanup operations.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { eq } from 'drizzle-orm';
import { createTestDb, closeDb, type TypenoteDb } from './db.js';
import { seedBuiltInTypes } from './objectTypeService.js';
import { createObject } from './objectService.js';
import { applyBlockPatch } from './applyBlockPatch.js';
import { InMemoryFileService, type FileService } from './fileService.js';
import { attachments } from './schema.js';
import { generateId } from '@typenote/core';
import {
  uploadAttachment,
  getAttachment,
  getAttachmentByHash,
  linkBlockToAttachment,
  unlinkBlockFromAttachment,
  getBlockAttachments,
  getAttachmentBlocks,
  listAttachments,
  cleanupOrphanedAttachments,
  AttachmentServiceError,
} from './attachmentService.js';

describe('attachmentService', () => {
  let db: TypenoteDb;
  let fileService: FileService;

  beforeEach(() => {
    db = createTestDb();
    seedBuiltInTypes(db);
    fileService = new InMemoryFileService();
  });

  afterEach(() => {
    closeDb(db);
  });

  describe('uploadAttachment', () => {
    it('stores new file and creates DB record', () => {
      const fileData = Buffer.from('test image content');
      const result = uploadAttachment(db, fileService, {
        filename: 'photo.png',
        mimeType: 'image/png',
        sizeBytes: fileData.length,
        fileData,
      });

      expect(result.wasDeduped).toBe(false);
      expect(result.attachmentId).toMatch(/^[0-9A-HJKMNP-TV-Z]{26}$/);

      // Verify DB record
      const attachment = getAttachment(db, result.attachmentId);
      expect(attachment).not.toBeNull();
      expect(attachment?.filename).toBe('photo.png');
      expect(attachment?.mimeType).toBe('image/png');
    });

    it('deduplicates by hash and returns existing', () => {
      const fileData = Buffer.from('same content');
      const first = uploadAttachment(db, fileService, {
        filename: 'file1.txt',
        mimeType: 'text/plain',
        sizeBytes: fileData.length,
        fileData,
      });

      const second = uploadAttachment(db, fileService, {
        filename: 'file2.txt', // Different name, same content
        mimeType: 'text/plain',
        sizeBytes: fileData.length,
        fileData,
      });

      expect(second.wasDeduped).toBe(true);
      expect(second.attachmentId).toBe(first.attachmentId);
    });

    it('updates lastReferencedAt on dedup', () => {
      const fileData = Buffer.from('content');
      const first = uploadAttachment(db, fileService, {
        filename: 'file.txt',
        mimeType: 'text/plain',
        sizeBytes: fileData.length,
        fileData,
      });

      const beforeDedup = getAttachment(db, first.attachmentId);

      // Small delay to ensure timestamp differs
      const second = uploadAttachment(db, fileService, {
        filename: 'file2.txt',
        mimeType: 'text/plain',
        sizeBytes: fileData.length,
        fileData,
      });

      const afterDedup = getAttachment(db, second.attachmentId);
      expect(afterDedup?.lastReferencedAt.getTime()).toBeGreaterThanOrEqual(
        beforeDedup?.lastReferencedAt.getTime() ?? 0
      );
    });

    it('rejects file exceeding size limit', () => {
      expect(() =>
        uploadAttachment(db, fileService, {
          filename: 'big.bin',
          mimeType: 'image/png',
          sizeBytes: 11 * 1024 * 1024, // 11 MB (exceeds 10 MB limit)
          fileData: Buffer.alloc(100), // Actual data doesn't matter, sizeBytes is validated
        })
      ).toThrow(AttachmentServiceError);

      try {
        uploadAttachment(db, fileService, {
          filename: 'big.bin',
          mimeType: 'image/png',
          sizeBytes: 11 * 1024 * 1024,
          fileData: Buffer.alloc(100),
        });
      } catch (err) {
        expect(err).toBeInstanceOf(AttachmentServiceError);
        expect((err as AttachmentServiceError).code).toBe('FILE_TOO_LARGE');
      }
    });

    it('rejects unsupported MIME type', () => {
      expect(() =>
        uploadAttachment(db, fileService, {
          filename: 'script.js',
          mimeType: 'application/javascript' as 'text/plain', // Cast to bypass type checking
          sizeBytes: 100,
          fileData: Buffer.from('code'),
        })
      ).toThrow(AttachmentServiceError);

      try {
        uploadAttachment(db, fileService, {
          filename: 'script.js',
          mimeType: 'application/javascript' as 'text/plain',
          sizeBytes: 100,
          fileData: Buffer.from('code'),
        });
      } catch (err) {
        expect(err).toBeInstanceOf(AttachmentServiceError);
        expect((err as AttachmentServiceError).code).toBe('UNSUPPORTED_FILE_TYPE');
      }
    });
  });

  describe('getAttachment / getAttachmentByHash', () => {
    it('returns attachment by ID', () => {
      const { attachmentId } = uploadAttachment(db, fileService, {
        filename: 'test.png',
        mimeType: 'image/png',
        sizeBytes: 10,
        fileData: Buffer.from('1234567890'),
      });

      const attachment = getAttachment(db, attachmentId);
      expect(attachment).not.toBeNull();
      expect(attachment?.id).toBe(attachmentId);
    });

    it('returns null for non-existent ID', () => {
      const attachment = getAttachment(db, 'nonexistent');
      expect(attachment).toBeNull();
    });

    it('returns attachment by SHA256 hash', () => {
      const fileData = Buffer.from('unique content');
      const { attachmentId } = uploadAttachment(db, fileService, {
        filename: 'test.txt',
        mimeType: 'text/plain',
        sizeBytes: fileData.length,
        fileData,
      });

      const hash = fileService.computeHash(fileData);
      const attachment = getAttachmentByHash(db, hash);
      expect(attachment?.id).toBe(attachmentId);
    });

    it('returns null for non-existent hash', () => {
      const attachment = getAttachmentByHash(db, 'a'.repeat(64));
      expect(attachment).toBeNull();
    });
  });

  describe('linkBlockToAttachment', () => {
    it('creates junction record', () => {
      const { attachmentId } = uploadTestAttachment(db, fileService);
      const blockId = createTestBlock(db);

      linkBlockToAttachment(db, blockId, attachmentId);

      const attachmentList = getBlockAttachments(db, blockId);
      expect(attachmentList).toHaveLength(1);
      expect(attachmentList[0]?.id).toBe(attachmentId);
    });

    it('is idempotent - no error on duplicate', () => {
      const { attachmentId } = uploadTestAttachment(db, fileService);
      const blockId = createTestBlock(db);

      linkBlockToAttachment(db, blockId, attachmentId);
      expect(() => linkBlockToAttachment(db, blockId, attachmentId)).not.toThrow();

      const attachmentList = getBlockAttachments(db, blockId);
      expect(attachmentList).toHaveLength(1);
    });

    it('clears orphanedAt when linking', () => {
      const { attachmentId } = uploadTestAttachment(db, fileService);
      const blockId = createTestBlock(db);

      // Manually mark as orphaned
      markAttachmentOrphaned(db, attachmentId);
      expect(getAttachment(db, attachmentId)?.orphanedAt).not.toBeNull();

      // Link should clear orphaned status
      linkBlockToAttachment(db, blockId, attachmentId);
      expect(getAttachment(db, attachmentId)?.orphanedAt).toBeNull();
    });

    it('throws if attachment does not exist', () => {
      const blockId = createTestBlock(db);
      expect(() => linkBlockToAttachment(db, blockId, 'nonexistent')).toThrow(
        AttachmentServiceError
      );

      try {
        linkBlockToAttachment(db, blockId, 'nonexistent');
      } catch (err) {
        expect((err as AttachmentServiceError).code).toBe('ATTACHMENT_NOT_FOUND');
      }
    });
  });

  describe('unlinkBlockFromAttachment', () => {
    it('removes junction record', () => {
      const { attachmentId } = uploadTestAttachment(db, fileService);
      const blockId = createTestBlock(db);

      linkBlockToAttachment(db, blockId, attachmentId);
      unlinkBlockFromAttachment(db, blockId, attachmentId);

      const attachmentList = getBlockAttachments(db, blockId);
      expect(attachmentList).toHaveLength(0);
    });

    it('marks orphaned when last reference removed', () => {
      const { attachmentId } = uploadTestAttachment(db, fileService);
      const blockId = createTestBlock(db);

      linkBlockToAttachment(db, blockId, attachmentId);
      unlinkBlockFromAttachment(db, blockId, attachmentId);

      const attachment = getAttachment(db, attachmentId);
      expect(attachment?.orphanedAt).not.toBeNull();
    });

    it('does NOT mark orphaned if other references exist', () => {
      const { attachmentId } = uploadTestAttachment(db, fileService);
      const blockId1 = createTestBlock(db);
      const blockId2 = createTestBlock(db);

      linkBlockToAttachment(db, blockId1, attachmentId);
      linkBlockToAttachment(db, blockId2, attachmentId);
      unlinkBlockFromAttachment(db, blockId1, attachmentId);

      const attachment = getAttachment(db, attachmentId);
      expect(attachment?.orphanedAt).toBeNull();
    });

    it('is idempotent - no error if not linked', () => {
      const { attachmentId } = uploadTestAttachment(db, fileService);
      const blockId = createTestBlock(db);

      expect(() => unlinkBlockFromAttachment(db, blockId, attachmentId)).not.toThrow();
    });
  });

  describe('getBlockAttachments / getAttachmentBlocks', () => {
    it('getBlockAttachments returns all attachments for a block', () => {
      const { attachmentId: a1 } = uploadTestAttachment(db, fileService, 'content1');
      const { attachmentId: a2 } = uploadTestAttachment(db, fileService, 'content2');
      const blockId = createTestBlock(db);

      linkBlockToAttachment(db, blockId, a1);
      linkBlockToAttachment(db, blockId, a2);

      const attachmentList = getBlockAttachments(db, blockId);
      expect(attachmentList).toHaveLength(2);
    });

    it('getAttachmentBlocks returns all blocks referencing an attachment', () => {
      const { attachmentId } = uploadTestAttachment(db, fileService);
      const blockId1 = createTestBlock(db);
      const blockId2 = createTestBlock(db);

      linkBlockToAttachment(db, blockId1, attachmentId);
      linkBlockToAttachment(db, blockId2, attachmentId);

      const blockIds = getAttachmentBlocks(db, attachmentId);
      expect(blockIds).toHaveLength(2);
      expect(blockIds).toContain(blockId1);
      expect(blockIds).toContain(blockId2);
    });

    it('returns empty array for block with no attachments', () => {
      const blockId = createTestBlock(db);
      const attachmentList = getBlockAttachments(db, blockId);
      expect(attachmentList).toHaveLength(0);
    });

    it('returns empty array for attachment with no blocks', () => {
      const { attachmentId } = uploadTestAttachment(db, fileService);
      const blockIds = getAttachmentBlocks(db, attachmentId);
      expect(blockIds).toHaveLength(0);
    });
  });

  describe('listAttachments', () => {
    it('returns all attachments', () => {
      uploadTestAttachment(db, fileService, 'content1');
      uploadTestAttachment(db, fileService, 'content2');

      const list = listAttachments(db);
      expect(list).toHaveLength(2);
    });

    it('can filter by orphaned status', () => {
      const { attachmentId: orphaned } = uploadTestAttachment(db, fileService, 'orphan');
      const { attachmentId: active } = uploadTestAttachment(db, fileService, 'active');
      const blockId = createTestBlock(db);

      markAttachmentOrphaned(db, orphaned);
      linkBlockToAttachment(db, blockId, active);

      const orphanedOnly = listAttachments(db, { orphanedOnly: true });
      expect(orphanedOnly).toHaveLength(1);
      expect(orphanedOnly[0]?.id).toBe(orphaned);
    });

    it('returns empty array when no attachments', () => {
      const list = listAttachments(db);
      expect(list).toHaveLength(0);
    });
  });

  describe('cleanupOrphanedAttachments', () => {
    it('deletes attachments orphaned longer than grace period', async () => {
      const { attachmentId } = uploadTestAttachment(db, fileService);

      // Mark orphaned 31 days ago
      markAttachmentOrphanedAt(db, attachmentId, daysAgo(31));

      const deleted = await cleanupOrphanedAttachments(db, fileService, 30);

      expect(deleted).toBe(1);
      expect(getAttachment(db, attachmentId)).toBeNull();
    });

    it('does NOT delete attachments within grace period', async () => {
      const { attachmentId } = uploadTestAttachment(db, fileService);

      // Mark orphaned 29 days ago (within 30-day grace)
      markAttachmentOrphanedAt(db, attachmentId, daysAgo(29));

      const deleted = await cleanupOrphanedAttachments(db, fileService, 30);

      expect(deleted).toBe(0);
      expect(getAttachment(db, attachmentId)).not.toBeNull();
    });

    it('does NOT delete attachments still referenced', async () => {
      const { attachmentId } = uploadTestAttachment(db, fileService);
      const blockId = createTestBlock(db);
      linkBlockToAttachment(db, blockId, attachmentId);

      const deleted = await cleanupOrphanedAttachments(db, fileService, 30);

      expect(deleted).toBe(0);
    });

    it('deletes file from filesystem', async () => {
      const fileData = Buffer.from('to be deleted');
      const hash = fileService.computeHash(fileData);
      const { attachmentId } = uploadAttachment(db, fileService, {
        filename: 'delete-me.txt',
        mimeType: 'text/plain',
        sizeBytes: fileData.length,
        fileData,
      });

      markAttachmentOrphanedAt(db, attachmentId, daysAgo(31));
      await cleanupOrphanedAttachments(db, fileService, 30);

      expect(await fileService.fileExists(hash, 'txt')).toBe(false);
    });

    it('handles multiple orphaned attachments', async () => {
      const { attachmentId: a1 } = uploadTestAttachment(db, fileService, 'orphan1');
      const { attachmentId: a2 } = uploadTestAttachment(db, fileService, 'orphan2');
      const { attachmentId: a3 } = uploadTestAttachment(db, fileService, 'recent');

      markAttachmentOrphanedAt(db, a1, daysAgo(31));
      markAttachmentOrphanedAt(db, a2, daysAgo(35));
      markAttachmentOrphanedAt(db, a3, daysAgo(25)); // Within grace period

      const deleted = await cleanupOrphanedAttachments(db, fileService, 30);

      expect(deleted).toBe(2);
      expect(getAttachment(db, a1)).toBeNull();
      expect(getAttachment(db, a2)).toBeNull();
      expect(getAttachment(db, a3)).not.toBeNull();
    });
  });
});

// ============================================================================
// Helper Functions
// ============================================================================

function uploadTestAttachment(
  db: TypenoteDb,
  fileService: FileService,
  content = 'test'
): { attachmentId: string; wasDeduped: boolean } {
  const fileData = Buffer.from(content + Date.now() + Math.random()); // Unique content
  return uploadAttachment(db, fileService, {
    filename: 'test.txt',
    mimeType: 'text/plain',
    sizeBytes: fileData.length,
    fileData,
  });
}

function createTestBlock(db: TypenoteDb): string {
  // Create a page with a paragraph block and return the block ID
  const obj = createObject(db, 'Page', 'Test Page', {}, { applyDefaultTemplate: false });
  const blockId = generateId();
  applyBlockPatch(db, {
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
  });
  return blockId;
}

function markAttachmentOrphaned(db: TypenoteDb, attachmentId: string): void {
  // Direct DB update for testing
  db.update(attachments)
    .set({ orphanedAt: new Date() })
    .where(eq(attachments.id, attachmentId))
    .run();
}

function markAttachmentOrphanedAt(db: TypenoteDb, attachmentId: string, date: Date): void {
  db.update(attachments).set({ orphanedAt: date }).where(eq(attachments.id, attachmentId)).run();
}

function daysAgo(n: number): Date {
  return new Date(Date.now() - n * 24 * 60 * 60 * 1000);
}
