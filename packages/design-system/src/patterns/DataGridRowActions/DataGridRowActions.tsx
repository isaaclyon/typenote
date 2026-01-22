import * as React from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '../../lib/utils.js';
import { IconButton } from '../../primitives/IconButton/IconButton.js';

// ============================================================================
// Types
// ============================================================================

export interface DataGridRowAction {
  /** Unique identifier for the action */
  id: string;
  /** Icon component to render */
  icon: React.ReactNode;
  /** Accessible label for the action */
  label: string;
  /** Click handler */
  onClick: () => void;
  /** Whether the action is destructive */
  destructive?: boolean;
  /** Whether the action is disabled */
  disabled?: boolean;
}

type ActionVisibility = 'always' | 'hover' | 'focus';
type RowState = 'default' | 'selected' | 'disabled';
type ActionAlign = 'left' | 'right';

export interface DataGridRowActionsProps {
  /** Array of actions to display */
  actions: DataGridRowAction[];
  /** When to show actions */
  visible?: ActionVisibility;
  /** Current row state */
  rowState?: RowState;
  /** Alignment of actions within the cell */
  align?: ActionAlign;
  /** Whether actions are sticky */
  sticky?: boolean;
  /** Compact mode with smaller buttons */
  compact?: boolean;
  /** Additional CSS classes */
  className?: string;
}

// ============================================================================
// Variants
// ============================================================================

const rowActionsVariants = cva(['tn-grid-actions', 'flex items-center gap-0.5'], {
  variants: {
    visible: {
      always: '',
      hover:
        'opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-150',
      focus: 'opacity-0 focus-within:opacity-100 transition-opacity duration-150',
    },
    align: {
      left: 'justify-start',
      right: 'justify-end',
    },
  },
  defaultVariants: {
    visible: 'hover',
    align: 'right',
  },
});

// ============================================================================
// DataGridRowActions
// ============================================================================

const DataGridRowActions = React.forwardRef<HTMLDivElement, DataGridRowActionsProps>(
  (
    {
      actions,
      visible = 'hover',
      rowState = 'default',
      align = 'right',
      sticky = false,
      compact = false,
      className,
    },
    ref
  ) => {
    const hasActions = actions.length > 0;

    return (
      <div
        ref={ref}
        className={cn(rowActionsVariants({ visible, align }), className)}
        data-visible={visible}
        data-has-actions={hasActions}
        data-row-state={rowState}
        data-align={align}
        data-sticky={sticky ? true : undefined}
        data-compact={compact ? true : undefined}
      >
        {actions.map((action) => (
          <IconButton
            key={action.id}
            variant="ghost"
            size="sm"
            onClick={action.onClick}
            disabled={action.disabled || rowState === 'disabled'}
            aria-label={action.label}
            className={cn(
              'tn-grid-actions-button',
              action.destructive && 'text-error hover:bg-error/10 hover:text-error'
            )}
          >
            {action.icon}
          </IconButton>
        ))}
      </div>
    );
  }
);

DataGridRowActions.displayName = 'DataGridRowActions';

export { DataGridRowActions, rowActionsVariants };
