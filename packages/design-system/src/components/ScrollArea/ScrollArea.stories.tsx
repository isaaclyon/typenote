import type { Story } from '@ladle/react';
import { ScrollArea } from './ScrollArea.js';

export default {
  title: 'Components/ScrollArea',
};

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
