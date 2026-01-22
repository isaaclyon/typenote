import * as React from 'react';

import { cn } from '../../lib/utils.js';

export interface CommandPaletteListProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Content to show when there are no results */
  emptyState?: React.ReactNode | undefined;
  /** Whether to show the empty state */
  isEmpty?: boolean | undefined;
}

const CommandPaletteList = React.forwardRef<HTMLDivElement, CommandPaletteListProps>(
  ({ className, children, emptyState, isEmpty, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'max-h-80 overflow-y-auto overscroll-contain',
          // Thin scrollbar styling
          'scrollbar-thin scrollbar-track-transparent scrollbar-thumb-muted-foreground/20',
          className
        )}
        {...props}
      >
        {isEmpty && emptyState ? emptyState : children}
      </div>
    );
  }
);

CommandPaletteList.displayName = 'CommandPaletteList';

export { CommandPaletteList };
