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
        className={cn('inline-flex items-center gap-1 cursor-pointer transition-colors')}
        contentEditable={false}
      >
        <Icon className={cn('w-3.5 h-3.5 flex-shrink-0', config.colorClass)} />
        <span
          className={cn(
            'underline decoration-1 underline-offset-2 text-gray-700 hover:text-gray-900',
            config.decorationClass
          )}
        >
          {label}
        </span>
      </span>
    </NodeViewWrapper>
  );
};

RefNodeView.displayName = 'RefNodeView';
