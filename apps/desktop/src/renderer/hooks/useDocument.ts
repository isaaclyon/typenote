import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { notateDocToTiptap } from '@typenote/core';
import type { JSONContent } from '@tiptap/core';
import { queryKeys } from '../lib/queryKeys.js';
import { adaptIpcOutcome } from '../lib/ipcQueryAdapter.js';
import { buildRefResolver, documentBlocksToConvertedBlocks } from './documentConversion.js';
import { api } from '../lib/api.js';

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
  const objectsQuery = useQuery({
    queryKey: queryKeys.objects(),
    queryFn: async () => adaptIpcOutcome(api.listObjects({})),
    staleTime: Number.POSITIVE_INFINITY,
    enabled: !!objectId,
  });

  const typesQuery = useQuery({
    queryKey: queryKeys.types(),
    queryFn: async () => adaptIpcOutcome(api.listObjectTypes({ builtInOnly: true })),
    staleTime: Number.POSITIVE_INFINITY,
    enabled: !!objectId,
  });

  const refResolver = useMemo(
    () => buildRefResolver(objectsQuery.data, typesQuery.data),
    [objectsQuery.data, typesQuery.data]
  );

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: queryKeys.document(objectId),
    queryFn: async () => {
      // 1. Fetch document blocks
      const result = await adaptIpcOutcome(api.getDocument(objectId));

      // 2. Convert DocumentBlock[] to ConvertedBlock[] format
      const convertedBlocks = documentBlocksToConvertedBlocks(result.blocks);

      return {
        objectId: result.objectId,
        docVersion: result.docVersion,
        convertedBlocks,
      };
    },
    enabled: !!objectId,
    staleTime: 0, // Always refetch on mount (document may have changed externally)
  });

  const content = useMemo(() => {
    if (!data) {
      return undefined;
    }

    return notateDocToTiptap(data.convertedBlocks, refResolver);
  }, [data, refResolver]);

  return {
    content,
    docVersion: data?.docVersion,
    isLoading,
    error: error ? String(error) : null,
    refetch,
  };
}
