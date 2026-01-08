import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';
import { FilesystemFileService, InMemoryFileService, type FileService } from './fileService.js';

// Test both implementations with the same test suite
describe.each([
  ['InMemoryFileService', () => new InMemoryFileService()],
  [
    'FilesystemFileService',
    () => {
      const testDir = path.join(os.tmpdir(), `typenote-test-${Date.now()}`);
      return new FilesystemFileService(testDir);
    },
  ],
])('%s', (_name, createService) => {
  let service: FileService;

  beforeEach(() => {
    service = createService();
  });

  afterEach(async () => {
    // Cleanup for FilesystemFileService
    if (service instanceof FilesystemFileService) {
      await fs.rm(service.basePath, { recursive: true, force: true });
    }
  });

  describe('computeHash', () => {
    it('computes SHA256 hash of buffer', () => {
      const data = Buffer.from('hello world');
      const hash = service.computeHash(data);
      // Known SHA256 of "hello world"
      expect(hash).toBe('b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9');
    });

    it('produces same hash for same content', () => {
      const data1 = Buffer.from('test content');
      const data2 = Buffer.from('test content');
      expect(service.computeHash(data1)).toBe(service.computeHash(data2));
    });

    it('produces different hash for different content', () => {
      const hash1 = service.computeHash(Buffer.from('content1'));
      const hash2 = service.computeHash(Buffer.from('content2'));
      expect(hash1).not.toBe(hash2);
    });
  });

  describe('storeFile', () => {
    it('stores file and returns true for new file', async () => {
      const data = Buffer.from('test content');
      const hash = service.computeHash(data);
      const result = await service.storeFile(hash, data, 'txt');
      expect(result).toBe(true);
    });

    it('returns false if file already exists (dedup)', async () => {
      const data = Buffer.from('test content');
      const hash = service.computeHash(data);
      await service.storeFile(hash, data, 'txt');
      const result = await service.storeFile(hash, data, 'txt');
      expect(result).toBe(false); // File already existed
    });
  });

  describe('readFile', () => {
    it('returns stored file content', async () => {
      const data = Buffer.from('test content');
      const hash = service.computeHash(data);
      await service.storeFile(hash, data, 'txt');

      const content = await service.readFile(hash, 'txt');
      expect(content).toEqual(data);
    });

    it('throws if file not found', async () => {
      await expect(service.readFile('nonexistent', 'txt')).rejects.toThrow();
    });
  });

  describe('deleteFile', () => {
    it('deletes file and returns true', async () => {
      const data = Buffer.from('test content');
      const hash = service.computeHash(data);
      await service.storeFile(hash, data, 'txt');

      const result = await service.deleteFile(hash, 'txt');
      expect(result).toBe(true);
      expect(await service.fileExists(hash, 'txt')).toBe(false);
    });

    it('returns false if file does not exist', async () => {
      const result = await service.deleteFile('nonexistent', 'txt');
      expect(result).toBe(false);
    });
  });

  describe('fileExists', () => {
    it('returns true if file exists', async () => {
      const data = Buffer.from('test content');
      const hash = service.computeHash(data);
      await service.storeFile(hash, data, 'txt');

      expect(await service.fileExists(hash, 'txt')).toBe(true);
    });

    it('returns false if file does not exist', async () => {
      expect(await service.fileExists('nonexistent', 'txt')).toBe(false);
    });
  });

  describe('getFilePath', () => {
    it('returns path with hash and extension', () => {
      const hash = 'a'.repeat(64);
      const filePath = service.getFilePath(hash, 'png');
      expect(filePath).toContain(hash);
      expect(filePath).toMatch(/\.png$/);
    });
  });
});
