import * as React from 'react';
import { cn } from '../../utils/cn.js';
import type { SidebarSectionProps } from './types.js';

const SidebarSection = React.forwardRef<HTMLDivElement, SidebarSectionProps>(
  ({ title, className, children }, ref) => {
    return (
      <div ref={ref} className={cn('flex flex-col gap-1', className)}>
        {title && (
          <div className="px-3 py-2">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              {title}
            </span>
          </div>
        )}
        {children}
      </div>
    );
  }
);

SidebarSection.displayName = 'SidebarSection';

export { SidebarSection };
