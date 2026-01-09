/**
 * useImageUpload Hook Tests
 *
 * Tests for the hook that handles image upload for the TipTap editor.
 * Following strict TDD: RED -> GREEN -> REFACTOR for each cycle.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import type { Editor } from '@tiptap/react';
import { useImageUpload } from './useImageUpload.js';
import { MAX_FILE_SIZE } from '../lib/imageUtils.js';

// ─────────────────────────────────────────────────────────────────────────────
// Mock sonner toast
// ─────────────────────────────────────────────────────────────────────────────

vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
    loading: vi.fn(),
  },
}));

import { toast } from 'sonner';

// ─────────────────────────────────────────────────────────────────────────────
// Mock Editor Helper
// ─────────────────────────────────────────────────────────────────────────────

interface MockEditor {
  chain: ReturnType<typeof vi.fn>;
  focus: ReturnType<typeof vi.fn>;
  insertContent: ReturnType<typeof vi.fn>;
  run: ReturnType<typeof vi.fn>;
}

function createMockEditor(): MockEditor {
  const mockEditor: MockEditor = {
    chain: vi.fn(),
    focus: vi.fn(),
    insertContent: vi.fn(),
    run: vi.fn(),
  };

  // Chain pattern: editor.chain().focus().insertContent(...).run()
  mockEditor.chain.mockReturnValue(mockEditor);
  mockEditor.focus.mockReturnValue(mockEditor);
  mockEditor.insertContent.mockReturnValue(mockEditor);

  return mockEditor;
}

// ─────────────────────────────────────────────────────────────────────────────
// Mock IPC API
// ─────────────────────────────────────────────────────────────────────────────

const mockUploadAttachment = vi.fn();

beforeEach(() => {
  vi.resetAllMocks();
  // @ts-expect-error - Mocking global window.typenoteAPI
  window.typenoteAPI = {
    uploadAttachment: mockUploadAttachment,
  };
});

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
  const file = new File([blob], name, { type });
  if (size !== blob.size) {
    Object.defineProperty(file, 'size', { value: size, writable: false });
  }
  return file;
}

// ─────────────────────────────────────────────────────────────────────────────
// TDD Cycle 1: Returns handler functions
// ─────────────────────────────────────────────────────────────────────────────

describe('useImageUpload', () => {
  describe('Cycle 1: returns handler functions', () => {
    it('returns handleFile, handleDrop, and handlePaste', () => {
      const mockEditor = createMockEditor();
      const { result } = renderHook(() => useImageUpload(mockEditor as unknown as Editor));

      expect(typeof result.current.handleFile).toBe('function');
      expect(typeof result.current.handleDrop).toBe('function');
      expect(typeof result.current.handlePaste).toBe('function');
    });

    it('works when editor is null', () => {
      const { result } = renderHook(() => useImageUpload(null));

      expect(typeof result.current.handleFile).toBe('function');
      expect(typeof result.current.handleDrop).toBe('function');
      expect(typeof result.current.handlePaste).toBe('function');
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // TDD Cycle 2: handleFile - validation errors
  // ─────────────────────────────────────────────────────────────────────────────

  describe('Cycle 2: handleFile validation errors', () => {
    it('shows toast error for unsupported file type', async () => {
      const mockEditor = createMockEditor();
      const { result } = renderHook(() => useImageUpload(mockEditor as unknown as Editor));

      const pdfFile = createMockFile('document.pdf', 1024, 'application/pdf');

      await act(async () => {
        await result.current.handleFile(pdfFile);
      });

      expect(toast.error).toHaveBeenCalledWith('Unsupported image type');
      expect(mockUploadAttachment).not.toHaveBeenCalled();
    });

    it('shows toast error for file exceeding size limit', async () => {
      const mockEditor = createMockEditor();
      const { result } = renderHook(() => useImageUpload(mockEditor as unknown as Editor));

      const hugeFile = createMockFile('huge.png', MAX_FILE_SIZE + 1, 'image/png');

      await act(async () => {
        await result.current.handleFile(hugeFile);
      });

      expect(toast.error).toHaveBeenCalledWith('Image exceeds 10MB limit');
      expect(mockUploadAttachment).not.toHaveBeenCalled();
    });

    it('does nothing when editor is null', async () => {
      const { result } = renderHook(() => useImageUpload(null));

      const file = createMockFile('test.png', 1024, 'image/png');

      await act(async () => {
        await result.current.handleFile(file);
      });

      // Should not attempt upload or show any errors
      expect(mockUploadAttachment).not.toHaveBeenCalled();
      expect(toast.error).not.toHaveBeenCalled();
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // TDD Cycle 3: handleFile - successful upload
  // ─────────────────────────────────────────────────────────────────────────────

  describe('Cycle 3: handleFile successful upload', () => {
    it('calls uploadAttachment with correct data', async () => {
      const mockEditor = createMockEditor();
      mockUploadAttachment.mockResolvedValue({
        success: true,
        result: { attachmentId: 'att_123' },
      });

      const { result } = renderHook(() => useImageUpload(mockEditor as unknown as Editor));

      const file = createMockFile('photo.jpg', 2048, 'image/jpeg', 'JPEG content');

      await act(async () => {
        await result.current.handleFile(file);
      });

      expect(mockUploadAttachment).toHaveBeenCalledWith({
        filename: 'photo.jpg',
        mimeType: 'image/jpeg',
        sizeBytes: 2048,
        data: expect.any(String), // base64 encoded
      });
    });

    it('inserts attachment node on successful upload', async () => {
      const mockEditor = createMockEditor();
      mockUploadAttachment.mockResolvedValue({
        success: true,
        result: { attachmentId: 'att_456' },
      });

      const { result } = renderHook(() => useImageUpload(mockEditor as unknown as Editor));

      const file = createMockFile('image.png', 1024, 'image/png');

      await act(async () => {
        await result.current.handleFile(file);
      });

      expect(mockEditor.chain).toHaveBeenCalled();
      expect(mockEditor.focus).toHaveBeenCalled();
      expect(mockEditor.insertContent).toHaveBeenCalledWith({
        type: 'attachment',
        attrs: { attachmentId: 'att_456' },
      });
      expect(mockEditor.run).toHaveBeenCalled();
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // TDD Cycle 4: handleFile - IPC error handling
  // ─────────────────────────────────────────────────────────────────────────────

  describe('Cycle 4: handleFile IPC error handling', () => {
    it('shows toast error when IPC returns failure', async () => {
      const mockEditor = createMockEditor();
      mockUploadAttachment.mockResolvedValue({
        success: false,
        error: { code: 'STORAGE_ERROR', message: 'Disk full' },
      });

      const { result } = renderHook(() => useImageUpload(mockEditor as unknown as Editor));

      const file = createMockFile('test.png', 1024, 'image/png');

      await act(async () => {
        await result.current.handleFile(file);
      });

      expect(toast.error).toHaveBeenCalledWith('Disk full');
      expect(mockEditor.insertContent).not.toHaveBeenCalled();
    });

    it('handles IPC exception gracefully', async () => {
      const mockEditor = createMockEditor();
      mockUploadAttachment.mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useImageUpload(mockEditor as unknown as Editor));

      const file = createMockFile('test.png', 1024, 'image/png');

      await act(async () => {
        await result.current.handleFile(file);
      });

      expect(toast.error).toHaveBeenCalledWith('Failed to upload image');
      expect(mockEditor.insertContent).not.toHaveBeenCalled();
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // TDD Cycle 5: handleDrop
  // ─────────────────────────────────────────────────────────────────────────────

  describe('Cycle 5: handleDrop', () => {
    it('extracts image files from drop event', async () => {
      const mockEditor = createMockEditor();
      mockUploadAttachment.mockResolvedValue({
        success: true,
        result: { attachmentId: 'att_drop' },
      });

      const { result } = renderHook(() => useImageUpload(mockEditor as unknown as Editor));

      const file = createMockFile('dropped.png', 1024, 'image/png');
      const dropEvent = {
        dataTransfer: {
          files: [file] as unknown as FileList,
        },
        preventDefault: vi.fn(),
      } as unknown as DragEvent;

      await act(async () => {
        await result.current.handleDrop(dropEvent);
      });

      expect(dropEvent.preventDefault).toHaveBeenCalled();
      expect(mockUploadAttachment).toHaveBeenCalled();
    });

    it('returns false when no image files in drop', async () => {
      const mockEditor = createMockEditor();
      const { result } = renderHook(() => useImageUpload(mockEditor as unknown as Editor));

      const file = createMockFile('doc.pdf', 1024, 'application/pdf');
      const dropEvent = {
        dataTransfer: {
          files: [file] as unknown as FileList,
        },
        preventDefault: vi.fn(),
      } as unknown as DragEvent;

      let returnValue: boolean | undefined;
      await act(async () => {
        returnValue = await result.current.handleDrop(dropEvent);
      });

      expect(returnValue).toBe(false);
      expect(mockUploadAttachment).not.toHaveBeenCalled();
    });

    it('handles multiple image files', async () => {
      const mockEditor = createMockEditor();
      mockUploadAttachment.mockResolvedValue({
        success: true,
        result: { attachmentId: 'att_multi' },
      });

      const { result } = renderHook(() => useImageUpload(mockEditor as unknown as Editor));

      const file1 = createMockFile('image1.png', 1024, 'image/png');
      const file2 = createMockFile('image2.jpg', 2048, 'image/jpeg');
      const dropEvent = {
        dataTransfer: {
          files: [file1, file2] as unknown as FileList,
        },
        preventDefault: vi.fn(),
      } as unknown as DragEvent;

      await act(async () => {
        await result.current.handleDrop(dropEvent);
      });

      expect(mockUploadAttachment).toHaveBeenCalledTimes(2);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // TDD Cycle 6: handlePaste
  // ─────────────────────────────────────────────────────────────────────────────

  describe('Cycle 6: handlePaste', () => {
    it('extracts image files from clipboard', async () => {
      const mockEditor = createMockEditor();
      mockUploadAttachment.mockResolvedValue({
        success: true,
        result: { attachmentId: 'att_paste' },
      });

      const { result } = renderHook(() => useImageUpload(mockEditor as unknown as Editor));

      const file = createMockFile('pasted.png', 1024, 'image/png');
      const pasteEvent = {
        clipboardData: {
          files: [file] as unknown as FileList,
        },
        preventDefault: vi.fn(),
      } as unknown as ClipboardEvent;

      await act(async () => {
        await result.current.handlePaste(pasteEvent);
      });

      expect(pasteEvent.preventDefault).toHaveBeenCalled();
      expect(mockUploadAttachment).toHaveBeenCalled();
    });

    it('returns false when no image files in clipboard', async () => {
      const mockEditor = createMockEditor();
      const { result } = renderHook(() => useImageUpload(mockEditor as unknown as Editor));

      const pasteEvent = {
        clipboardData: {
          files: [] as unknown as FileList,
        },
        preventDefault: vi.fn(),
      } as unknown as ClipboardEvent;

      let returnValue: boolean | undefined;
      await act(async () => {
        returnValue = await result.current.handlePaste(pasteEvent);
      });

      expect(returnValue).toBe(false);
      expect(pasteEvent.preventDefault).not.toHaveBeenCalled();
    });

    it('handles screenshot paste (no filename)', async () => {
      const mockEditor = createMockEditor();
      mockUploadAttachment.mockResolvedValue({
        success: true,
        result: { attachmentId: 'att_screenshot' },
      });

      const { result } = renderHook(() => useImageUpload(mockEditor as unknown as Editor));

      // Screenshots typically have empty filename
      const blob = new Blob(['PNG content'], { type: 'image/png' });
      const file = new File([blob], '', { type: 'image/png' });
      const pasteEvent = {
        clipboardData: {
          files: [file] as unknown as FileList,
        },
        preventDefault: vi.fn(),
      } as unknown as ClipboardEvent;

      await act(async () => {
        await result.current.handlePaste(pasteEvent);
      });

      expect(mockUploadAttachment).toHaveBeenCalledWith(
        expect.objectContaining({
          filename: expect.stringMatching(/^paste-\d+\.png$/),
        })
      );
    });
  });
});
