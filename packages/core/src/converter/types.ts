/**
 * TipTap JSONContent types (minimal definition for packages/core).
 * We can't import from @tiptap/core here, so we define the subset we need.
 */

export interface TiptapMark {
  type: string;
  attrs?: Record<string, unknown>;
}

export interface TiptapNode {
  type: string;
  attrs?: Record<string, unknown>;
  content?: TiptapNode[];
  marks?: TiptapMark[];
  text?: string;
}

/**
 * TipTap document structure (root node).
 */
export interface TiptapDoc {
  type: 'doc';
  content?: TiptapNode[];
}
