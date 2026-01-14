import * as React from 'react';
import { cn } from '../../../utils/cn.js';
import { Input } from '../../Input/Input.js';

interface NumberCellProps {
  value: number | null;
  onSave: (value: number | null) => void;
}

function NumberCell({ value, onSave }: NumberCellProps) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [editValue, setEditValue] = React.useState(value?.toString() ?? '');
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  // Sync with external value changes
  React.useEffect(() => {
    if (!isEditing) {
      setEditValue(value?.toString() ?? '');
    }
  }, [value, isEditing]);

  const handleSave = () => {
    const trimmed = editValue.trim();

    // Empty input saves as null
    if (trimmed === '') {
      if (value !== null) {
        onSave(null);
      }
    } else {
      const parsed = parseFloat(trimmed);
      // Only save if it's a valid number and different from current value
      if (!isNaN(parsed) && parsed !== value) {
        onSave(parsed);
      }
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      setEditValue(value?.toString() ?? '');
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <Input
        ref={inputRef}
        type="number"
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        className="h-7 -my-1"
      />
    );
  }

  return (
    <div
      className={cn(
        'truncate cursor-text px-1 -mx-1 rounded min-h-[1.5rem] flex items-center',
        'hover:bg-gray-100'
      )}
      onClick={() => setIsEditing(true)}
    >
      {value !== null && value !== undefined ? (
        String(value)
      ) : (
        <span className="text-gray-400">-</span>
      )}
    </div>
  );
}

NumberCell.displayName = 'NumberCell';

export { NumberCell };
export type { NumberCellProps };
