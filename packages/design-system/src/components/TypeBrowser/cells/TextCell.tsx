import * as React from 'react';
import { cn } from '../../../utils/cn.js';
import { Input } from '../../Input/Input.js';

interface TextCellProps {
  value: string;
  onSave: (value: string) => void;
}

function TextCell({ value, onSave }: TextCellProps) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [editValue, setEditValue] = React.useState(value);
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
      setEditValue(value);
    }
  }, [value, isEditing]);

  const handleSave = () => {
    if (editValue !== value) {
      onSave(editValue);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      setEditValue(value);
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <Input
        ref={inputRef}
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
        'hover:bg-secondary'
      )}
      onClick={() => setIsEditing(true)}
    >
      {value || <span className="text-muted-foreground">-</span>}
    </div>
  );
}

TextCell.displayName = 'TextCell';

export { TextCell };
export type { TextCellProps };
