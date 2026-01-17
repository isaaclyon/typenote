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
import { ChevronDown, GripVertical, MoreHorizontal, Pencil, Trash2, Palette } from 'lucide-react';
import { cn } from '../../utils/cn.js';
import { Checkbox } from '../Checkbox/Checkbox.js';
import {
  OPTION_COLORS,
  getOptionColorClasses,
  getSwatchColorClass,
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
  /** Callback when options are mutated (edit, delete, color change) */
  onOptionsChange?: (options: MultiselectOption[]) => void;
  /** Placeholder text when no values selected */
  placeholder?: string;
  /** Whether the component is disabled */
  disabled?: boolean;
  /** Additional class name for the trigger */
  className?: string;
}

/** Props for the option actions menu */
interface OptionActionsMenuProps {
  option: MultiselectOption;
  onEdit: () => void;
  onDelete: () => void;
  onColorChange: (color: OptionColor, variant: OptionColorVariant) => void;
}

/** Actions menu with edit/delete/color options */
const OptionActionsMenu = ({ option, onEdit, onDelete, onColorChange }: OptionActionsMenuProps) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [showColorPicker, setShowColorPicker] = React.useState(false);

  const { refs, floatingStyles, context } = useFloating({
    open: isOpen,
    onOpenChange: (open) => {
      setIsOpen(open);
      if (!open) setShowColorPicker(false);
    },
    placement: 'bottom-end',
    middleware: [offset(4), flip({ padding: 8 })],
  });

  const click = useClick(context);
  const dismiss = useDismiss(context);
  const role = useRole(context, { role: 'menu' });

  const { getReferenceProps, getFloatingProps } = useInteractions([click, dismiss, role]);

  const handleEdit = () => {
    setIsOpen(false);
    onEdit();
  };

  const handleDelete = () => {
    setIsOpen(false);
    onDelete();
  };

  const handleColorSelect = (color: OptionColor, variant: OptionColorVariant) => {
    setIsOpen(false);
    setShowColorPicker(false);
    onColorChange(color, variant);
  };

  const colorKeys = Object.keys(OPTION_COLORS) as OptionColor[];

  return (
    <>
      <button
        ref={refs.setReference}
        type="button"
        className={cn(
          'flex-shrink-0',
          'opacity-0 group-hover:opacity-100',
          'p-1 rounded',
          'text-muted-foreground hover:text-foreground hover:bg-muted',
          'transition-all duration-150',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          isOpen && 'opacity-100'
        )}
        onClick={(e) => e.stopPropagation()}
        {...getReferenceProps()}
      >
        <MoreHorizontal className="w-4 h-4" />
      </button>

      {isOpen && (
        <FloatingPortal>
          <div
            ref={refs.setFloating}
            style={floatingStyles}
            className={cn(
              'z-[60]',
              'bg-background border border-border rounded shadow-lg',
              'py-1 min-w-[140px]'
            )}
            onClick={(e) => e.stopPropagation()}
            {...getFloatingProps()}
          >
            {!showColorPicker ? (
              <>
                <button
                  type="button"
                  className={cn(
                    'w-full px-3 py-1.5 text-sm text-left',
                    'flex items-center gap-2',
                    'hover:bg-muted transition-colors'
                  )}
                  onClick={handleEdit}
                >
                  <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
                  <span>Edit</span>
                </button>

                <button
                  type="button"
                  className={cn(
                    'w-full px-3 py-1.5 text-sm text-left',
                    'flex items-center gap-2',
                    'hover:bg-muted transition-colors'
                  )}
                  onClick={() => setShowColorPicker(true)}
                >
                  <Palette className="w-3.5 h-3.5 text-muted-foreground" />
                  <span>Change color</span>
                </button>

                <div className="h-px bg-secondary my-1" />

                <button
                  type="button"
                  className={cn(
                    'w-full px-3 py-1.5 text-sm text-left',
                    'flex items-center gap-2',
                    'text-red-600 hover:bg-red-50 transition-colors'
                  )}
                  onClick={handleDelete}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </>
            ) : (
              <div className="px-2 py-1">
                <p className="text-xs text-muted-foreground mb-2 px-1">Select color</p>
                <div className="grid grid-cols-6 gap-1.5">
                  {colorKeys.map((color) => (
                    <React.Fragment key={color}>
                      {/* Light variant */}
                      <button
                        type="button"
                        className={cn(
                          'w-6 h-6 rounded-full',
                          'ring-offset-1 hover:ring-2 hover:ring-gray-400',
                          'transition-all duration-100',
                          getSwatchColorClass(color, 'light'),
                          option.color === color &&
                            option.variant === 'light' &&
                            'ring-2 ring-gray-500'
                        )}
                        onClick={() => handleColorSelect(color, 'light')}
                        title={`${color} light`}
                      />
                    </React.Fragment>
                  ))}
                  {colorKeys.map((color) => (
                    <React.Fragment key={`${color}-regular`}>
                      {/* Regular variant */}
                      <button
                        type="button"
                        className={cn(
                          'w-6 h-6 rounded-full',
                          'ring-offset-1 hover:ring-2 hover:ring-gray-400',
                          'transition-all duration-100',
                          getSwatchColorClass(color, 'regular'),
                          option.color === color &&
                            option.variant === 'regular' &&
                            'ring-2 ring-gray-500'
                        )}
                        onClick={() => handleColorSelect(color, 'regular')}
                        title={`${color} regular`}
                      />
                    </React.Fragment>
                  ))}
                </div>
              </div>
            )}
          </div>
        </FloatingPortal>
      )}
    </>
  );
};

interface SortableItemProps {
  option: MultiselectOption;
  isSelected: boolean;
  isActive: boolean;
  onToggle: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onColorChange?: (color: OptionColor, variant: OptionColorVariant) => void;
  isDraggingDisabled: boolean;
  listRef: React.RefObject<(HTMLDivElement | null)[]>;
  index: number;
  getItemProps: (userProps?: React.HTMLAttributes<HTMLElement>) => Record<string, unknown>;
}

const SortableItem = ({
  option,
  isSelected,
  isActive,
  onToggle,
  onEdit,
  onDelete,
  onColorChange,
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
        'group flex items-center gap-2',
        'px-2 py-2 cursor-pointer',
        'transition-colors duration-100',
        'bg-background',
        isActive && 'bg-muted',
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
        <GripVertical className="w-3.5 h-3.5 text-muted-foreground" />
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

      {/* Actions menu */}
      {onEdit && onDelete && onColorChange && (
        <OptionActionsMenu
          option={option}
          onEdit={onEdit}
          onDelete={onDelete}
          onColorChange={onColorChange}
        />
      )}
    </div>
  );
};

/**
 * A dropdown multiselect component with search, checkboxes, and drag-and-drop reordering.
 * Uses Floating UI for positioning, keyboard navigation, and @dnd-kit for sortable.
 */
const MultiselectDropdown = React.forwardRef<HTMLButtonElement, MultiselectDropdownProps>(
  (
    {
      value,
      onChange,
      options,
      onReorder,
      onOptionsChange,
      placeholder = 'Select...',
      disabled = false,
      className,
    },
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

    // Option mutation handlers (for actions menu)
    const handleEditOption = React.useCallback((optionValue: string) => {
      // For now, just log - edit inline would need more state
      // TODO: Implement inline editing with input field
      console.log('Edit option:', optionValue);
    }, []);

    const handleDeleteOption = React.useCallback(
      (optionValue: string) => {
        if (!onOptionsChange) return;
        const newOptions = options.filter((opt) => opt.value !== optionValue);
        onOptionsChange(newOptions);
        // Also remove from selection if selected
        if (value.includes(optionValue)) {
          onChange(value.filter((v) => v !== optionValue));
        }
      },
      [options, onOptionsChange, value, onChange]
    );

    const handleColorChangeOption = React.useCallback(
      (optionValue: string, color: OptionColor, variant: OptionColorVariant) => {
        if (!onOptionsChange) return;
        const newOptions = options.map((opt) =>
          opt.value === optionValue ? { ...opt, color, variant } : opt
        );
        onOptionsChange(newOptions);
      },
      [options, onOptionsChange]
    );

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
            'bg-background border border-border rounded',
            'transition-colors duration-150 ease-out',
            'hover:border-border',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2',
            'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-border',
            isOpen && 'border-border',
            value.length === 0 && 'text-muted-foreground',
            className
          )}
          {...getReferenceProps()}
        >
          <span className="truncate">{displayText}</span>
          <ChevronDown
            className={cn(
              'w-3.5 h-3.5 text-muted-foreground transition-transform duration-150 flex-shrink-0',
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
                  'bg-background border border-border rounded shadow-md',
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
                      'bg-muted border border-border rounded',
                      'placeholder:text-muted-foreground',
                      'focus:outline-none focus:border-border focus:bg-background',
                      'transition-colors duration-150'
                    )}
                  />
                </div>

                {/* Options list */}
                <div className="overflow-y-auto flex-1">
                  {filteredOptions.length === 0 ? (
                    <div className="px-3 py-4 text-center text-sm text-muted-foreground">
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
                            {...(onOptionsChange && {
                              onEdit: () => handleEditOption(option.value),
                              onDelete: () => handleDeleteOption(option.value),
                              onColorChange: (color, variant) =>
                                handleColorChangeOption(option.value, color, variant),
                            })}
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
