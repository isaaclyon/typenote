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
}

export interface UseAutoSaveResult {
  isSaving: boolean;
  lastSaved: Date | null;
  error: string | null;
}

export function useAutoSave(options: UseAutoSaveOptions): UseAutoSaveResult {
  const { editor, objectId, initialBlocks, debounceMs = DEFAULT_DEBOUNCE_MS } = options;

  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const save = useCallback(async () => {
    if (!editor) return;

    const editorJson = editor.getJSON();
    const ops = generateBlockOps(initialBlocks, editorJson, objectId);

    if (ops.length === 0) return;

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
        setLastSaved(new Date());
      } else {
        setError(result.error?.message ?? 'Save failed');
      }
    } catch {
      // Error already toasted by ipcCall, just set local state
      setError('Save failed');
    } finally {
      setIsSaving(false);
    }
  }, [editor, initialBlocks, objectId]);

  useEffect(() => {
    if (!editor) return;

    const handleUpdate = () => {
      // Clear existing timer
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      // Set new debounced timer
      timerRef.current = setTimeout(() => {
        void save();
      }, debounceMs);
    };

    editor.on('update', handleUpdate);

    return () => {
      editor.off('update', handleUpdate);
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [editor, debounceMs, save]);

  return {
    isSaving,
    lastSaved,
    error,
  };
}
