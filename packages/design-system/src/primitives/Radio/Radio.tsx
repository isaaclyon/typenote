import * as React from 'react';
import * as RadioGroupPrimitive from '@radix-ui/react-radio-group';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '../../lib/utils.js';

type RadioSize = 'sm' | 'md';

// ============================================================================
// RadioGroup
// ============================================================================

const radioGroupVariants = cva('flex flex-col gap-2');

export interface RadioGroupProps extends React.ComponentPropsWithoutRef<
  typeof RadioGroupPrimitive.Root
> {
  size?: RadioSize;
}

const RadioGroupContext = React.createContext<{ size?: RadioSize }>({});

const RadioGroup = React.forwardRef<
  React.ComponentRef<typeof RadioGroupPrimitive.Root>,
  RadioGroupProps
>(({ className, size = 'md', children, ...props }, ref) => {
  return (
    <RadioGroupContext.Provider value={{ size }}>
      <RadioGroupPrimitive.Root
        ref={ref}
        className={cn(radioGroupVariants(), className)}
        {...props}
      >
        {children}
      </RadioGroupPrimitive.Root>
    </RadioGroupContext.Provider>
  );
});

RadioGroup.displayName = RadioGroupPrimitive.Root.displayName;

// ============================================================================
// RadioItem
// ============================================================================

const radioVariants = cva(
  [
    'aspect-square rounded-full border',
    'transition-colors duration-150 ease-out',
    'focus-visible:outline focus-visible:outline-1 focus-visible:outline-gray-300',
    'focus-visible:outline-offset-2',
    'disabled:cursor-not-allowed disabled:opacity-50',
    'data-[state=checked]:border-accent-500 data-[state=checked]:bg-accent-500',
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

const indicatorVariants = cva('flex items-center justify-center', {
  variants: {
    size: {
      sm: '',
      md: '',
    },
  },
  defaultVariants: {
    size: 'md',
  },
});

const dotVariants = cva('rounded-full bg-white', {
  variants: {
    size: {
      sm: 'h-1.5 w-1.5',
      md: 'h-2 w-2',
    },
  },
  defaultVariants: {
    size: 'md',
  },
});

export interface RadioItemProps
  extends
    React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>,
    VariantProps<typeof radioVariants> {}

const RadioItem = React.forwardRef<
  React.ComponentRef<typeof RadioGroupPrimitive.Item>,
  RadioItemProps
>(({ className, size: sizeProp, ...props }, ref) => {
  const { size: contextSize } = React.useContext(RadioGroupContext);
  const size = sizeProp ?? contextSize ?? 'md';

  return (
    <RadioGroupPrimitive.Item
      ref={ref}
      className={cn(radioVariants({ size }), className)}
      {...props}
    >
      <RadioGroupPrimitive.Indicator className={cn(indicatorVariants({ size }))}>
        <span className={cn(dotVariants({ size }))} />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  );
});

RadioItem.displayName = RadioGroupPrimitive.Item.displayName;

export { RadioGroup, RadioItem, radioVariants };
export type { RadioSize };
