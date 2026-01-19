import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { CaretDown } from '@phosphor-icons/react/dist/ssr/CaretDown';
import { Check } from '@phosphor-icons/react/dist/ssr/Check';

import { cn } from '../../lib/utils.js';

type SelectSize = 'sm' | 'md' | 'lg';

// ============================================================================
// SelectTrigger - The button that opens the dropdown
// ============================================================================

const selectTriggerVariants = cva(
  [
    'inline-flex items-center justify-between gap-2 rounded-md border bg-white text-gray-900',
    'transition-colors duration-150 ease-out',
    'focus-visible:outline focus-visible:outline-1 focus-visible:outline-gray-300',
    'focus-visible:outline-offset-2',
    'disabled:pointer-events-none disabled:opacity-50',
    'data-[placeholder]:text-gray-400',
  ],
  {
    variants: {
      size: {
        sm: 'h-8 px-3 text-sm',
        md: 'h-9 px-3.5 text-sm',
        lg: 'h-10 px-4 text-base',
      },
      variant: {
        default: 'border-gray-200 hover:border-gray-300',
        error: 'border-error',
      },
    },
    defaultVariants: {
      size: 'md',
      variant: 'default',
    },
  }
);

export interface SelectTriggerProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof selectTriggerVariants> {
  placeholder?: string;
}

const SelectTrigger = React.forwardRef<HTMLButtonElement, SelectTriggerProps>(
  ({ className, size, variant, placeholder, children, ...props }, ref) => {
    const hasValue = React.Children.count(children) > 0;

    return (
      <button
        ref={ref}
        type="button"
        className={cn(selectTriggerVariants({ size, variant }), className)}
        data-placeholder={!hasValue ? '' : undefined}
        {...props}
      >
        <span className="truncate">{hasValue ? children : placeholder}</span>
        <CaretDown className="h-4 w-4 shrink-0 text-gray-400" weight="bold" />
      </button>
    );
  }
);

SelectTrigger.displayName = 'SelectTrigger';

// ============================================================================
// SelectContent - The dropdown container
// ============================================================================

const selectContentVariants = cva([
  'z-50 min-w-[8rem] overflow-hidden rounded-md border border-gray-200 bg-white p-1 shadow-md',
  'animate-in fade-in-0 zoom-in-95',
]);

export interface SelectContentProps extends React.HTMLAttributes<HTMLDivElement> {}

const SelectContent = React.forwardRef<HTMLDivElement, SelectContentProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div ref={ref} className={cn(selectContentVariants(), className)} {...props}>
        {children}
      </div>
    );
  }
);

SelectContent.displayName = 'SelectContent';

// ============================================================================
// SelectItem - Individual option
// ============================================================================

const selectItemVariants = cva([
  'relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm',
  'outline-none transition-colors',
  'hover:bg-gray-50 focus:bg-gray-50',
  'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
]);

export interface SelectItemProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
  disabled?: boolean;
  selected?: boolean;
}

const SelectItem = React.forwardRef<HTMLDivElement, SelectItemProps>(
  ({ className, children, disabled, selected, ...props }, ref) => {
    return (
      <div
        ref={ref}
        role="option"
        aria-selected={selected}
        data-disabled={disabled ? '' : undefined}
        className={cn(selectItemVariants(), className)}
        {...props}
      >
        <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
          {selected && <Check className="h-4 w-4" weight="bold" />}
        </span>
        <span className="truncate">{children}</span>
      </div>
    );
  }
);

SelectItem.displayName = 'SelectItem';

// ============================================================================
// SelectSeparator - Divider between groups
// ============================================================================

export interface SelectSeparatorProps extends React.HTMLAttributes<HTMLDivElement> {}

const SelectSeparator = React.forwardRef<HTMLDivElement, SelectSeparatorProps>(
  ({ className, ...props }, ref) => {
    return <div ref={ref} className={cn('-mx-1 my-1 h-px bg-gray-100', className)} {...props} />;
  }
);

SelectSeparator.displayName = 'SelectSeparator';

// ============================================================================
// SelectLabel - Group label
// ============================================================================

export interface SelectLabelProps extends React.HTMLAttributes<HTMLDivElement> {}

const SelectLabel = React.forwardRef<HTMLDivElement, SelectLabelProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('py-1.5 pl-8 pr-2 text-xs font-medium text-gray-500', className)}
        {...props}
      />
    );
  }
);

SelectLabel.displayName = 'SelectLabel';

export {
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectLabel,
  selectTriggerVariants,
};
export type { SelectSize };
