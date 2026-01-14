import * as React from 'react';
import { cn } from '../../../utils/cn.js';
import { Input } from '../../Input/Input.js';

interface DateCellProps {
  /** The current date value (ISO date string YYYY-MM-DD or empty) */
  value: string;
  /** Callback when date is saved */
  onSave: (value: string) => void;
  /** Whether to include time in the picker (datetime-local) */
  includeTime?: boolean;
}

/**
 * Format a date string for display
 */
function formatDateDisplay(value: string, includeTime: boolean): string {
  if (!value) return '';

  const date = new Date(value);
  if (isNaN(date.getTime())) return '';

  if (includeTime) {
    return date.toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  }

  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Convert a date string to the format expected by input[type="date"] or input[type="datetime-local"]
 */
function toInputFormat(value: string, includeTime: boolean): string {
  if (!value) return '';

  const date = new Date(value);
  if (isNaN(date.getTime())) return '';

  if (includeTime) {
    // datetime-local expects YYYY-MM-DDTHH:MM
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  // date expects YYYY-MM-DD
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * DateCell - Click-to-edit date cell for TypeBrowser
 *
 * Features:
 * - Click to open native date picker
 * - Auto-save on blur
 * - Escape to cancel
 * - Supports both date and datetime-local
 */
function DateCell({ value, onSave, includeTime = false }: DateCellProps) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [editValue, setEditValue] = React.useState(() => toInputFormat(value, includeTime));
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      // Open the date picker on focus (doesn't work in all browsers but nice when it does)
      inputRef.current?.showPicker?.();
    }
  }, [isEditing]);

  // Sync with external value changes
  React.useEffect(() => {
    if (!isEditing) {
      setEditValue(toInputFormat(value, includeTime));
    }
  }, [value, isEditing, includeTime]);

  const handleSave = () => {
    // Convert input format back to ISO string
    const newValue = editValue ? new Date(editValue).toISOString() : '';
    if (newValue !== value) {
      onSave(newValue);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      setEditValue(toInputFormat(value, includeTime));
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <Input
        ref={inputRef}
        type={includeTime ? 'datetime-local' : 'date'}
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        className={cn('h-7 -my-1', includeTime ? 'w-52' : 'w-36')}
      />
    );
  }

  const displayValue = formatDateDisplay(value, includeTime);

  return (
    <div
      className={cn(
        'truncate cursor-text px-1 -mx-1 rounded min-h-[1.5rem] flex items-center',
        'hover:bg-gray-100'
      )}
      onClick={() => setIsEditing(true)}
    >
      {displayValue || <span className="text-gray-400">–</span>}
    </div>
  );
}

DateCell.displayName = 'DateCell';

export { DateCell };
export type { DateCellProps };
