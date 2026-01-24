import { useQuery } from '@tanstack/react-query';
import { notateDocToTiptap } from '@typenote/core';
import type { JSONContent } from '@tiptap/core';
import type { DocumentBlock } from '@typenote/api';
import type { RefResolver, ConvertedBlock } from '@typenote/core';
import { queryKeys } from '../lib/queryKeys.js';
import { adaptIpcOutcome } from '../lib/ipcQueryAdapter.js';

/**
 * Map DocumentBlock[] (with IDs, tree structure) to ConvertedBlock[] (with blockId preserved).
 * This enables round-trip ID tracking: load → edit → save with correct block IDs.
 */
function documentBlocksToConvertedBlocks(blocks: DocumentBlock[]): ConvertedBlock[] {
  return blocks.map((block) => ({
    type: block.blockType as ConvertedBlock['type'],
    content: block.content,
    blockId: block.id, // Preserve block ID for round-trip
    ...(block.children.length > 0
      ? { children: documentBlocksToConvertedBlocks(block.children) }
      : {}),
  }));
}

/**
 * Build a RefResolver that looks up object metadata synchronously.
 * Pre-fetches all referenced objects before conversion.
 */
async function buildRefResolver(): Promise<RefResolver> {
  // For MVP: Fetch all objects to build a lookup map
  // This is acceptable for small datasets; optimize later with selective fetching
  const outcome = await window.typenoteAPI.listObjects({});

  if (!outcome.success) {
    // Fallback resolver if fetch fails
    return {
      resolveObject: (objectId: string) => ({
        displayTitle: objectId.slice(0, 8) + '...',
        objectType: 'unknown',
      }),
    };
  }

  // Build lookup map: objectId -> metadata
  const objectMap = new Map<string, { title: string; typeKey: string }>();
  for (const obj of outcome.result) {
    objectMap.set(obj.id, { title: obj.title, typeKey: obj.typeKey });
  }

  // Also fetch object types for colors
  const typesOutcome = await window.typenoteAPI.listObjectTypes({});
  const typeColorMap = new Map<string, string>();
  if (typesOutcome.success) {
    for (const type of typesOutcome.result) {
      if (type.color) {
        typeColorMap.set(type.key, type.color);
      }
    }
  }

  return {
    resolveObject: (objectId: string) => {
      const obj = objectMap.get(objectId);
      if (!obj) {
        return {
          displayTitle: objectId.slice(0, 8) + '...',
          objectType: 'unknown',
        };
      }

      const color = typeColorMap.get(obj.typeKey);
      return {
        displayTitle: obj.title,
        objectType: obj.typeKey,
        ...(color ? { color } : {}),
      };
    },
  };
}

/**
 * Result of useDocument hook.
 */
export interface UseDocumentResult {
  /** TipTap JSONContent for the Editor */
  content: JSONContent | undefined;
  /** Current document version for optimistic concurrency */
  docVersion: number | undefined;
  /** Loading state */
  isLoading: boolean;
  /** Error message if fetch failed */
  error: string | null;
  /** Refetch the document */
  refetch: () => void;
}

/**
 * Hook to fetch a document and convert it to TipTap JSONContent format.
 *
 * Handles:
 * - Fetching document blocks via IPC
 * - Converting NotateDoc format to TipTap JSONContent
 * - Resolving reference metadata (object titles, colors)
 * - Caching via TanStack Query
 *
 * @param objectId - The object ID to fetch
 * @returns Document content, loading state, and error
 */
export function useDocument(objectId: string): UseDocumentResult {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: queryKeys.document(objectId),
    queryFn: async () => {
      // 1. Fetch document blocks
      const result = await adaptIpcOutcome(window.typenoteAPI.getDocument(objectId));

      // 2. Build ref resolver with all object metadata
      const refResolver = await buildRefResolver();

      // 3. Convert DocumentBlock[] to ConvertedBlock[] format
      const convertedBlocks = documentBlocksToConvertedBlocks(result.blocks);

      // 4. Convert to TipTap JSONContent
      const content = notateDocToTiptap(convertedBlocks, refResolver);

      return {
        objectId: result.objectId,
        docVersion: result.docVersion,
        content,
      };
    },
    enabled: !!objectId,
    staleTime: 0, // Always refetch on mount (document may have changed externally)
  });

  return {
    content: data?.content,
    docVersion: data?.docVersion,
    isLoading,
    error: error ? String(error) : null,
    refetch,
  };
}
