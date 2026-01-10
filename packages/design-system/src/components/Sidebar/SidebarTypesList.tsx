import * as React from 'react';
import { cn } from '../../utils/cn.js';
import { ScrollArea } from '../ScrollArea/index.js';
import type { SidebarTypesListProps } from './types.js';

const SidebarTypesList = React.forwardRef<HTMLDivElement, SidebarTypesListProps>(
  ({ className, children }, ref) => {
    return (
      <ScrollArea className={cn('flex-1', className)} ref={ref}>
        <div className="flex flex-col gap-1 p-2">{children}</div>
      </ScrollArea>
    );
  }
);

SidebarTypesList.displayName = 'SidebarTypesList';

export { SidebarTypesList };
