import * as React from 'react';
import { cn } from '../../utils/cn.js';
import type { CommandPaletteEmptyProps } from './types.js';

/**
 * CommandPaletteEmpty - Empty state message.
 *
 * Shown when there are no results or no commands available.
 */
const CommandPaletteEmpty = React.forwardRef<HTMLDivElement, CommandPaletteEmptyProps>(
  ({ children, className }, ref) => {
    return (
      <div ref={ref} className={cn('px-3 py-8 text-center text-sm text-gray-400', className)}>
        {children}
      </div>
    );
  }
);

CommandPaletteEmpty.displayName = 'CommandPaletteEmpty';

export { CommandPaletteEmpty };
