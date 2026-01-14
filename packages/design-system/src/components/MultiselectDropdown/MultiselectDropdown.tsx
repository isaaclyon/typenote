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
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ChevronDown, GripVertical } from 'lucide-react';
import { cn } from '../../utils/cn.js';
import { Checkbox } from '../Checkbox/Checkbox.js';
import {
  getOptionColorClasses,
  type OptionColor,
  type OptionColorVariant,
} from '../../constants/optionColors.js';

export interface MultiselectOption {
  value: string;
  label: string;
  color?: OptionColor;
  variant?: OptionColorVariant;
}

export interface MultiselectDropdownProps {
  /** Currently selected values */
  value: string[];
  /** Callback when selection changes */
  onChange: (value: string[]) => void;
  /** Available options */
  options: MultiselectOption[];
  /** Callback when options are reordered via drag-and-drop */
  onReorder?: (options: MultiselectOption[]) => void;
  /** Placeholder text when no values selected */
  placeholder?: string;
  /** Whether the component is disabled */
  disabled?: boolean;
  /** Additional class name for the trigger */
  className?: string;
}

interface SortableItemProps {
  option: MultiselectOption;
  isSelected: boolean;
  isActive: boolean;
  onToggle: () => void;
  isDraggingDisabled: boolean;
  listRef: React.MutableRefObject<(HTMLDivElement | null)[]>;
  index: number;
  getItemProps: (userProps?: React.HTMLAttributes<HTMLElement>) => Record<string, unknown>;
}

const SortableItem = ({
  option,
  isSelected,
  isActive,
  onToggle,
  isDraggingDisabled,
  listRef,
  index,
  getItemProps,
}: SortableItemProps) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: option.value,
    disabled: isDraggingDisabled,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={(node) => {
        setNodeRef(node);
        listRef.current[index] = node;
      }}
      style={style}
      role="option"
      aria-selected={isSelected}
      tabIndex={isActive ? 0 : -1}
      className={cn(
        'flex items-center gap-2',
        'px-2 py-2 cursor-pointer',
        'transition-colors duration-100',
        'bg-white',
        isActive && 'bg-gray-50',
        isDragging && 'opacity-50 shadow-lg z-10'
      )}
      {...getItemProps({
        onClick: onToggle,
        onKeyDown: (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onToggle();
          }
        },
      })}
    >
      {/* Drag handle */}
      <div
        {...attributes}
        {...listeners}
        className={cn(
          'flex items-center justify-center',
          'touch-none',
          isDraggingDisabled
            ? 'cursor-not-allowed opacity-30'
            : 'cursor-grab active:cursor-grabbing'
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <GripVertical className="w-3.5 h-3.5 text-gray-300" />
      </div>

      {/* Colored pill label */}
      <span className={cn('flex-1 min-w-0', 'flex items-center')}>
        <span
          className={cn(
            'px-2 py-0.5 rounded text-sm font-medium truncate',
            getOptionColorClasses(option.color, option.variant)
          )}
        >
          {option.label}
        </span>
      </span>

      {/* Checkbox */}
      <Checkbox
        checked={isSelected}
        onChange={(e) => {
          e.stopPropagation();
          onToggle();
        }}
        className="flex-shrink-0"
      />
    </div>
  );
};

/**
 * A dropdown multiselect component with search, checkboxes, and drag-and-drop reordering.
 * Uses Floating UI for positioning, keyboard navigation, and @dnd-kit for sortable.
 */
const MultiselectDropdown = React.forwardRef<HTMLButtonElement, MultiselectDropdownProps>(
  (
    { value, onChange, options, onReorder, placeholder = 'Select...', disabled = false, className },
    ref
  ) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const [activeIndex, setActiveIndex] = React.useState<number | null>(null);
    const [filterQuery, setFilterQuery] = React.useState('');

    const listRef = React.useRef<(HTMLDivElement | null)[]>([]);
    const filterInputRef = React.useRef<HTMLInputElement>(null);

    // DnD sensors
    const sensors = useSensors(
      useSensor(PointerSensor, {
        activationConstraint: {
          distance: 5, // 5px movement before drag starts
        },
      }),
      useSensor(KeyboardSensor, {
        coordinateGetter: sortableKeyboardCoordinates,
      })
    );

    // Filter options based on search query
    const filteredOptions = React.useMemo(() => {
      if (!filterQuery) return options;
      const lowerQuery = filterQuery.toLowerCase();
      return options.filter((opt) => opt.label.toLowerCase().includes(lowerQuery));
    }, [options, filterQuery]);

    // Disable drag when filtering (reordering filtered list doesn't make sense)
    const isDraggingDisabled = filterQuery.length > 0 || !onReorder;

    // Reset filter when dropdown closes
    React.useEffect(() => {
      if (!isOpen) {
        setFilterQuery('');
        setActiveIndex(null);
      }
    }, [isOpen]);

    // Focus filter input when dropdown opens
    React.useEffect(() => {
      if (isOpen) {
        setTimeout(() => filterInputRef.current?.focus(), 0);
      }
    }, [isOpen]);

    const { refs, floatingStyles, context } = useFloating({
      open: isOpen,
      onOpenChange: setIsOpen,
      placement: 'bottom-start',
      middleware: [
        offset(4),
        flip({ padding: 8 }),
        floatingSize({
          apply({ rects, elements }) {
            Object.assign(elements.floating.style, {
              minWidth: `${Math.max(rects.reference.width, 200)}px`,
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
      focusItemOnOpen: false,
    });

    const { getReferenceProps, getFloatingProps, getItemProps } = useInteractions([
      click,
      dismiss,
      role,
      listNav,
    ]);

    const handleToggle = (optionValue: string) => {
      const newValue = value.includes(optionValue)
        ? value.filter((v) => v !== optionValue)
        : [...value, optionValue];
      onChange(newValue);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && activeIndex !== null && filteredOptions[activeIndex]) {
        e.preventDefault();
        handleToggle(filteredOptions[activeIndex].value);
      }
    };

    const handleDragEnd = (event: DragEndEvent) => {
      const { active, over } = event;

      if (over && active.id !== over.id && onReorder) {
        const oldIndex = options.findIndex((opt) => opt.value === active.id);
        const newIndex = options.findIndex((opt) => opt.value === over.id);
        const newOptions = arrayMove(options, oldIndex, newIndex);
        onReorder(newOptions);
      }
    };

    // Display text for the trigger button
    const displayText = React.useMemo(() => {
      if (value.length === 0) return placeholder;
      if (value.length === 1) {
        const opt = options.find((o) => o.value === value[0]);
        return opt?.label ?? value[0];
      }
      return `${value.length} selected`;
    }, [value, options, placeholder]);

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
            'inline-flex items-center justify-between gap-2',
            'w-full px-3 h-7',
            'text-sm text-left',
            'bg-white border border-gray-200 rounded',
            'transition-colors duration-150 ease-out',
            'hover:border-gray-300',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2',
            'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-gray-200',
            isOpen && 'border-gray-300',
            value.length === 0 && 'text-gray-400',
            className
          )}
          {...getReferenceProps()}
        >
          <span className="truncate">{displayText}</span>
          <ChevronDown
            className={cn(
              'w-3.5 h-3.5 text-gray-400 transition-transform duration-150 flex-shrink-0',
              isOpen && 'rotate-180'
            )}
          />
        </button>

        {/* Dropdown */}
        {isOpen && (
          <FloatingPortal>
            <FloatingFocusManager context={context} modal={false} initialFocus={filterInputRef}>
              <div
                ref={refs.setFloating}
                style={floatingStyles}
                className={cn(
                  'z-50',
                  'bg-white border border-gray-200 rounded shadow-md',
                  'max-h-72 overflow-hidden flex flex-col'
                )}
                {...getFloatingProps()}
              >
                {/* Search input */}
                <div className="p-2 border-b border-gray-100">
                  <input
                    ref={filterInputRef}
                    type="text"
                    value={filterQuery}
                    onChange={(e) => setFilterQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Search or Create"
                    className={cn(
                      'w-full px-3 py-2 text-sm',
                      'bg-gray-50 border border-gray-200 rounded',
                      'placeholder:text-gray-400',
                      'focus:outline-none focus:border-gray-300 focus:bg-white',
                      'transition-colors duration-150'
                    )}
                  />
                </div>

                {/* Options list */}
                <div className="overflow-y-auto flex-1">
                  {filteredOptions.length === 0 ? (
                    <div className="px-3 py-4 text-center text-sm text-gray-400">
                      No options found
                    </div>
                  ) : (
                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={handleDragEnd}
                    >
                      <SortableContext
                        items={filteredOptions.map((opt) => opt.value)}
                        strategy={verticalListSortingStrategy}
                      >
                        {filteredOptions.map((option, index) => (
                          <SortableItem
                            key={option.value}
                            option={option}
                            isSelected={value.includes(option.value)}
                            isActive={activeIndex === index}
                            onToggle={() => handleToggle(option.value)}
                            isDraggingDisabled={isDraggingDisabled}
                            listRef={listRef}
                            index={index}
                            getItemProps={getItemProps}
                          />
                        ))}
                      </SortableContext>
                    </DndContext>
                  )}
                </div>
              </div>
            </FloatingFocusManager>
          </FloatingPortal>
        )}
      </>
    );
  }
);

MultiselectDropdown.displayName = 'MultiselectDropdown';

export { MultiselectDropdown };
