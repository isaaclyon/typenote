import * as React from 'react';
import { cn } from '../../utils/cn.js';
import { Input } from '../Input/Input.js';
import { Checkbox } from '../Checkbox/Checkbox.js';
import { Select } from '../Select/Select.js';
import { X } from 'lucide-react';
import { MultiselectDropdown } from '../MultiselectDropdown/MultiselectDropdown.js';

export type PropertyType =
  | 'text'
  | 'number'
  | 'boolean'
  | 'date'
  | 'datetime'
  | 'select'
  | 'multiselect'
  | 'ref'
  | 'refs';

export interface RefItem {
  id: string;
  title: string;
}

export interface PropertyItemProps {
  label: string;
  value?: string | number | boolean | string[] | undefined;
  type: PropertyType;
  options?: string[]; // For select/multiselect types
  placeholder?: string;
  onSave?: (value: string | number | boolean | string[]) => void;
  onOptionsReorder?: (options: string[]) => void; // For multiselect type - reorder options via drag
  onSearch?: (query: string) => Promise<RefItem[]>; // For ref/refs types
  resolveRefs?: (ids: string[]) => Promise<RefItem[]>; // Resolve IDs to titles for display
  error?: string;
  className?: string;
}

const PropertyItem = React.forwardRef<HTMLDivElement, PropertyItemProps>(
  (
    {
      label,
      value,
      type,
      options = [],
      placeholder,
      onSave,
      onOptionsReorder,
      onSearch,
      resolveRefs,
      error,
      className,
    },
    ref
  ) => {
    const [isEditing, setIsEditing] = React.useState(false);
    const [editValue, setEditValue] = React.useState<string | string[]>('');
    const [searchQuery, setSearchQuery] = React.useState('');
    const [searchResults, setSearchResults] = React.useState<RefItem[]>([]);
    const [resolvedRefs, setResolvedRefs] = React.useState<Map<string, string>>(new Map());
    const inputRef = React.useRef<HTMLInputElement>(null);
    const datetimeContainerRef = React.useRef<HTMLDivElement>(null);

    // Initialize edit value when entering edit mode
    React.useEffect(() => {
      if (isEditing) {
        if (type === 'multiselect' || type === 'refs') {
          setEditValue(Array.isArray(value) ? value : []);
        } else {
          setEditValue(value?.toString() ?? '');
        }
        // Focus input after render (select handles its own focus via click)
        setTimeout(() => {
          if (type !== 'boolean' && type !== 'select' && type !== 'multiselect') {
            inputRef.current?.focus();
          }
        }, 0);
      }
    }, [isEditing, value, type]);

    // Handle search for ref/refs types
    React.useEffect(() => {
      if ((type === 'ref' || type === 'refs') && isEditing && searchQuery && onSearch) {
        const timeoutId = setTimeout(() => {
          onSearch(searchQuery).then(setSearchResults);
        }, 200);
        return () => clearTimeout(timeoutId);
      }
    }, [searchQuery, type, isEditing, onSearch]);

    // Resolve ref IDs to titles for display
    React.useEffect(() => {
      if ((type === 'ref' || type === 'refs') && resolveRefs) {
        const ids = type === 'ref' ? (value ? [value as string] : []) : ((value as string[]) ?? []);
        if (ids.length > 0) {
          resolveRefs(ids).then((items) => {
            const newMap = new Map<string, string>();
            items.forEach((item) => newMap.set(item.id, item.title));
            setResolvedRefs(newMap);
          });
        } else {
          setResolvedRefs(new Map());
        }
      }
    }, [type, value, resolveRefs]);

    const handleClick = () => {
      if (!isEditing && type !== 'boolean' && type !== 'multiselect') {
        setIsEditing(true);
      }
    };

    const handleSave = () => {
      if (!onSave) {
        setIsEditing(false);
        return;
      }

      if (type === 'number') {
        const numValue = parseFloat(editValue as string);
        if (!isNaN(numValue)) {
          onSave(numValue);
        }
      } else if (type === 'multiselect' || type === 'refs') {
        onSave(editValue as string[]);
      } else {
        onSave(editValue as string);
      }

      setIsEditing(false);
      setSearchQuery('');
      setSearchResults([]);
    };

    const handleCancel = () => {
      if (type === 'multiselect' || type === 'refs') {
        setEditValue(Array.isArray(value) ? value : []);
      } else {
        setEditValue(value?.toString() ?? '');
      }
      setIsEditing(false);
      setSearchQuery('');
      setSearchResults([]);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && type !== 'multiselect' && type !== 'refs') {
        e.preventDefault();
        handleSave();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        handleCancel();
      }
    };

    const handleBlur = () => {
      // Delay to allow clicking on search results
      if (type === 'ref' || type === 'refs') {
        setTimeout(() => handleSave(), 150);
      } else {
        handleSave();
      }
    };

    // Special blur handler for datetime - only saves when focus leaves both inputs
    const handleDatetimeBlur = (e: React.FocusEvent) => {
      // Check if focus is moving to another element within the datetime container
      const relatedTarget = e.relatedTarget as HTMLElement | null;
      if (relatedTarget && datetimeContainerRef.current?.contains(relatedTarget)) {
        // Focus is moving between date and time inputs, don't save yet
        return;
      }
      // Focus is leaving the datetime area entirely, save now
      handleSave();
    };

    const handleBooleanChange = (checked: boolean) => {
      if (onSave) {
        onSave(checked);
      }
    };

    const handleRefSelect = (refId: string, refTitle: string) => {
      if (type === 'ref') {
        setEditValue(refId);
        setSearchQuery(refTitle);
        setTimeout(() => handleSave(), 50);
      } else if (type === 'refs') {
        const current = Array.isArray(editValue) ? editValue : [];
        if (!current.includes(refId)) {
          setEditValue([...current, refId]);
        }
        setSearchQuery('');
        setSearchResults([]);
      }
    };

    const handleRefsRemove = (refId: string) => {
      const current = Array.isArray(editValue) ? editValue : [];
      setEditValue(current.filter((v) => v !== refId));
    };

    // Format display value
    const getDisplayValue = () => {
      if (type === 'boolean') {
        return value ? 'Yes' : 'No';
      }
      if (type === 'ref') {
        // Show resolved title for single ref, fall back to ID if not resolved
        const id = value as string | undefined;
        if (!id) return placeholder ?? 'Not set';
        return resolvedRefs.get(id) ?? id;
      }
      if (type === 'refs') {
        // Show resolved titles for multiple refs
        const arr = Array.isArray(value) ? value : [];
        if (arr.length === 0) return placeholder ?? 'None selected';
        const titles = arr.map((id) => resolvedRefs.get(id) ?? id);
        return titles.join(', ');
      }
      if (type === 'multiselect') {
        const arr = Array.isArray(value) ? value : [];
        return arr.length > 0 ? arr.join(', ') : (placeholder ?? 'None selected');
      }
      if (type === 'datetime' && typeof value === 'string') {
        // Format datetime display (YYYY-MM-DDTHH:mm -> "Jan 12, 2026 at 2:30 PM")
        try {
          const date = new Date(value);
          return date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
          });
        } catch {
          return value;
        }
      }
      return value ?? placeholder ?? 'Not set';
    };

    const displayValue = getDisplayValue();
    const isEmpty = !value || (Array.isArray(value) && value.length === 0);

    return (
      <div
        ref={ref}
        className={cn('flex items-start gap-3 group', className)}
        onClick={handleClick}
      >
        {/* Label column */}
        <div className="w-20 flex-shrink-0 flex items-center h-7">
          <span className="text-sm text-gray-600">{label}</span>
        </div>

        {/* Value column */}
        <div className="flex-1 min-w-0">
          {/* Boolean type - always show checkbox */}
          {type === 'boolean' ? (
            <div className="flex items-center h-7">
              <Checkbox
                checked={value === true}
                onChange={(e) => handleBooleanChange(e.target.checked)}
              />
            </div>
          ) : /* Multiselect type - dropdown manages its own state */
          type === 'multiselect' ? (
            <MultiselectDropdown
              value={Array.isArray(value) ? value : []}
              onChange={(newValue) => {
                if (onSave) {
                  onSave(newValue);
                }
              }}
              options={options.map((opt) => ({ value: opt, label: opt }))}
              {...(onOptionsReorder && {
                onReorder: (reorderedOptions) =>
                  onOptionsReorder(reorderedOptions.map((opt) => opt.value)),
              })}
              placeholder={placeholder ?? 'Select...'}
            />
          ) : isEditing ? (
            <div className="space-y-1">
              {/* DateTime type - date + time inputs */}
              {type === 'datetime' ? (
                <div ref={datetimeContainerRef} className="flex gap-2">
                  <Input
                    ref={inputRef}
                    type="date"
                    value={(editValue as string).split('T')[0] ?? ''}
                    onChange={(e) => {
                      const time = (editValue as string).split('T')[1] ?? '00:00';
                      setEditValue(`${e.target.value}T${time}`);
                    }}
                    onKeyDown={handleKeyDown}
                    onBlur={handleDatetimeBlur}
                    className={cn('flex-1 h-7', error && 'border-red-500 focus:ring-red-500')}
                  />
                  <Input
                    type="time"
                    value={(editValue as string).split('T')[1] ?? ''}
                    onChange={(e) => {
                      const date = (editValue as string).split('T')[0] ?? '';
                      setEditValue(`${date}T${e.target.value}`);
                    }}
                    onKeyDown={handleKeyDown}
                    onBlur={handleDatetimeBlur}
                    className={cn('w-32 h-7', error && 'border-red-500 focus:ring-red-500')}
                  />
                </div>
              ) : /* Select type */
              type === 'select' ? (
                <Select
                  value={editValue as string}
                  onChange={(newValue) => {
                    setEditValue(newValue);
                    // Save immediately on select (same behavior as before)
                    if (onSave) {
                      onSave(newValue);
                    }
                    setIsEditing(false);
                  }}
                  options={options.map((opt) => ({ value: opt, label: opt }))}
                  placeholder="Select..."
                  size="sm"
                />
              ) : /* Ref/Refs type - object search */
              type === 'ref' || type === 'refs' ? (
                <div className="space-y-2">
                  {/* Show selected refs */}
                  {type === 'refs' && Array.isArray(editValue) && editValue.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {editValue.map((refId) => (
                        <span
                          key={refId}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded text-xs"
                        >
                          {resolvedRefs.get(refId) ?? refId}
                          <button
                            type="button"
                            onClick={() => handleRefsRemove(refId)}
                            className="hover:text-red-600"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Search input */}
                  <div className="relative">
                    <Input
                      ref={inputRef}
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={handleKeyDown}
                      onBlur={handleBlur}
                      placeholder="Search objects..."
                      className={cn('h-7', error && 'border-red-500 focus:ring-red-500')}
                    />

                    {/* Search results dropdown */}
                    {searchResults.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto">
                        {searchResults.map((result) => (
                          <button
                            key={result.id}
                            type="button"
                            onMouseDown={() => handleRefSelect(result.id, result.title)}
                            className="w-full px-3 py-2 text-sm text-left hover:bg-gray-50 flex items-center gap-2"
                          >
                            <span className="truncate">{result.title}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* Default text/number/date input */
                <Input
                  ref={inputRef}
                  type={type === 'date' ? 'date' : type === 'number' ? 'number' : 'text'}
                  value={editValue as string}
                  onChange={(e) => setEditValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onBlur={handleBlur}
                  className={cn('h-7', error && 'border-red-500 focus:ring-red-500')}
                />
              )}
              {error && <p className="text-xs text-red-600">{error}</p>}
            </div>
          ) : (
            <div
              className={cn(
                'px-3 py-1 text-sm rounded-md cursor-pointer transition-colors h-7 flex items-center',
                'hover:bg-gray-50',
                'truncate',
                isEmpty && 'text-gray-400'
              )}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setIsEditing(true);
                }
              }}
            >
              {displayValue}
            </div>
          )}
        </div>
      </div>
    );
  }
);

PropertyItem.displayName = 'PropertyItem';

export { PropertyItem };
