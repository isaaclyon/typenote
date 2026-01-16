import * as React from 'react';
import { NodeViewWrapper, type NodeViewProps } from '@tiptap/react';
import { TYPE_CONFIG, type ObjectType } from '../../../../constants/editorConfig.js';
import { cn } from '../../../../utils/cn.js';
import type { RefNodeOptions } from './RefNode.js';

/**
 * RefNodeView - React component for rendering wiki-link references in the editor.
 *
 * Displays the linked note with its type icon and appropriate styling.
 * Clicking the ref triggers the onNavigate callback if provided.
 */
export const RefNodeView: React.FC<NodeViewProps> = ({ node, extension }) => {
  const id = node.attrs['id'] as string | null;
  const label = node.attrs['label'] as string;
  const type = (node.attrs['type'] as ObjectType) || 'note';

  // Get onNavigate callback from extension options
  const options = extension.options as RefNodeOptions;
  const onNavigate = options.onNavigate;

  const config = TYPE_CONFIG[type] || TYPE_CONFIG.note;
  const Icon = config.icon;

  const handleClick = React.useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (id && onNavigate) {
        onNavigate(id);
      }
    },
    [id, onNavigate]
  );

  return (
    <NodeViewWrapper as="span" className="inline" data-testid="ref-node">
      <span
        role="button"
        tabIndex={0}
        className={cn('inline-flex items-center gap-1 cursor-pointer transition-colors')}
        contentEditable={false}
        onClick={handleClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            if (id && onNavigate) {
              onNavigate(id);
            }
          }
        }}
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
