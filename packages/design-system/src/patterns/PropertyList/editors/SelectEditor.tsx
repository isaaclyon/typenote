import * as React from 'react';
import { BadgeSelect } from '../../BadgeSelect/BadgeSelect.js';

export interface SelectEditorProps {
  value: string;
  options: string[];
  onSave: (value: string) => void;
  onCancel: () => void;
  placeholder?: string | undefined;
  disabled?: boolean | undefined;
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

  const handleChange = (newValue: string) => {
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
    <BadgeSelect
      value={value}
      options={options}
      onChange={handleChange}
      placeholder={placeholder}
      disabled={disabled}
      open={open}
      onOpenChange={handleOpenChange}
    />
  );
};

SelectEditor.displayName = 'SelectEditor';

export { SelectEditor };
