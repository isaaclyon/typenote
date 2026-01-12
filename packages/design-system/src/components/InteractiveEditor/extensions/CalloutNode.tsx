import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper, NodeViewContent } from '@tiptap/react';
import type { NodeViewProps } from '@tiptap/react';
import { cn } from '../../../utils/cn.js';
import { CALLOUT_CONFIG, type CalloutKind } from '../../../constants/editorConfig.js';

interface CalloutNodeAttrs {
  kind: CalloutKind;
}

function CalloutNodeView({ node }: NodeViewProps) {
  const attrs = node.attrs as CalloutNodeAttrs;
  const kind = attrs.kind || 'info';
  const config = CALLOUT_CONFIG[kind];
  const Icon = config.icon;

  return (
    <NodeViewWrapper>
      <div className={cn('rounded p-4 my-2', config.bgClass)}>
        <div className="flex items-center gap-2 font-medium mb-2">
          <Icon className={cn('h-4 w-4', config.iconClass)} />
          <span>{config.defaultTitle}</span>
        </div>
        <div className="pl-6">
          <NodeViewContent />
        </div>
      </div>
    </NodeViewWrapper>
  );
}

export const CalloutNode = Node.create({
  name: 'callout',
  group: 'block',
  content: 'block+',

  addAttributes() {
    return {
      kind: {
        default: 'info',
        parseHTML: (element: HTMLElement) => element.getAttribute('data-kind') ?? 'info',
        renderHTML: (attributes: Record<string, unknown>) => ({
          'data-kind': attributes['kind'] as string,
        }),
      },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-callout]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-callout': '' }), 0];
  },

  addNodeView() {
    return ReactNodeViewRenderer(CalloutNodeView);
  },
});
