import * as React from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { JSONContent } from '@tiptap/core';
import type { ConvertedBlock, TiptapDoc } from '@typenote/core';
import { tiptapToNotateDoc } from '@typenote/core';
import type { DocumentBlock, GetDocumentResult } from '@typenote/api';
import { queryKeys } from '../../lib/queryKeys.js';
import { useDocumentMutation } from '../useDocumentMutation.js';
import { createMockTypenoteAPI, createTestQueryClient, setupMockAPI } from './test-utils.js';

function toDocumentBlocks(
  blocks: ConvertedBlock[],
  parentBlockId: string | null = null,
  orderPrefix = 'a'
): DocumentBlock[] {
  return blocks.map((block, index) => {
    const blockId = block.blockId ?? `${orderPrefix}${index}`;
    return {
      id: blockId,
      parentBlockId,
      orderKey: `${orderPrefix}${index}`,
      blockType: block.type,
      content: block.content,
      meta: null,
      children: block.children
        ? toDocumentBlocks(block.children, blockId, `${orderPrefix}${index}`)
        : [],
    };
  });
}

describe('useDocumentMutation', () => {
  it('retries with the latest docVersion on conflict', async () => {
    const objectId = '01ABC123456789DEFGHIJK0001';
    const content: JSONContent = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          attrs: { blockId: 'block-1' },
          content: [{ type: 'text', text: 'Hello' }],
        },
      ],
    };

    const convertedBlocks = tiptapToNotateDoc(content as TiptapDoc);
    const documentBlocks = toDocumentBlocks(convertedBlocks);
    const firstBlock = documentBlocks[0];
    if (firstBlock) {
      documentBlocks[0] = {
        ...firstBlock,
        content: { inline: [{ t: 'text', text: 'Old' }] },
      };
    }
    const firstDoc: GetDocumentResult = {
      objectId,
      docVersion: 1,
      blocks: documentBlocks,
    };
    const secondDoc: GetDocumentResult = {
      objectId,
      docVersion: 2,
      blocks: documentBlocks,
    };

    const getDocument = vi
      .fn()
      .mockResolvedValueOnce({ success: true as const, result: firstDoc })
      .mockResolvedValueOnce({ success: true as const, result: secondDoc });
    const applyBlockPatch = vi
      .fn()
      .mockResolvedValueOnce({
        success: false as const,
        error: { code: 'CONFLICT_VERSION', message: 'Conflict' },
      })
      .mockResolvedValueOnce({
        success: true as const,
        result: { newDocVersion: 2 },
      });

    const cleanup = setupMockAPI(
      createMockTypenoteAPI({
        getDocument,
        applyBlockPatch,
      })
    );

    const queryClient = createTestQueryClient();
    queryClient.setQueryData(queryKeys.document(objectId), {
      objectId,
      docVersion: 1,
      convertedBlocks,
    });

    const wrapper = ({ children }: { children: React.ReactNode }) =>
      React.createElement(QueryClientProvider, { client: queryClient }, children);

    const { result } = renderHook(() => useDocumentMutation(), { wrapper });

    act(() => {
      result.current.save({ objectId, content, docVersion: 1 });
    });

    await waitFor(() => {
      expect(applyBlockPatch).toHaveBeenCalledTimes(2);
    });

    expect(applyBlockPatch.mock.calls[0]?.[0]).toMatchObject({ baseDocVersion: 1 });
    expect(applyBlockPatch.mock.calls[1]?.[0]).toMatchObject({ baseDocVersion: 2 });

    const cached = queryClient.getQueryData(queryKeys.document(objectId));
    expect(cached).toMatchObject({ docVersion: 2, convertedBlocks });

    cleanup();
  });
});
