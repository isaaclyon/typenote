import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '../../lib/utils.js';

type KeycapSize = 'xs' | 'sm' | 'md';

const keycapVariants = cva(
  [
    'inline-flex items-center justify-center font-mono font-medium',
    'rounded border border-border bg-muted text-foreground',
    'select-none',
  ],
  {
    variants: {
      size: {
        xs: 'min-w-4 h-4 px-0.5 text-[10px]',
        sm: 'min-w-5 h-5 px-1 text-xs',
        md: 'min-w-6 h-6 px-1.5 text-xs',
      },
    },
    defaultVariants: {
      size: 'sm',
    },
  }
);

export interface KeycapProps
  extends React.HTMLAttributes<HTMLElement>, VariantProps<typeof keycapVariants> {
  /** The key or key combination to display */
  children: React.ReactNode;
}

const Keycap = React.forwardRef<HTMLElement, KeycapProps>(
  ({ className, size, children, ...props }, ref) => {
    return (
      <kbd ref={ref} className={cn(keycapVariants({ size }), className)} {...props}>
        {children}
      </kbd>
    );
  }
);

Keycap.displayName = 'Keycap';

export { Keycap, keycapVariants };
export type { KeycapSize };
