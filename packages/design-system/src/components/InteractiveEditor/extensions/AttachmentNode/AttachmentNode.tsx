/**
 * AttachmentNode Extension for TipTap
 *
 * Custom block-level node for image attachments.
 * Renders images using file:// protocol with optional resize handles.
 */

import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react';
import type { NodeViewProps } from '@tiptap/react';
import { ImageIcon } from 'lucide-react';
import { cn } from '../../../../utils/cn.js';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface AttachmentNodeAttrs {
  attachmentId: string | null;
  width: number | null;
  height: number | null;
  alt: string;
}

export interface AttachmentNodeOptions {
  // Future: getFilePath callback for resolving attachment paths
}

// ─────────────────────────────────────────────────────────────────────────────
// Node View Component
// ─────────────────────────────────────────────────────────────────────────────

function AttachmentNodeView({ node, selected }: NodeViewProps) {
  const attrs = node.attrs as AttachmentNodeAttrs;
  const { attachmentId, width, height, alt } = attrs;

  // Placeholder when no attachment ID
  if (attachmentId === null) {
    return (
      <NodeViewWrapper className="my-2">
        <div
          data-testid="attachment-placeholder"
          className={cn(
            'flex items-center justify-center',
            'h-32 w-full rounded-lg border-2 border-dashed',
            'bg-gray-50 text-gray-400',
            'dark:bg-gray-800 dark:text-gray-500',
            selected && 'ring-2 ring-blue-500'
          )}
        >
          <ImageIcon className="h-8 w-8" />
        </div>
      </NodeViewWrapper>
    );
  }

  // For now, use a placeholder src that includes the attachment ID
  // This will be replaced with actual file:// path when wired up
  const src = `attachment://${attachmentId}`;

  return (
    <NodeViewWrapper className="my-2">
      <div className={cn('relative inline-block', selected && 'ring-2 ring-blue-500 rounded')}>
        <img
          src={src}
          alt={alt}
          data-testid="attachment-image"
          data-attachment-id={attachmentId}
          {...(width !== null ? { width: String(width) } : {})}
          {...(height !== null ? { height: String(height) } : {})}
          className={cn('max-w-full rounded', width === null && height === null && 'w-full')}
          draggable={false}
        />
      </div>
    </NodeViewWrapper>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TipTap Extension
// ─────────────────────────────────────────────────────────────────────────────

export const AttachmentNode = Node.create<AttachmentNodeOptions>({
  name: 'attachment',
  group: 'block',
  atom: true, // Not editable content inside
  draggable: true,

  addOptions() {
    return {};
  },

  addAttributes() {
    return {
      attachmentId: {
        default: null,
        parseHTML: (element: HTMLElement) => element.getAttribute('data-attachment-id'),
        renderHTML: (attributes: Record<string, unknown>) => ({
          'data-attachment-id': attributes['attachmentId'] as string | null,
        }),
      },
      width: {
        default: null,
        parseHTML: (element: HTMLElement) => {
          const width = element.getAttribute('width');
          return width ? parseInt(width, 10) : null;
        },
        renderHTML: (attributes: Record<string, unknown>) => {
          const width = attributes['width'] as number | null;
          return width !== null ? { width: String(width) } : {};
        },
      },
      height: {
        default: null,
        parseHTML: (element: HTMLElement) => {
          const height = element.getAttribute('height');
          return height ? parseInt(height, 10) : null;
        },
        renderHTML: (attributes: Record<string, unknown>) => {
          const height = attributes['height'] as number | null;
          return height !== null ? { height: String(height) } : {};
        },
      },
      alt: {
        default: '',
        parseHTML: (element: HTMLElement) => element.getAttribute('alt') ?? '',
        renderHTML: (attributes: Record<string, unknown>) => ({
          alt: attributes['alt'] as string,
        }),
      },
    };
  },

  parseHTML() {
    return [{ tag: 'img[data-attachment-id]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['img', mergeAttributes(HTMLAttributes, { 'data-attachment-id': '' })];
  },

  addNodeView() {
    return ReactNodeViewRenderer(AttachmentNodeView);
  },
});
