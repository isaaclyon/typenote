/**
 * Attachment API contracts.
 *
 * Attachments are content-addressed files (images, documents) that can be
 * referenced by blocks. They use SHA256 hashing for global deduplication
 * and have a 30-day orphan grace period before cleanup.
 */

import { z } from 'zod';

// ============================================================================
// Constants
// ============================================================================

/**
 * Maximum file size in bytes (10 MB).
 */
export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

/**
 * Supported MIME types for attachments.
 * Whitelist approach for security.
 */
export const SUPPORTED_MIME_TYPES = [
  // Images
  'image/png',
  'image/jpeg',
  'image/gif',
  'image/webp',
  // Documents
  'application/pdf',
  'text/plain',
] as const;

export type SupportedMimeType = (typeof SUPPORTED_MIME_TYPES)[number];

// ============================================================================
// Field Schemas
// ============================================================================

/**
 * SHA256 hash format - exactly 64 lowercase hex characters.
 */
export const Sha256Schema = z
  .string()
  .length(64)
  .regex(/^[0-9a-f]{64}$/, {
    message: 'SHA256 must be 64 lowercase hex characters',
  });

/**
 * Filename with reasonable limits.
 */
export const FilenameSchema = z.string().min(1).max(255);

/**
 * MIME type from the supported whitelist.
 */
export const SupportedMimeTypeSchema = z.enum(SUPPORTED_MIME_TYPES);

/**
 * File size validation (1 byte to 10 MB).
 */
export const FileSizeSchema = z.number().int().min(1).max(MAX_FILE_SIZE_BYTES);

// ============================================================================
// Attachment Entity
// ============================================================================

/**
 * Full Attachment entity as stored in the database.
 */
export const AttachmentSchema = z.object({
  id: z.string().length(26), // ULID
  sha256: Sha256Schema,
  filename: FilenameSchema,
  mimeType: z.string().min(1), // Stored MIME type (may differ from upload)
  sizeBytes: z.number().int().min(1),
  lastReferencedAt: z.date(),
  orphanedAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Attachment = z.infer<typeof AttachmentSchema>;

// ============================================================================
// API Operations - Upload
// ============================================================================

/**
 * Input for uploading an attachment.
 * File data is passed separately (as Buffer/Uint8Array).
 */
export const UploadAttachmentInputSchema = z.object({
  filename: FilenameSchema,
  mimeType: SupportedMimeTypeSchema,
  sizeBytes: FileSizeSchema,
});

export type UploadAttachmentInput = z.infer<typeof UploadAttachmentInputSchema>;

/**
 * Upload request metadata (used by HTTP multipart uploads).
 */
export const UploadAttachmentRequestSchema = UploadAttachmentInputSchema.extend({
  objectId: z.string().length(26),
  alt: z.string().optional(),
  caption: z.string().optional(),
});

export type UploadAttachmentRequest = z.infer<typeof UploadAttachmentRequestSchema>;

/**
 * Result from uploading an attachment.
 */
export const UploadAttachmentResultSchema = z.object({
  attachmentId: z.string().length(26),
  wasDeduped: z.boolean(),
});

export type UploadAttachmentResult = z.infer<typeof UploadAttachmentResultSchema>;

// ============================================================================
// API Operations - List
// ============================================================================

/**
 * Query options for listing attachments.
 */
export const ListAttachmentsOptionsSchema = z.object({
  objectId: z.string().length(26).optional(),
});

export type ListAttachmentsOptions = z.infer<typeof ListAttachmentsOptionsSchema>;

/**
 * Result for listing attachments.
 */
export const ListAttachmentsResultSchema = z.object({
  attachments: z.array(AttachmentSchema),
});

export type ListAttachmentsResult = z.infer<typeof ListAttachmentsResultSchema>;

// ============================================================================
// API Operations - Cleanup
// ============================================================================

/**
 * Cleanup options for orphaned attachments.
 */
export const CleanupAttachmentsOptionsSchema = z.object({
  graceDays: z.number().int().positive().optional(),
});

export type CleanupAttachmentsOptions = z.infer<typeof CleanupAttachmentsOptionsSchema>;

/**
 * Result for cleanup dry-run.
 */
export const CleanupAttachmentsResultSchema = z.object({
  count: z.number().int().nonnegative(),
  attachmentIds: z.array(z.string().length(26)),
});

export type CleanupAttachmentsResult = z.infer<typeof CleanupAttachmentsResultSchema>;

// ============================================================================
// Block Content Schema
// ============================================================================

/**
 * Content schema for attachment blocks.
 * Used when a block references an attachment.
 */
export const AttachmentContentSchema = z.object({
  attachmentId: z.string().length(26),
  alt: z.string().optional(),
  caption: z.string().optional(),
});

export type AttachmentContent = z.infer<typeof AttachmentContentSchema>;

// ============================================================================
// Error Codes (specific to Attachment operations)
// ============================================================================

/**
 * Attachment-specific error codes.
 */
export const AttachmentErrorCodeSchema = z.enum([
  'ATTACHMENT_NOT_FOUND', // Attachment does not exist
  'FILE_TOO_LARGE', // File exceeds 10 MB limit
  'UNSUPPORTED_FILE_TYPE', // MIME type not in whitelist
]);

export type AttachmentErrorCode = z.infer<typeof AttachmentErrorCodeSchema>;

// ============================================================================
// Download Response Contract
// ============================================================================

/**
 * Canonical download headers for attachment content responses.
 */
export const AttachmentDownloadHeadersSchema = z.object({
  contentType: z.string().min(1),
  contentLength: z.number().int().nonnegative(),
  contentDisposition: z.string().min(1),
  etag: z.string().min(1),
  cacheControl: z.string().min(1),
  xContentTypeOptions: z.literal('nosniff'),
});

export type AttachmentDownloadHeaders = z.infer<typeof AttachmentDownloadHeadersSchema>;
