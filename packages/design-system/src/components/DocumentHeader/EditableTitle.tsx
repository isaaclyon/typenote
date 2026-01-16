import * as React from 'react';
import { cn } from '../../utils/cn.js';
import type { EditableTitleProps } from './types.js';

/**
 * EditableTitle - Inline editable title for document headers.
 *
 * Follows the TitleCell pattern from TypeBrowser:
 * - Display mode: h1 with subtle hover state
 * - Edit mode: input on click, auto-focus + select
 * - Save: blur or Enter
 * - Cancel: Escape reverts to original
 */
export function EditableTitle({
  value,
  onChange,
  placeholder = 'Untitled',
  disabled = false,
}: EditableTitleProps): React.ReactElement {
  const [isEditing, setIsEditing] = React.useState(false);
  const [editValue, setEditValue] = React.useState(value);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Focus and select when entering edit mode
  React.useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  // Sync with external value changes (when not editing)
  React.useEffect(() => {
    if (!isEditing) {
      setEditValue(value);
    }
  }, [value, isEditing]);

  const handleSave = () => {
    const trimmed = editValue.trim();
    if (trimmed !== value) {
      onChange(trimmed || value); // Don't save empty, revert to original
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

  // Disabled mode (for Daily Notes - immutable)
  if (disabled) {
    return (
      <h1 className="text-3xl text-gray-900 font-semibold select-none">
        {value || <span className="text-gray-400">{placeholder}</span>}
      </h1>
    );
  }

  // Edit mode
  if (isEditing) {
    return (
      <input
        ref={inputRef}
        type="text"
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={cn(
          'w-full text-3xl font-semibold text-gray-900',
          'bg-transparent border-none outline-none',
          'placeholder:text-gray-400',
          'focus:ring-0'
        )}
      />
    );
  }

  // Display mode
  return (
    <h1
      className={cn(
        'text-3xl text-gray-900 font-semibold cursor-text',
        'rounded px-1 -mx-1',
        'hover:bg-gray-100 transition-colors duration-150'
      )}
      onClick={() => setIsEditing(true)}
    >
      {value || <span className="text-gray-400">{placeholder}</span>}
    </h1>
  );
}

EditableTitle.displayName = 'EditableTitle';
