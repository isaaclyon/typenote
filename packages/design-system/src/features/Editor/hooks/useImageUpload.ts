import * as React from 'react';
import type { Editor as TiptapEditor } from '@tiptap/core';
import type { Node as ProseMirrorNode } from '@tiptap/pm/model';
import type { ImageUploadHandler, ImageUploadRequest } from '../types.js';
import type { ImageNodeAttributes } from '../extensions/ResizableImage.js';
import {
  createImageUploadId,
  isRasterImageFile,
  normalizeImageMeta,
} from '../extensions/image-utils.js';
import { useCallbackRef } from './useCallbackRef.js';

// ============================================================================
// Types
// ============================================================================

export interface UseImageUploadOptions {
  /** Reference to the TipTap editor instance */
  editorRef: React.RefObject<TiptapEditor | null>;
  /** Whether the editor is in read-only mode */
  readOnly: boolean;
  /** Optional handler for uploading images */
  onImageUpload: ImageUploadHandler | undefined;
  /** Optional handler called when an image is removed */
  onImageRemove: ((uploadId: string | null) => void) | undefined;
}

export interface UseImageUploadReturn {
  /** Insert image files into the editor (with optional upload) */
  insertImageFiles: (
    files: File[],
    meta?: { alt?: string | null; caption?: string | null },
    position?: number | null
  ) => void;
  /** Insert an image from a URL */
  insertImageFromUrl: (
    src: string,
    meta?: { alt?: string | null; caption?: string | null },
    position?: number | null
  ) => void;
  /** Retry a failed upload */
  handleRetryUpload: (file: File, uploadId: string | null) => void;
  /** Remove an image and clean up resources */
  handleImageRemove: (uploadId: string | null) => void;
  /** Sync upload IDs when document changes (call in onChange) */
  syncImageUploadIds: (doc: ProseMirrorNode) => void;
  /** Cleanup function for unmounting */
  cleanup: () => void;
}

// ============================================================================
// Hook Implementation
// ============================================================================

/**
 * Manages image upload lifecycle for the Editor.
 *
 * Handles:
 * - Inserting images from files or URLs
 * - Progress tracking during uploads
 * - Error handling and retry logic
 * - Object URL management (creation and revocation)
 * - Cleanup when images are removed from the document
 */
export function useImageUpload({
  editorRef,
  readOnly,
  onImageUpload,
  onImageRemove,
}: UseImageUploadOptions): UseImageUploadReturn {
  // Refs for callbacks (stable across renders)
  const onImageUploadRef = useCallbackRef(onImageUpload);
  const onImageRemoveRef = useCallbackRef(onImageRemove);

  // Track object URLs for cleanup
  const imageObjectUrlsRef = React.useRef(new Map<string, string>());
  const imageUploadIdsRef = React.useRef(new Set<string>());

  // -------------------------------------------------------------------------
  // Internal helpers
  // -------------------------------------------------------------------------

  const releaseImageObjectUrl = React.useCallback((uploadId: string) => {
    const existingUrl = imageObjectUrlsRef.current.get(uploadId);
    if (existingUrl) {
      URL.revokeObjectURL(existingUrl);
      imageObjectUrlsRef.current.delete(uploadId);
    }
  }, []);

  const setImageObjectUrl = React.useCallback((uploadId: string, objectUrl: string) => {
    const existingUrl = imageObjectUrlsRef.current.get(uploadId);
    if (existingUrl && existingUrl !== objectUrl) {
      URL.revokeObjectURL(existingUrl);
    }
    imageObjectUrlsRef.current.set(uploadId, objectUrl);
  }, []);

  const collectImageUploadIds = React.useCallback((doc: ProseMirrorNode) => {
    const uploadIds = new Set<string>();
    doc.descendants((node) => {
      if (node.type.name !== 'image') return true;
      const uploadId = (node.attrs as ImageNodeAttributes)['uploadId'];
      if (typeof uploadId === 'string' && uploadId.length > 0) {
        uploadIds.add(uploadId);
      }
      return true;
    });
    return uploadIds;
  }, []);

  const updateImageNodeByUploadId = React.useCallback(
    (uploadId: string, attrs: Partial<ImageNodeAttributes>) => {
      const editorInstance = editorRef.current;
      if (!editorInstance) return;
      const { state, view } = editorInstance;
      let transaction = state.tr;
      let updated = false;

      state.doc.descendants((node, pos) => {
        if (node.type.name !== 'image') return true;
        const nodeUploadId = (node.attrs as ImageNodeAttributes)['uploadId'];
        if (nodeUploadId !== uploadId) return true;
        transaction = transaction.setNodeMarkup(pos, undefined, {
          ...node.attrs,
          ...attrs,
        });
        updated = true;
        return false;
      });

      if (updated) {
        view.dispatch(transaction);
      }
    },
    [editorRef]
  );

  const findImageNodeByUploadId = React.useCallback(
    (uploadId: string | null): ImageNodeAttributes | null => {
      if (!uploadId) return null;
      const editorInstance = editorRef.current;
      if (!editorInstance) return null;
      let found: ImageNodeAttributes | null = null;
      editorInstance.state.doc.descendants((node) => {
        if (node.type.name !== 'image') return true;
        const nodeUploadId = (node.attrs as ImageNodeAttributes)['uploadId'];
        if (nodeUploadId !== uploadId) return true;
        found = node.attrs as ImageNodeAttributes;
        return false;
      });
      return found;
    },
    [editorRef]
  );

  const insertImageNodes = React.useCallback(
    (nodes: ImageNodeAttributes[], position?: number | null) => {
      const editorInstance = editorRef.current;
      if (!editorInstance || readOnly) return;
      const content = nodes.map((attrs) => ({
        type: 'image',
        attrs,
      }));
      const chain = editorInstance.chain().focus();
      if (typeof position === 'number') {
        chain.insertContentAt(position, content);
      } else {
        chain.insertContent(content);
      }
      chain.run();
    },
    [editorRef, readOnly]
  );

  const startImageUpload = React.useCallback(
    async (
      file: File,
      uploadId: string,
      meta?: { alt?: string | null; caption?: string | null }
    ) => {
      const uploader = onImageUploadRef.current;
      if (!uploader) return;

      const baseMeta = meta ?? findImageNodeByUploadId(uploadId);
      const normalizedMeta = normalizeImageMeta({
        alt: baseMeta?.alt ?? null,
        caption: baseMeta?.caption ?? null,
      });

      const request: ImageUploadRequest = {
        uploadId,
        alt: normalizedMeta.alt,
        caption: normalizedMeta.caption,
        onProgress: (progress) => {
          const safeProgress = Math.max(0, Math.min(100, progress));
          updateImageNodeByUploadId(uploadId, { uploadProgress: safeProgress });
        },
      };

      try {
        const result = await uploader(file, request);
        const mergedMeta = normalizeImageMeta({
          alt: result.alt ?? normalizedMeta.alt,
          caption: result.caption ?? normalizedMeta.caption,
        });
        updateImageNodeByUploadId(uploadId, {
          src: result.src,
          alt: mergedMeta.alt,
          caption: mergedMeta.caption,
          uploadStatus: null,
          uploadProgress: null,
          errorMessage: null,
        });
        releaseImageObjectUrl(uploadId);
      } catch (error) {
        updateImageNodeByUploadId(uploadId, {
          uploadStatus: 'error',
          uploadProgress: null,
          errorMessage: error instanceof Error && error.message ? error.message : 'Upload failed',
        });
      }
    },
    [findImageNodeByUploadId, releaseImageObjectUrl, updateImageNodeByUploadId, onImageUploadRef]
  );

  // -------------------------------------------------------------------------
  // Public API
  // -------------------------------------------------------------------------

  const insertImageFiles = React.useCallback(
    (
      files: File[],
      meta?: { alt?: string | null; caption?: string | null },
      position?: number | null
    ) => {
      if (readOnly) return;
      const validFiles = files.filter(isRasterImageFile);
      if (validFiles.length === 0) return;
      const uploader = onImageUploadRef.current;
      const normalizedMeta = normalizeImageMeta(meta);

      const uploads = validFiles.map((file) => {
        const uploadId = createImageUploadId();
        const objectUrl = URL.createObjectURL(file);
        setImageObjectUrl(uploadId, objectUrl);

        const attrs: ImageNodeAttributes = {
          src: objectUrl,
          alt: normalizedMeta.alt,
          caption: normalizedMeta.caption,
          uploadId,
          uploadStatus: uploader ? 'uploading' : null,
          uploadProgress: uploader ? 0 : null,
          errorMessage: null,
        };

        return { file, uploadId, attrs };
      });

      insertImageNodes(
        uploads.map((upload) => upload.attrs),
        position
      );

      uploads.forEach((upload) => {
        if (uploader) {
          void startImageUpload(upload.file, upload.uploadId, normalizedMeta);
        }
      });
    },
    [insertImageNodes, readOnly, setImageObjectUrl, startImageUpload, onImageUploadRef]
  );

  const insertImageFromUrl = React.useCallback(
    (
      src: string,
      meta?: { alt?: string | null; caption?: string | null },
      position?: number | null
    ) => {
      if (readOnly) return;
      const normalizedMeta = normalizeImageMeta(meta);
      insertImageNodes(
        [
          {
            src,
            alt: normalizedMeta.alt,
            caption: normalizedMeta.caption,
            uploadId: null,
            uploadStatus: null,
            uploadProgress: null,
            errorMessage: null,
          },
        ],
        position
      );
    },
    [insertImageNodes, readOnly]
  );

  const handleRetryUpload = React.useCallback(
    (file: File, uploadId: string | null) => {
      if (!uploadId) {
        insertImageFiles([file]);
        return;
      }

      const existingMeta = findImageNodeByUploadId(uploadId);
      const normalizedMeta = normalizeImageMeta({
        alt: existingMeta?.alt ?? null,
        caption: existingMeta?.caption ?? null,
      });
      const objectUrl = URL.createObjectURL(file);
      setImageObjectUrl(uploadId, objectUrl);
      updateImageNodeByUploadId(uploadId, {
        src: objectUrl,
        alt: normalizedMeta.alt,
        caption: normalizedMeta.caption,
        uploadStatus: onImageUploadRef.current ? 'uploading' : null,
        uploadProgress: onImageUploadRef.current ? 0 : null,
        errorMessage: null,
      });

      if (onImageUploadRef.current) {
        void startImageUpload(file, uploadId, normalizedMeta);
      }
    },
    [
      findImageNodeByUploadId,
      insertImageFiles,
      setImageObjectUrl,
      startImageUpload,
      updateImageNodeByUploadId,
      onImageUploadRef,
    ]
  );

  const handleImageRemove = React.useCallback(
    (uploadId: string | null) => {
      if (uploadId) {
        releaseImageObjectUrl(uploadId);
        imageUploadIdsRef.current.delete(uploadId);
      }
      onImageRemoveRef.current?.(uploadId ?? null);
    },
    [releaseImageObjectUrl, onImageRemoveRef]
  );

  const syncImageUploadIds = React.useCallback(
    (doc: ProseMirrorNode) => {
      const currentIds = collectImageUploadIds(doc);
      const previousIds = imageUploadIdsRef.current;

      previousIds.forEach((uploadId) => {
        if (!currentIds.has(uploadId)) {
          releaseImageObjectUrl(uploadId);
          onImageRemoveRef.current?.(uploadId);
        }
      });

      imageUploadIdsRef.current = currentIds;
    },
    [collectImageUploadIds, releaseImageObjectUrl, onImageRemoveRef]
  );

  const cleanup = React.useCallback(() => {
    imageObjectUrlsRef.current.forEach((url) => {
      URL.revokeObjectURL(url);
    });
    imageObjectUrlsRef.current.clear();
  }, []);

  return {
    insertImageFiles,
    insertImageFromUrl,
    handleRetryUpload,
    handleImageRemove,
    syncImageUploadIds,
    cleanup,
  };
}
