import type { JSONContent } from '@tiptap/core';

export interface EmbedNodeAttributes {
  objectId: string;
  objectType: string;
  displayTitle: string;
  alias?: string | null;
  headingText?: string | null;
  blockId?: string | null;
}

export interface EmbedNodeOptions {
  /** HTML attributes to add to the rendered element. */
  HTMLAttributes: Record<string, unknown>;
  /** Resolve embed content to TipTap JSON. */
  onResolve: ((target: EmbedNodeAttributes) => Promise<JSONContent>) | null;
  /** Open the source object. */
  onOpen: ((target: EmbedNodeAttributes) => void) | null;
  /** Subscribe to live updates. */
  onSubscribe:
    | ((target: EmbedNodeAttributes, onUpdate: (content: JSONContent) => void) => () => void)
    | null;
  /** Max embed depth before suppression. */
  maxDepth: number;
  /** Current embed depth (root = 0). */
  embedDepth: number;
}
