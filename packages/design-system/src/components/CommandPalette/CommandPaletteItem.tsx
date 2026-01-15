import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn.js';
import type { CommandPaletteItemProps } from './types.js';

const itemVariants = cva(
  'flex items-center gap-2 px-2 py-1.5 mx-1 rounded-sm cursor-pointer transition-colors text-sm',
  {
    variants: {
      selected: {
        true: 'bg-accent-50 text-accent-700',
        false: 'hover:bg-gray-50',
      },
      disabled: {
        true: 'opacity-50 pointer-events-none',
        false: '',
      },
    },
    defaultVariants: {
      selected: false,
      disabled: false,
    },
  }
);

export interface ItemVariantProps extends VariantProps<typeof itemVariants> {}

/**
 * CommandPaletteItem - Individual selectable command.
 *
 * Renders children as content (icons, text, badges). Use selected prop
 * to highlight the item, and onSelect for click/Enter handling.
 */
const CommandPaletteItem = React.forwardRef<HTMLDivElement, CommandPaletteItemProps>(
  ({ value, selected = false, disabled = false, onSelect, children, className }, ref) => {
    const handleClick = () => {
      if (!disabled) {
        onSelect();
      }
    };

    return (
      <div
        ref={ref}
        role="option"
        aria-selected={selected}
        aria-disabled={disabled}
        data-value={value}
        onClick={handleClick}
        className={cn(itemVariants({ selected, disabled }), className)}
      >
        {children}
      </div>
    );
  }
);

CommandPaletteItem.displayName = 'CommandPaletteItem';

export { CommandPaletteItem, itemVariants };
