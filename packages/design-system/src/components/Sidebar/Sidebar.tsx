import * as React from 'react';
import { cn } from '../../lib/utils.js';
import { ScrollArea } from '../ui/scroll-area.js';

export interface SidebarProps {
  /** Header content (e.g., search, quick actions) */
  header?: React.ReactNode;
  /** Main navigation content */
  children: React.ReactNode;
  /** Footer content (e.g., settings) */
  footer?: React.ReactNode;
  /** Additional className */
  className?: string;
}

/**
 * Sidebar container with header, scrollable content, and footer sections.
 */
export function Sidebar({ header, children, footer, className }: SidebarProps) {
  return (
    <div className={cn('flex h-full flex-col', className)}>
      {header && <div className="flex-shrink-0 border-b border-sidebar-border p-2">{header}</div>}
      <ScrollArea className="flex-1">
        <div className="p-2">{children}</div>
      </ScrollArea>
      {footer && <div className="flex-shrink-0 border-t border-sidebar-border p-2">{footer}</div>}
    </div>
  );
}

export interface SidebarSectionProps {
  /** Section title */
  title?: string;
  /** Section content */
  children: React.ReactNode;
  /** Additional className */
  className?: string;
}

/**
 * A labeled section within the sidebar.
 */
export function SidebarSection({ title, children, className }: SidebarSectionProps) {
  return (
    <div className={cn('py-2', className)}>
      {title && (
        <h3 className="mb-1 px-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {title}
        </h3>
      )}
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}

export interface SidebarItemProps {
  /** Icon component */
  icon?: React.ReactNode;
  /** Item label */
  label: string;
  /** Optional count badge */
  count?: number;
  /** Whether this item is currently active/selected */
  active?: boolean;
  /** Click handler */
  onClick?: () => void;
  /** Additional className */
  className?: string;
}

/**
 * A clickable item in the sidebar navigation.
 */
export function SidebarItem({ icon, label, count, active, onClick, className }: SidebarItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors',
        'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring',
        active && 'bg-sidebar-accent text-sidebar-accent-foreground font-medium',
        className
      )}
    >
      {icon && <span className="flex-shrink-0 text-muted-foreground">{icon}</span>}
      <span className="flex-1 truncate text-left">{label}</span>
      {count !== undefined && (
        <span className="flex-shrink-0 text-xs text-muted-foreground">{count}</span>
      )}
    </button>
  );
}
