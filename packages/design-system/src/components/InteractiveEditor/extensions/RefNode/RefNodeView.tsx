import * as React from 'react';
import { NodeViewWrapper, type NodeViewProps } from '@tiptap/react';
import { TYPE_CONFIG, type ObjectType } from '../../../../constants/editorConfig.js';
import { cn } from '../../../../utils/cn.js';

/**
 * RefNodeView - React component for rendering wiki-link references in the editor.
 *
 * Displays the linked note with its type icon and appropriate styling.
 */
export const RefNodeView: React.FC<NodeViewProps> = ({ node }) => {
  const label = node.attrs['label'] as string;
  const type = (node.attrs['type'] as ObjectType) || 'note';

  const config = TYPE_CONFIG[type] || TYPE_CONFIG.note;
  const Icon = config.icon;

  return (
    <NodeViewWrapper as="span" className="inline">
      <span
        className={cn(
          'inline-flex items-center gap-0.5 px-1 py-0.5 rounded',
          'bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer',
          'text-sm font-medium',
          config.colorClass
        )}
        contentEditable={false}
      >
        <Icon className="w-3.5 h-3.5 flex-shrink-0" />
        <span className="underline decoration-1 underline-offset-2">{label}</span>
      </span>
    </NodeViewWrapper>
  );
};

RefNodeView.displayName = 'RefNodeView';
