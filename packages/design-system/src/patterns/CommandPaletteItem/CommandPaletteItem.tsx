import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '../../lib/utils.js';

const commandPaletteItemVariants = cva(
  'flex h-9 w-full cursor-pointer items-center gap-3 rounded-md px-3 text-sm transition-colors duration-100',
  {
    variants: {
      selected: {
        true: 'bg-accent-50 text-accent-700',
        false: 'hover:bg-muted/50',
      },
      disabled: {
        true: 'pointer-events-none opacity-50',
        false: '',
      },
    },
    defaultVariants: {
      selected: false,
      disabled: false,
    },
  }
);

export interface CommandPaletteItemProps
  extends
    Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'disabled'>,
    VariantProps<typeof commandPaletteItemVariants> {
  /** Icon component to render on the left */
  icon: React.ComponentType<{ className?: string }>;
  /** Primary text label */
  title: string;
  /** Optional type badge (e.g., "Page", "Daily Note") */
  badge?: string | undefined;
  /** Optional keyboard shortcut hint */
  shortcut?: string | undefined;
}

const CommandPaletteItem = React.forwardRef<HTMLButtonElement, CommandPaletteItemProps>(
  ({ className, icon: Icon, title, badge, shortcut, selected, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        type="button"
        role="option"
        aria-selected={selected ?? false}
        aria-disabled={disabled ?? false}
        disabled={disabled ?? false}
        className={cn(commandPaletteItemVariants({ selected, disabled }), className)}
        {...props}
      >
        <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
        <span className="flex-1 truncate text-left">{title}</span>
        {badge ? <span className="shrink-0 text-xs text-muted-foreground">{badge}</span> : null}
        {shortcut ? (
          <span className="shrink-0 text-xs text-muted-foreground">{shortcut}</span>
        ) : null}
      </button>
    );
  }
);

CommandPaletteItem.displayName = 'CommandPaletteItem';

export { CommandPaletteItem, commandPaletteItemVariants };
