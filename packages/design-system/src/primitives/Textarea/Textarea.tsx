import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '../../lib/utils.js';

type TextareaVariant = 'default' | 'subtle' | 'error' | 'success';

type TextareaSize = 'sm' | 'md' | 'lg';

const textareaVariants = cva(
  [
    'flex w-full rounded-md border bg-background text-foreground',
    'placeholder:text-placeholder',
    'transition-colors duration-150 ease-out',
    'focus-visible:outline focus-visible:outline-1',
    'focus-visible:outline-offset-2',
    'disabled:pointer-events-none disabled:opacity-50',
    'resize-y',
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
        sm: 'min-h-20 px-3 py-2 text-sm',
        md: 'min-h-24 px-3.5 py-2.5 text-base',
        lg: 'min-h-32 px-4 py-3 text-base',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

type TextareaVariantProps = VariantProps<typeof textareaVariants>;

type TextareaHTMLProps = Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'>;

export interface TextareaProps extends TextareaHTMLProps, TextareaVariantProps {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(textareaVariants({ variant, size }), className)}
        {...props}
      />
    );
  }
);

Textarea.displayName = 'Textarea';

export { Textarea, textareaVariants };
export type { TextareaVariant, TextareaSize };
