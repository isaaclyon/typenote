import * as React from 'react';
import { format } from 'date-fns';
import { DayPicker } from 'react-day-picker';
import { CalendarBlank } from '@phosphor-icons/react/dist/ssr/CalendarBlank';
import { cn } from '../../../lib/utils.js';
import { Button } from '../../../primitives/Button/Button.js';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from '../../../primitives/DropdownMenu/DropdownMenu.js';

export interface DateEditorProps {
  value: Date | null;
  onSave: (value: Date | null) => void;
  onCancel: () => void;
  includeTime?: boolean;
  placeholder?: string;
  disabled?: boolean;
}

const DateEditor: React.FC<DateEditorProps> = ({
  value,
  onSave,
  onCancel,
  includeTime = false,
  placeholder = 'Pick a date',
  disabled,
}) => {
  const [open, setOpen] = React.useState(true);
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(value ?? undefined);

  const handleSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    if (date && !includeTime) {
      // For date-only, save immediately on selection
      onSave(date);
      setOpen(false);
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen && !selectedDate) {
      onCancel();
    }
  };

  const formatDate = (date: Date) => {
    return includeTime ? format(date, 'MMM d, yyyy h:mm a') : format(date, 'MMM d, yyyy');
  };

  return (
    <DropdownMenu open={open} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild disabled={disabled === true}>
        <Button
          variant="outline"
          size="sm"
          className={cn('justify-start text-left font-normal', !value && 'text-fg-tertiary')}
        >
          <CalendarBlank className="mr-2 h-4 w-4" />
          {value ? formatDate(value) : placeholder}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-auto p-0">
        <DayPicker mode="single" selected={selectedDate} onSelect={handleSelect} className="p-3" />
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

DateEditor.displayName = 'DateEditor';

export { DateEditor };
