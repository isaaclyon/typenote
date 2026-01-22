import * as React from 'react';
import { Checkbox } from '../../primitives/Checkbox/Checkbox.js';
import { cn } from '../../lib/utils.js';

// ============================================================================
// Types
// ============================================================================

type SelectionState = 'none' | 'some' | 'all';

export interface DataGridHeaderCheckboxProps {
  /** Current selection state */
  selection: SelectionState;
  /** Callback when checkbox is toggled */
  onToggle: () => void;
  /** Whether the checkbox is disabled */
  disabled?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Accessible label */
  'aria-label'?: string;
}

export interface DataGridRowCheckboxProps {
  /** Whether the row is checked */
  checked: boolean;
  /** Callback when checkbox is toggled */
  onToggle: () => void;
  /** Whether the checkbox is disabled */
  disabled?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Accessible label */
  'aria-label'?: string;
}

// ============================================================================
// DataGridHeaderCheckbox
// ============================================================================

const DataGridHeaderCheckbox = React.forwardRef<HTMLButtonElement, DataGridHeaderCheckboxProps>(
  (
    { selection, onToggle, disabled = false, className, 'aria-label': ariaLabel = 'Select all' },
    ref
  ) => {
    const checked = selection === 'all' ? true : selection === 'some' ? 'indeterminate' : false;

    return (
      <div
        className={cn(
          'tn-grid-select tn-grid-select-header flex items-center justify-center',
          className
        )}
        data-selection={selection}
        data-align="center"
      >
        <Checkbox
          ref={ref}
          checked={checked}
          onCheckedChange={onToggle}
          disabled={disabled}
          size="sm"
          aria-label={ariaLabel}
          data-indeterminate={selection === 'some' ? true : undefined}
        />
      </div>
    );
  }
);

DataGridHeaderCheckbox.displayName = 'DataGridHeaderCheckbox';

// ============================================================================
// DataGridRowCheckbox
// ============================================================================

const DataGridRowCheckbox = React.forwardRef<HTMLButtonElement, DataGridRowCheckboxProps>(
  (
    { checked, onToggle, disabled = false, className, 'aria-label': ariaLabel = 'Select row' },
    ref
  ) => {
    return (
      <div
        className={cn(
          'tn-grid-select tn-grid-select-checkbox flex items-center justify-center',
          className
        )}
        data-checked={checked}
        data-disabled={disabled ? true : undefined}
        data-align="center"
      >
        <Checkbox
          ref={ref}
          checked={checked}
          onCheckedChange={onToggle}
          disabled={disabled}
          size="sm"
          aria-label={ariaLabel}
        />
      </div>
    );
  }
);

DataGridRowCheckbox.displayName = 'DataGridRowCheckbox';

// ============================================================================
// Exports
// ============================================================================

export { DataGridHeaderCheckbox, DataGridRowCheckbox };
