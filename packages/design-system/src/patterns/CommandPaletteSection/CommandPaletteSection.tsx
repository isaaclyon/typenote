import * as React from 'react';

import { cn } from '../../lib/utils.js';

export interface CommandPaletteSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Section label displayed as a header */
  label: string;
}

const CommandPaletteSection = React.forwardRef<HTMLDivElement, CommandPaletteSectionProps>(
  ({ className, label, children, ...props }, ref) => {
    return (
      <div ref={ref} role="group" aria-label={label} className={cn('py-1', className)} {...props}>
        <div className="px-3 py-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </div>
        <div role="listbox">{children}</div>
      </div>
    );
  }
);

CommandPaletteSection.displayName = 'CommandPaletteSection';

export { CommandPaletteSection };
