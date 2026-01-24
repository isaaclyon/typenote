import { useMutation, useQueryClient } from '@tanstack/react-query';
import { tiptapToNotateDoc } from '@typenote/core';
import type { JSONContent } from '@tiptap/core';
import type { TiptapDoc } from '@typenote/core';
import { queryKeys } from '../lib/queryKeys.js';
import { adaptIpcOutcome } from '../lib/ipcQueryAdapter.js';
import { useDebouncedCallback } from '../utils/useDebouncedCallback.js';
import { buildBlockOps } from './documentOps.js';

/** Debounce delay for autosave in milliseconds */
const AUTOSAVE_DEBOUNCE_MS = 750;

/**
 * Input for saving a document.
 */
interface SaveDocumentInput {
  objectId: string;
  content: JSONContent;
  docVersion: number;
}

/**
 * Result of useDocumentMutation hook.
 */
export interface UseDocumentMutationResult {
  /** Save immediately (bypasses debounce) */
  save: (input: SaveDocumentInput) => void;
  /** Debounced save for autosave */
  autosave: (input: SaveDocumentInput) => void;
  /** Whether a save is in progress */
  isSaving: boolean;
  /** Error message if save failed */
  error: string | null;
}

/**
 * Hook to save document changes with autosave debouncing.
 *
 * Handles:
 * - Converting TipTap JSONContent to NotateDoc format
 * - Generating block patch operations
 * - Sending patch to backend via IPC
 * - Debounced autosave
 * - Cache update on success
 *
 * @returns Save functions, loading state, and error
 */
export function useDocumentMutation(): UseDocumentMutationResult {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ objectId, content }: SaveDocumentInput) => {
      // 1. Convert TipTap JSONContent to NotateDoc format
      // Cast to TiptapDoc - JSONContent always has type: 'doc' at root level
      const convertedBlocks = tiptapToNotateDoc(content as TiptapDoc);

      const snapshot = await adaptIpcOutcome(api.getDocument(objectId));
      const ops = buildBlockOps(convertedBlocks, snapshot.blocks);

      if (ops.length === 0) {
        return {
          objectId,
          newDocVersion: snapshot.docVersion,
          convertedBlocks,
        };
      }

      const applyPatch = async (baseDocVersion: number, patchOps: typeof ops) => {
        const outcome = await api.applyBlockPatch({
          apiVersion: 'v1',
          objectId,
          baseDocVersion,
          ops: patchOps,
        });

        if (outcome.success) {
          return outcome.result.newDocVersion;
        }

        if (outcome.error.code === 'CONFLICT_VERSION') {
          return null;
        }

        throw new Error(outcome.error.message);
      };

      const newDocVersion = await applyPatch(snapshot.docVersion, ops);

      if (newDocVersion !== null) {
        return {
          objectId,
          newDocVersion,
          convertedBlocks,
        };
      }

      const retrySnapshot = await adaptIpcOutcome(api.getDocument(objectId));
      const retryOps = buildBlockOps(convertedBlocks, retrySnapshot.blocks);

      if (retryOps.length === 0) {
        return {
          objectId,
          newDocVersion: retrySnapshot.docVersion,
          convertedBlocks,
        };
      }

      const retryOutcome = await api.applyBlockPatch({
        apiVersion: 'v1',
        objectId,
        baseDocVersion: retrySnapshot.docVersion,
        ops: retryOps,
      });

      if (!retryOutcome.success) {
        throw new Error(retryOutcome.error.message);
      }

      return {
        objectId,
        newDocVersion: retryOutcome.result.newDocVersion,
        convertedBlocks,
      };
    },
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.document(data.objectId), () => ({
        objectId: data.objectId,
        docVersion: data.newDocVersion,
        convertedBlocks: data.convertedBlocks,
      }));
      // Invalidate type counts (sidebar) in case title changed
      void queryClient.invalidateQueries({
        queryKey: queryKeys.typeCounts(),
      });
    },
  });

  // Debounced autosave
  const debouncedSave = useDebouncedCallback((input: SaveDocumentInput) => {
    mutation.mutate(input);
  }, AUTOSAVE_DEBOUNCE_MS);

  return {
    save: (input: SaveDocumentInput) => mutation.mutate(input),
    autosave: debouncedSave,
    isSaving: mutation.isPending,
    error: mutation.error ? String(mutation.error) : null,
  };
}
