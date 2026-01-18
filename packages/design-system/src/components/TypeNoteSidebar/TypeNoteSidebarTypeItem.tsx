import * as React from 'react';
import { cn } from '../../utils/cn.js';
import { SidebarMenuItem } from '../ShadcnSidebar/index.js';

export interface TypeNoteSidebarTypeItemProps {
  /** Lucide icon component to display */
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  /** Label text for the type */
  label: string;
  /** Count to display (shows on hover) */
  count: number;
  /** Optional color for the icon */
  color?: string;
  /** Whether this item is currently selected */
  selected?: boolean;
  /** Called when the item is clicked */
  onClick?: () => void;
  /** Optional actions to show on hover (e.g., dropdown menu) */
  actions?: React.ReactNode;
  /** Additional className for styling */
  className?: string;
}

/**
 * TypeNote-style type item for the sidebar.
 * Uses a 4-column grid layout: icon | label | count | actions
 * Count and actions are revealed on hover for a clean, calm interface.
 *
 * Built on shadcn SidebarMenuItem but styled for TypeNote's design system.
 */
const TypeNoteSidebarTypeItem = React.forwardRef<HTMLDivElement, TypeNoteSidebarTypeItemProps>(
  ({ icon: Icon, label, count, color, selected = false, onClick, actions, className }, ref) => {
    return (
      <SidebarMenuItem>
        <div
          ref={ref}
          role="button"
          tabIndex={0}
          onClick={onClick}
          onKeyDown={(e) => {
            if ((e.key === 'Enter' || e.key === ' ') && onClick) {
              e.preventDefault();
              onClick();
            }
          }}
          className={cn(
            'grid grid-cols-[14px_1fr_auto_auto] items-center gap-3 h-7 px-3 rounded',
            'transition-colors duration-150 cursor-pointer',
            'group/typeitem',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            selected ? 'bg-accent-50' : 'hover:bg-muted',
            className
          )}
        >
          <Icon className="w-3.5 h-3.5 shrink-0" {...(color ? { style: { color } } : {})} />
          <span className="text-sm font-medium truncate text-left">{label}</span>
          <span className="text-xs font-mono text-muted-foreground transition-opacity w-6 text-right opacity-0 group-hover/typeitem:opacity-100">
            {count}
          </span>
          <div className="w-6 flex items-center justify-center transition-opacity opacity-0 group-hover/typeitem:opacity-100">
            {actions}
          </div>
        </div>
      </SidebarMenuItem>
    );
  }
);

TypeNoteSidebarTypeItem.displayName = 'TypeNoteSidebarTypeItem';

export { TypeNoteSidebarTypeItem };
