import * as React from 'react';

import { cn } from '../../lib/utils.js';
import { Switch } from '../../primitives/Switch/Switch.js';
import type { SwitchProps, SwitchSize } from '../../primitives/Switch/Switch.js';
import { Label } from '../../primitives/Label/Label.js';

// ============================================================================
// Types
// ============================================================================

export interface SwitchFieldProps extends Omit<SwitchProps, 'id'> {
  /** Field label */
  label: string;
  /** Optional help text shown below the switch */
  help?: string;
  /** Optional id override */
  id?: string;
  /** Additional CSS classes for the container */
  containerClassName?: string;
}

// ============================================================================
// SwitchField
// ============================================================================

const SwitchField = React.forwardRef<React.ComponentRef<typeof Switch>, SwitchFieldProps>(
  ({ label, help, id, containerClassName, className, ...props }, ref) => {
    const fieldId = id ?? React.useId();
    const helpId = `${fieldId}-help`;

    return (
      <div className={cn('flex flex-col gap-2', containerClassName)}>
        <div className="flex items-center gap-3">
          <Switch
            ref={ref}
            id={fieldId}
            aria-describedby={help ? helpId : undefined}
            className={className}
            {...props}
          />
          <Label htmlFor={fieldId}>{label}</Label>
        </div>

        {help && (
          <p id={helpId} className="text-sm text-muted-foreground">
            {help}
          </p>
        )}
      </div>
    );
  }
);

SwitchField.displayName = 'SwitchField';

export { SwitchField };
export type { SwitchSize };
