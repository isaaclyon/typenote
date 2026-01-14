import { Checkbox } from '../../Checkbox/Checkbox.js';

interface BooleanCellProps {
  value: boolean;
  onSave: (value: boolean) => void;
}

function BooleanCell({ value, onSave }: BooleanCellProps) {
  return (
    <Checkbox
      checked={value}
      onChange={(e) => onSave(e.target.checked)}
      onClick={(e) => e.stopPropagation()}
    />
  );
}

BooleanCell.displayName = 'BooleanCell';

export { BooleanCell };
export type { BooleanCellProps };
