/**
 * useAutoSave Hook
 *
 * Auto-saves TipTap editor changes with debouncing.
 * Converts TipTap JSON to NotateDoc format and applies block patches via IPC.
 */

/// <reference path="../global.d.ts" />

import { useState, useEffect, useRef, useCallback } from 'react';
import type { Editor } from '@tiptap/react';
import type { DocumentBlock } from '@typenote/api';
import { generateBlockOps } from '../lib/tiptapToNotate.js';
import { ipcCall } from '../lib/ipc.js';

const DEFAULT_DEBOUNCE_MS = 500;

export interface UseAutoSaveOptions {
  editor: Editor | null;
  objectId: string;
  initialBlocks: DocumentBlock[];
  debounceMs?: number;
  onSaveSuccess?: (objectId: string) => void | Promise<void>;
}

export interface UseAutoSaveResult {
  isSaving: boolean;
  lastSaved: Date | null;
  error: string | null;
}

export function useAutoSave(options: UseAutoSaveOptions): UseAutoSaveResult {
  const {
    editor,
    objectId,
    initialBlocks,
    debounceMs = DEFAULT_DEBOUNCE_MS,
    onSaveSuccess,
  } = options;

  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const initialBlocksRef = useRef<DocumentBlock[]>(initialBlocks);

  // Keep ref in sync with prop
  useEffect(() => {
    initialBlocksRef.current = initialBlocks;
  }, [initialBlocks]);

  const save = useCallback(async () => {
    if (!editor) {
      console.log('[useAutoSave] save() called but no editor');
      return;
    }

    const editorJson = editor.getJSON();
    const ops = generateBlockOps(initialBlocksRef.current, editorJson, objectId);

    if (ops.length === 0) {
      console.log('[useAutoSave] save() called but no changes to save');
      return;
    }

    console.log('[useAutoSave] Saving', ops.length, 'ops');
    setIsSaving(true);
    setError(null);

    try {
      const result = await ipcCall('Save', () =>
        window.typenoteAPI.applyBlockPatch({
          apiVersion: 'v1',
          objectId,
          ops,
        })
      );

      if (result.success) {
        console.log('[useAutoSave] Save successful');
        setLastSaved(new Date());
        // Notify caller so they can update initialBlocks
        if (onSaveSuccess) {
          await onSaveSuccess(objectId);
        }
      } else {
        console.error('[useAutoSave] Save failed:', result.error?.message);
        setError(result.error?.message ?? 'Save failed');
      }
    } catch (err) {
      console.error('[useAutoSave] Save error:', err);
      // Error already toasted by ipcCall, just set local state
      setError('Save failed');
    } finally {
      setIsSaving(false);
    }
  }, [editor, objectId, onSaveSuccess]);

  useEffect(() => {
    if (!editor) return;

    const handleUpdate = () => {
      console.log('[useAutoSave] Editor update detected, debouncing save');
      // Clear existing timer
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      // Set new debounced timer
      timerRef.current = setTimeout(() => {
        console.log('[useAutoSave] Debounce timer fired, calling save()');
        void save();
      }, debounceMs);
    };

    console.log('[useAutoSave] Setting up editor listener');
    editor.on('update', handleUpdate);

    return () => {
      console.log('[useAutoSave] Cleanup called');
      editor.off('update', handleUpdate);
      // CRITICAL FIX: Flush pending save immediately on unmount
      // This prevents data loss when navigating before debounce completes
      if (timerRef.current) {
        console.log('[useAutoSave] Cleanup: flushing pending save');
        clearTimeout(timerRef.current);
        void save(); // Execute pending save immediately
      } else {
        console.log('[useAutoSave] Cleanup: no pending timer');
      }
    };
  }, [editor, debounceMs, save]);

  return {
    isSaving,
    lastSaved,
    error,
  };
}
