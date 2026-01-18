import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '../../lib/utils.js';

type LabelSize = 'sm' | 'md';

type LabelTone = 'default' | 'muted';

const labelVariants = cva('font-medium leading-none text-gray-600', {
  variants: {
    size: {
      sm: 'text-sm',
      md: 'text-base',
    },
    tone: {
      default: '',
      muted: 'text-gray-500',
    },
  },
  defaultVariants: {
    size: 'sm',
    tone: 'default',
  },
});

export interface LabelProps
  extends React.LabelHTMLAttributes<HTMLLabelElement>, VariantProps<typeof labelVariants> {
  required?: boolean;
}

const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, size, tone, required = false, children, ...props }, ref) => {
    return (
      <label ref={ref} className={cn(labelVariants({ size, tone }), className)} {...props}>
        <span>{children}</span>
        {required ? <span className="ml-1 text-error">*</span> : null}
      </label>
    );
  }
);

Label.displayName = 'Label';

export { Label, labelVariants };
export type { LabelSize, LabelTone };
