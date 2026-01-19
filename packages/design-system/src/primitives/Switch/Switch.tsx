import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '../../lib/utils.js';

type SwitchSize = 'sm' | 'md';

const switchVariants = cva(
  [
    'relative inline-flex shrink-0 cursor-pointer items-center rounded-md border-2 border-transparent',
    'transition-colors duration-150 ease-out',
    'focus-visible:outline focus-visible:outline-1 focus-visible:outline-gray-300',
    'focus-visible:outline-offset-2',
    'disabled:pointer-events-none disabled:opacity-50',
  ],
  {
    variants: {
      size: {
        sm: 'h-5 w-9',
        md: 'h-6 w-11',
      },
      checked: {
        true: 'bg-accent-500',
        false: 'bg-gray-200',
      },
    },
    defaultVariants: {
      size: 'md',
      checked: false,
    },
  }
);

const thumbVariants = cva(
  [
    'pointer-events-none block rounded bg-white shadow-sm ring-0',
    'transition-transform duration-150 ease-out',
  ],
  {
    variants: {
      size: {
        sm: 'h-4 w-4',
        md: 'h-5 w-5',
      },
      checked: {
        true: '',
        false: 'translate-x-0',
      },
    },
    compoundVariants: [
      { size: 'sm', checked: true, className: 'translate-x-4' },
      { size: 'md', checked: true, className: 'translate-x-5' },
    ],
    defaultVariants: {
      size: 'md',
      checked: false,
    },
  }
);

type SwitchVariantProps = Omit<VariantProps<typeof switchVariants>, 'checked'>;

type SwitchButtonProps = Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'>;

export interface SwitchProps extends SwitchButtonProps, SwitchVariantProps {
  checked?: boolean;
  onCheckedChange?: ((checked: boolean) => void) | undefined;
}

const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
  ({ className, size, checked = false, onCheckedChange, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        className={cn(switchVariants({ size, checked }), className)}
        onClick={() => {
          if (disabled) {
            return;
          }
          if (onCheckedChange) {
            onCheckedChange(!checked);
          }
        }}
        {...props}
      >
        <span aria-hidden="true" className={cn(thumbVariants({ size, checked }))} />
      </button>
    );
  }
);

Switch.displayName = 'Switch';

export { Switch, switchVariants };
export type { SwitchSize };
