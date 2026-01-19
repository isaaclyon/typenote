import * as React from 'react';
import type { Icon as PhosphorIcon } from '@phosphor-icons/react';

import { cn } from '../../lib/utils.js';
import { Button } from '../../primitives/Button/Button.js';

// ============================================================================
// Types
// ============================================================================

export interface EmptyStateAction {
  /** Button label text */
  label: string;
  /** Click handler */
  onClick: () => void;
}

export interface EmptyStateProps {
  /** Optional Phosphor icon to display */
  icon?: PhosphorIcon;
  /** Main heading text */
  heading: string;
  /** Optional description text */
  description?: string;
  /** Optional primary action button */
  action?: EmptyStateAction;
  /** Additional CSS classes */
  className?: string;
}

// ============================================================================
// EmptyState
// ============================================================================

export function EmptyState({
  icon: Icon,
  heading,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/50 px-6 py-10 text-center',
        className
      )}
    >
      {Icon && (
        <div className="mb-4">
          <Icon className="h-10 w-10 text-muted-foreground opacity-60" weight="light" />
        </div>
      )}

      <h3 className="text-base font-medium text-foreground">{heading}</h3>

      {description && (
        <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">{description}</p>
      )}

      {action && (
        <div className="mt-4">
          <Button variant="primary" size="sm" onClick={action.onClick}>
            {action.label}
          </Button>
        </div>
      )}
    </div>
  );
}
