import * as React from 'react';

import { cn } from '../../lib/utils.js';
import { useSidebarContext } from './SidebarContext.js';
import type { SidebarSectionProps } from './types.js';

// ============================================================================
// SidebarSection
// ============================================================================

function SidebarSectionComponent({ label, children, className }: SidebarSectionProps) {
  const { collapsed } = useSidebarContext();

  return (
    <div className={cn('flex flex-col', className)}>
      {/* Section label (hidden when collapsed) */}
      {label && !collapsed && (
        <div className="px-3 py-1.5">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {label}
          </span>
        </div>
      )}

      {/* Section content */}
      <div className={cn('flex flex-col gap-0.5', collapsed ? 'px-2' : 'px-2')}>{children}</div>
    </div>
  );
}

SidebarSectionComponent.displayName = 'SidebarSection';

export const SidebarSection = SidebarSectionComponent;
