import * as React from 'react';
import { cn } from '../../utils/cn.js';
import { SidebarMenuItem, SidebarMenuButton } from '../ShadcnSidebar/index.js';

export interface TypeNoteSidebarActionButtonProps {
  /** Lucide icon component to display */
  icon: React.ComponentType<{ className?: string }>;
  /** Label text for the action */
  label: string;
  /** Called when the button is clicked */
  onClick?: () => void;
  /** Whether to show a divider above this button */
  withDivider?: boolean;
  /** Additional className for styling */
  className?: string;
}

/**
 * TypeNote-style action button for the sidebar footer.
 * Used for actions like Settings, Archive, etc.
 *
 * Built on shadcn SidebarMenuItem/SidebarMenuButton but styled for TypeNote's design system.
 */
const TypeNoteSidebarActionButton = React.forwardRef<
  HTMLButtonElement,
  TypeNoteSidebarActionButtonProps
>(({ icon: Icon, label, onClick, withDivider = false, className }, ref) => {
  return (
    <SidebarMenuItem className={cn(withDivider && 'border-t border-border pt-4 mt-4', className)}>
      <SidebarMenuButton ref={ref} onClick={onClick}>
        <Icon className="w-4 h-4" />
        <span>{label}</span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
});

TypeNoteSidebarActionButton.displayName = 'TypeNoteSidebarActionButton';

export { TypeNoteSidebarActionButton };
