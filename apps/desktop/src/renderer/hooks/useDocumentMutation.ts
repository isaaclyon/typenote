import { useMutation, useQueryClient } from '@tanstack/react-query';
import { generateId, tiptapToNotateDoc } from '@typenote/core';
import type { JSONContent } from '@tiptap/core';
import type { DocumentBlock, BlockOp } from '@typenote/api';
import type { ConvertedBlock, TiptapDoc } from '@typenote/core';
import { queryKeys } from '../lib/queryKeys.js';
import { adaptIpcOutcome } from '../lib/ipcQueryAdapter.js';
import { useDebouncedCallback } from '../utils/useDebouncedCallback.js';

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
 * Generic tree walker to collect IDs from nested block structures.
 * Works with both ConvertedBlock (optional blockId) and DocumentBlock (required id).
 */
function collectIds<T extends { children?: T[] }>(
  blocks: T[],
  getId: (block: T) => string | undefined
): Set<string> {
  const ids = new Set<string>();
  function walk(block: T) {
    const id = getId(block);
    if (id) {
      ids.add(id);
    }
    block.children?.forEach(walk);
  }
  blocks.forEach(walk);
  return ids;
}

/**
 * Generate block operations from converted content using preserved block IDs.
 *
 * Strategy:
 * - Blocks with blockId → update (content changed)
 * - Blocks without blockId → insert (new block)
 * - Blocks in DB but not in converted → delete (removed by user)
 */
async function generateBlockOps(
  objectId: string,
  convertedBlocks: ConvertedBlock[]
): Promise<BlockOp[]> {
  // Fetch current document to compare for deletions
  const result = await adaptIpcOutcome(window.typenoteAPI.getDocument(objectId));
  const existingBlocks = result.blocks;

  const ops: BlockOp[] = [];

  // Collect IDs for comparison using generic walker
  const convertedIds = collectIds(convertedBlocks, (b) => b.blockId);
  const existingIds = collectIds(existingBlocks as DocumentBlock[], (b) => b.id);

  /**
   * Process a list of blocks at the same level.
   * Returns the ID of the last processed block for sibling placement.
   */
  function processBlockList(blocks: ConvertedBlock[], parentBlockId: string | null): void {
    // Track last sibling at THIS level only (not global)
    let lastSiblingId: string | null = null;

    for (const block of blocks) {
      let currentBlockId: string;

      if (block.blockId && existingIds.has(block.blockId)) {
        // Existing block → update
        ops.push({
          op: 'block.update',
          blockId: block.blockId,
          patch: {
            content: block.content,
          },
        });
        currentBlockId = block.blockId;
      } else {
        // New block → insert
        const newBlockId = generateId();
        ops.push({
          op: 'block.insert',
          blockId: newBlockId,
          parentBlockId,
          blockType: block.type,
          content: block.content,
          place: lastSiblingId
            ? { where: 'after', siblingBlockId: lastSiblingId }
            : { where: 'start' },
        });
        currentBlockId = newBlockId;
      }

      // Update last sibling for next iteration at this level
      lastSiblingId = currentBlockId;

      // Process children with fresh sibling tracking (new level)
      if (block.children && block.children.length > 0) {
        processBlockList(block.children, currentBlockId);
      }
    }
  }

  // Process root-level blocks
  processBlockList(convertedBlocks, null);

  // Find deleted blocks (exist in DB but not in converted)
  for (const existingId of existingIds) {
    if (!convertedIds.has(existingId)) {
      ops.push({
        op: 'block.delete',
        blockId: existingId,
      });
    }
  }

  return ops;
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
 * - Cache invalidation on success
 *
 * @returns Save functions, loading state, and error
 */
export function useDocumentMutation(): UseDocumentMutationResult {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ objectId, content, docVersion }: SaveDocumentInput) => {
      // 1. Convert TipTap JSONContent to NotateDoc format
      // Cast to TiptapDoc - JSONContent always has type: 'doc' at root level
      const convertedBlocks = tiptapToNotateDoc(content as TiptapDoc);

      // 2. Generate block operations
      const ops = await generateBlockOps(objectId, convertedBlocks);

      // Skip if no ops (document unchanged)
      if (ops.length === 0) {
        return { objectId, newDocVersion: docVersion };
      }

      // 3. Send patch to backend
      const result = await adaptIpcOutcome(
        window.typenoteAPI.applyBlockPatch({
          apiVersion: 'v1',
          objectId,
          baseDocVersion: docVersion,
          ops,
        })
      );

      return {
        objectId,
        newDocVersion: result.newDocVersion,
      };
    },
    onSuccess: (data) => {
      // Invalidate document query to refetch with new version
      void queryClient.invalidateQueries({
        queryKey: queryKeys.document(data.objectId),
      });
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
