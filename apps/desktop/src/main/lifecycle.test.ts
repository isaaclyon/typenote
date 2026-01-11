import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  createTestDb,
  closeDb,
  seedBuiltInTypes,
  InMemoryFileService,
  type TypenoteDb,
  type FileService,
} from '@typenote/storage';
import { startAttachmentCleanupScheduler, stopAttachmentCleanupScheduler } from './lifecycle.js';

describe('Attachment Cleanup Scheduler', () => {
  let db: TypenoteDb;
  let fileService: FileService;

  beforeEach(() => {
    db = createTestDb();
    seedBuiltInTypes(db);
    fileService = new InMemoryFileService();
    vi.useFakeTimers();
  });

  afterEach(() => {
    stopAttachmentCleanupScheduler();
    closeDb(db);
    vi.useRealTimers();
  });

  describe('startAttachmentCleanupScheduler', () => {
    it('runs cleanup on startup', async () => {
      // Spy on console.log to verify cleanup ran
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      await startAttachmentCleanupScheduler(db, fileService, 30);

      // Verify startup log
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('Running attachment cleanup')
      );

      consoleLogSpy.mockRestore();
    });

    it('uses default 30-day grace period if not specified', async () => {
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      await startAttachmentCleanupScheduler(db, fileService);

      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('grace period: 30 days'));

      consoleLogSpy.mockRestore();
    });

    it('accepts custom grace period', async () => {
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      await startAttachmentCleanupScheduler(db, fileService, 60);

      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('grace period: 60 days'));

      consoleLogSpy.mockRestore();
    });

    it('logs scheduler start message', async () => {
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      await startAttachmentCleanupScheduler(db, fileService, 30);

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('Attachment cleanup scheduler started (runs daily)')
      );

      consoleLogSpy.mockRestore();
    });
  });

  describe('stopAttachmentCleanupScheduler', () => {
    it('logs when stopping scheduler', async () => {
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      await startAttachmentCleanupScheduler(db, fileService, 30);
      stopAttachmentCleanupScheduler();

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('Attachment cleanup scheduler stopped')
      );

      consoleLogSpy.mockRestore();
    });

    it('is safe to call multiple times', () => {
      stopAttachmentCleanupScheduler();
      stopAttachmentCleanupScheduler();
      // Should not throw
    });

    it('is safe to call without starting scheduler', () => {
      stopAttachmentCleanupScheduler();
      // Should not throw
    });
  });

  describe('end-to-end cleanup integration', () => {
    it('runs cleanup without errors when started', async () => {
      // Simple test: Just verify the scheduler starts and runs cleanup without throwing
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      // Start scheduler
      await startAttachmentCleanupScheduler(db, fileService, 30);

      // Verify no errors were logged
      expect(consoleErrorSpy).not.toHaveBeenCalledWith(
        expect.stringContaining('Attachment cleanup failed')
      );

      // Verify scheduler started
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('Attachment cleanup scheduler started')
      );

      consoleLogSpy.mockRestore();
      consoleErrorSpy.mockRestore();
    });
  });
});
