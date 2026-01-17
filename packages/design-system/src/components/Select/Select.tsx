import * as React from 'react';
import {
  useFloating,
  useClick,
  useDismiss,
  useRole,
  useInteractions,
  useListNavigation,
  FloatingPortal,
  FloatingFocusManager,
  offset,
  flip,
  size as floatingSize,
} from '@floating-ui/react';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '../../utils/cn.js';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends Omit<React.HTMLAttributes<HTMLButtonElement>, 'onChange'> {
  /** The currently selected value */
  value?: string;
  /** Callback when selection changes */
  onChange?: (value: string) => void;
  /** Available options */
  options: SelectOption[];
  /** Placeholder text when no value selected */
  placeholder?: string;
  /** Whether the select is disabled */
  disabled?: boolean;
  /** Size variant: 'sm' (28px/h-7) or 'md' (36px/h-9, default) */
  size?: 'sm' | 'md';
}

/**
 * A dropdown select component for choosing from predefined options.
 * Uses Floating UI for positioning and keyboard navigation.
 */
const Select = React.forwardRef<HTMLButtonElement, SelectProps>(
  (
    {
      value,
      onChange,
      options,
      placeholder = 'Select...',
      disabled = false,
      size = 'md',
      className,
      ...htmlProps
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const [activeIndex, setActiveIndex] = React.useState<number | null>(null);

    const listRef = React.useRef<(HTMLDivElement | null)[]>([]);

    const selectedOption = options.find((opt) => opt.value === value);

    const { refs, floatingStyles, context } = useFloating({
      open: isOpen,
      onOpenChange: setIsOpen,
      placement: 'bottom-start',
      strategy: 'fixed', // Use fixed positioning to prevent layout shift
      middleware: [
        offset(4),
        flip({ padding: 8 }),
        floatingSize({
          apply({ rects, elements }) {
            Object.assign(elements.floating.style, {
              minWidth: `${rects.reference.width}px`,
            });
          },
          padding: 8,
        }),
      ],
    });

    const click = useClick(context);
    const dismiss = useDismiss(context);
    const role = useRole(context, { role: 'listbox' });
    const listNav = useListNavigation(context, {
      listRef,
      activeIndex,
      onNavigate: setActiveIndex,
      loop: true,
    });

    const { getReferenceProps, getFloatingProps, getItemProps } = useInteractions([
      click,
      dismiss,
      role,
      listNav,
    ]);

    const handleSelect = (optionValue: string) => {
      onChange?.(optionValue);
      setIsOpen(false);
    };

    return (
      <>
        {/* Trigger button */}
        <button
          ref={(node) => {
            refs.setReference(node);
            if (typeof ref === 'function') {
              ref(node);
            } else if (ref) {
              ref.current = node;
            }
          }}
          type="button"
          disabled={disabled}
          className={cn(
            // Base styles
            'inline-flex items-center justify-between gap-2',
            'px-3 min-w-[120px]',
            // Size variants
            size === 'sm' ? 'h-7' : 'h-9',
            'text-sm text-foreground',
            'bg-background border border-border rounded',
            'transition-colors duration-150 ease-out',
            // Hover
            'hover:border-border',
            // Focus - use border color change instead of ring to avoid layout shift
            'focus:outline-none focus-visible:border-accent-500',
            // Disabled
            'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-border',
            // Open state
            isOpen && 'border-border',
            className
          )}
          {...htmlProps}
          {...getReferenceProps()}
        >
          <span className={cn(!selectedOption && 'text-muted-foreground')}>
            {selectedOption?.label ?? placeholder}
          </span>
          <ChevronDown
            className={cn(
              'w-3.5 h-3.5 text-muted-foreground transition-transform duration-150',
              isOpen && 'rotate-180'
            )}
          />
        </button>

        {/* Dropdown */}
        {isOpen && (
          <FloatingPortal>
            <FloatingFocusManager context={context} modal={false}>
              <div
                ref={refs.setFloating}
                style={floatingStyles}
                className={cn(
                  'z-50 py-1',
                  'bg-background border border-border rounded shadow-md',
                  'max-h-60 overflow-auto'
                )}
                {...getFloatingProps()}
              >
                {options.map((option, index) => {
                  const isSelected = option.value === value;
                  const isActive = activeIndex === index;

                  return (
                    <div
                      key={option.value}
                      ref={(node) => {
                        listRef.current[index] = node;
                      }}
                      role="option"
                      aria-selected={isSelected}
                      tabIndex={isActive ? 0 : -1}
                      className={cn(
                        'flex items-center justify-between gap-2',
                        'px-3 py-2 text-sm cursor-pointer',
                        'transition-colors duration-100',
                        isActive && 'bg-muted',
                        isSelected && 'text-accent-600 font-medium'
                      )}
                      {...getItemProps({
                        onClick: () => handleSelect(option.value),
                        onKeyDown: (e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            handleSelect(option.value);
                          }
                        },
                      })}
                    >
                      <span>{option.label}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-accent-500" />}
                    </div>
                  );
                })}
              </div>
            </FloatingFocusManager>
          </FloatingPortal>
        )}
      </>
    );
  }
);

Select.displayName = 'Select';

export { Select };
