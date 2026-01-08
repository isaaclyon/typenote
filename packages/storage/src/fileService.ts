/**
 * File Service - Content-addressed storage abstraction for attachments.
 *
 * Provides a FileService interface with two implementations:
 * - FilesystemFileService: Production implementation using Node.js fs
 * - InMemoryFileService: Test implementation for fast isolated tests
 *
 * Files are stored at `{basePath}/{sha256}.{ext}` with content-addressed deduplication.
 */

import { createHash } from 'crypto';
import * as fs from 'fs/promises';
import * as path from 'path';

/**
 * Interface for content-addressed file storage.
 */
export interface FileService {
  /**
   * Compute SHA256 hash of file data.
   */
  computeHash(data: Buffer): string;

  /**
   * Store a file with content-addressed naming.
   * @returns true if file was newly stored, false if it already existed (dedup)
   */
  storeFile(hash: string, data: Buffer, ext: string): Promise<boolean>;

  /**
   * Read file content by hash and extension.
   * @throws Error if file not found
   */
  readFile(hash: string, ext: string): Promise<Buffer>;

  /**
   * Delete a file by hash and extension.
   * @returns true if file was deleted, false if it didn't exist
   */
  deleteFile(hash: string, ext: string): Promise<boolean>;

  /**
   * Check if a file exists.
   */
  fileExists(hash: string, ext: string): Promise<boolean>;

  /**
   * Get the file path for a given hash and extension.
   */
  getFilePath(hash: string, ext: string): string;
}

/**
 * Production implementation using filesystem storage.
 */
export class FilesystemFileService implements FileService {
  readonly basePath: string;

  constructor(basePath: string) {
    this.basePath = basePath;
  }

  computeHash(data: Buffer): string {
    return createHash('sha256').update(data).digest('hex');
  }

  getFilePath(hash: string, ext: string): string {
    return path.join(this.basePath, `${hash}.${ext}`);
  }

  async storeFile(hash: string, data: Buffer, ext: string): Promise<boolean> {
    const filePath = this.getFilePath(hash, ext);

    // Check if already exists (deduplication)
    if (await this.fileExists(hash, ext)) {
      return false;
    }

    // Ensure directory exists
    await fs.mkdir(this.basePath, { recursive: true });

    // Write file atomically (write to temp, then rename)
    const tempPath = `${filePath}.tmp.${Date.now()}`;
    await fs.writeFile(tempPath, data);
    await fs.rename(tempPath, filePath);

    return true;
  }

  async readFile(hash: string, ext: string): Promise<Buffer> {
    const filePath = this.getFilePath(hash, ext);
    return fs.readFile(filePath);
  }

  async deleteFile(hash: string, ext: string): Promise<boolean> {
    const filePath = this.getFilePath(hash, ext);
    try {
      await fs.unlink(filePath);
      return true;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return false;
      }
      throw error;
    }
  }

  async fileExists(hash: string, ext: string): Promise<boolean> {
    const filePath = this.getFilePath(hash, ext);
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * In-memory implementation for testing.
 * No filesystem access - all data stored in memory.
 */
export class InMemoryFileService implements FileService {
  private files = new Map<string, Buffer>();

  computeHash(data: Buffer): string {
    return createHash('sha256').update(data).digest('hex');
  }

  getFilePath(hash: string, ext: string): string {
    return `memory://${hash}.${ext}`;
  }

  async storeFile(hash: string, data: Buffer, ext: string): Promise<boolean> {
    const key = `${hash}.${ext}`;
    if (this.files.has(key)) {
      return false;
    }
    this.files.set(key, Buffer.from(data));
    return true;
  }

  async readFile(hash: string, ext: string): Promise<Buffer> {
    const key = `${hash}.${ext}`;
    const data = this.files.get(key);
    if (data === undefined) {
      throw new Error(`File not found: ${key}`);
    }
    return data;
  }

  async deleteFile(hash: string, ext: string): Promise<boolean> {
    const key = `${hash}.${ext}`;
    return this.files.delete(key);
  }

  async fileExists(hash: string, ext: string): Promise<boolean> {
    const key = `${hash}.${ext}`;
    return this.files.has(key);
  }

  /**
   * Clear all files (for testing).
   */
  clear(): void {
    this.files.clear();
  }
}
