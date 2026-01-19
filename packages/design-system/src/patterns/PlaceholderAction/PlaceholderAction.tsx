import * as React from 'react';
import type { Icon as PhosphorIcon } from '@phosphor-icons/react';

import { cn } from '../../lib/utils.js';

// ============================================================================
// Types
// ============================================================================

export interface PlaceholderActionProps {
  /** Optional Phosphor icon to display */
  icon?: PhosphorIcon;
  /** Label text */
  label: string;
  /** Click handler */
  onClick?: () => void;
  /** Whether the action is disabled */
  disabled?: boolean;
  /** Additional CSS classes */
  className?: string;
}

// ============================================================================
// PlaceholderAction
// ============================================================================

/**
 * A dashed placeholder button for "add new" or "empty slot" actions.
 * Styled with a subtle dashed border and low-contrast text that becomes
 * more prominent on hover.
 */
export function PlaceholderAction({
  icon: Icon,
  label,
  onClick,
  disabled = false,
  className,
}: PlaceholderActionProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'flex h-7 w-full items-center gap-2 rounded-md border border-dashed px-2',
        'text-sm text-muted-foreground',
        'transition-colors duration-150 ease-out',
        'border-border/60 hover:border-border hover:bg-muted/50 hover:text-foreground',
        'focus-visible:outline focus-visible:outline-1 focus-visible:outline-ring',
        disabled && 'pointer-events-none opacity-50',
        className
      )}
    >
      {Icon && <Icon className="h-3.5 w-3.5 shrink-0" weight="regular" />}
      <span className="min-w-0 flex-1 truncate text-left">{label}</span>
    </button>
  );
}
