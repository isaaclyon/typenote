import * as React from 'react';
import { cn } from '../../utils/cn.js';
import type { CommandPaletteListProps } from './types.js';

const CommandPaletteList = React.forwardRef<HTMLDivElement, CommandPaletteListProps>(
  ({ children, className }, ref) => {
    return (
      <div ref={ref} role="listbox" className={cn('max-h-80 overflow-y-auto py-2', className)}>
        {children}
      </div>
    );
  }
);

CommandPaletteList.displayName = 'CommandPaletteList';

export { CommandPaletteList };
