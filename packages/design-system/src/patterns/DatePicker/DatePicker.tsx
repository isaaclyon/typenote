import * as React from 'react';
import { format, parse, isValid } from 'date-fns';
import { CalendarBlank } from '@phosphor-icons/react/dist/ssr/CalendarBlank';

import { cn } from '../../lib/utils.js';
import { Input } from '../../primitives/Input/Input.js';
import { IconButton } from '../../primitives/IconButton/IconButton.js';
import { Popover, PopoverTrigger, PopoverContent } from '../../primitives/Popover/Popover.js';
import { Calendar } from '../Calendar/Calendar.js';

export interface DatePickerProps {
  value?: Date | null;
  onChange?: (date: Date | null) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

const DATE_FORMAT = 'MMM d, yyyy';
const PARSE_FORMATS = ['MMM d, yyyy', 'yyyy-MM-dd', 'MM/dd/yyyy', 'M/d/yyyy'];

function tryParseDate(input: string): Date | null {
  for (const fmt of PARSE_FORMATS) {
    const parsed = parse(input, fmt, new Date());
    if (isValid(parsed)) {
      return parsed;
    }
  }
  return null;
}

const DatePicker = React.forwardRef<HTMLInputElement, DatePickerProps>(
  (
    { value, onChange = () => {}, placeholder = 'Select date', disabled = false, className },
    ref
  ) => {
    const [open, setOpen] = React.useState(false);
    const [inputValue, setInputValue] = React.useState(value ? format(value, DATE_FORMAT) : '');

    // Sync input when value changes externally
    React.useEffect(() => {
      setInputValue(value ? format(value, DATE_FORMAT) : '');
    }, [value]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setInputValue(newValue);
    };

    const handleInputBlur = () => {
      if (inputValue.trim() === '') {
        onChange(null);
        return;
      }

      const parsed = tryParseDate(inputValue);
      if (parsed) {
        onChange(parsed);
        setInputValue(format(parsed, DATE_FORMAT));
      } else {
        // Revert to previous value
        setInputValue(value ? format(value, DATE_FORMAT) : '');
      }
    };

    const handleInputKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        handleInputBlur();
      }
    };

    const handleCalendarSelect = (date: Date | undefined) => {
      onChange(date ?? null);
      setOpen(false);
    };

    return (
      <div className={cn('relative flex items-center', className)}>
        <Input
          ref={ref}
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          onKeyDown={handleInputKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className="pr-9"
        />
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <IconButton
              variant="ghost"
              size="sm"
              className="absolute right-1 h-7 w-7"
              disabled={disabled}
              aria-label="Open calendar"
            >
              <CalendarBlank className="h-4 w-4" />
            </IconButton>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar value={value ?? null} onChange={handleCalendarSelect} />
          </PopoverContent>
        </Popover>
      </div>
    );
  }
);

DatePicker.displayName = 'DatePicker';

export { DatePicker };
