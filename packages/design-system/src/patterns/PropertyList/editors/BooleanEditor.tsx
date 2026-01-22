import * as React from 'react';
import { Checkbox } from '../../../primitives/Checkbox/Checkbox.js';

export interface BooleanEditorProps {
  value: boolean;
  onSave: (value: boolean) => void;
  disabled?: boolean;
}

const BooleanEditor: React.FC<BooleanEditorProps> = ({ value, onSave, disabled }) => {
  const handleChange = (checked: boolean | 'indeterminate') => {
    // Only handle boolean values, ignore indeterminate
    if (typeof checked === 'boolean') {
      onSave(checked);
    }
  };

  return <Checkbox checked={value} onCheckedChange={handleChange} disabled={disabled} size="sm" />;
};

BooleanEditor.displayName = 'BooleanEditor';

export { BooleanEditor };
