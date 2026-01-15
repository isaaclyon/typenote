import * as React from 'react';
import { cn } from '../../utils/cn.js';
import type { CommandPaletteLoadingProps } from './types.js';

/**
 * CommandPaletteLoading - Loading indicator.
 *
 * Shown during async search operations.
 */
const CommandPaletteLoading = React.forwardRef<HTMLDivElement, CommandPaletteLoadingProps>(
  ({ children = 'Searching...', className }, ref) => {
    return (
      <div ref={ref} className={cn('px-3 py-6 text-center text-sm text-gray-400', className)}>
        {children}
      </div>
    );
  }
);

CommandPaletteLoading.displayName = 'CommandPaletteLoading';

export { CommandPaletteLoading };
