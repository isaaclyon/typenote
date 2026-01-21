/**
 * EmbedNode Extension
 *
 * Block-level atom for Obsidian-style embeds (![[...]]).
 * Renders a framed, read-only preview with a title bar.
 */

import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import type { JSONContent } from '@tiptap/core';
import { EmbedNodeView } from './EmbedNodeView.js';

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

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    embedNode: {
      /** Insert an embed node. */
      insertEmbed: (attrs: EmbedNodeAttributes) => ReturnType;
    };
  }
}

export const EmbedNode = Node.create<EmbedNodeOptions>({
  name: 'embedNode',

  group: 'block',

  atom: true,

  selectable: true,

  draggable: false,

  isolating: true,

  addOptions() {
    return {
      HTMLAttributes: {},
      onResolve: null,
      onOpen: null,
      onSubscribe: null,
      maxDepth: 1,
      embedDepth: 0,
    };
  },

  addAttributes() {
    return {
      objectId: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-object-id'),
        renderHTML: (attributes: Record<string, unknown>) => ({
          'data-object-id': attributes['objectId'] as string,
        }),
      },
      objectType: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-object-type'),
        renderHTML: (attributes: Record<string, unknown>) => ({
          'data-object-type': attributes['objectType'] as string,
        }),
      },
      displayTitle: {
        default: '',
        parseHTML: (element) => element.getAttribute('data-display-title') ?? '',
        renderHTML: (attributes: Record<string, unknown>) => ({
          'data-display-title': attributes['displayTitle'] as string,
        }),
      },
      alias: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-alias'),
        renderHTML: (attributes: Record<string, unknown>) => {
          if (!attributes['alias']) return {};
          return { 'data-alias': attributes['alias'] as string };
        },
      },
      headingText: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-heading-text'),
        renderHTML: (attributes: Record<string, unknown>) => {
          if (!attributes['headingText']) return {};
          return { 'data-heading-text': attributes['headingText'] as string };
        },
      },
      blockId: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-block-id'),
        renderHTML: (attributes: Record<string, unknown>) => {
          if (!attributes['blockId']) return {};
          return { 'data-block-id': attributes['blockId'] as string };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-embed-node]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        'data-embed-node': '',
      }),
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(EmbedNodeView);
  },

  addCommands() {
    return {
      insertEmbed:
        (attrs: EmbedNodeAttributes) =>
        ({ commands }) => {
          return commands.insertContent({ type: this.name, attrs });
        },
    };
  },
});
