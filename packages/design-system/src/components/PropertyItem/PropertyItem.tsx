import * as React from 'react';
import { cn } from '../../utils/cn.js';
import { Input } from '../Input/Input.js';

export type PropertyType = 'text' | 'select' | 'date' | 'number';

export interface PropertyItemProps {
  label: string;
  value?: string | number;
  type: PropertyType;
  options?: string[]; // For select type
  placeholder?: string;
  onSave?: (value: string | number) => void;
  error?: string;
  className?: string;
}

const PropertyItem = React.forwardRef<HTMLDivElement, PropertyItemProps>(
  ({ label, value, type, options = [], placeholder, onSave, error, className }, ref) => {
    const [isEditing, setIsEditing] = React.useState(false);
    const [editValue, setEditValue] = React.useState('');
    const inputRef = React.useRef<HTMLInputElement>(null);
    const selectRef = React.useRef<HTMLSelectElement>(null);

    // Initialize edit value when entering edit mode
    React.useEffect(() => {
      if (isEditing) {
        setEditValue(value?.toString() ?? '');
        // Focus input/select after render
        setTimeout(() => {
          if (type === 'select') {
            selectRef.current?.focus();
          } else {
            inputRef.current?.focus();
          }
        }, 0);
      }
    }, [isEditing, value, type]);

    const handleClick = () => {
      if (!isEditing) {
        setIsEditing(true);
      }
    };

    const handleSave = () => {
      if (onSave && editValue !== value?.toString()) {
        if (type === 'number') {
          const numValue = parseFloat(editValue);
          if (!isNaN(numValue)) {
            onSave(numValue);
          }
        } else {
          onSave(editValue);
        }
      }
      setIsEditing(false);
    };

    const handleCancel = () => {
      setEditValue(value?.toString() ?? '');
      setIsEditing(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleSave();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        handleCancel();
      }
    };

    const handleBlur = () => {
      handleSave();
    };

    const displayValue = value ?? placeholder ?? 'Not set';
    const isEmpty = !value;

    return (
      <div
        ref={ref}
        className={cn('flex items-start gap-3 group', className)}
        onClick={handleClick}
      >
        {/* Label column */}
        <div className="w-20 flex-shrink-0 pt-1.5">
          <span className="text-sm text-gray-600">{label}</span>
        </div>

        {/* Value column */}
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <div className="space-y-1">
              {type === 'select' ? (
                <select
                  ref={selectRef}
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onBlur={handleBlur}
                  className="w-full h-9 px-3 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent"
                >
                  <option value="">Select...</option>
                  {options.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              ) : (
                <Input
                  ref={inputRef}
                  type={type === 'date' ? 'date' : type === 'number' ? 'number' : 'text'}
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onBlur={handleBlur}
                  className={cn(error && 'border-red-500 focus:ring-red-500')}
                />
              )}
              {error && <p className="text-xs text-red-600">{error}</p>}
            </div>
          ) : (
            <div
              className={cn(
                'px-3 py-1.5 text-sm rounded-md cursor-pointer transition-colors min-h-[36px] flex items-center',
                'hover:bg-gray-50',
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
