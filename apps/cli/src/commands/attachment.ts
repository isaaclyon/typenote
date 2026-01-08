/**
 * Attachment CLI Commands
 *
 * Provides commands for managing attachments: upload, get, link/unlink, list, and cleanup.
 */

import { readFileSync, statSync, existsSync, mkdirSync } from 'node:fs';
import { basename, dirname, extname, join } from 'node:path';
import { Command } from 'commander';
import {
  createFileDb,
  closeDb,
  getDbPath,
  seedBuiltInTypes,
  seedDailyNoteTemplate,
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
  FilesystemFileService,
  type TypenoteDb,
  type FileService,
} from '@typenote/storage';
import type { SupportedMimeType } from '@typenote/api';

// ============================================================================
// Database Setup
// ============================================================================

function initDb(): TypenoteDb {
  const dbPath = getDbPath();
  const db = createFileDb(dbPath);
  seedBuiltInTypes(db);
  seedDailyNoteTemplate(db);
  return db;
}

// ============================================================================
// File Service Setup
// ============================================================================

/**
 * Get the attachments directory path.
 * Uses ~/.typenote/attachments/ by default, or sibling to TYPENOTE_DB_PATH if set.
 */
function getAttachmentsPath(): string {
  const dbPath = getDbPath();
  const dbDir = dirname(dbPath);
  const attachmentsPath = join(dbDir, 'attachments');

  // Ensure directory exists
  if (!existsSync(attachmentsPath)) {
    mkdirSync(attachmentsPath, { recursive: true });
  }

  return attachmentsPath;
}

/**
 * Create a FileService instance for the CLI.
 */
function createFileService(): FileService {
  const attachmentsPath = getAttachmentsPath();
  console.log(`Using attachments directory: ${attachmentsPath}`);
  return new FilesystemFileService(attachmentsPath);
}

// ============================================================================
// MIME Type Detection
// ============================================================================

/**
 * Extension to MIME type mapping for supported types.
 */
const EXTENSION_TO_MIME: Record<string, SupportedMimeType> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.pdf': 'application/pdf',
  '.txt': 'text/plain',
};

/**
 * Detect MIME type from file extension.
 */
function detectMimeType(filePath: string): SupportedMimeType | null {
  const ext = extname(filePath).toLowerCase();
  return EXTENSION_TO_MIME[ext] ?? null;
}

// ============================================================================
// Attachment Commands
// ============================================================================

export function registerAttachmentCommand(program: Command): void {
  const attachmentCmd = program.command('attachment').description('Attachment management commands');

  // attachment upload <filePath> [--filename <name>]
  attachmentCmd
    .command('upload')
    .description('Upload a file as an attachment')
    .argument('<filePath>', 'Path to the file to upload')
    .option('-f, --filename <name>', 'Override the filename (defaults to original filename)')
    .action((filePath: string, options: { filename?: string }) => {
      const db = initDb();
      const fileService = createFileService();
      try {
        // Check file exists
        if (!existsSync(filePath)) {
          console.error(`Error: File not found: ${filePath}`);
          process.exit(1);
        }

        // Get file stats
        const stats = statSync(filePath);
        if (!stats.isFile()) {
          console.error(`Error: Not a file: ${filePath}`);
          process.exit(1);
        }

        // Detect MIME type
        const mimeType = detectMimeType(filePath);
        if (!mimeType) {
          console.error(
            `Error: Unsupported file type. Supported extensions: ${Object.keys(EXTENSION_TO_MIME).join(', ')}`
          );
          process.exit(1);
        }

        // Read file data
        const fileData = readFileSync(filePath);

        // Get filename
        const filename = options.filename ?? basename(filePath);

        // Upload
        const result = uploadAttachment(db, fileService, {
          filename,
          mimeType,
          sizeBytes: stats.size,
          fileData,
        });

        console.log('Attachment uploaded:');
        console.log(JSON.stringify(result, null, 2));

        if (result.wasDeduped) {
          console.log('Note: File was deduplicated (identical content already exists).');
        }
      } catch (error) {
        if (error instanceof AttachmentServiceError) {
          console.error(`Error [${error.code}]: ${error.message}`);
          if (error.details) {
            console.error('Details:', JSON.stringify(error.details, null, 2));
          }
        } else {
          console.error('Error:', error instanceof Error ? error.message : String(error));
        }
        process.exit(1);
      } finally {
        closeDb(db);
      }
    });

  // attachment get <id>
  attachmentCmd
    .command('get')
    .description('Get attachment metadata by ID')
    .argument('<id>', 'Attachment ID (ULID)')
    .action((id: string) => {
      const db = initDb();
      try {
        const attachment = getAttachment(db, id);

        if (!attachment) {
          console.error(`Error: Attachment not found: ${id}`);
          process.exit(1);
        }

        console.log('Attachment:');
        console.log(JSON.stringify(attachment, null, 2));
      } catch (error) {
        console.error('Error:', error instanceof Error ? error.message : String(error));
        process.exit(1);
      } finally {
        closeDb(db);
      }
    });

  // attachment get-by-hash <hash>
  attachmentCmd
    .command('get-by-hash')
    .description('Get attachment by SHA256 hash')
    .argument('<hash>', 'SHA256 hash (64 hex characters)')
    .action((hash: string) => {
      const db = initDb();
      try {
        const attachment = getAttachmentByHash(db, hash);

        if (!attachment) {
          console.error(`Error: No attachment found with hash: ${hash}`);
          process.exit(1);
        }

        console.log('Attachment:');
        console.log(JSON.stringify(attachment, null, 2));
      } catch (error) {
        console.error('Error:', error instanceof Error ? error.message : String(error));
        process.exit(1);
      } finally {
        closeDb(db);
      }
    });

  // attachment link <blockId> <attachmentId>
  attachmentCmd
    .command('link')
    .description('Link a block to an attachment')
    .argument('<blockId>', 'Block ID (ULID)')
    .argument('<attachmentId>', 'Attachment ID (ULID)')
    .action((blockId: string, attachmentId: string) => {
      const db = initDb();
      try {
        linkBlockToAttachment(db, blockId, attachmentId);
        console.log(`Block ${blockId} linked to attachment ${attachmentId}.`);
      } catch (error) {
        if (error instanceof AttachmentServiceError) {
          console.error(`Error [${error.code}]: ${error.message}`);
        } else {
          console.error('Error:', error instanceof Error ? error.message : String(error));
        }
        process.exit(1);
      } finally {
        closeDb(db);
      }
    });

  // attachment unlink <blockId> <attachmentId>
  attachmentCmd
    .command('unlink')
    .description('Unlink a block from an attachment')
    .argument('<blockId>', 'Block ID (ULID)')
    .argument('<attachmentId>', 'Attachment ID (ULID)')
    .action((blockId: string, attachmentId: string) => {
      const db = initDb();
      try {
        unlinkBlockFromAttachment(db, blockId, attachmentId);
        console.log(`Block ${blockId} unlinked from attachment ${attachmentId}.`);
      } catch (error) {
        console.error('Error:', error instanceof Error ? error.message : String(error));
        process.exit(1);
      } finally {
        closeDb(db);
      }
    });

  // attachment block-attachments <blockId>
  attachmentCmd
    .command('block-attachments')
    .description('Get all attachments for a block')
    .argument('<blockId>', 'Block ID (ULID)')
    .action((blockId: string) => {
      const db = initDb();
      try {
        const attachments = getBlockAttachments(db, blockId);

        if (attachments.length === 0) {
          console.log(`No attachments found for block ${blockId}.`);
        } else {
          console.log(`Attachments for block ${blockId} (${attachments.length}):`);
          console.log(JSON.stringify(attachments, null, 2));
        }
      } catch (error) {
        console.error('Error:', error instanceof Error ? error.message : String(error));
        process.exit(1);
      } finally {
        closeDb(db);
      }
    });

  // attachment attachment-blocks <attachmentId>
  attachmentCmd
    .command('attachment-blocks')
    .description('Get all blocks referencing an attachment')
    .argument('<attachmentId>', 'Attachment ID (ULID)')
    .action((attachmentId: string) => {
      const db = initDb();
      try {
        const blockIds = getAttachmentBlocks(db, attachmentId);

        if (blockIds.length === 0) {
          console.log(`No blocks reference attachment ${attachmentId}.`);
        } else {
          console.log(`Blocks referencing attachment ${attachmentId} (${blockIds.length}):`);
          console.log(JSON.stringify(blockIds, null, 2));
        }
      } catch (error) {
        console.error('Error:', error instanceof Error ? error.message : String(error));
        process.exit(1);
      } finally {
        closeDb(db);
      }
    });

  // attachment list [--orphans-only]
  attachmentCmd
    .command('list')
    .description('List all attachments')
    .option('-o, --orphans-only', 'Only show orphaned attachments (no block references)')
    .action((options: { orphansOnly?: boolean }) => {
      const db = initDb();
      try {
        const attachments = listAttachments(db, {
          orphanedOnly: options.orphansOnly ?? false,
        });

        if (attachments.length === 0) {
          if (options.orphansOnly) {
            console.log('No orphaned attachments found.');
          } else {
            console.log('No attachments found.');
          }
        } else {
          const label = options.orphansOnly ? 'Orphaned attachments' : 'All attachments';
          console.log(`${label} (${attachments.length}):`);
          console.log(JSON.stringify(attachments, null, 2));
        }
      } catch (error) {
        console.error('Error:', error instanceof Error ? error.message : String(error));
        process.exit(1);
      } finally {
        closeDb(db);
      }
    });

  // attachment cleanup [--older-than-days <days>] [--dry-run]
  attachmentCmd
    .command('cleanup')
    .description('Clean up orphaned attachments older than grace period')
    .option('-d, --older-than-days <days>', 'Grace period in days (default: 30)', '30')
    .option('--dry-run', 'Preview what would be deleted without actually deleting')
    .action(async (options: { olderThanDays: string; dryRun?: boolean }) => {
      const db = initDb();
      const fileService = createFileService();
      try {
        const graceDays = parseInt(options.olderThanDays, 10);

        if (isNaN(graceDays) || graceDays < 0) {
          console.error('Error: --older-than-days must be a non-negative number');
          process.exit(1);
        }

        if (options.dryRun) {
          // Dry run: list what would be deleted
          const orphaned = listAttachments(db, { orphanedOnly: true });

          // Filter by grace period
          const cutoffDate = new Date();
          cutoffDate.setDate(cutoffDate.getDate() - graceDays);

          const wouldDelete = orphaned.filter((att) => {
            if (!att.orphanedAt) return false;
            return new Date(att.orphanedAt) < cutoffDate;
          });

          console.log(
            `[DRY RUN] Would clean up orphaned attachments older than ${graceDays} days...`
          );
          if (wouldDelete.length === 0) {
            console.log('[DRY RUN] No orphaned attachments would be deleted.');
          } else {
            console.log(`[DRY RUN] Would delete ${wouldDelete.length} attachment(s):`);
            for (const att of wouldDelete) {
              console.log(
                `  - ${att.id}: ${att.filename} (${att.sizeBytes} bytes, orphaned: ${att.orphanedAt})`
              );
            }
          }
        } else {
          console.log(`Cleaning up orphaned attachments older than ${graceDays} days...`);

          const deletedCount = await cleanupOrphanedAttachments(db, fileService, graceDays);

          if (deletedCount === 0) {
            console.log('No orphaned attachments to clean up.');
          } else {
            console.log(`Cleaned up ${deletedCount} orphaned attachment(s).`);
          }
        }
      } catch (error) {
        console.error('Error:', error instanceof Error ? error.message : String(error));
        process.exit(1);
      } finally {
        closeDb(db);
      }
    });
}
