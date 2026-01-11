import * as React from 'react';
import { cn } from '../../utils/cn.js';
import type { CommandPaletteItemProps } from './types.js';

const CommandPaletteItem = React.forwardRef<HTMLDivElement, CommandPaletteItemProps>(
  ({ item, selected, onClick, className }, ref) => {
    const Icon = item.icon;

    return (
      <div
        ref={ref}
        role="option"
        aria-selected={selected}
        onClick={onClick}
        className={cn(
          'flex items-center gap-3 px-3 py-2 cursor-pointer transition-colors',
          selected ? 'bg-accent-50 text-accent-700' : 'hover:bg-gray-50',
          className
        )}
      >
        {Icon && <Icon className="h-4 w-4 flex-shrink-0 text-gray-500" />}
        <span className="flex-1 text-sm font-medium">{item.label}</span>
        {item.shortcut && <span className="text-xs text-gray-400 font-mono">{item.shortcut}</span>}
      </div>
    );
  }
);

CommandPaletteItem.displayName = 'CommandPaletteItem';

export { CommandPaletteItem };
