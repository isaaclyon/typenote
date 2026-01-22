import * as React from 'react';
import { DayPicker } from 'react-day-picker';
import { CaretLeft } from '@phosphor-icons/react/dist/ssr/CaretLeft';
import { CaretRight } from '@phosphor-icons/react/dist/ssr/CaretRight';

import { cn } from '../../lib/utils.js';
import { buttonVariants } from '../../primitives/Button/Button.js';

export interface CalendarProps {
  value?: Date | null;
  onChange?: (date: Date | undefined) => void;
  disabled?: boolean;
  className?: string;
}

const calendarClassNames = {
  months: 'flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0',
  month: 'space-y-4',
  caption: 'flex justify-center pt-1 relative items-center',
  caption_label: 'text-sm font-medium',
  nav: 'space-x-1 flex items-center',
  button_previous: cn(
    buttonVariants({ variant: 'outline' }),
    'absolute left-1 h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100'
  ),
  button_next: cn(
    buttonVariants({ variant: 'outline' }),
    'absolute right-1 h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100'
  ),
  table: 'w-full border-collapse space-y-1',
  head_row: 'flex',
  head_cell: 'text-muted-foreground rounded-md w-8 font-normal text-[0.8rem]',
  row: 'flex w-full mt-2',
  cell: cn(
    'relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-accent-50 [&:has([aria-selected].day-outside)]:bg-accent-50/50',
    '[&:has([aria-selected].day-range-end)]:rounded-r-md'
  ),
  day: cn(
    buttonVariants({ variant: 'ghost' }),
    'h-8 w-8 p-0 font-normal aria-selected:opacity-100'
  ),
  range_start: 'day-range-start',
  range_end: 'day-range-end',
  selected:
    'bg-accent-500 text-white hover:bg-accent-600 hover:text-white focus:bg-accent-500 focus:text-white',
  today: 'bg-secondary text-foreground',
  outside:
    'day-outside text-muted-foreground opacity-50 aria-selected:bg-accent-50/50 aria-selected:text-muted-foreground aria-selected:opacity-30',
  disabled: 'text-muted-foreground opacity-50',
  range_middle: 'aria-selected:bg-accent-50 aria-selected:text-foreground',
  hidden: 'invisible',
};

function ChevronIcon(props: {
  className?: string;
  size?: number;
  disabled?: boolean;
  orientation?: 'left' | 'right' | 'up' | 'down';
}) {
  return props.orientation === 'left' ? (
    <CaretLeft className="h-4 w-4" />
  ) : (
    <CaretRight className="h-4 w-4" />
  );
}

const Calendar = React.forwardRef<HTMLDivElement, CalendarProps>(
  ({ value, onChange = () => {}, disabled = false, className }, ref) => {
    return (
      <div ref={ref} className={cn('p-3', className)}>
        <DayPicker
          mode="single"
          required={false}
          selected={value ?? undefined}
          onSelect={onChange}
          disabled={disabled}
          showOutsideDays
          classNames={calendarClassNames}
          components={{ Chevron: ChevronIcon }}
        />
      </div>
    );
  }
);

Calendar.displayName = 'Calendar';

export { Calendar };
