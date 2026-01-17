import * as React from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '../../utils/cn.js';
import type { ToastProps } from './types.js';

const toastVariants = cva(
  'flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium border transition-all duration-200',
  {
    variants: {
      variant: {
        default: 'bg-muted text-foreground border-border shadow-md',
        success: 'bg-success/10 text-success-dark border-success shadow-md',
        error: 'bg-error/10 text-error-dark border-error shadow-md',
        warning: 'bg-warning/10 text-warning-dark border-warning shadow-md',
        info: 'bg-info/10 text-info-dark border-info shadow-md',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

const Toast = React.forwardRef<HTMLDivElement, ToastProps>(
  ({ message, icon: Icon, variant = 'default', action, className }, ref) => {
    return (
      <div
        ref={ref}
        role="status"
        aria-live="polite"
        className={cn(toastVariants({ variant }), className)}
      >
        {Icon && <Icon className="h-4 w-4 flex-shrink-0" />}
        <span className="flex-1">{message}</span>
        {action && (
          <button
            onClick={action.onClick}
            className="text-xs font-semibold underline hover:no-underline transition-all"
          >
            {action.label}
          </button>
        )}
      </div>
    );
  }
);

Toast.displayName = 'Toast';

export { Toast, toastVariants };
