import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react';
import { Plugin, PluginKey } from 'prosemirror-state';
import type { EditorView } from 'prosemirror-view';
import { FileText } from 'lucide-react';
import type { NodeViewProps } from '@tiptap/react';

/**
 * RefNode attributes stored in the document
 */
export interface RefNodeAttributes {
  /** The target object ID */
  objectId: string;
  /** Display text (optional - falls back to objectId if not provided) */
  label?: string;
}

export interface RefNodeOptions {
  /** Callback when a ref node is clicked (for navigation) */
  onNavigate?: ((objectId: string) => void) | undefined;
}

/**
 * RefNodeView - React component for rendering a wiki-link in the editor.
 */
function RefNodeView({ node, selected }: NodeViewProps) {
  const { objectId, label } = node.attrs as RefNodeAttributes;
  const displayText = label || objectId;

  return (
    <NodeViewWrapper
      as="span"
      className={`ref-node inline-flex items-center gap-0.5 rounded px-1 py-0.5 text-accent-foreground bg-accent/20 cursor-pointer hover:bg-accent/30 transition-colors ${
        selected ? 'ring-2 ring-accent ring-offset-1' : ''
      }`}
      data-ref={objectId}
      data-type="wiki-link"
    >
      <FileText className="h-3 w-3 opacity-70" />
      <span className="text-sm">{displayText}</span>
    </NodeViewWrapper>
  );
}

RefNodeView.displayName = 'RefNodeView';

/**
 * RefNode - TipTap node extension for wiki-links.
 *
 * Renders inline references to other objects in the knowledge base.
 * Clicking a ref navigates to the linked object.
 *
 * @example
 * ```typescript
 * import { RefNode } from './extensions/RefNode.js';
 *
 * const editor = useEditor({
 *   extensions: [
 *     RefNode.configure({
 *       onNavigate: (objectId) => navigate(`/notes/${objectId}`),
 *     }),
 *   ],
 * });
 * ```
 */
export const RefNode = Node.create<RefNodeOptions>({
  name: 'refNode',

  group: 'inline',

  inline: true,

  atom: true,

  addOptions() {
    return {
      onNavigate: undefined,
    };
  },

  addAttributes() {
    return {
      objectId: {
        default: '',
        parseHTML: (element) => element.getAttribute('data-object-id'),
        renderHTML: (attributes: RefNodeAttributes) => ({
          'data-object-id': attributes.objectId,
        }),
      },
      label: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-label'),
        renderHTML: (attributes: RefNodeAttributes) => ({
          'data-label': attributes.label ?? null,
        }),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-type="wiki-link"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'span',
      mergeAttributes(HTMLAttributes, {
        'data-type': 'wiki-link',
        class: 'ref-node',
      }),
    ];
  },

  addNodeView() {
    // Note: Type assertion needed due to TipTap version conflicts (3.14.0 vs 3.15.x)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return ReactNodeViewRenderer(RefNodeView) as any;
  },

  // Add click handler for navigation
  addProseMirrorPlugins() {
    const { onNavigate } = this.options;

    if (!onNavigate) {
      return [];
    }

    const pluginKey = new PluginKey('refNodeClick');

    return [
      new Plugin({
        key: pluginKey,
        props: {
          handleClick: (_view: EditorView, _pos: number, event: MouseEvent) => {
            const target = event.target as HTMLElement;
            const refNode = target.closest('[data-type="wiki-link"]');

            if (refNode) {
              const objectId = refNode.getAttribute('data-object-id');
              if (objectId) {
                onNavigate(objectId);
                return true;
              }
            }

            return false;
          },
        },
      }),
    ];
  },
});
