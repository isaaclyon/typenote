import * as React from 'react';
import { Plus } from 'lucide-react';
import { cn } from '../../utils/cn.js';
import { SidebarMenuItem } from '../ShadcnSidebar/index.js';

export interface TypeNoteSidebarNewTypeButtonProps {
  /** Called when the button is clicked */
  onClick?: () => void;
  /** Additional className for styling */
  className?: string;
}

/**
 * TypeNote-style "New Type" button for the sidebar.
 * Used to create new object types in the application.
 *
 * Built on shadcn SidebarMenuItem but styled for TypeNote's design system.
 */
const TypeNoteSidebarNewTypeButton = React.forwardRef<
  HTMLButtonElement,
  TypeNoteSidebarNewTypeButtonProps
>(({ onClick, className }, ref) => {
  return (
    <SidebarMenuItem>
      <button
        ref={ref}
        onClick={onClick}
        className={cn(
          'flex items-center gap-2 h-7 px-3 rounded-md w-full',
          'transition-colors duration-150',
          'text-sm font-medium text-muted-foreground',
          'hover:bg-muted hover:text-foreground',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          className
        )}
      >
        <Plus className="w-3.5 h-3.5" />
        <span>New Type</span>
      </button>
    </SidebarMenuItem>
  );
});

TypeNoteSidebarNewTypeButton.displayName = 'TypeNoteSidebarNewTypeButton';

export { TypeNoteSidebarNewTypeButton };
