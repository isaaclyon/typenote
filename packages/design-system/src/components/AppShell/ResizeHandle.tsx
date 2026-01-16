import * as React from 'react';
import { cn } from '../../utils/cn.js';

export interface ResizeHandleProps {
  /** Which side of the layout */
  side: 'left' | 'right';
  /** Whether currently resizing (shows solid line) */
  isResizing: boolean;
  /** Mousedown handler to start resize */
  onResizeStart: (e: React.MouseEvent) => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Resize handle for sidebars.
 *
 * - 8px hitbox along inner edge of sidebar (4px overlap each side)
 * - Invisible by default, 2px accent line on hover
 * - Solid accent line when actively dragging
 * - Cursor changes to col-resize on hover
 *
 * @example
 * <ResizeHandle
 *   side="left"
 *   isResizing={isResizing}
 *   onResizeStart={handleResizeStart}
 * />
 */
const ResizeHandle = React.forwardRef<HTMLDivElement, ResizeHandleProps>(
  ({ side, isResizing, onResizeStart, className }, ref) => {
    return (
      <div
        ref={ref}
        onMouseDown={onResizeStart}
        className={cn(
          // Position: absolute, full height
          'absolute top-0 bottom-0 z-20',
          // Position on correct side with 4px offset into content area
          side === 'left' ? '-right-1' : '-left-1',
          // Hitbox: 8px wide
          'w-2',
          // Cursor
          'cursor-col-resize',
          // Group for nested hover styling
          'group/resize-handle',
          className
        )}
        data-testid={`resize-handle-${side}`}
      >
        {/* Visual indicator: 2px line */}
        <div
          className={cn(
            'h-full w-0.5',
            // Center the line within the 8px hitbox
            'mx-auto',
            // Color states
            isResizing
              ? 'bg-accent-500' // Solid during drag
              : 'bg-transparent group-hover/resize-handle:bg-accent-500/50', // Invisible -> 50% on hover
            // Smooth transition
            'transition-colors duration-150'
          )}
        />
      </div>
    );
  }
);

ResizeHandle.displayName = 'ResizeHandle';

export { ResizeHandle };
