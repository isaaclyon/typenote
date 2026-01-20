/**
 * ImageNodeView - Custom NodeView for images with resize handles.
 *
 * Features:
 * - Displays image from URL or local path
 * - Drag handles for resizing (width-based, maintains aspect ratio)
 * - Selection state with outline
 * - Stores width in node attributes
 */

import * as React from 'react';
import { NodeViewWrapper } from '@tiptap/react';
import type { NodeViewProps } from '@tiptap/react';

import { cn } from '../../../lib/utils.js';

// Minimum width for images
const MIN_WIDTH = 100;
// Maximum width (relative to container)
const MAX_WIDTH_PERCENT = 100;

export function ImageNodeView({ node, updateAttributes, selected }: NodeViewProps) {
  const { src, alt, width, title } = node.attrs as {
    src: string;
    alt?: string;
    width?: number;
    title?: string;
  };

  const containerRef = React.useRef<HTMLDivElement>(null);
  const imageRef = React.useRef<HTMLImageElement>(null);
  const [isResizing, setIsResizing] = React.useState(false);
  const [aspectRatio, setAspectRatio] = React.useState<number | null>(null);

  // Capture aspect ratio when image loads
  const handleImageLoad = React.useCallback(() => {
    if (imageRef.current) {
      const { naturalWidth, naturalHeight } = imageRef.current;
      if (naturalWidth && naturalHeight) {
        setAspectRatio(naturalWidth / naturalHeight);
      }
    }
  }, []);

  // Handle resize drag
  const handleResizeStart = React.useCallback(
    (e: React.MouseEvent, corner: 'left' | 'right') => {
      e.preventDefault();
      e.stopPropagation();

      if (!imageRef.current || !containerRef.current) return;

      setIsResizing(true);

      const startX = e.clientX;
      const startWidth = imageRef.current.offsetWidth;
      const containerWidth = containerRef.current.parentElement?.offsetWidth ?? 650;
      const isLeftHandle = corner === 'left';

      const handleMouseMove = (moveEvent: MouseEvent) => {
        const deltaX = moveEvent.clientX - startX;
        // Left handle: dragging left increases size, right decreases
        // Right handle: dragging right increases size, left decreases
        const newWidth = isLeftHandle ? startWidth - deltaX : startWidth + deltaX;

        // Clamp width between min and max
        const clampedWidth = Math.max(
          MIN_WIDTH,
          Math.min(newWidth, containerWidth * (MAX_WIDTH_PERCENT / 100))
        );

        updateAttributes({ width: Math.round(clampedWidth) });
      };

      const handleMouseUp = () => {
        setIsResizing(false);
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    },
    [updateAttributes]
  );

  // Calculate height based on aspect ratio (for proper sizing during resize)
  const calculatedHeight = width && aspectRatio ? Math.round(width / aspectRatio) : undefined;

  return (
    <NodeViewWrapper className="image-node-wrapper my-3">
      <div
        ref={containerRef}
        className={cn(
          'image-node relative inline-block',
          selected && 'ring-2 ring-accent-500 ring-offset-2 ring-offset-background',
          isResizing && 'cursor-ew-resize'
        )}
        data-drag-handle
        contentEditable={false}
      >
        {/* The image */}
        <img
          ref={imageRef}
          src={src}
          alt={alt ?? ''}
          title={title}
          onLoad={handleImageLoad}
          className={cn(
            'rounded-md block',
            'max-w-full h-auto',
            isResizing && 'pointer-events-none select-none'
          )}
          style={{
            width: width ? `${width}px` : undefined,
            height: calculatedHeight ? `${calculatedHeight}px` : undefined,
          }}
          draggable={false}
        />

        {/* Resize handles - only show when selected */}
        {selected && (
          <>
            {/* Left resize handle */}
            <div
              className={cn(
                'image-resize-handle image-resize-handle-left',
                'absolute top-0 left-0 w-3 h-full',
                'cursor-ew-resize',
                'flex items-center justify-center'
              )}
              onMouseDown={(e) => handleResizeStart(e, 'left')}
            >
              <div
                className={cn(
                  'w-1 h-8 rounded-full',
                  'bg-accent-500 opacity-0 transition-opacity duration-150',
                  'group-hover:opacity-100',
                  selected && 'opacity-70 hover:opacity-100'
                )}
              />
            </div>

            {/* Right resize handle */}
            <div
              className={cn(
                'image-resize-handle image-resize-handle-right',
                'absolute top-0 right-0 w-3 h-full',
                'cursor-ew-resize',
                'flex items-center justify-center'
              )}
              onMouseDown={(e) => handleResizeStart(e, 'right')}
            >
              <div
                className={cn(
                  'w-1 h-8 rounded-full',
                  'bg-accent-500 opacity-0 transition-opacity duration-150',
                  'group-hover:opacity-100',
                  selected && 'opacity-70 hover:opacity-100'
                )}
              />
            </div>
          </>
        )}
      </div>
    </NodeViewWrapper>
  );
}

ImageNodeView.displayName = 'ImageNodeView';
