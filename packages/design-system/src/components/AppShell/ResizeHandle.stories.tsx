import * as React from 'react';
import type { Story } from '@ladle/react';
import { ResizeHandle } from './ResizeHandle.js';

export default {
  title: 'Components/AppShell/ResizeHandle',
};

/**
 * Left sidebar resize handle in default state.
 * Hover to see the accent line appear.
 */
export const LeftSide: Story = () => (
  <div className="relative h-[300px] w-[240px] bg-gray-100 border border-gray-200 rounded-lg">
    <div className="p-4 text-sm text-gray-600">
      Left sidebar content
      <br />
      <span className="text-xs text-gray-400">Hover the right edge to see resize handle</span>
    </div>
    <ResizeHandle side="left" isResizing={false} onResizeStart={() => {}} />
  </div>
);

/**
 * Right sidebar resize handle in default state.
 * Hover to see the accent line appear.
 */
export const RightSide: Story = () => (
  <div className="relative h-[300px] w-[240px] bg-gray-100 border border-gray-200 rounded-lg">
    <div className="p-4 text-sm text-gray-600">
      Right sidebar content
      <br />
      <span className="text-xs text-gray-400">Hover the left edge to see resize handle</span>
    </div>
    <ResizeHandle side="right" isResizing={false} onResizeStart={() => {}} />
  </div>
);

/**
 * Resize handle during active drag (isResizing=true).
 * Shows solid accent line instead of 50% opacity.
 */
export const Resizing: Story = () => (
  <div className="flex gap-8">
    <div className="relative h-[300px] w-[240px] bg-gray-100 border border-gray-200 rounded-lg">
      <div className="p-4 text-sm text-gray-600">
        Left sidebar
        <br />
        <span className="text-xs text-gray-400">isResizing=true (solid line)</span>
      </div>
      <ResizeHandle side="left" isResizing={true} onResizeStart={() => {}} />
    </div>
    <div className="relative h-[300px] w-[240px] bg-gray-100 border border-gray-200 rounded-lg">
      <div className="p-4 text-sm text-gray-600">
        Right sidebar
        <br />
        <span className="text-xs text-gray-400">isResizing=true (solid line)</span>
      </div>
      <ResizeHandle side="right" isResizing={true} onResizeStart={() => {}} />
    </div>
  </div>
);

/**
 * Comparison of left vs right positioning.
 * Left handle is on the right edge, right handle is on the left edge.
 */
export const BothSides: Story = () => (
  <div className="flex items-center">
    <div className="relative h-[300px] w-[200px] bg-gray-100 border border-gray-200 rounded-l-lg">
      <div className="p-4 text-sm text-gray-600">
        Left Sidebar
        <br />
        <span className="text-xs text-gray-400">Handle on right edge</span>
      </div>
      <ResizeHandle side="left" isResizing={false} onResizeStart={() => {}} />
    </div>
    <div className="flex-1 h-[300px] bg-white border-y border-gray-200 flex items-center justify-center">
      <span className="text-gray-400">Content Area</span>
    </div>
    <div className="relative h-[300px] w-[200px] bg-gray-100 border border-gray-200 rounded-r-lg">
      <div className="p-4 text-sm text-gray-600">
        Right Sidebar
        <br />
        <span className="text-xs text-gray-400">Handle on left edge</span>
      </div>
      <ResizeHandle side="right" isResizing={false} onResizeStart={() => {}} />
    </div>
  </div>
);

/**
 * Interactive demo with draggable resize handle.
 */
export const Interactive: Story = () => {
  const [width, setWidth] = React.useState(240);
  const [isResizing, setIsResizing] = React.useState(false);

  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    const startX = e.clientX;
    const startWidth = width;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const delta = moveEvent.clientX - startX;
      const newWidth = Math.max(150, Math.min(400, startWidth + delta));
      setWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <div className="space-y-4">
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Interactive Demo:</strong> Drag the resize handle on the right edge of the sidebar
          to resize. Width: {width}px (min: 150px, max: 400px)
        </p>
      </div>
      <div className="flex">
        <div
          className="relative h-[300px] bg-gray-100 border border-gray-200 rounded-l-lg transition-[width] duration-75"
          style={{ width }}
        >
          <div className="p-4 text-sm text-gray-600">
            Left Sidebar
            <br />
            <span className="text-xs text-gray-400">Width: {width}px</span>
          </div>
          <ResizeHandle side="left" isResizing={isResizing} onResizeStart={handleResizeStart} />
        </div>
        <div className="flex-1 h-[300px] bg-white border-y border-r border-gray-200 rounded-r-lg flex items-center justify-center">
          <span className="text-gray-400">Content Area</span>
        </div>
      </div>
    </div>
  );
};
