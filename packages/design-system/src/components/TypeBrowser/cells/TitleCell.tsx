import * as React from 'react';
import { ArrowSquareOutIcon } from '@phosphor-icons/react/dist/csr/ArrowSquareOut';
import { cn } from '../../../utils/cn.js';
import { Input } from '../../Input/Input.js';

interface TitleCellProps {
  /** The title text to display */
  value: string;
  /** Called when the title is edited and saved */
  onSave: (value: string) => void;
  /** Called when the "Open" button is clicked */
  onOpen: () => void;
}

/**
 * TitleCell - A specialized cell for the primary identifier column.
 *
 * Features:
 * - Text display with truncation
 * - "Open" button appears on hover (right side)
 * - Click text to edit inline
 * - Click "Open" button to navigate
 */
function TitleCell({ value, onSave, onOpen }: TitleCellProps) {
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

  const handleOpenClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onOpen();
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
    <div className="group relative flex items-center min-h-[1.5rem]">
      {/* Title text - clickable to edit */}
      <div
        className={cn(
          'truncate cursor-text px-1 -mx-1 rounded flex-1 min-w-0',
          'hover:bg-secondary transition-colors duration-150'
        )}
        onClick={() => setIsEditing(true)}
      >
        {value || <span className="text-muted-foreground">-</span>}
      </div>

      {/* Open button - appears on hover */}
      <button
        type="button"
        onClick={handleOpenClick}
        className={cn(
          'flex-shrink-0 ml-2 p-1 rounded',
          'text-muted-foreground hover:text-foreground hover:bg-secondary',
          'opacity-0 group-hover:opacity-100',
          'transition-opacity duration-150 ease-out',
          'focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:ring-offset-1'
        )}
        aria-label="Open"
        title="Open"
      >
        <ArrowSquareOutIcon className="w-4 h-4" weight="regular" />
      </button>
    </div>
  );
}

TitleCell.displayName = 'TitleCell';

export { TitleCell };
export type { TitleCellProps };
