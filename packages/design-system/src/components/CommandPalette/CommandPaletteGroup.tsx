import * as React from 'react';
import { cn } from '../../utils/cn.js';
import type { CommandPaletteGroupProps } from './types.js';

/**
 * CommandPaletteGroup - Groups related items with an optional heading.
 *
 * Use for sections like "Recent", "Go to", "Create new".
 */
const CommandPaletteGroup = React.forwardRef<HTMLDivElement, CommandPaletteGroupProps>(
  ({ heading, children, className }, ref) => {
    return (
      <div ref={ref} role="group" aria-label={heading} className={cn('p-1', className)}>
        {heading && <div className="px-2 py-1.5 text-xs font-medium text-gray-500">{heading}</div>}
        {children}
      </div>
    );
  }
);

CommandPaletteGroup.displayName = 'CommandPaletteGroup';

export { CommandPaletteGroup };
