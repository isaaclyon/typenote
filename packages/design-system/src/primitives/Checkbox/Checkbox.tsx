import * as React from 'react';
import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { cva, type VariantProps } from 'class-variance-authority';
import { Check } from '@phosphor-icons/react/dist/ssr/Check';
import { Minus } from '@phosphor-icons/react/dist/ssr/Minus';

import { cn } from '../../lib/utils.js';

type CheckboxSize = 'sm' | 'md';

const checkboxVariants = cva(
  [
    'peer shrink-0 border rounded-md transition-colors duration-150 ease-out',
    'focus-visible:outline focus-visible:outline-1 focus-visible:outline-gray-300',
    'focus-visible:outline-offset-2',
    'disabled:cursor-not-allowed disabled:opacity-50',
    'data-[state=checked]:border-accent-500 data-[state=checked]:bg-accent-500 data-[state=checked]:text-white',
    'data-[state=indeterminate]:border-accent-500 data-[state=indeterminate]:bg-accent-500 data-[state=indeterminate]:text-white',
    'data-[state=unchecked]:border-gray-300 data-[state=unchecked]:bg-white',
  ],
  {
    variants: {
      size: {
        sm: 'h-4 w-4',
        md: 'h-5 w-5',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
);

export interface CheckboxProps
  extends
    React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>,
    VariantProps<typeof checkboxVariants> {}

const Checkbox = React.forwardRef<React.ComponentRef<typeof CheckboxPrimitive.Root>, CheckboxProps>(
  ({ className, size, ...props }, ref) => {
    const iconSize = size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5';

    return (
      <CheckboxPrimitive.Root
        ref={ref}
        className={cn(checkboxVariants({ size }), className)}
        {...props}
      >
        <CheckboxPrimitive.Indicator className="flex items-center justify-center text-current">
          {props.checked === 'indeterminate' ? (
            <Minus className={iconSize} weight="bold" />
          ) : (
            <Check className={iconSize} weight="bold" />
          )}
        </CheckboxPrimitive.Indicator>
      </CheckboxPrimitive.Root>
    );
  }
);

Checkbox.displayName = CheckboxPrimitive.Root.displayName;

export { Checkbox, checkboxVariants };
export type { CheckboxSize };
