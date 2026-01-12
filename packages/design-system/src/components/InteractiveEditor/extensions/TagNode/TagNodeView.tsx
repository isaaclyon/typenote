import * as React from 'react';
import { NodeViewWrapper, type NodeViewProps } from '@tiptap/react';
import { cn } from '../../../../utils/cn.js';

/**
 * TagNodeView - React component for rendering tags in the editor.
 *
 * Displays the tag with a color dot (if provided) and hash prefix styling.
 */
export const TagNodeView: React.FC<NodeViewProps> = ({ node }) => {
  const value = node.attrs['value'] as string;
  const color = node.attrs['color'] as string | null;

  return (
    <NodeViewWrapper as="span" className="inline">
      <span
        className={cn(
          'inline-flex items-center gap-1 px-1.5 py-0.5 rounded',
          'bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer',
          'text-sm font-medium text-gray-700'
        )}
        contentEditable={false}
      >
        {color ? (
          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
        ) : null}
        <span>#{value}</span>
      </span>
    </NodeViewWrapper>
  );
};

TagNodeView.displayName = 'TagNodeView';
