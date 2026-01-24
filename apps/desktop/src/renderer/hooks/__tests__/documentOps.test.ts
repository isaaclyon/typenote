import { describe, expect, it } from 'vitest';
import type { DocumentBlock } from '@typenote/api';
import type { ConvertedBlock } from '@typenote/core';
import { buildBlockOps } from '../documentOps.js';

function createDocumentBlock(
  id: string,
  orderIndex: number,
  content: unknown,
  parentBlockId: string | null = null
): DocumentBlock {
  return {
    id,
    parentBlockId,
    orderKey: `a${orderIndex}`,
    blockType: 'paragraph',
    content,
    meta: null,
    children: [],
  };
}

describe('buildBlockOps', () => {
  it('returns no ops when content and order match', () => {
    const existingBlocks = [createDocumentBlock('block-a', 0, { text: 'A' })];
    const convertedBlocks: ConvertedBlock[] = [
      { blockId: 'block-a', type: 'paragraph', content: { text: 'A' } },
    ];

    const ops = buildBlockOps(convertedBlocks, existingBlocks);

    expect(ops).toEqual([]);
  });

  it('emits move ops when order changes', () => {
    const existingBlocks = [
      createDocumentBlock('block-a', 0, { text: 'A' }),
      createDocumentBlock('block-b', 1, { text: 'B' }),
    ];
    const convertedBlocks: ConvertedBlock[] = [
      { blockId: 'block-b', type: 'paragraph', content: { text: 'B' } },
      { blockId: 'block-a', type: 'paragraph', content: { text: 'A' } },
    ];

    const ops = buildBlockOps(convertedBlocks, existingBlocks);

    expect(ops).toEqual([
      {
        op: 'block.move',
        blockId: 'block-b',
        newParentBlockId: null,
        place: { where: 'start' },
      },
      {
        op: 'block.move',
        blockId: 'block-a',
        newParentBlockId: null,
        place: { where: 'after', siblingBlockId: 'block-b' },
      },
    ]);
  });
});
