import * as React from 'react';
import { Search } from 'lucide-react';
import { cn } from '../../utils/cn.js';
import { KeyboardKey } from '../KeyboardKey/index.js';

export interface TypeNoteSidebarSearchTriggerProps {
  /** Called when the search trigger is clicked */
  onClick?: () => void;
  /** Keyboard shortcut to display (default: ⌘K) */
  shortcut?: string;
  /** Additional className for styling */
  className?: string;
}

/**
 * TypeNote-style search trigger for the sidebar.
 * Displays a search input placeholder with keyboard shortcut hint.
 *
 * Built on shadcn patterns but styled for TypeNote's design system.
 */
const TypeNoteSidebarSearchTrigger = React.forwardRef<
  HTMLButtonElement,
  TypeNoteSidebarSearchTriggerProps
>(({ onClick, shortcut = '⌘K', className }, ref) => {
  return (
    <button
      ref={ref}
      onClick={onClick}
      className={cn(
        'flex items-center gap-2 h-9 px-3 rounded-md w-full',
        'transition-colors duration-150',
        'text-sm text-muted-foreground',
        'bg-muted hover:bg-secondary',
        'border border-border',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        className
      )}
    >
      <Search className="w-4 h-4" />
      <span className="flex-1 text-left">Search...</span>
      <KeyboardKey className="text-xs">{shortcut}</KeyboardKey>
    </button>
  );
});

TypeNoteSidebarSearchTrigger.displayName = 'TypeNoteSidebarSearchTrigger';

export { TypeNoteSidebarSearchTrigger };
