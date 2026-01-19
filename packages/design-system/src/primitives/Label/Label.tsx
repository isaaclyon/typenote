import * as React from 'react';
import * as LabelPrimitive from '@radix-ui/react-label';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '../../lib/utils.js';

type LabelSize = 'sm' | 'md';

type LabelTone = 'default' | 'muted';

const labelVariants = cva(
  'font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
  {
    variants: {
      size: {
        sm: 'text-sm',
        md: 'text-base',
      },
      tone: {
        default: 'text-gray-700',
        muted: 'text-gray-500',
      },
    },
    defaultVariants: {
      size: 'sm',
      tone: 'default',
    },
  }
);

export interface LabelProps
  extends
    React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>,
    VariantProps<typeof labelVariants> {
  required?: boolean;
}

const Label = React.forwardRef<React.ComponentRef<typeof LabelPrimitive.Root>, LabelProps>(
  ({ className, size, tone, required = false, children, ...props }, ref) => {
    return (
      <LabelPrimitive.Root
        ref={ref}
        className={cn(labelVariants({ size, tone }), className)}
        {...props}
      >
        <span>{children}</span>
        {required ? <span className="ml-1 text-error">*</span> : null}
      </LabelPrimitive.Root>
    );
  }
);

Label.displayName = LabelPrimitive.Root.displayName;

export { Label, labelVariants };
export type { LabelSize, LabelTone };
