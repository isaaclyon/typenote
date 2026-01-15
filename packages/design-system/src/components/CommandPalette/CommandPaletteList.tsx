import * as React from 'react';
import { cn } from '../../utils/cn.js';
import type { CommandPaletteListProps } from './types.js';

/**
 * CommandPaletteList - Scrollable container for command palette content.
 *
 * Contains groups, items, empty states, or loading indicators.
 */
const CommandPaletteList = React.forwardRef<HTMLDivElement, CommandPaletteListProps>(
  ({ children, className }, ref) => {
    return (
      <div
        ref={ref}
        role="listbox"
        className={cn('max-h-[300px] overflow-y-auto overflow-x-hidden py-1', className)}
      >
        {children}
      </div>
    );
  }
);

CommandPaletteList.displayName = 'CommandPaletteList';

export { CommandPaletteList };
