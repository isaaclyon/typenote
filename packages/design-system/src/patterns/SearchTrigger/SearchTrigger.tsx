import * as React from 'react';
import { MagnifyingGlass } from '@phosphor-icons/react/dist/ssr/MagnifyingGlass';

import { cn } from '../../lib/utils.js';
import { Keycap } from '../../primitives/Keycap/Keycap.js';

// ============================================================================
// Types
// ============================================================================

export interface SearchTriggerProps {
  /** Click handler (opens command palette) */
  onClick?: () => void;
  /** Placeholder text */
  placeholder?: string;
  /** Keyboard shortcut hint (e.g., "⌘K" or "Ctrl+K") */
  shortcut?: string;
  /** Additional CSS classes */
  className?: string;
}

// ============================================================================
// SearchTrigger
// ============================================================================

/**
 * A button styled like an input field that triggers the command palette.
 * Displays a placeholder, search icon, and keyboard shortcut hint.
 */
export function SearchTrigger({
  onClick,
  placeholder = 'Search...',
  shortcut = '⌘K',
  className,
}: SearchTriggerProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        // Layout
        'inline-flex h-8 w-[200px] items-center gap-2 rounded-md px-2.5',
        // Input-like appearance
        'bg-muted/50 border border-transparent',
        'hover:border-border hover:bg-muted',
        // Text styling
        'text-sm text-muted-foreground',
        // Transitions
        'transition-colors duration-150 ease-out',
        // Focus
        'focus-visible:outline focus-visible:outline-1 focus-visible:outline-ring',
        'focus-visible:outline-offset-2',
        className
      )}
    >
      {/* Search icon */}
      <MagnifyingGlass className="h-3.5 w-3.5 shrink-0 text-muted-foreground" weight="regular" />

      {/* Placeholder text */}
      <span className="flex-1 text-left">{placeholder}</span>

      {/* Keyboard shortcut hint */}
      <Keycap size="sm" className="text-muted-foreground">
        {shortcut}
      </Keycap>
    </button>
  );
}
