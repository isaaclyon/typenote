import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn.js';
import type { SidebarTypeItemProps } from './types.js';

const typeItemVariants = cva(
  'grid grid-cols-[14px_1fr_auto_auto] items-center gap-3 h-7 px-3 rounded transition-colors cursor-pointer group',
  {
    variants: {
      selected: {
        true: 'bg-accent-50 text-accent-700',
        false: 'hover:bg-gray-50',
      },
    },
    defaultVariants: {
      selected: false,
    },
  }
);

export interface TypeItemVariantProps extends VariantProps<typeof typeItemVariants> {}

const SidebarTypeItem = React.forwardRef<HTMLButtonElement, SidebarTypeItemProps>(
  ({ icon: Icon, label, count, color, selected = false, onClick, className, actions }, ref) => {
    return (
      <button
        ref={ref}
        onClick={onClick}
        className={cn(
          typeItemVariants({ selected }),
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          className
        )}
      >
        <Icon className="w-3.5 h-3.5 shrink-0" style={color ? { color } : undefined} />
        <span className="text-sm font-medium truncate text-left">{label}</span>
        <span
          className={cn(
            'text-[11px] font-mono text-gray-400 transition-opacity w-6 text-right',
            'opacity-0 group-hover:opacity-100'
          )}
        >
          {count}
        </span>
        <div
          className={cn(
            'w-6 flex items-center justify-center transition-opacity',
            actions ? 'opacity-0 group-hover:opacity-100' : 'opacity-0'
          )}
        >
          {actions}
        </div>
      </button>
    );
  }
);

SidebarTypeItem.displayName = 'SidebarTypeItem';

export { SidebarTypeItem, typeItemVariants };
