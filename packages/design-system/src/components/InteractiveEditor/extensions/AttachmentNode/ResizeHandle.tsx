/**
 * ResizeHandle Component
 *
 * Corner handles for resizing images with aspect ratio preservation.
 * Positioned absolutely over the parent image container.
 */

import { useCallback, useRef } from 'react';
import { cn } from '../../../../utils/cn.js';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface ResizeHandleProps {
  /** Current image width */
  width: number;
  /** Current image height */
  height: number;
  /** Called when resize completes with new dimensions */
  onResize: (width: number, height: number) => void;
  /** Whether handles should be visible */
  visible?: boolean;
}

type Corner = 'nw' | 'ne' | 'sw' | 'se';

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const HANDLE_SIZE = 10;
const MIN_SIZE = 50;

const cornerPositions: Record<Corner, string> = {
  nw: 'top-0 left-0 cursor-nw-resize',
  ne: 'top-0 right-0 cursor-ne-resize',
  sw: 'bottom-0 left-0 cursor-sw-resize',
  se: 'bottom-0 right-0 cursor-se-resize',
};

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function ResizeHandle({ width, height, onResize, visible = true }: ResizeHandleProps) {
  const startPos = useRef<{ x: number; y: number; width: number; height: number } | null>(null);
  const activeCorner = useRef<Corner | null>(null);
  const aspectRatio = useRef(width / height);

  const handleMouseDown = useCallback(
    (corner: Corner) => (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      startPos.current = {
        x: e.clientX,
        y: e.clientY,
        width,
        height,
      };
      activeCorner.current = corner;
      aspectRatio.current = width / height;

      const handleMouseMove = (moveEvent: MouseEvent) => {
        if (!startPos.current || !activeCorner.current) return;

        const deltaX = moveEvent.clientX - startPos.current.x;

        // Calculate new dimensions based on which corner is being dragged
        // (We use deltaX only and maintain aspect ratio)
        let newWidth = startPos.current.width;
        let newHeight = startPos.current.height;

        switch (activeCorner.current) {
          case 'se':
            newWidth = startPos.current.width + deltaX;
            break;
          case 'sw':
            newWidth = startPos.current.width - deltaX;
            break;
          case 'ne':
            newWidth = startPos.current.width + deltaX;
            break;
          case 'nw':
            newWidth = startPos.current.width - deltaX;
            break;
        }

        // Maintain aspect ratio
        newWidth = Math.max(MIN_SIZE, newWidth);
        newHeight = Math.round(newWidth / aspectRatio.current);

        // Ensure minimum height
        if (newHeight < MIN_SIZE) {
          newHeight = MIN_SIZE;
          newWidth = Math.round(newHeight * aspectRatio.current);
        }

        // Update in real-time for visual feedback
        // (The actual persistence happens on mouseup)
        document.body.style.cursor = cornerPositions[activeCorner.current].split(' ').pop() ?? '';
      };

      const handleMouseUp = (upEvent: MouseEvent) => {
        if (!startPos.current || !activeCorner.current) return;

        const deltaX = upEvent.clientX - startPos.current.x;

        let newWidth = startPos.current.width;

        switch (activeCorner.current) {
          case 'se':
          case 'ne':
            newWidth = startPos.current.width + deltaX;
            break;
          case 'sw':
          case 'nw':
            newWidth = startPos.current.width - deltaX;
            break;
        }

        // Maintain aspect ratio
        newWidth = Math.max(MIN_SIZE, newWidth);
        let newHeight = Math.round(newWidth / aspectRatio.current);

        // Ensure minimum height
        if (newHeight < MIN_SIZE) {
          newHeight = MIN_SIZE;
          newWidth = Math.round(newHeight * aspectRatio.current);
        }

        onResize(Math.round(newWidth), Math.round(newHeight));

        // Cleanup
        startPos.current = null;
        activeCorner.current = null;
        document.body.style.cursor = '';
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    },
    [width, height, onResize]
  );

  if (!visible) return null;

  return (
    <>
      {(Object.keys(cornerPositions) as Corner[]).map((corner) => (
        <div
          key={corner}
          data-testid={`resize-handle-${corner}`}
          onMouseDown={handleMouseDown(corner)}
          className={cn(
            'absolute z-10',
            'bg-blue-500 border border-white',
            'rounded-sm shadow-sm',
            'hover:bg-blue-600',
            cornerPositions[corner]
          )}
          style={{
            width: HANDLE_SIZE,
            height: HANDLE_SIZE,
            // Offset to center handle on corner
            transform: 'translate(-50%, -50%)',
            // Adjust for corner positioning
            ...(corner.includes('e') ? { transform: 'translate(50%, -50%)' } : {}),
            ...(corner.includes('s')
              ? { transform: corner.includes('e') ? 'translate(50%, 50%)' : 'translate(-50%, 50%)' }
              : {}),
          }}
        />
      ))}
    </>
  );
}
