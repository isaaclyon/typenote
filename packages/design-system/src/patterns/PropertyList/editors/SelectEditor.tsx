import * as React from 'react';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '../../../primitives/Select/Select.js';

export interface SelectEditorProps {
  value: string;
  options: string[];
  onSave: (value: string) => void;
  onCancel: () => void;
  placeholder?: string;
  disabled?: boolean;
}

const SelectEditor: React.FC<SelectEditorProps> = ({
  value,
  options,
  onSave,
  onCancel,
  placeholder = 'Select...',
  disabled,
}) => {
  const [open, setOpen] = React.useState(true);

  const handleValueChange = (newValue: string) => {
    onSave(newValue);
    setOpen(false);
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      // If closed without selection, treat as cancel
      onCancel();
    }
  };

  return (
    <Select
      value={value}
      onValueChange={handleValueChange}
      open={open}
      onOpenChange={handleOpenChange}
      disabled={disabled === true}
    >
      <SelectTrigger className="h-7 text-sm">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option} value={option}>
            {option}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

SelectEditor.displayName = 'SelectEditor';

export { SelectEditor };
