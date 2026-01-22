import * as React from 'react';
import { X } from '@phosphor-icons/react/dist/ssr/X';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '../../lib/utils.js';

const dismissibleTagVariants = cva(
  [
    'inline-flex items-center gap-1 rounded text-xs font-medium leading-none',
    'transition-colors duration-150 ease-out',
    'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1',
  ],
  {
    variants: {
      variant: {
        solid: 'bg-secondary text-foreground',
        outline: 'border border-border bg-transparent text-foreground',
      },
      size: {
        sm: 'h-5 pl-2 pr-1 text-[11px]',
        md: 'h-6 pl-2.5 pr-1 text-xs',
      },
    },
    defaultVariants: {
      variant: 'solid',
      size: 'md',
    },
  }
);

export interface DismissibleTagProps
  extends
    Omit<React.HTMLAttributes<HTMLSpanElement>, 'children'>,
    VariantProps<typeof dismissibleTagVariants> {
  label: string;
  onRemove?: () => void;
  disabled?: boolean;
  color?: string;
}

const DismissibleTag = React.forwardRef<HTMLSpanElement, DismissibleTagProps>(
  ({ label, onRemove, disabled = false, color, variant, size, className, ...props }, ref) => {
    const handleKeyDown = (e: React.KeyboardEvent) => {
      if ((e.key === 'Backspace' || e.key === 'Delete') && !disabled) {
        e.preventDefault();
        onRemove?.();
      }
    };

    const handleRemoveClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!disabled) {
        onRemove?.();
      }
    };

    const customStyle = color ? { backgroundColor: color, color: 'white' } : undefined;

    return (
      <span
        ref={ref}
        role="button"
        tabIndex={disabled ? -1 : 0}
        className={cn(
          dismissibleTagVariants({ variant: color ? undefined : variant, size }),
          disabled && 'cursor-not-allowed opacity-50',
          className
        )}
        style={customStyle}
        onKeyDown={handleKeyDown}
        aria-disabled={disabled}
        {...props}
      >
        <span className="max-w-[120px] truncate">{label}</span>
        {!disabled && onRemove && (
          <button
            type="button"
            onClick={handleRemoveClick}
            className={cn(
              'flex items-center justify-center rounded-sm',
              'hover:bg-black/10 focus:outline-none',
              size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4'
            )}
            aria-label={`Remove ${label}`}
          >
            <X className={size === 'sm' ? 'h-2.5 w-2.5' : 'h-3 w-3'} weight="bold" />
          </button>
        )}
      </span>
    );
  }
);

DismissibleTag.displayName = 'DismissibleTag';

export { DismissibleTag, dismissibleTagVariants };
