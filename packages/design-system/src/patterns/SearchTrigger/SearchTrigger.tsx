import * as React from 'react';
import { MagnifyingGlass } from '@phosphor-icons/react/dist/ssr/MagnifyingGlass';

import { cn } from '../../lib/utils.js';
import { Keycap } from '../../primitives/Keycap/Keycap.js';

// ============================================================================
// Types
// ============================================================================

export type SearchTriggerSize = 'default' | 'compact';

export interface SearchTriggerProps {
  /** Click handler (opens command palette) */
  onClick?: () => void;
  /** Placeholder text */
  placeholder?: string;
  /** Keyboard shortcut hint (e.g., "⌘K" or "Ctrl+K") */
  shortcut?: string;
  /** Size variant: 'default' (200px, h-8) or 'compact' (120px, h-6) */
  size?: SearchTriggerSize;
  /** Additional CSS classes */
  className?: string;
}

// ============================================================================
// SearchTrigger
// ============================================================================

/**
 * A button styled like an input field that triggers the command palette.
 * Displays a placeholder, search icon, and keyboard shortcut hint.
 *
 * Size variants:
 * - 'default': 200px wide, 32px tall (h-8) - for HeaderBar
 * - 'compact': 120px wide, 24px tall (h-6) - for TitleBar
 */
export function SearchTrigger({
  onClick,
  placeholder,
  shortcut = '⌘K',
  size = 'default',
  className,
}: SearchTriggerProps) {
  const isCompact = size === 'compact';
  const displayPlaceholder = placeholder ?? (isCompact ? 'Search' : 'Search...');

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        // Layout - size-dependent
        'inline-flex items-center rounded-md',
        isCompact ? 'h-6 w-[120px] gap-1.5 px-2' : 'h-8 w-[200px] gap-2 px-2.5',
        // Input-like appearance
        'bg-muted/50 border border-transparent',
        'hover:border-border hover:bg-muted',
        // Text styling - size-dependent
        isCompact ? 'text-xs text-muted-foreground' : 'text-sm text-muted-foreground',
        // Transitions
        'transition-colors duration-150 ease-out',
        // Focus
        'focus-visible:outline focus-visible:outline-1 focus-visible:outline-ring',
        'focus-visible:outline-offset-2',
        className
      )}
    >
      {/* Search icon */}
      <MagnifyingGlass
        className={cn('shrink-0 text-muted-foreground', isCompact ? 'h-3 w-3' : 'h-3.5 w-3.5')}
        weight="regular"
      />

      {/* Placeholder text */}
      <span className="flex-1 text-left truncate">{displayPlaceholder}</span>

      {/* Keyboard shortcut hint */}
      <Keycap size={isCompact ? 'xs' : 'sm'} className="text-muted-foreground">
        {shortcut}
      </Keycap>
    </button>
  );
}
