import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '../../lib/utils.js';

type RadioSize = 'sm' | 'md';

// ============================================================================
// RadioGroup
// ============================================================================

interface RadioGroupContextValue {
  name: string;
  value: string | undefined;
  onValueChange: (value: string) => void;
  disabled: boolean | undefined;
  size: RadioSize | undefined;
}

const RadioGroupContext = React.createContext<RadioGroupContextValue | null>(null);

function useRadioGroup() {
  const context = React.useContext(RadioGroupContext);
  if (!context) {
    throw new Error('RadioItem must be used within a RadioGroup');
  }
  return context;
}

export interface RadioGroupProps {
  name: string;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  size?: RadioSize;
  children: React.ReactNode;
  className?: string;
}

const RadioGroup = React.forwardRef<HTMLDivElement, RadioGroupProps>(
  (
    {
      name,
      value: controlledValue,
      defaultValue,
      onValueChange,
      disabled,
      size = 'md',
      children,
      className,
      ...props
    },
    ref
  ) => {
    const [uncontrolledValue, setUncontrolledValue] = React.useState(defaultValue);
    const isControlled = controlledValue !== undefined;
    const value = isControlled ? controlledValue : uncontrolledValue;

    const handleValueChange = React.useCallback(
      (newValue: string) => {
        if (!isControlled) {
          setUncontrolledValue(newValue);
        }
        onValueChange?.(newValue);
      },
      [isControlled, onValueChange]
    );

    const contextValue = React.useMemo(
      () => ({
        name,
        value,
        onValueChange: handleValueChange,
        disabled,
        size,
      }),
      [name, value, handleValueChange, disabled, size]
    );

    return (
      <RadioGroupContext.Provider value={contextValue}>
        <div
          ref={ref}
          role="radiogroup"
          className={cn('flex flex-col gap-2', className)}
          {...props}
        >
          {children}
        </div>
      </RadioGroupContext.Provider>
    );
  }
);

RadioGroup.displayName = 'RadioGroup';

// ============================================================================
// RadioItem
// ============================================================================

const radioVariants = cva(
  [
    'relative inline-flex items-center justify-center rounded-full border',
    'transition-colors duration-150 ease-out',
    'focus-visible:outline focus-visible:outline-1 focus-visible:outline-gray-300',
    'focus-visible:outline-offset-2',
    'disabled:pointer-events-none disabled:opacity-50',
  ],
  {
    variants: {
      size: {
        sm: 'h-4 w-4',
        md: 'h-5 w-5',
      },
      checked: {
        true: 'border-accent-500 bg-accent-500',
        false: 'border-gray-300 bg-white',
      },
    },
    defaultVariants: {
      size: 'md',
      checked: false,
    },
  }
);

const indicatorVariants = cva('rounded-full bg-white', {
  variants: {
    size: {
      sm: 'h-1.5 w-1.5',
      md: 'h-2 w-2',
    },
  },
  defaultVariants: {
    size: 'md',
  },
});

type RadioVariantProps = Omit<VariantProps<typeof radioVariants>, 'checked'>;

type RadioButtonProps = Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onChange' | 'value'>;

export interface RadioItemProps extends RadioButtonProps, RadioVariantProps {
  value: string;
}

const RadioItem = React.forwardRef<HTMLButtonElement, RadioItemProps>(
  ({ className, size: sizeProp, value, disabled: disabledProp, ...props }, ref) => {
    const group = useRadioGroup();
    const checked = group.value === value;
    const disabled = disabledProp ?? group.disabled;
    const size = sizeProp ?? group.size ?? 'md';

    return (
      <button
        ref={ref}
        type="button"
        role="radio"
        aria-checked={checked}
        disabled={disabled}
        className={cn(radioVariants({ size, checked }), className)}
        onClick={() => {
          if (disabled) {
            return;
          }
          group.onValueChange(value);
        }}
        {...props}
      >
        {checked && <span aria-hidden="true" className={cn(indicatorVariants({ size }))} />}
      </button>
    );
  }
);

RadioItem.displayName = 'RadioItem';

export { RadioGroup, RadioItem, radioVariants };
export type { RadioSize };
