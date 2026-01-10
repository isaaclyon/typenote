/**
 * Attachment Service.
 *
 * Provides CRUD operations for attachments with content-addressed deduplication,
 * block linking, orphan tracking, and cleanup functionality.
 */

import { eq, sql, and, lt } from 'drizzle-orm';
import { generateId } from '@typenote/core';
import {
  MAX_FILE_SIZE_BYTES,
  SUPPORTED_MIME_TYPES,
  type Attachment,
  type UploadAttachmentResult,
  type SupportedMimeType,
} from '@typenote/api';
import { attachments, blockAttachments } from './schema.js';
import type { TypenoteDb } from './db.js';
import type { FileService } from './fileService.js';
import { createServiceError } from './errors.js';

// ============================================================================
// Error Types
// ============================================================================

export type AttachmentServiceErrorCode =
  | 'FILE_TOO_LARGE'
  | 'UNSUPPORTED_FILE_TYPE'
  | 'ATTACHMENT_NOT_FOUND';

export const AttachmentServiceError =
  createServiceError<AttachmentServiceErrorCode>('AttachmentServiceError');
// eslint-disable-next-line @typescript-eslint/no-redeclare
export type AttachmentServiceError = InstanceType<typeof AttachmentServiceError>;

// ============================================================================
// Input Types
// ============================================================================

export interface UploadAttachmentInput {
  filename: string;
  mimeType: SupportedMimeType;
  sizeBytes: number;
  fileData: Buffer;
}

export interface ListAttachmentsOptions {
  orphanedOnly?: boolean;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Extract file extension from MIME type.
 */
function getExtensionFromMimeType(mimeType: string): string {
  const map: Record<string, string> = {
    'image/png': 'png',
    'image/jpeg': 'jpg',
    'image/gif': 'gif',
    'image/webp': 'webp',
    'application/pdf': 'pdf',
    'text/plain': 'txt',
  };
  return map[mimeType] ?? 'bin';
}

/**
 * Check if a MIME type is supported.
 */
function isSupportedMimeType(mimeType: string): mimeType is SupportedMimeType {
  return (SUPPORTED_MIME_TYPES as readonly string[]).includes(mimeType);
}

/**
 * Map database row to Attachment type.
 */
function mapRowToAttachment(row: {
  id: string;
  sha256: string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  lastReferencedAt: Date;
  orphanedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}): Attachment {
  return {
    id: row.id,
    sha256: row.sha256,
    filename: row.filename,
    mimeType: row.mimeType,
    sizeBytes: row.sizeBytes,
    lastReferencedAt: row.lastReferencedAt,
    orphanedAt: row.orphanedAt,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

// ============================================================================
// Upload Operations
// ============================================================================

/**
 * Upload an attachment with content-addressed deduplication.
 *
 * @param db - Database connection
 * @param fileService - File storage service
 * @param input - Upload input with file data and metadata
 * @returns Upload result with attachment ID and deduplication status
 *
 * @throws AttachmentServiceError with code FILE_TOO_LARGE if file exceeds limit
 * @throws AttachmentServiceError with code UNSUPPORTED_FILE_TYPE if MIME type not allowed
 */
export function uploadAttachment(
  db: TypenoteDb,
  fileService: FileService,
  input: UploadAttachmentInput
): UploadAttachmentResult {
  // 1. Validate file size
  if (input.sizeBytes > MAX_FILE_SIZE_BYTES) {
    throw new AttachmentServiceError(
      'FILE_TOO_LARGE',
      `File size ${input.sizeBytes} bytes exceeds limit of ${MAX_FILE_SIZE_BYTES} bytes`,
      { sizeBytes: input.sizeBytes, maxSizeBytes: MAX_FILE_SIZE_BYTES }
    );
  }

  // 2. Validate MIME type
  if (!isSupportedMimeType(input.mimeType)) {
    throw new AttachmentServiceError(
      'UNSUPPORTED_FILE_TYPE',
      `MIME type '${input.mimeType}' is not supported`,
      { mimeType: input.mimeType, supportedTypes: SUPPORTED_MIME_TYPES }
    );
  }

  // 3. Compute hash for content-addressing
  const hash = fileService.computeHash(input.fileData);

  // 4. Check for existing attachment by hash (deduplication)
  const existing = getAttachmentByHash(db, hash);
  if (existing) {
    // Update lastReferencedAt to track activity
    const now = new Date();
    db.update(attachments)
      .set({ lastReferencedAt: now, updatedAt: now })
      .where(eq(attachments.id, existing.id))
      .run();

    return {
      attachmentId: existing.id,
      wasDeduped: true,
    };
  }

  // 5. Store file to filesystem
  const ext = getExtensionFromMimeType(input.mimeType);
  // Note: fileService.storeFile is async but we call it synchronously
  // Since InMemoryFileService is actually synchronous internally
  void fileService.storeFile(hash, input.fileData, ext);

  // 6. Create database record
  const id = generateId();
  const now = new Date();

  db.insert(attachments)
    .values({
      id,
      sha256: hash,
      filename: input.filename,
      mimeType: input.mimeType,
      sizeBytes: input.sizeBytes,
      lastReferencedAt: now,
      orphanedAt: null,
      createdAt: now,
      updatedAt: now,
    })
    .run();

  return {
    attachmentId: id,
    wasDeduped: false,
  };
}

// ============================================================================
// Get Operations
// ============================================================================

/**
 * Get an attachment by its ID.
 *
 * @param db - Database connection
 * @param attachmentId - The attachment ID to look up
 * @returns The attachment or null if not found
 */
export function getAttachment(db: TypenoteDb, attachmentId: string): Attachment | null {
  const row = db.select().from(attachments).where(eq(attachments.id, attachmentId)).get();

  if (!row) {
    return null;
  }

  return mapRowToAttachment(row);
}

/**
 * Get an attachment by its SHA256 hash.
 *
 * @param db - Database connection
 * @param hash - The SHA256 hash to look up
 * @returns The attachment or null if not found
 */
export function getAttachmentByHash(db: TypenoteDb, hash: string): Attachment | null {
  const row = db.select().from(attachments).where(eq(attachments.sha256, hash)).get();

  if (!row) {
    return null;
  }

  return mapRowToAttachment(row);
}

// ============================================================================
// Linking Operations
// ============================================================================

/**
 * Link a block to an attachment.
 *
 * This is idempotent - linking an already-linked pair does nothing.
 * Clears orphanedAt if the attachment was marked as orphaned.
 *
 * @param db - Database connection
 * @param blockId - The block ID
 * @param attachmentId - The attachment ID
 *
 * @throws AttachmentServiceError with code ATTACHMENT_NOT_FOUND if attachment doesn't exist
 */
export function linkBlockToAttachment(db: TypenoteDb, blockId: string, attachmentId: string): void {
  // 1. Verify attachment exists
  const attachment = getAttachment(db, attachmentId);
  if (!attachment) {
    throw new AttachmentServiceError(
      'ATTACHMENT_NOT_FOUND',
      `Attachment not found: ${attachmentId}`,
      { attachmentId }
    );
  }

  // 2. Check if link already exists (idempotency)
  const existingLink = db
    .select()
    .from(blockAttachments)
    .where(
      and(eq(blockAttachments.blockId, blockId), eq(blockAttachments.attachmentId, attachmentId))
    )
    .get();

  if (existingLink) {
    // Already linked - nothing to do
    return;
  }

  // 3. Create junction record
  const now = new Date();
  db.insert(blockAttachments)
    .values({
      blockId,
      attachmentId,
      createdAt: now,
    })
    .run();

  // 4. Clear orphaned status if set
  if (attachment.orphanedAt !== null) {
    db.update(attachments)
      .set({ orphanedAt: null, updatedAt: now })
      .where(eq(attachments.id, attachmentId))
      .run();
  }
}

/**
 * Unlink a block from an attachment.
 *
 * This is idempotent - unlinking an unlinked pair does nothing.
 * Marks attachment as orphaned if this was the last reference.
 *
 * @param db - Database connection
 * @param blockId - The block ID
 * @param attachmentId - The attachment ID
 */
export function unlinkBlockFromAttachment(
  db: TypenoteDb,
  blockId: string,
  attachmentId: string
): void {
  // 1. Delete junction record (if exists)
  db.delete(blockAttachments)
    .where(
      and(eq(blockAttachments.blockId, blockId), eq(blockAttachments.attachmentId, attachmentId))
    )
    .run();

  // 2. Check if there are any remaining references
  const remainingCount = db
    .select({ count: sql<number>`count(*)` })
    .from(blockAttachments)
    .where(eq(blockAttachments.attachmentId, attachmentId))
    .get();

  // 3. Mark as orphaned if no references remain
  if (remainingCount && remainingCount.count === 0) {
    const now = new Date();
    db.update(attachments)
      .set({ orphanedAt: now, updatedAt: now })
      .where(eq(attachments.id, attachmentId))
      .run();
  }
}

// ============================================================================
// Query Operations
// ============================================================================

/**
 * Get all attachments linked to a block.
 *
 * @param db - Database connection
 * @param blockId - The block ID
 * @returns Array of attachments (empty if none)
 */
export function getBlockAttachments(db: TypenoteDb, blockId: string): Attachment[] {
  const rows = db
    .select({
      id: attachments.id,
      sha256: attachments.sha256,
      filename: attachments.filename,
      mimeType: attachments.mimeType,
      sizeBytes: attachments.sizeBytes,
      lastReferencedAt: attachments.lastReferencedAt,
      orphanedAt: attachments.orphanedAt,
      createdAt: attachments.createdAt,
      updatedAt: attachments.updatedAt,
    })
    .from(blockAttachments)
    .innerJoin(attachments, eq(blockAttachments.attachmentId, attachments.id))
    .where(eq(blockAttachments.blockId, blockId))
    .all();

  return rows.map(mapRowToAttachment);
}

/**
 * Get all block IDs that reference an attachment.
 *
 * @param db - Database connection
 * @param attachmentId - The attachment ID
 * @returns Array of block IDs (empty if none)
 */
export function getAttachmentBlocks(db: TypenoteDb, attachmentId: string): string[] {
  const rows = db
    .select({ blockId: blockAttachments.blockId })
    .from(blockAttachments)
    .where(eq(blockAttachments.attachmentId, attachmentId))
    .all();

  return rows.map((row) => row.blockId);
}

/**
 * List all attachments with optional filtering.
 *
 * @param db - Database connection
 * @param options - Filtering options
 * @returns Array of attachments
 */
export function listAttachments(db: TypenoteDb, options?: ListAttachmentsOptions): Attachment[] {
  const { orphanedOnly = false } = options ?? {};

  let query = db.select().from(attachments);

  if (orphanedOnly) {
    query = query.where(sql`${attachments.orphanedAt} IS NOT NULL`) as typeof query;
  }

  const rows = query.all();
  return rows.map(mapRowToAttachment);
}

// ============================================================================
// Cleanup Operations
// ============================================================================

/**
 * Delete orphaned attachments that have exceeded the grace period.
 *
 * @param db - Database connection
 * @param fileService - File storage service
 * @param graceDays - Number of days before orphaned attachments are deleted
 * @returns Number of attachments deleted
 */
export async function cleanupOrphanedAttachments(
  db: TypenoteDb,
  fileService: FileService,
  graceDays: number
): Promise<number> {
  // Calculate cutoff date
  const cutoffDate = new Date(Date.now() - graceDays * 24 * 60 * 60 * 1000);

  // Find orphaned attachments older than grace period
  const orphanedRows = db
    .select()
    .from(attachments)
    .where(and(sql`${attachments.orphanedAt} IS NOT NULL`, lt(attachments.orphanedAt, cutoffDate)))
    .all();

  let deletedCount = 0;

  for (const row of orphanedRows) {
    // Double-check no references exist (safety check)
    const refCount = db
      .select({ count: sql<number>`count(*)` })
      .from(blockAttachments)
      .where(eq(blockAttachments.attachmentId, row.id))
      .get();

    if (refCount && refCount.count > 0) {
      // Has references - clear orphaned status instead of deleting
      db.update(attachments)
        .set({ orphanedAt: null, updatedAt: new Date() })
        .where(eq(attachments.id, row.id))
        .run();
      continue;
    }

    // Delete file from filesystem
    const ext = getExtensionFromMimeType(row.mimeType);
    await fileService.deleteFile(row.sha256, ext);

    // Delete from database
    db.delete(attachments).where(eq(attachments.id, row.id)).run();

    deletedCount++;
  }

  return deletedCount;
}
