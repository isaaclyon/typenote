import * as React from 'react';

import { cn } from '../../lib/utils.js';
import { Tooltip } from '../../primitives/Tooltip/Tooltip.js';
import { Divider } from '../../primitives/Divider/Divider.js';
import { useSidebarContext } from './SidebarContext.js';
import type { SidebarFooterProps } from './types.js';

// ============================================================================
// SidebarFooter
// ============================================================================

function SidebarFooterComponent({ actions, className }: SidebarFooterProps) {
  const { collapsed } = useSidebarContext();

  return (
    <div className={cn('mt-auto', className)}>
      <Divider className="ml-2 mr-4" />
      <div className={cn('flex flex-col gap-0.5 px-2 py-2')}>
        {actions.map((action) => {
          const Icon = action.icon;

          // Collapsed mode: icon-only with tooltip
          if (collapsed) {
            return (
              <Tooltip key={action.label} content={action.label} side="right">
                <div
                  role="button"
                  tabIndex={0}
                  className={cn(
                    'flex h-7 w-full items-center justify-center rounded-md',
                    'transition-colors duration-150 ease-out',
                    'focus-visible:outline focus-visible:outline-1 focus-visible:outline-ring',
                    action.active
                      ? 'bg-accent text-accent-foreground'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                  onClick={action.onClick}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      action.onClick();
                    }
                  }}
                  aria-label={action.label}
                >
                  <Icon className="h-4 w-4" weight="regular" />
                </div>
              </Tooltip>
            );
          }

          // Expanded mode: full row with icon + label
          return (
            <button
              key={action.label}
              type="button"
              className={cn(
                'flex h-7 w-full items-center gap-2 rounded-md px-2',
                'text-sm transition-colors duration-150 ease-out',
                'focus-visible:outline focus-visible:outline-1 focus-visible:outline-ring',
                action.active
                  ? 'bg-accent text-accent-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
              onClick={action.onClick}
            >
              <Icon className="h-3.5 w-3.5 shrink-0" weight="regular" />
              <span className="truncate">{action.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

SidebarFooterComponent.displayName = 'SidebarFooter';

export const SidebarFooter = SidebarFooterComponent;
