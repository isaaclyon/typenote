import * as React from 'react';

import { cn } from '../../lib/utils.js';
import { Checkbox } from '../../primitives/Checkbox/Checkbox.js';
import { Label } from '../../primitives/Label/Label.js';

export interface CheckboxFieldProps {
  id?: string;
  label: string;
  description?: string;
  checked?: boolean | 'indeterminate';
  disabled?: boolean;
  onCheckedChange?: (checked: boolean | 'indeterminate') => void;
  className?: string;
}

export function CheckboxField({
  id,
  label,
  description,
  checked,
  disabled,
  onCheckedChange,
  className,
}: CheckboxFieldProps) {
  const labelId = id ?? React.useId();

  return (
    <div className={cn('flex items-start gap-3', className)}>
      <Checkbox
        id={labelId}
        checked={checked ?? false}
        disabled={disabled}
        onCheckedChange={onCheckedChange}
        className="mt-1"
      />
      <div className="space-y-1">
        <Label htmlFor={labelId}>{label}</Label>
        {description ? <p className="text-sm text-gray-500">{description}</p> : null}
      </div>
    </div>
  );
}
