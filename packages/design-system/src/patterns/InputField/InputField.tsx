import * as React from 'react';

import { cn } from '../../lib/utils.js';
import { Input } from '../../primitives/Input/Input.js';
import type { InputProps, InputSize, InputVariant } from '../../primitives/Input/Input.js';
import { Label } from '../../primitives/Label/Label.js';

// ============================================================================
// Types
// ============================================================================

export interface InputFieldProps extends Omit<InputProps, 'id'> {
  /** Field label */
  label: string;
  /** Optional help text shown below input */
  help?: string;
  /** Error message (replaces help text, sets error styling) */
  error?: string;
  /** Whether the field is required */
  required?: boolean;
  /** Optional id override */
  id?: string;
  /** Additional CSS classes for the container */
  containerClassName?: string;
}

// ============================================================================
// InputField
// ============================================================================

const InputField = React.forwardRef<HTMLInputElement, InputFieldProps>(
  ({ label, help, error, required, id, containerClassName, className, variant, ...props }, ref) => {
    const fieldId = id ?? React.useId();
    const helpId = `${fieldId}-help`;
    const hasError = Boolean(error);

    // Use error variant when there's an error, otherwise use provided variant
    const resolvedVariant: InputVariant = hasError ? 'error' : (variant ?? 'default');

    return (
      <div className={cn('flex flex-col gap-1.5', containerClassName)}>
        <Label htmlFor={fieldId}>
          {label}
          {required && <span className="ml-0.5 text-error">*</span>}
        </Label>

        <Input
          ref={ref}
          id={fieldId}
          variant={resolvedVariant}
          aria-describedby={help || error ? helpId : undefined}
          aria-invalid={hasError || undefined}
          className={className}
          {...props}
        />

        {(help || error) && (
          <p
            id={helpId}
            className={cn('text-sm', hasError ? 'text-error' : 'text-muted-foreground')}
          >
            {error || help}
          </p>
        )}
      </div>
    );
  }
);

InputField.displayName = 'InputField';

export { InputField };
export type { InputSize, InputVariant };
