import * as React from 'react';
import { cn } from '../../utils/cn.js';
import type { CommandPaletteSeparatorProps } from './types.js';

/**
 * CommandPaletteSeparator - Visual divider between groups.
 *
 * Use sparingly - group headings usually provide enough visual separation.
 */
const CommandPaletteSeparator = React.forwardRef<HTMLDivElement, CommandPaletteSeparatorProps>(
  ({ className }, ref) => {
    return (
      <div ref={ref} role="separator" className={cn('-mx-1 my-1 h-px bg-border', className)} />
    );
  }
);

CommandPaletteSeparator.displayName = 'CommandPaletteSeparator';

export { CommandPaletteSeparator };
