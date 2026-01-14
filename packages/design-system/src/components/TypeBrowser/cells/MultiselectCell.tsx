import * as React from 'react';
import { cn } from '../../../utils/cn.js';
import { MultiselectDropdown } from '../../MultiselectDropdown/MultiselectDropdown.js';
import {
  getOptionColorClasses,
  OPTION_COLORS,
  type OptionColor,
} from '../../../constants/optionColors.js';

interface MultiselectCellProps {
  /** The currently selected values */
  value: string[];
  /** Callback when selection changes */
  onSave: (value: string[]) => void;
  /** Available options */
  options: string[];
}

// Assign consistent colors to options based on their index
const colorKeys = Object.keys(OPTION_COLORS) as OptionColor[];

/**
 * MultiselectCell - Click-to-edit multiselect cell for TypeBrowser
 *
 * Features:
 * - Click to open dropdown with checkboxes
 * - Selection auto-saves on each change
 * - Click outside to close
 * - Displays selected values as colored pills
 */
function MultiselectCell({ value, onSave, options }: MultiselectCellProps) {
  const [isEditing, setIsEditing] = React.useState(false);
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (isEditing) {
      // Programmatically click the button to open the dropdown
      buttonRef.current?.click();
    }
  }, [isEditing]);

  const handleChange = (newValue: string[]) => {
    onSave(newValue);
    // Don't close on each selection - let user select multiple
  };

  // Convert string options to MultiselectOption format with colors
  const multiselectOptions = options.map((opt, index) => {
    const colorKey = colorKeys[index % colorKeys.length];
    return {
      value: opt,
      label: opt,
      // Only include color if it's defined (satisfies exactOptionalPropertyTypes)
      ...(colorKey ? { color: colorKey } : {}),
      variant: 'light' as const,
    };
  });

  // Create a map for quick color lookup
  const colorMap = new Map(options.map((opt, index) => [opt, colorKeys[index % colorKeys.length]]));

  if (isEditing) {
    return (
      <div
        ref={containerRef}
        className="-my-0.5 min-w-[150px]"
        onBlur={() => {
          // Check if focus is leaving the entire container (including portal)
          // Use a timeout to allow the portal element to receive focus first
          setTimeout(() => {
            // Check if any element with the dropdown is focused
            const activeElement = document.activeElement;
            if (
              containerRef.current &&
              !containerRef.current.contains(activeElement) &&
              !activeElement?.closest('[role="listbox"]')
            ) {
              setIsEditing(false);
            }
          }, 0);
        }}
      >
        <MultiselectDropdown
          ref={buttonRef}
          value={value}
          onChange={handleChange}
          options={multiselectOptions}
          placeholder="Select..."
        />
      </div>
    );
  }

  // Display selected values as pills
  const displayPills = value.slice(0, 3);
  const remainingCount = value.length - 3;

  return (
    <div
      className={cn(
        'cursor-pointer px-1 -mx-1 rounded min-h-[1.5rem] flex items-center gap-1 flex-wrap',
        'hover:bg-gray-100'
      )}
      onClick={() => setIsEditing(true)}
    >
      {value.length === 0 ? (
        <span className="text-gray-400">–</span>
      ) : (
        <>
          {displayPills.map((v) => (
            <span
              key={v}
              className={cn(
                'px-1.5 py-0.5 rounded text-xs font-medium truncate max-w-[100px]',
                getOptionColorClasses(colorMap.get(v), 'light')
              )}
            >
              {v}
            </span>
          ))}
          {remainingCount > 0 && <span className="text-xs text-gray-500">+{remainingCount}</span>}
        </>
      )}
    </div>
  );
}

MultiselectCell.displayName = 'MultiselectCell';

export { MultiselectCell };
export type { MultiselectCellProps };
