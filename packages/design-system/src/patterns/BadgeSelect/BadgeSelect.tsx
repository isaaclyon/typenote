import * as React from 'react';
import { Check } from '@phosphor-icons/react/dist/ssr/Check';
import { CaretDown } from '@phosphor-icons/react/dist/ssr/CaretDown';

import { cn } from '../../lib/utils.js';
import { Badge } from '../../primitives/Badge/Badge.js';
import { Popover, PopoverTrigger, PopoverContent } from '../../primitives/Popover/Popover.js';

export interface BadgeSelectProps {
  value: string;
  options: string[];
  onChange: (value: string) => void;
  placeholder?: string | undefined;
  disabled?: boolean | undefined;
  open?: boolean | undefined;
  onOpenChange?: ((open: boolean) => void) | undefined;
  className?: string | undefined;
}

/**
 * A select component that renders options as badge pills.
 * Use this instead of regular Select when you need badge-styled options.
 */
const BadgeSelect = React.forwardRef<HTMLButtonElement, BadgeSelectProps>(
  (
    {
      value,
      options,
      onChange,
      placeholder = 'Select...',
      disabled = false,
      open,
      onOpenChange,
      className,
    },
    ref
  ) => {
    const [internalOpen, setInternalOpen] = React.useState(false);

    const isControlled = open !== undefined;
    const isOpen = isControlled ? open : internalOpen;

    const handleOpenChange = (newOpen: boolean) => {
      if (!isControlled) {
        setInternalOpen(newOpen);
      }
      onOpenChange?.(newOpen);
    };

    const handleSelect = (option: string) => {
      onChange(option);
      handleOpenChange(false);
    };

    return (
      <Popover open={isOpen} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild disabled={disabled}>
          <button
            ref={ref}
            type="button"
            className={cn(
              'flex items-center justify-between gap-2 rounded-md border border-border bg-background',
              'h-auto min-h-7 w-full px-2 py-1',
              'transition-colors duration-150 ease-out',
              'hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1',
              'disabled:cursor-not-allowed disabled:opacity-50',
              className
            )}
            disabled={disabled}
          >
            {value ? (
              <Badge variant="solid" size="sm">
                {value}
              </Badge>
            ) : (
              <span className="text-sm text-muted-foreground">{placeholder}</span>
            )}
            <CaretDown className="h-4 w-4 shrink-0 text-muted-foreground" weight="bold" />
          </button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-auto min-w-[8rem] p-1">
          <div className="flex flex-col gap-0.5">
            {options.map((option) => {
              const isSelected = option === value;
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => handleSelect(option)}
                  className={cn(
                    'flex items-center gap-2 rounded-sm px-2 py-1.5 text-left',
                    'transition-colors duration-150',
                    'hover:bg-muted focus:bg-muted focus:outline-none',
                    isSelected && 'bg-muted/50'
                  )}
                >
                  <span className="w-4 shrink-0">
                    {isSelected && <Check className="h-4 w-4" weight="bold" />}
                  </span>
                  <Badge variant="solid" size="sm">
                    {option}
                  </Badge>
                </button>
              );
            })}
          </div>
        </PopoverContent>
      </Popover>
    );
  }
);

BadgeSelect.displayName = 'BadgeSelect';

export { BadgeSelect };
