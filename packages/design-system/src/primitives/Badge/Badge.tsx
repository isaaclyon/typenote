import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '../../lib/utils.js';

type BadgeVariant = 'solid' | 'outline';

type BadgeIntent = 'neutral' | 'info' | 'success' | 'warning' | 'danger';

type BadgeSize = 'sm' | 'md';

const badgeVariants = cva(
  [
    'inline-flex items-center justify-center rounded text-xs font-medium leading-none',
    'transition-colors duration-150 ease-out',
  ],
  {
    variants: {
      variant: {
        solid: '',
        outline: 'border border-current bg-transparent',
      },
      intent: {
        neutral: 'bg-gray-100 text-gray-600',
        info: 'bg-info/20 text-info-dark',
        success: 'bg-success/20 text-success-dark',
        warning: 'bg-warning/20 text-warning-dark',
        danger: 'bg-error/20 text-error-dark',
      },
      size: {
        sm: 'h-5 px-2 text-[11px] uppercase tracking-wide',
        md: 'h-6 px-2.5 text-xs',
      },
    },
    compoundVariants: [
      {
        variant: 'outline',
        intent: 'neutral',
        className: 'border-gray-200 text-gray-600',
      },
      {
        variant: 'outline',
        intent: 'info',
        className: 'border-info/40 text-info-dark',
      },
      {
        variant: 'outline',
        intent: 'success',
        className: 'border-success/40 text-success-dark',
      },
      {
        variant: 'outline',
        intent: 'warning',
        className: 'border-warning/50 text-warning-dark',
      },
      {
        variant: 'outline',
        intent: 'danger',
        className: 'border-error/50 text-error-dark',
      },
    ],
    defaultVariants: {
      variant: 'solid',
      intent: 'neutral',
      size: 'md',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant, intent, size, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(badgeVariants({ variant, intent, size }), className)}
        {...props}
      />
    );
  }
);

Badge.displayName = 'Badge';

export { Badge, badgeVariants };
export type { BadgeVariant, BadgeIntent, BadgeSize };
