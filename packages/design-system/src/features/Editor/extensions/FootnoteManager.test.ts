import { describe, expect, it } from 'vitest';

import type { Node as ProseMirrorNode } from '@tiptap/pm/model';
import { nodesEqual } from './FootnoteManager.js';

function makeNode(id: string): ProseMirrorNode {
  return {
    id,
    eq: (other: ProseMirrorNode) => (other as { id?: string }).id === id,
  } as unknown as ProseMirrorNode;
}

describe('nodesEqual', () => {
  it('returns true for equal node arrays', () => {
    const nodes = [makeNode('a'), makeNode('b')];
    const others = [makeNode('a'), makeNode('b')];
    expect(nodesEqual(nodes, others)).toBe(true);
  });

  it('returns false when lengths differ', () => {
    expect(nodesEqual([makeNode('a')], [makeNode('a'), makeNode('b')])).toBe(false);
  });

  it('returns false when nodes differ', () => {
    const nodes = [makeNode('a'), makeNode('b')];
    const others = [makeNode('a'), makeNode('c')];
    expect(nodesEqual(nodes, others)).toBe(false);
  });
});
