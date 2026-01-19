import * as React from 'react';

import { cn } from '../../lib/utils.js';
import { RadioGroup } from '../../primitives/Radio/Radio.js';
import type { RadioGroupProps, RadioSize } from '../../primitives/Radio/Radio.js';

// ============================================================================
// Types
// ============================================================================

export interface RadioFieldProps extends Omit<RadioGroupProps, 'id'> {
  /** Field label */
  label: string;
  /** Optional help text shown below the radio group */
  help?: string;
  /** Whether the field is required */
  required?: boolean;
  /** Optional id override */
  id?: string;
  /** Additional CSS classes for the container */
  containerClassName?: string;
  /** Radio items as children */
  children: React.ReactNode;
}

// ============================================================================
// RadioField
// ============================================================================

const RadioField = React.forwardRef<React.ComponentRef<typeof RadioGroup>, RadioFieldProps>(
  ({ label, help, required, id, containerClassName, className, children, ...props }, ref) => {
    const fieldId = id ?? React.useId();
    const helpId = `${fieldId}-help`;
    const labelId = `${fieldId}-label`;

    return (
      <div className={cn('flex flex-col gap-2', containerClassName)}>
        <span id={labelId} className="text-sm font-medium text-foreground">
          {label}
          {required && <span className="ml-0.5 text-error">*</span>}
        </span>

        <RadioGroup
          ref={ref}
          aria-describedby={help ? helpId : undefined}
          aria-labelledby={labelId}
          className={className}
          {...props}
        >
          {children}
        </RadioGroup>

        {help && (
          <p id={helpId} className="text-sm text-muted-foreground">
            {help}
          </p>
        )}
      </div>
    );
  }
);

RadioField.displayName = 'RadioField';

export { RadioField };
export type { RadioSize };
