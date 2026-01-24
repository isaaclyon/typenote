import { describe, expect, it } from 'vitest';
import { notateDocToTiptap, defaultRefResolver } from './notateDocToTiptap.js';
import { tiptapToNotateDoc } from './tiptapToNotateDoc.js';
import type { TiptapDoc } from './types.js';

describe('blockId roundtrip', () => {
  it('preserves blockId through conversions', () => {
    const doc: TiptapDoc = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          attrs: { blockId: 'block-1' },
          content: [{ type: 'text', text: 'Hello' }],
        },
      ],
    };

    const convertedBlocks = tiptapToNotateDoc(doc);

    expect(convertedBlocks[0]?.blockId).toBe('block-1');

    const roundtrip = notateDocToTiptap(convertedBlocks, defaultRefResolver);

    expect(roundtrip.content?.[0]?.attrs).toMatchObject({ blockId: 'block-1' });
  });
});
