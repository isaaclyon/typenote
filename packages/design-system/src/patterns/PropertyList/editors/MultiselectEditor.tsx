import * as React from 'react';
import { cn } from '../../../lib/utils.js';
import { Badge } from '../../../primitives/Badge/Badge.js';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
} from '../../../primitives/DropdownMenu/DropdownMenu.js';

export interface MultiselectEditorProps {
  value: string[];
  options: string[];
  onSave: (value: string[]) => void;
  onCancel: () => void;
  placeholder?: string | undefined;
  disabled?: boolean | undefined;
}

const MultiselectEditor: React.FC<MultiselectEditorProps> = ({
  value,
  options,
  onSave,
  onCancel,
  placeholder = 'Select...',
  disabled,
}) => {
  const [open, setOpen] = React.useState(true);
  const [localValue, setLocalValue] = React.useState<string[]>(value);

  const handleToggle = (option: string, checked: boolean) => {
    setLocalValue((prev) => (checked ? [...prev, option] : prev.filter((v) => v !== option)));
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      // Check if value actually changed
      const valueChanged =
        localValue.length !== value.length || localValue.some((v) => !value.includes(v));

      if (valueChanged) {
        onSave(localValue);
      } else {
        onCancel();
      }
    }
  };

  return (
    <DropdownMenu open={open} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild disabled={disabled === true}>
        <button
          className={cn(
            'flex flex-wrap gap-1 min-h-7 w-full items-center rounded px-2 py-1',
            'text-sm text-left',
            'border border-border bg-background',
            'hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary'
          )}
        >
          {localValue.length > 0 ? (
            localValue.map((v) => (
              <Badge key={v} intent="neutral" size="sm">
                {v}
              </Badge>
            ))
          ) : (
            <span className="text-placeholder italic">{placeholder}</span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-48" align="start">
        {options.map((option) => (
          <DropdownMenuCheckboxItem
            key={option}
            checked={localValue.includes(option)}
            onCheckedChange={(checked) => handleToggle(option, checked === true)}
          >
            {option}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

MultiselectEditor.displayName = 'MultiselectEditor';

export { MultiselectEditor };
