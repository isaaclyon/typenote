/**
 * imageUtils Tests
 *
 * Tests for image validation and base64 encoding utilities.
 * Following strict TDD: RED -> GREEN -> REFACTOR for each cycle.
 */

import { describe, it, expect } from 'vitest';
import {
  SUPPORTED_IMAGE_TYPES,
  MAX_FILE_SIZE,
  fileToBase64,
  validateImageFile,
} from './imageUtils.js';

// ─────────────────────────────────────────────────────────────────────────────
// Helper to create mock File objects
// ─────────────────────────────────────────────────────────────────────────────

function createMockFile(
  name: string,
  size: number,
  type: string,
  content: string = 'mock file content'
): File {
  const blob = new Blob([content], { type });
  // Override size if needed (Blob size is determined by content)
  const file = new File([blob], name, { type });
  // We need to mock the size property for testing large files
  if (size !== blob.size) {
    Object.defineProperty(file, 'size', { value: size, writable: false });
  }
  return file;
}

// ─────────────────────────────────────────────────────────────────────────────
// TDD Cycle 1: Constants are properly defined
// ─────────────────────────────────────────────────────────────────────────────

describe('imageUtils', () => {
  describe('Cycle 1: Constants', () => {
    it('exports SUPPORTED_IMAGE_TYPES with correct values', () => {
      expect(SUPPORTED_IMAGE_TYPES).toEqual(['image/png', 'image/jpeg', 'image/gif', 'image/webp']);
    });

    it('exports MAX_FILE_SIZE as 10MB', () => {
      expect(MAX_FILE_SIZE).toBe(10 * 1024 * 1024);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // TDD Cycle 2: validateImageFile - valid files
  // ─────────────────────────────────────────────────────────────────────────────

  describe('Cycle 2: validateImageFile - valid files', () => {
    it('returns valid for PNG under size limit', () => {
      const file = createMockFile('test.png', 1024, 'image/png');
      const result = validateImageFile(file);
      expect(result).toEqual({ valid: true });
    });

    it('returns valid for JPEG under size limit', () => {
      const file = createMockFile('photo.jpg', 5000, 'image/jpeg');
      const result = validateImageFile(file);
      expect(result).toEqual({ valid: true });
    });

    it('returns valid for GIF under size limit', () => {
      const file = createMockFile('animation.gif', 2048, 'image/gif');
      const result = validateImageFile(file);
      expect(result).toEqual({ valid: true });
    });

    it('returns valid for WebP under size limit', () => {
      const file = createMockFile('image.webp', 3000, 'image/webp');
      const result = validateImageFile(file);
      expect(result).toEqual({ valid: true });
    });

    it('returns valid for file exactly at size limit', () => {
      const file = createMockFile('exact.png', MAX_FILE_SIZE, 'image/png');
      const result = validateImageFile(file);
      expect(result).toEqual({ valid: true });
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // TDD Cycle 3: validateImageFile - invalid type
  // ─────────────────────────────────────────────────────────────────────────────

  describe('Cycle 3: validateImageFile - invalid type', () => {
    it('returns error for PDF file', () => {
      const file = createMockFile('document.pdf', 1024, 'application/pdf');
      const result = validateImageFile(file);
      expect(result).toEqual({ valid: false, error: 'Unsupported image type' });
    });

    it('returns error for text file', () => {
      const file = createMockFile('notes.txt', 512, 'text/plain');
      const result = validateImageFile(file);
      expect(result).toEqual({ valid: false, error: 'Unsupported image type' });
    });

    it('returns error for SVG file', () => {
      const file = createMockFile('icon.svg', 1024, 'image/svg+xml');
      const result = validateImageFile(file);
      expect(result).toEqual({ valid: false, error: 'Unsupported image type' });
    });

    it('returns error for BMP file', () => {
      const file = createMockFile('old.bmp', 2048, 'image/bmp');
      const result = validateImageFile(file);
      expect(result).toEqual({ valid: false, error: 'Unsupported image type' });
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // TDD Cycle 4: validateImageFile - file too large
  // ─────────────────────────────────────────────────────────────────────────────

  describe('Cycle 4: validateImageFile - file too large', () => {
    it('returns error for file exceeding 10MB', () => {
      const file = createMockFile('huge.png', MAX_FILE_SIZE + 1, 'image/png');
      const result = validateImageFile(file);
      expect(result).toEqual({ valid: false, error: 'Image exceeds 10MB limit' });
    });

    it('returns error for very large file', () => {
      const file = createMockFile('massive.jpg', 50 * 1024 * 1024, 'image/jpeg');
      const result = validateImageFile(file);
      expect(result).toEqual({ valid: false, error: 'Image exceeds 10MB limit' });
    });

    it('prioritizes size error over type error', () => {
      // File is both too large and wrong type - size should be checked first
      const file = createMockFile('huge.pdf', MAX_FILE_SIZE + 1, 'application/pdf');
      const result = validateImageFile(file);
      // Size check happens first
      expect(result).toEqual({ valid: false, error: 'Image exceeds 10MB limit' });
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // TDD Cycle 5: fileToBase64 - encoding
  // ─────────────────────────────────────────────────────────────────────────────

  describe('Cycle 5: fileToBase64', () => {
    it('converts file content to base64 string', async () => {
      const content = 'Hello, World!';
      const file = createMockFile('test.txt', content.length, 'text/plain', content);
      const result = await fileToBase64(file);

      // "Hello, World!" in base64
      expect(result).toBe(btoa(content));
    });

    it('handles binary content correctly', async () => {
      // Create a simple "binary" content
      const binaryContent = String.fromCharCode(0, 1, 2, 255, 254, 253);
      const blob = new Blob([binaryContent], { type: 'application/octet-stream' });
      const file = new File([blob], 'binary.bin', { type: 'application/octet-stream' });

      const result = await fileToBase64(file);

      // Should be valid base64
      expect(() => atob(result)).not.toThrow();
    });

    it('rejects for empty file', async () => {
      const file = createMockFile('empty.png', 0, 'image/png', '');
      await expect(fileToBase64(file)).rejects.toThrow('Failed to encode image as base64');
    });
  });
});
