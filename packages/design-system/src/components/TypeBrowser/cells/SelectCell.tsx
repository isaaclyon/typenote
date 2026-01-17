import * as React from 'react';
import { cn } from '../../../utils/cn.js';
import { Select } from '../../Select/Select.js';

interface SelectCellProps {
  /** The current selected value */
  value: string;
  /** Callback when selection changes */
  onSave: (value: string) => void;
  /** Available options */
  options: string[];
}

/**
 * SelectCell - Click-to-edit select cell for TypeBrowser
 *
 * Features:
 * - Click to open dropdown
 * - Selection auto-saves immediately
 * - Click outside to close without changing
 */
function SelectCell({ value, onSave, options }: SelectCellProps) {
  const [isEditing, setIsEditing] = React.useState(false);
  const buttonRef = React.useRef<HTMLButtonElement>(null);

  React.useEffect(() => {
    if (isEditing) {
      // Programmatically click the button to open the dropdown
      buttonRef.current?.click();
    }
  }, [isEditing]);

  const handleChange = (newValue: string) => {
    if (newValue !== value) {
      onSave(newValue);
    }
    setIsEditing(false);
  };

  // Convert string options to SelectOption format
  const selectOptions = options.map((opt) => ({
    value: opt,
    label: opt,
  }));

  if (isEditing) {
    return (
      <div
        className="-my-0.5"
        onBlur={(e) => {
          // Check if focus is leaving the entire select component
          if (!e.currentTarget.contains(e.relatedTarget as Node)) {
            setIsEditing(false);
          }
        }}
      >
        <Select
          ref={buttonRef}
          value={value}
          onChange={handleChange}
          options={selectOptions}
          size="sm"
          className="min-w-[100px]"
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        'truncate cursor-pointer px-1 -mx-1 rounded min-h-[1.5rem] flex items-center',
        'hover:bg-secondary'
      )}
      onClick={() => setIsEditing(true)}
    >
      {value || <span className="text-muted-foreground">–</span>}
    </div>
  );
}

SelectCell.displayName = 'SelectCell';

export { SelectCell };
export type { SelectCellProps };
