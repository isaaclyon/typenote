import * as React from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '../../utils/cn.js';
import type { ToastProps } from './types.js';

const toastVariants = cva(
  'flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium border transition-all duration-200',
  {
    variants: {
      variant: {
        default: 'bg-gray-50 text-gray-700 border-gray-200 shadow-md',
        success: 'bg-[#81c78420] text-[#4caf50] border-[#81c784] shadow-md',
        error: 'bg-[#e5737320] text-[#d32f2f] border-[#e57373] shadow-md',
        warning: 'bg-[#ffb74d20] text-[#f57c00] border-[#ffb74d] shadow-md',
        info: 'bg-[#6495ED20] text-[#3d5fc2] border-[#6495ED] shadow-md',
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
