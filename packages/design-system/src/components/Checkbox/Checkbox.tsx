import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '../../lib/utils.js';

type CheckboxSize = 'sm' | 'md';

type CheckedState = boolean | 'indeterminate';

const checkboxVariants = cva(
  [
    'relative inline-flex items-center justify-center border p-[2px] transition-colors duration-150 ease-out',
    'focus-visible:outline focus-visible:outline-1 focus-visible:outline-gray-300',
    'focus-visible:outline-offset-2',
    'disabled:pointer-events-none disabled:opacity-50',
  ],
  {
    variants: {
      size: {
        sm: 'h-4 w-4 rounded-md',
        md: 'h-5 w-5 rounded-md',
      },
      checked: {
        true: 'border-accent-500 bg-accent-500 text-white',
        false: 'border-gray-300 bg-white text-transparent',
      },
    },
    defaultVariants: {
      size: 'md',
      checked: false,
    },
  }
);

type CheckboxVariantProps = Omit<VariantProps<typeof checkboxVariants>, 'checked'>;

type CheckboxButtonProps = Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'>;

export interface CheckboxProps extends CheckboxButtonProps, CheckboxVariantProps {
  checked?: CheckedState;
  onCheckedChange?: ((checked: CheckedState) => void) | undefined;
}

const Checkbox = React.forwardRef<HTMLButtonElement, CheckboxProps>(
  ({ className, size, checked = false, onCheckedChange, disabled, ...props }, ref) => {
    const isIndeterminate = checked === 'indeterminate';
    const iconSize = size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5';
    const dashSize = size === 'sm' ? 'h-0.5 w-2' : 'h-0.5 w-2.5';

    return (
      <button
        ref={ref}
        type="button"
        role="checkbox"
        aria-checked={isIndeterminate ? 'mixed' : checked}
        disabled={disabled}
        className={cn(
          checkboxVariants({ size, checked: checked === true || isIndeterminate }),
          className
        )}
        onClick={() => {
          if (disabled) {
            return;
          }
          if (onCheckedChange) {
            const nextChecked = isIndeterminate ? true : !checked;
            onCheckedChange(nextChecked);
          }
        }}
        {...props}
      >
        {isIndeterminate ? (
          <span className={cn('rounded-full bg-current', dashSize)} aria-hidden="true" />
        ) : (
          <svg
            aria-hidden="true"
            className={cn('text-current', iconSize, checked ? 'opacity-100' : 'opacity-0')}
            viewBox="0 0 12 10"
            fill="none"
          >
            <path
              d="M1 5L4.5 8.5L11 1"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </button>
    );
  }
);

Checkbox.displayName = 'Checkbox';

export { Checkbox, checkboxVariants };
export type { CheckboxSize, CheckedState };
