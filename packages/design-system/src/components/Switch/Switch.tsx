import * as React from 'react';
import { cn } from '../../utils/cn.js';

export interface SwitchProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'type' | 'onChange'
> {
  /** Whether the switch is checked */
  checked?: boolean;
  /** Callback when the switch state changes */
  onCheckedChange?: (checked: boolean) => void;
}

/**
 * A toggle switch component for binary settings.
 * Built with accessibility in mind - uses native checkbox with visual styling.
 */
const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, checked, onCheckedChange, disabled, ...props }, ref) => {
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      onCheckedChange?.(event.target.checked);
    };

    return (
      <label
        className={cn(
          'relative inline-flex items-center cursor-pointer',
          disabled && 'cursor-not-allowed opacity-50',
          className
        )}
      >
        <input
          ref={ref}
          type="checkbox"
          checked={checked}
          onChange={handleChange}
          disabled={disabled}
          className="sr-only peer"
          {...props}
        />
        {/* Track */}
        <div
          className={cn(
            // Base
            'relative w-9 h-5 rounded-full transition-colors duration-150 ease-out',
            // Unchecked state
            'bg-gray-300',
            // Checked state
            'peer-checked:bg-accent-500',
            // Focus ring
            'peer-focus-visible:ring-2 peer-focus-visible:ring-accent-500 peer-focus-visible:ring-offset-2'
          )}
        />
        {/* Thumb - sibling to track, so peer-checked works */}
        <div
          className={cn(
            'absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-sm',
            'transition-transform duration-150 ease-out',
            'peer-checked:translate-x-4'
          )}
        />
      </label>
    );
  }
);

Switch.displayName = 'Switch';

export { Switch };
