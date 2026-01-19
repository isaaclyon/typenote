import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '../../lib/utils.js';

type InputVariant = 'default' | 'subtle' | 'error' | 'success';

type InputSize = 'sm' | 'md' | 'lg';

const inputVariants = cva(
  [
    'flex w-full rounded-md border bg-background text-foreground',
    'placeholder:text-placeholder',
    'transition-colors duration-150 ease-out',
    'focus-visible:outline focus-visible:outline-1',
    'focus-visible:outline-offset-2',
    'disabled:pointer-events-none disabled:opacity-50',
  ],
  {
    variants: {
      variant: {
        default: 'border-border focus-visible:outline-ring',
        subtle: 'border-border bg-muted focus-visible:outline-ring',
        error: 'border-error focus-visible:outline-error/60',
        success: 'border-success focus-visible:outline-success/60',
      },
      size: {
        sm: 'h-8 px-3 text-sm',
        md: 'h-9 px-3.5 text-base',
        lg: 'h-10 px-4 text-base',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

type InputVariantProps = VariantProps<typeof inputVariants>;

type InputHTMLProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>;

export interface InputProps extends InputHTMLProps, InputVariantProps {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, variant, size, type = 'text', ...props }, ref) => {
    return (
      <input
        ref={ref}
        type={type}
        className={cn(inputVariants({ variant, size }), className)}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';

export { Input, inputVariants };
export type { InputVariant, InputSize };
