/**
 * useImageUpload Hook
 *
 * Handles image upload for the TipTap editor via drag-drop and paste.
 * Validates files, encodes to base64, and uploads via IPC.
 */

import { useCallback } from 'react';
import type { Editor } from '@tiptap/core';
import { toast } from 'sonner';
import {
  fileToBase64,
  validateImageFile,
  SUPPORTED_IMAGE_TYPES,
  type SupportedImageType,
} from '../lib/imageUtils.js';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface UseImageUploadReturn {
  handleFile: (file: File) => Promise<void>;
  handleDrop: (event: DragEvent) => Promise<boolean>;
  handlePaste: (event: ClipboardEvent) => Promise<boolean>;
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper Functions
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Checks if a file is a supported image type.
 */
function isSupportedImageFile(file: File): boolean {
  return SUPPORTED_IMAGE_TYPES.includes(file.type as SupportedImageType);
}

/**
 * Generates a filename for pasted images (e.g., screenshots).
 */
function generatePasteFilename(mimeType: string): string {
  const extension = mimeType.split('/')[1] ?? 'png';
  return `paste-${Date.now()}.${extension}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Hook for handling image uploads in TipTap editor.
 *
 * @param editor - The TipTap editor instance, or null if not ready
 * @returns Handlers for file upload, drag-drop, and paste events
 */
export function useImageUpload(editor: Editor | null): UseImageUploadReturn {
  /**
   * Handles a single file upload.
   * Validates, encodes, uploads via IPC, and inserts attachment node.
   */
  const handleFile = useCallback(
    async (file: File): Promise<void> => {
      // Don't do anything if editor is not available
      if (editor === null) {
        return;
      }

      // Validate file
      const validation = validateImageFile(file);
      if (!validation.valid) {
        toast.error(validation.error);
        return;
      }

      try {
        // Convert to base64
        const base64 = await fileToBase64(file);

        // Determine filename (generate one for screenshots/pastes)
        const filename = file.name || generatePasteFilename(file.type);

        // Upload via IPC
        const result = await window.typenoteAPI.uploadAttachment({
          filename,
          mimeType: file.type,
          sizeBytes: file.size,
          data: base64,
        });

        // Handle result
        if (result.success) {
          editor
            .chain()
            .focus()
            .insertContent({
              type: 'attachment',
              attrs: { attachmentId: result.result.attachmentId },
            })
            .run();
        } else {
          toast.error(result.error.message);
        }
      } catch {
        toast.error('Failed to upload image');
      }
    },
    [editor]
  );

  /**
   * Handles drag-and-drop events.
   * Returns true if images were found and handled, false otherwise.
   */
  const handleDrop = useCallback(
    async (event: DragEvent): Promise<boolean> => {
      const files = event.dataTransfer?.files;
      if (files === undefined || files.length === 0) {
        return false;
      }

      // Filter to only image files
      const imageFiles = Array.from(files).filter(isSupportedImageFile);
      if (imageFiles.length === 0) {
        return false;
      }

      // Prevent default browser handling
      event.preventDefault();

      // Upload all image files
      await Promise.all(imageFiles.map(handleFile));

      return true;
    },
    [handleFile]
  );

  /**
   * Handles paste events.
   * Returns true if images were found and handled, false otherwise.
   */
  const handlePaste = useCallback(
    async (event: ClipboardEvent): Promise<boolean> => {
      const files = event.clipboardData?.files;
      if (files === undefined || files.length === 0) {
        return false;
      }

      // Filter to only image files
      const imageFiles = Array.from(files).filter(isSupportedImageFile);
      if (imageFiles.length === 0) {
        return false;
      }

      // Prevent default paste handling
      event.preventDefault();

      // Upload all image files
      await Promise.all(imageFiles.map(handleFile));

      return true;
    },
    [handleFile]
  );

  return { handleFile, handleDrop, handlePaste };
}
