import * as React from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '../../utils/cn.js';
import type { ToastProps } from './types.js';

const toastVariants = cva(
  'flex items-center gap-3 px-4 py-3 rounded-md shadow-lg text-sm font-medium',
  {
    variants: {
      variant: {
        default: 'bg-gray-800 text-white',
        success: 'bg-gray-800 text-white',
        error: 'bg-gray-800 text-white',
        warning: 'bg-gray-800 text-white',
        info: 'bg-gray-800 text-white',
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
