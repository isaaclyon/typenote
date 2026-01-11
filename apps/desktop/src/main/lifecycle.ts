/**
 * Application lifecycle management
 *
 * Handles background tasks like attachment cleanup scheduling.
 */

import { cleanupOrphanedAttachments, type TypenoteDb, type FileService } from '@typenote/storage';

const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

let cleanupIntervalId: NodeJS.Timeout | null = null;

/**
 * Start the attachment cleanup scheduler
 *
 * Runs cleanup immediately on startup, then schedules daily runs.
 *
 * @param db - Database instance
 * @param fileService - File service instance
 * @param graceDays - Number of days before orphaned attachments are deleted (default: 30)
 */
export async function startAttachmentCleanupScheduler(
  db: TypenoteDb,
  fileService: FileService,
  graceDays: number = 30
): Promise<void> {
  // Stop any existing scheduler first
  stopAttachmentCleanupScheduler();

  // Run cleanup immediately on startup
  console.log(`[TypeNote] Running attachment cleanup (grace period: ${graceDays} days)`);
  try {
    const deletedCount = await cleanupOrphanedAttachments(db, fileService, graceDays);
    if (deletedCount > 0) {
      console.log(`[TypeNote] Cleaned up ${deletedCount} orphaned attachment(s)`);
    }
  } catch (error) {
    console.error('[TypeNote] Attachment cleanup failed:', error);
  }

  // Schedule daily cleanup
  cleanupIntervalId = setInterval(() => {
    console.log(`[TypeNote] Running scheduled attachment cleanup`);
    cleanupOrphanedAttachments(db, fileService, graceDays)
      .then((deletedCount) => {
        if (deletedCount > 0) {
          console.log(`[TypeNote] Cleaned up ${deletedCount} orphaned attachment(s)`);
        }
      })
      .catch((error) => {
        console.error('[TypeNote] Scheduled attachment cleanup failed:', error);
      });
  }, MILLISECONDS_PER_DAY);

  console.log(`[TypeNote] Attachment cleanup scheduler started (runs daily)`);
}

/**
 * Stop the attachment cleanup scheduler
 *
 * Safe to call multiple times or when scheduler is not running.
 */
export function stopAttachmentCleanupScheduler(): void {
  if (cleanupIntervalId !== null) {
    clearInterval(cleanupIntervalId);
    cleanupIntervalId = null;
    console.log(`[TypeNote] Attachment cleanup scheduler stopped`);
  }
}
