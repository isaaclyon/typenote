import * as React from 'react';

import { cn } from '../../lib/utils.js';
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from '../../primitives/Select/Select.js';
import type { SelectSize, SelectTriggerProps } from '../../primitives/Select/Select.js';
import { Label } from '../../primitives/Label/Label.js';

// ============================================================================
// Types
// ============================================================================

export interface SelectFieldProps {
  /** Field label */
  label: string;
  /** Optional help text shown below select */
  help?: string;
  /** Error message (replaces help text, sets error styling) */
  error?: string;
  /** Whether the field is required */
  required?: boolean;
  /** Placeholder text when no value selected */
  placeholder?: string;
  /** Current value */
  value?: string;
  /** Default value (uncontrolled) */
  defaultValue?: string;
  /** Value change handler */
  onValueChange?: (value: string) => void;
  /** Whether the select is disabled */
  disabled?: boolean;
  /** Select size */
  size?: SelectSize;
  /** Optional id override */
  id?: string;
  /** Additional CSS classes for the container */
  containerClassName?: string;
  /** Additional CSS classes for the trigger */
  triggerClassName?: string;
  /** SelectItem children */
  children: React.ReactNode;
}

// ============================================================================
// SelectField
// ============================================================================

function SelectField({
  label,
  help,
  error,
  required,
  placeholder,
  value,
  defaultValue,
  onValueChange,
  disabled,
  size,
  id,
  containerClassName,
  triggerClassName,
  children,
}: SelectFieldProps) {
  const fieldId = id ?? React.useId();
  const helpId = `${fieldId}-help`;
  const hasError = Boolean(error);

  // Use error variant when there's an error
  const triggerVariant: SelectTriggerProps['variant'] = hasError ? 'error' : 'default';

  return (
    <div className={cn('flex flex-col gap-1.5', containerClassName)}>
      <Label htmlFor={fieldId}>
        {label}
        {required && <span className="ml-0.5 text-error">*</span>}
      </Label>

      <Select
        {...(value !== undefined && { value })}
        {...(defaultValue !== undefined && { defaultValue })}
        {...(onValueChange !== undefined && { onValueChange })}
        {...(disabled !== undefined && { disabled })}
      >
        <SelectTrigger
          id={fieldId}
          size={size}
          variant={triggerVariant}
          aria-describedby={help || error ? helpId : undefined}
          aria-invalid={hasError || undefined}
          className={triggerClassName}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>{children}</SelectContent>
      </Select>

      {(help || error) && (
        <p id={helpId} className={cn('text-sm', hasError ? 'text-error' : 'text-muted-foreground')}>
          {error || help}
        </p>
      )}
    </div>
  );
}

export { SelectField };
export type { SelectSize };
