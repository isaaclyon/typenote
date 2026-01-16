import type { Story } from '@ladle/react';
import { ScrollArea } from './ScrollArea.js';

export default {
  title: 'Components/ScrollArea',
};

/**
 * Radix ScrollArea with macOS-style auto-hide scrollbar.
 * Scrollbar appears only when actively scrolling (type="scroll" default).
 */
export const Vertical: Story = () => (
  <ScrollArea className="h-64 w-80 border border-gray-200 rounded-md p-4">
    <div className="space-y-2">
      {Array.from({ length: 50 }, (_, i) => (
        <div key={i} className="text-sm">
          Item {i + 1}
        </div>
      ))}
    </div>
  </ScrollArea>
);

export const Horizontal: Story = () => (
  <ScrollArea className="w-80 border border-gray-200 rounded-md p-4">
    <div className="flex gap-4 w-[600px]">
      {Array.from({ length: 10 }, (_, i) => (
        <div
          key={i}
          className="flex-shrink-0 w-32 h-32 bg-gray-100 rounded-md flex items-center justify-center"
        >
          {i + 1}
        </div>
      ))}
    </div>
  </ScrollArea>
);

/**
 * Demonstrates macOS-style auto-hide behavior:
 * - Scrollbar is hidden by default
 * - Scrollbar appears when you scroll
 * - Fades out after scrolling stops
 * - Uses Radix's type="scroll" (default)
 */
export const AutoHideDemo: Story = () => (
  <div className="space-y-4">
    <p className="text-sm text-gray-500">Scroll inside the area to reveal the scrollbar</p>
    <ScrollArea className="h-48 w-80 border border-gray-200 rounded-md p-4">
      <div className="space-y-2">
        {Array.from({ length: 30 }, (_, i) => (
          <div key={i} className="text-sm py-1">
            Line {i + 1}: Lorem ipsum dolor sit amet
          </div>
        ))}
      </div>
    </ScrollArea>
  </div>
);

/**
 * Alternative: type="hover" shows scrollbar when hovering the scroll area.
 */
export const ShowOnHover: Story = () => (
  <div className="space-y-4">
    <p className="text-sm text-gray-500">Hover over the scroll area to reveal the scrollbar</p>
    <ScrollArea type="hover" className="h-48 w-80 border border-gray-200 rounded-md p-4">
      <div className="space-y-2">
        {Array.from({ length: 30 }, (_, i) => (
          <div key={i} className="text-sm py-1">
            Line {i + 1}: Scrollbar visible on hover
          </div>
        ))}
      </div>
    </ScrollArea>
  </div>
);
