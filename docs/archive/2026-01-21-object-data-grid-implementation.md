# ObjectDataGrid Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build ObjectDataGrid feature with inline cell editing for all property types.

**Architecture:** Bottom-up build: Popover primitive → Calendar/DismissibleTag patterns → DatePicker/RelationPicker patterns → ObjectDataGrid feature. Each component developed in Ladle sandbox first.

**Tech Stack:** React, Radix UI (Popover), react-day-picker, date-fns, Tailwind CSS, CVA

**Design Spec:** `docs/plans/2026-01-21-object-data-grid-design.md`

---

## Task 1: Install Dependencies

**Files:**

- Modify: `packages/design-system/package.json`

**Step 1: Install Radix Popover**

Run:

```bash
pnpm --filter @typenote/design-system add @radix-ui/react-popover
```

**Step 2: Install react-day-picker and date-fns**

Run:

```bash
pnpm --filter @typenote/design-system add react-day-picker date-fns
```

**Step 3: Verify installation**

Run:

```bash
pnpm --filter @typenote/design-system typecheck
```

Expected: No errors

**Step 4: Commit**

```bash
git add packages/design-system/package.json pnpm-lock.yaml
git commit -m "deps(design-system): add popover, react-day-picker, date-fns"
```

---

## Task 2: Popover Primitive

**Files:**

- Create: `packages/design-system/src/primitives/Popover/Popover.tsx`
- Create: `packages/design-system/src/primitives/Popover/Popover.stories.tsx`
- Create: `packages/design-system/src/primitives/Popover/index.ts`
- Modify: `packages/design-system/src/primitives/index.ts`

**Step 1: Create Popover.tsx**

Create `packages/design-system/src/primitives/Popover/Popover.tsx`:

```tsx
import * as React from 'react';
import * as PopoverPrimitive from '@radix-ui/react-popover';

import { cn } from '../../lib/utils.js';

const Popover = PopoverPrimitive.Root;
const PopoverTrigger = PopoverPrimitive.Trigger;
const PopoverAnchor = PopoverPrimitive.Anchor;
const PopoverClose = PopoverPrimitive.Close;

const PopoverContent = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>
>(({ className, align = 'center', sideOffset = 4, ...props }, ref) => (
  <PopoverPrimitive.Portal>
    <PopoverPrimitive.Content
      ref={ref}
      align={align}
      sideOffset={sideOffset}
      className={cn(
        'z-50 rounded-lg border border-border bg-background p-4 shadow-md outline-none',
        'data-[state=open]:animate-in data-[state=closed]:animate-out',
        'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
        'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
        'data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2',
        'data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
        className
      )}
      {...props}
    />
  </PopoverPrimitive.Portal>
));
PopoverContent.displayName = PopoverPrimitive.Content.displayName;

type PopoverContentProps = React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>;
type PopoverTriggerProps = React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Trigger>;
type PopoverAnchorProps = React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Anchor>;
type PopoverCloseProps = React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Close>;

export { Popover, PopoverTrigger, PopoverContent, PopoverAnchor, PopoverClose };
export type { PopoverContentProps, PopoverTriggerProps, PopoverAnchorProps, PopoverCloseProps };
```

**Step 2: Create index.ts**

Create `packages/design-system/src/primitives/Popover/index.ts`:

```ts
export { Popover, PopoverTrigger, PopoverContent, PopoverAnchor, PopoverClose } from './Popover.js';

export type {
  PopoverContentProps,
  PopoverTriggerProps,
  PopoverAnchorProps,
  PopoverCloseProps,
} from './Popover.js';
```

**Step 3: Create stories**

Create `packages/design-system/src/primitives/Popover/Popover.stories.tsx`:

```tsx
import * as React from 'react';
import type { Story } from '@ladle/react';

import { Popover, PopoverTrigger, PopoverContent, PopoverClose } from './Popover.js';
import { Button } from '../Button/Button.js';
import { Input } from '../Input/Input.js';
import { Label } from '../Label/Label.js';

export default {
  title: 'Primitives/Popover',
};

export const Default: Story = () => (
  <div className="flex min-h-[200px] items-center justify-center p-6">
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">Open popover</Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Dimensions</h4>
            <p className="text-sm text-muted-foreground">Set the dimensions for the layer.</p>
          </div>
          <div className="grid gap-2">
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="width">Width</Label>
              <Input id="width" defaultValue="100%" className="col-span-2 h-8" />
            </div>
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="height">Height</Label>
              <Input id="height" defaultValue="25px" className="col-span-2 h-8" />
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  </div>
);

export const Positions: Story = () => (
  <div className="flex min-h-[300px] flex-wrap items-center justify-center gap-4 p-6">
    {(['top', 'right', 'bottom', 'left'] as const).map((side) => (
      <Popover key={side}>
        <PopoverTrigger asChild>
          <Button variant="outline">{side}</Button>
        </PopoverTrigger>
        <PopoverContent side={side} className="w-40">
          <p className="text-sm">Popover on {side}</p>
        </PopoverContent>
      </Popover>
    ))}
  </div>
);

export const Controlled: Story = () => {
  const [open, setOpen] = React.useState(false);

  return (
    <div className="flex min-h-[200px] flex-col items-center justify-center gap-4 p-6">
      <p className="text-sm text-muted-foreground">Open: {open ? 'true' : 'false'}</p>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline">Controlled popover</Button>
        </PopoverTrigger>
        <PopoverContent className="w-60">
          <p className="text-sm">This popover is controlled.</p>
          <PopoverClose asChild>
            <Button size="sm" className="mt-2 w-full">
              Close
            </Button>
          </PopoverClose>
        </PopoverContent>
      </Popover>
    </div>
  );
};
```

**Step 4: Add to primitives index**

Add to `packages/design-system/src/primitives/index.ts`:

```ts
export {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverAnchor,
  PopoverClose,
} from './Popover/index.js';
export type {
  PopoverContentProps,
  PopoverTriggerProps,
  PopoverAnchorProps,
  PopoverCloseProps,
} from './Popover/index.js';
```

**Step 5: Verify**

Run:

```bash
pnpm --filter @typenote/design-system typecheck
```

Expected: No errors

**Step 6: Test in Ladle**

Run:

```bash
pnpm --filter @typenote/design-system sandbox
```

Open http://localhost:61000, navigate to Primitives/Popover, verify all stories render.

**Step 7: Commit**

```bash
git add packages/design-system/src/primitives/Popover packages/design-system/src/primitives/index.ts
git commit -m "feat(design-system): add Popover primitive"
```

---

## Task 3: Calendar Pattern

**Files:**

- Create: `packages/design-system/src/patterns/Calendar/Calendar.tsx`
- Create: `packages/design-system/src/patterns/Calendar/Calendar.stories.tsx`
- Create: `packages/design-system/src/patterns/Calendar/index.ts`
- Modify: `packages/design-system/src/patterns/index.ts`

**Step 1: Create Calendar.tsx**

Create `packages/design-system/src/patterns/Calendar/Calendar.tsx`:

```tsx
import * as React from 'react';
import { DayPicker } from 'react-day-picker';
import { CaretLeft, CaretRight } from '@phosphor-icons/react/ssr';

import { cn } from '../../lib/utils.js';
import { buttonVariants } from '../../primitives/Button/Button.js';

export interface CalendarProps {
  value?: Date | null;
  onChange?: (date: Date | undefined) => void;
  min?: Date;
  max?: Date;
  disabled?: boolean;
  className?: string;
}

const Calendar = React.forwardRef<HTMLDivElement, CalendarProps>(
  ({ value, onChange, min, max, disabled, className }, ref) => {
    return (
      <div ref={ref} className={cn('p-3', className)}>
        <DayPicker
          mode="single"
          selected={value ?? undefined}
          onSelect={onChange}
          disabled={disabled ? true : undefined}
          fromDate={min}
          toDate={max}
          showOutsideDays
          classNames={{
            months: 'flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0',
            month: 'space-y-4',
            caption: 'flex justify-center pt-1 relative items-center',
            caption_label: 'text-sm font-medium',
            nav: 'space-x-1 flex items-center',
            nav_button: cn(
              buttonVariants({ variant: 'outline' }),
              'h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100'
            ),
            nav_button_previous: 'absolute left-1',
            nav_button_next: 'absolute right-1',
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
            day_range_start: 'day-range-start',
            day_range_end: 'day-range-end',
            day_selected:
              'bg-accent-500 text-white hover:bg-accent-600 hover:text-white focus:bg-accent-500 focus:text-white',
            day_today: 'bg-secondary text-foreground',
            day_outside:
              'day-outside text-muted-foreground opacity-50 aria-selected:bg-accent-50/50 aria-selected:text-muted-foreground aria-selected:opacity-30',
            day_disabled: 'text-muted-foreground opacity-50',
            day_range_middle: 'aria-selected:bg-accent-50 aria-selected:text-foreground',
            day_hidden: 'invisible',
          }}
          components={{
            IconLeft: () => <CaretLeft className="h-4 w-4" />,
            IconRight: () => <CaretRight className="h-4 w-4" />,
          }}
        />
      </div>
    );
  }
);

Calendar.displayName = 'Calendar';

export { Calendar };
```

**Step 2: Create index.ts**

Create `packages/design-system/src/patterns/Calendar/index.ts`:

```ts
export { Calendar } from './Calendar.js';
export type { CalendarProps } from './Calendar.js';
```

**Step 3: Create stories**

Create `packages/design-system/src/patterns/Calendar/Calendar.stories.tsx`:

```tsx
import * as React from 'react';
import type { Story } from '@ladle/react';
import { addDays, subDays } from 'date-fns';

import { Calendar } from './Calendar.js';

export default {
  title: 'Patterns/Calendar',
};

export const Default: Story = () => {
  const [date, setDate] = React.useState<Date | undefined>(new Date());

  return (
    <div className="p-6">
      <Calendar value={date} onChange={setDate} />
      <p className="mt-4 text-sm text-muted-foreground">
        Selected: {date ? date.toLocaleDateString() : 'None'}
      </p>
    </div>
  );
};

export const WithMinMax: Story = () => {
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  const min = subDays(new Date(), 7);
  const max = addDays(new Date(), 7);

  return (
    <div className="p-6">
      <Calendar value={date} onChange={setDate} min={min} max={max} />
      <p className="mt-4 text-sm text-muted-foreground">
        Only dates within 7 days of today are selectable.
      </p>
    </div>
  );
};

export const Disabled: Story = () => (
  <div className="p-6">
    <Calendar value={new Date()} disabled />
  </div>
);

export const Uncontrolled: Story = () => (
  <div className="p-6">
    <Calendar />
    <p className="mt-4 text-sm text-muted-foreground">No controlled state.</p>
  </div>
);
```

**Step 4: Add to patterns index**

Add to `packages/design-system/src/patterns/index.ts`:

```ts
export { Calendar } from './Calendar/index.js';
export type { CalendarProps } from './Calendar/index.js';
```

**Step 5: Verify**

Run:

```bash
pnpm --filter @typenote/design-system typecheck
```

Expected: No errors

**Step 6: Test in Ladle**

Open http://localhost:61000, navigate to Patterns/Calendar, verify all stories render and date selection works.

**Step 7: Commit**

```bash
git add packages/design-system/src/patterns/Calendar packages/design-system/src/patterns/index.ts
git commit -m "feat(design-system): add Calendar pattern with react-day-picker"
```

---

## Task 4: DatePicker Pattern

**Files:**

- Create: `packages/design-system/src/patterns/DatePicker/DatePicker.tsx`
- Create: `packages/design-system/src/patterns/DatePicker/DatePicker.stories.tsx`
- Create: `packages/design-system/src/patterns/DatePicker/index.ts`
- Modify: `packages/design-system/src/patterns/index.ts`

**Step 1: Create DatePicker.tsx**

Create `packages/design-system/src/patterns/DatePicker/DatePicker.tsx`:

```tsx
import * as React from 'react';
import { format, parse, isValid } from 'date-fns';
import { CalendarBlank } from '@phosphor-icons/react/ssr';

import { cn } from '../../lib/utils.js';
import { Input } from '../../primitives/Input/Input.js';
import { IconButton } from '../../primitives/IconButton/IconButton.js';
import { Popover, PopoverTrigger, PopoverContent } from '../../primitives/Popover/Popover.js';
import { Calendar } from '../Calendar/Calendar.js';

export interface DatePickerProps {
  value?: Date | null;
  onChange?: (date: Date | null) => void;
  placeholder?: string;
  min?: Date;
  max?: Date;
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
  ({ value, onChange, placeholder = 'Select date', min, max, disabled, className }, ref) => {
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
        onChange?.(null);
        return;
      }

      const parsed = tryParseDate(inputValue);
      if (parsed) {
        onChange?.(parsed);
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
      onChange?.(date ?? null);
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
            <Calendar value={value} onChange={handleCalendarSelect} min={min} max={max} />
          </PopoverContent>
        </Popover>
      </div>
    );
  }
);

DatePicker.displayName = 'DatePicker';

export { DatePicker };
```

**Step 2: Create index.ts**

Create `packages/design-system/src/patterns/DatePicker/index.ts`:

```ts
export { DatePicker } from './DatePicker.js';
export type { DatePickerProps } from './DatePicker.js';
```

**Step 3: Create stories**

Create `packages/design-system/src/patterns/DatePicker/DatePicker.stories.tsx`:

```tsx
import * as React from 'react';
import type { Story } from '@ladle/react';
import { addDays, subDays } from 'date-fns';

import { DatePicker } from './DatePicker.js';

export default {
  title: 'Patterns/DatePicker',
};

export const Default: Story = () => {
  const [date, setDate] = React.useState<Date | null>(new Date());

  return (
    <div className="w-64 p-6">
      <DatePicker value={date} onChange={setDate} />
      <p className="mt-4 text-sm text-muted-foreground">
        Selected: {date ? date.toLocaleDateString() : 'None'}
      </p>
    </div>
  );
};

export const Empty: Story = () => {
  const [date, setDate] = React.useState<Date | null>(null);

  return (
    <div className="w-64 p-6">
      <DatePicker value={date} onChange={setDate} placeholder="Pick a date" />
      <p className="mt-4 text-sm text-muted-foreground">
        Selected: {date ? date.toLocaleDateString() : 'None'}
      </p>
    </div>
  );
};

export const WithMinMax: Story = () => {
  const [date, setDate] = React.useState<Date | null>(new Date());
  const min = subDays(new Date(), 7);
  const max = addDays(new Date(), 7);

  return (
    <div className="w-64 p-6">
      <DatePicker value={date} onChange={setDate} min={min} max={max} />
      <p className="mt-4 text-sm text-muted-foreground">Only dates within 7 days selectable.</p>
    </div>
  );
};

export const Disabled: Story = () => (
  <div className="w-64 p-6">
    <DatePicker value={new Date()} disabled />
  </div>
);

export const TextParsing: Story = () => {
  const [date, setDate] = React.useState<Date | null>(null);

  return (
    <div className="w-64 space-y-4 p-6">
      <DatePicker value={date} onChange={setDate} />
      <p className="text-sm text-muted-foreground">
        Try typing: "Jan 15, 2026", "2026-01-15", or "1/15/2026"
      </p>
      <p className="text-sm">Selected: {date ? date.toLocaleDateString() : 'None'}</p>
    </div>
  );
};
```

**Step 4: Add to patterns index**

Add to `packages/design-system/src/patterns/index.ts`:

```ts
export { DatePicker } from './DatePicker/index.js';
export type { DatePickerProps } from './DatePicker/index.js';
```

**Step 5: Verify**

Run:

```bash
pnpm --filter @typenote/design-system typecheck
```

Expected: No errors

**Step 6: Test in Ladle**

Open http://localhost:61000, navigate to Patterns/DatePicker:

- Verify calendar opens when clicking icon
- Verify typing dates works (try "Jan 15, 2026")
- Verify selecting from calendar updates input

**Step 7: Commit**

```bash
git add packages/design-system/src/patterns/DatePicker packages/design-system/src/patterns/index.ts
git commit -m "feat(design-system): add DatePicker pattern with text parsing"
```

---

## Task 5: DismissibleTag Pattern

**Files:**

- Create: `packages/design-system/src/patterns/DismissibleTag/DismissibleTag.tsx`
- Create: `packages/design-system/src/patterns/DismissibleTag/DismissibleTag.stories.tsx`
- Create: `packages/design-system/src/patterns/DismissibleTag/index.ts`
- Modify: `packages/design-system/src/patterns/index.ts`

**Step 1: Create DismissibleTag.tsx**

Create `packages/design-system/src/patterns/DismissibleTag/DismissibleTag.tsx`:

```tsx
import * as React from 'react';
import { X } from '@phosphor-icons/react/ssr';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '../../lib/utils.js';

const dismissibleTagVariants = cva(
  [
    'inline-flex items-center gap-1 rounded text-xs font-medium leading-none',
    'transition-colors duration-150 ease-out',
    'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1',
  ],
  {
    variants: {
      variant: {
        solid: 'bg-secondary text-foreground',
        outline: 'border border-border bg-transparent text-foreground',
      },
      size: {
        sm: 'h-5 pl-2 pr-1 text-[11px]',
        md: 'h-6 pl-2.5 pr-1 text-xs',
      },
    },
    defaultVariants: {
      variant: 'solid',
      size: 'md',
    },
  }
);

export interface DismissibleTagProps
  extends
    Omit<React.HTMLAttributes<HTMLSpanElement>, 'children'>,
    VariantProps<typeof dismissibleTagVariants> {
  label: string;
  onRemove?: () => void;
  disabled?: boolean;
  color?: string;
}

const DismissibleTag = React.forwardRef<HTMLSpanElement, DismissibleTagProps>(
  ({ label, onRemove, disabled, color, variant, size, className, ...props }, ref) => {
    const handleKeyDown = (e: React.KeyboardEvent) => {
      if ((e.key === 'Backspace' || e.key === 'Delete') && !disabled) {
        e.preventDefault();
        onRemove?.();
      }
    };

    const handleRemoveClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!disabled) {
        onRemove?.();
      }
    };

    const customStyle = color ? { backgroundColor: color, color: 'white' } : undefined;

    return (
      <span
        ref={ref}
        role="button"
        tabIndex={disabled ? -1 : 0}
        className={cn(
          dismissibleTagVariants({ variant: color ? undefined : variant, size }),
          disabled && 'cursor-not-allowed opacity-50',
          className
        )}
        style={customStyle}
        onKeyDown={handleKeyDown}
        aria-disabled={disabled}
        {...props}
      >
        <span className="max-w-[120px] truncate">{label}</span>
        {!disabled && onRemove && (
          <button
            type="button"
            onClick={handleRemoveClick}
            className={cn(
              'flex items-center justify-center rounded-sm',
              'hover:bg-black/10 focus:outline-none',
              size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4'
            )}
            aria-label={`Remove ${label}`}
          >
            <X className={size === 'sm' ? 'h-2.5 w-2.5' : 'h-3 w-3'} weight="bold" />
          </button>
        )}
      </span>
    );
  }
);

DismissibleTag.displayName = 'DismissibleTag';

export { DismissibleTag, dismissibleTagVariants };
```

**Step 2: Create index.ts**

Create `packages/design-system/src/patterns/DismissibleTag/index.ts`:

```ts
export { DismissibleTag, dismissibleTagVariants } from './DismissibleTag.js';
export type { DismissibleTagProps } from './DismissibleTag.js';
```

**Step 3: Create stories**

Create `packages/design-system/src/patterns/DismissibleTag/DismissibleTag.stories.tsx`:

```tsx
import * as React from 'react';
import type { Story } from '@ladle/react';

import { DismissibleTag } from './DismissibleTag.js';

export default {
  title: 'Patterns/DismissibleTag',
};

export const Default: Story = () => {
  const [tags, setTags] = React.useState(['Project Roadmap', 'Meeting Notes', 'John Smith']);

  const removeTag = (tag: string) => {
    setTags((prev) => prev.filter((t) => t !== tag));
  };

  return (
    <div className="space-y-4 p-6">
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <DismissibleTag key={tag} label={tag} onRemove={() => removeTag(tag)} />
        ))}
      </div>
      <p className="text-sm text-muted-foreground">Click X or focus and press Backspace/Delete</p>
    </div>
  );
};

export const Variants: Story = () => (
  <div className="space-y-4 p-6">
    <div className="flex flex-wrap gap-2">
      <DismissibleTag label="Solid (default)" onRemove={() => {}} />
      <DismissibleTag label="Outline" variant="outline" onRemove={() => {}} />
    </div>
  </div>
);

export const Sizes: Story = () => (
  <div className="space-y-4 p-6">
    <div className="flex flex-wrap items-center gap-2">
      <DismissibleTag label="Small" size="sm" onRemove={() => {}} />
      <DismissibleTag label="Medium (default)" size="md" onRemove={() => {}} />
    </div>
  </div>
);

export const CustomColors: Story = () => (
  <div className="space-y-4 p-6">
    <div className="flex flex-wrap gap-2">
      <DismissibleTag label="Blue" color="#3B82F6" onRemove={() => {}} />
      <DismissibleTag label="Green" color="#22C55E" onRemove={() => {}} />
      <DismissibleTag label="Purple" color="#8B5CF6" onRemove={() => {}} />
      <DismissibleTag label="Orange" color="#F97316" onRemove={() => {}} />
    </div>
  </div>
);

export const Disabled: Story = () => (
  <div className="p-6">
    <DismissibleTag label="Cannot remove" disabled onRemove={() => {}} />
  </div>
);

export const LongLabels: Story = () => (
  <div className="p-6">
    <DismissibleTag
      label="This is a very long tag label that should truncate"
      onRemove={() => {}}
    />
  </div>
);

export const WithoutRemove: Story = () => (
  <div className="p-6">
    <DismissibleTag label="Read only tag" />
  </div>
);
```

**Step 4: Add to patterns index**

Add to `packages/design-system/src/patterns/index.ts`:

```ts
export { DismissibleTag, dismissibleTagVariants } from './DismissibleTag/index.js';
export type { DismissibleTagProps } from './DismissibleTag/index.js';
```

**Step 5: Verify**

Run:

```bash
pnpm --filter @typenote/design-system typecheck
```

Expected: No errors

**Step 6: Test in Ladle**

Open http://localhost:61000, navigate to Patterns/DismissibleTag:

- Verify clicking X removes tag
- Verify keyboard removal (Backspace/Delete)
- Verify custom colors work

**Step 7: Commit**

```bash
git add packages/design-system/src/patterns/DismissibleTag packages/design-system/src/patterns/index.ts
git commit -m "feat(design-system): add DismissibleTag pattern for relation chips"
```

---

## Task 6: RelationPicker Pattern

**Files:**

- Create: `packages/design-system/src/patterns/RelationPicker/RelationPicker.tsx`
- Create: `packages/design-system/src/patterns/RelationPicker/RelationPicker.stories.tsx`
- Create: `packages/design-system/src/patterns/RelationPicker/index.ts`
- Modify: `packages/design-system/src/patterns/index.ts`

**Step 1: Create RelationPicker.tsx**

Create `packages/design-system/src/patterns/RelationPicker/RelationPicker.tsx`:

```tsx
import * as React from 'react';
import { Plus } from '@phosphor-icons/react/ssr';

import { cn } from '../../lib/utils.js';
import { Popover, PopoverTrigger, PopoverContent } from '../../primitives/Popover/Popover.js';
import { SearchInput } from '../SearchInput/SearchInput.js';
import { CommandPaletteItem } from '../CommandPaletteItem/CommandPaletteItem.js';
import { CommandPaletteList } from '../CommandPaletteList/CommandPaletteList.js';
import { Spinner } from '../../primitives/Spinner/Spinner.js';

export interface RelationOption {
  id: string;
  title: string;
  typeKey: string;
  typeName: string;
  icon?: React.ReactNode;
}

export interface RelationPickerProps {
  value?: string | string[];
  onChange?: (value: string | string[]) => void;
  multiple?: boolean;
  options: RelationOption[];
  loading?: boolean;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  onCreate?: (title: string) => void;
  placeholder?: string;
  disabled?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
  className?: string;
}

const RelationPicker = React.forwardRef<HTMLDivElement, RelationPickerProps>(
  (
    {
      value,
      onChange,
      multiple = false,
      options,
      loading = false,
      searchQuery = '',
      onSearchChange,
      onCreate,
      placeholder = 'Search...',
      disabled,
      open,
      onOpenChange,
      children,
      className,
    },
    ref
  ) => {
    const [highlightedIndex, setHighlightedIndex] = React.useState(0);
    const inputRef = React.useRef<HTMLInputElement>(null);

    const selectedIds = React.useMemo(() => {
      if (!value) return new Set<string>();
      return new Set(Array.isArray(value) ? value : [value]);
    }, [value]);

    const showCreateOption = onCreate && searchQuery.trim().length > 0;
    const totalItems = options.length + (showCreateOption ? 1 : 0);

    // Reset highlight when options change
    React.useEffect(() => {
      setHighlightedIndex(0);
    }, [options.length, searchQuery]);

    // Focus input when popover opens
    React.useEffect(() => {
      if (open) {
        setTimeout(() => inputRef.current?.focus(), 0);
      }
    }, [open]);

    const handleSelect = (option: RelationOption) => {
      if (multiple) {
        const newSet = new Set(selectedIds);
        if (newSet.has(option.id)) {
          newSet.delete(option.id);
        } else {
          newSet.add(option.id);
        }
        onChange?.(Array.from(newSet));
      } else {
        onChange?.(option.id);
        onOpenChange?.(false);
      }
    };

    const handleCreate = () => {
      onCreate?.(searchQuery.trim());
      onSearchChange?.('');
      if (!multiple) {
        onOpenChange?.(false);
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setHighlightedIndex((prev) => (prev + 1) % totalItems);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setHighlightedIndex((prev) => (prev - 1 + totalItems) % totalItems);
          break;
        case 'Enter':
          e.preventDefault();
          if (highlightedIndex < options.length) {
            const option = options[highlightedIndex];
            if (option) handleSelect(option);
          } else if (showCreateOption) {
            handleCreate();
          }
          break;
        case 'Escape':
          e.preventDefault();
          onOpenChange?.(false);
          break;
      }
    };

    return (
      <Popover open={open} onOpenChange={onOpenChange}>
        <PopoverTrigger asChild disabled={disabled}>
          {children}
        </PopoverTrigger>
        <PopoverContent
          ref={ref}
          className={cn('w-72 p-0', className)}
          align="start"
          onKeyDown={handleKeyDown}
        >
          <div className="p-2">
            <SearchInput
              ref={inputRef}
              value={searchQuery}
              onChange={(e) => onSearchChange?.(e.target.value)}
              onClear={() => onSearchChange?.('')}
              placeholder={placeholder}
              size="sm"
            />
          </div>
          <CommandPaletteList className="max-h-60">
            {loading ? (
              <div className="flex items-center justify-center py-6">
                <Spinner size="sm" />
              </div>
            ) : options.length === 0 && !showCreateOption ? (
              <div className="py-6 text-center text-sm text-muted-foreground">No results found</div>
            ) : (
              <>
                {options.map((option, index) => (
                  <CommandPaletteItem
                    key={option.id}
                    label={option.title}
                    description={option.typeName}
                    icon={option.icon}
                    selected={selectedIds.has(option.id)}
                    highlighted={index === highlightedIndex}
                    onClick={() => handleSelect(option)}
                  />
                ))}
                {showCreateOption && (
                  <CommandPaletteItem
                    label={`Create "${searchQuery.trim()}"`}
                    icon={<Plus className="h-4 w-4" />}
                    highlighted={highlightedIndex === options.length}
                    onClick={handleCreate}
                  />
                )}
              </>
            )}
          </CommandPaletteList>
        </PopoverContent>
      </Popover>
    );
  }
);

RelationPicker.displayName = 'RelationPicker';

export { RelationPicker };
```

**Step 2: Create index.ts**

Create `packages/design-system/src/patterns/RelationPicker/index.ts`:

```ts
export { RelationPicker } from './RelationPicker.js';
export type { RelationPickerProps, RelationOption } from './RelationPicker.js';
```

**Step 3: Create stories**

Create `packages/design-system/src/patterns/RelationPicker/RelationPicker.stories.tsx`:

```tsx
import * as React from 'react';
import type { Story } from '@ladle/react';
import { File, User, CalendarBlank } from '@phosphor-icons/react/ssr';

import { RelationPicker, type RelationOption } from './RelationPicker.js';
import { Button } from '../../primitives/Button/Button.js';
import { DismissibleTag } from '../DismissibleTag/DismissibleTag.js';

export default {
  title: 'Patterns/RelationPicker',
};

const mockOptions: RelationOption[] = [
  {
    id: '1',
    title: 'Project Roadmap',
    typeKey: 'Page',
    typeName: 'Page',
    icon: <File className="h-4 w-4" />,
  },
  {
    id: '2',
    title: 'Meeting Notes',
    typeKey: 'Page',
    typeName: 'Page',
    icon: <File className="h-4 w-4" />,
  },
  {
    id: '3',
    title: 'John Smith',
    typeKey: 'Person',
    typeName: 'Person',
    icon: <User className="h-4 w-4" />,
  },
  {
    id: '4',
    title: 'Jane Doe',
    typeKey: 'Person',
    typeName: 'Person',
    icon: <User className="h-4 w-4" />,
  },
  {
    id: '5',
    title: 'Team Standup',
    typeKey: 'Event',
    typeName: 'Event',
    icon: <CalendarBlank className="h-4 w-4" />,
  },
];

export const SingleSelect: Story = () => {
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState<string>('');
  const [search, setSearch] = React.useState('');

  const filtered = mockOptions.filter((o) => o.title.toLowerCase().includes(search.toLowerCase()));

  const selected = mockOptions.find((o) => o.id === value);

  return (
    <div className="p-6">
      <RelationPicker
        open={open}
        onOpenChange={setOpen}
        value={value}
        onChange={(v) => setValue(v as string)}
        options={filtered}
        searchQuery={search}
        onSearchChange={setSearch}
        placeholder="Search objects..."
      >
        <Button variant="outline">{selected ? selected.title : 'Select object...'}</Button>
      </RelationPicker>
    </div>
  );
};

export const MultiSelect: Story = () => {
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState<string[]>([]);
  const [search, setSearch] = React.useState('');

  const filtered = mockOptions.filter((o) => o.title.toLowerCase().includes(search.toLowerCase()));

  const selectedOptions = mockOptions.filter((o) => value.includes(o.id));

  const removeOption = (id: string) => {
    setValue((prev) => prev.filter((v) => v !== id));
  };

  return (
    <div className="space-y-4 p-6">
      <div className="flex flex-wrap gap-2">
        {selectedOptions.map((opt) => (
          <DismissibleTag key={opt.id} label={opt.title} onRemove={() => removeOption(opt.id)} />
        ))}
        <RelationPicker
          open={open}
          onOpenChange={setOpen}
          value={value}
          onChange={(v) => setValue(v as string[])}
          multiple
          options={filtered}
          searchQuery={search}
          onSearchChange={setSearch}
          placeholder="Search objects..."
        >
          <Button variant="outline" size="sm">
            + Add
          </Button>
        </RelationPicker>
      </div>
    </div>
  );
};

export const WithCreate: Story = () => {
  const [open, setOpen] = React.useState(false);
  const [options, setOptions] = React.useState(mockOptions);
  const [value, setValue] = React.useState<string>('');
  const [search, setSearch] = React.useState('');

  const filtered = options.filter((o) => o.title.toLowerCase().includes(search.toLowerCase()));

  const handleCreate = (title: string) => {
    const newOption: RelationOption = {
      id: String(Date.now()),
      title,
      typeKey: 'Page',
      typeName: 'Page',
      icon: <File className="h-4 w-4" />,
    };
    setOptions((prev) => [...prev, newOption]);
    setValue(newOption.id);
    setSearch('');
  };

  const selected = options.find((o) => o.id === value);

  return (
    <div className="p-6">
      <RelationPicker
        open={open}
        onOpenChange={setOpen}
        value={value}
        onChange={(v) => setValue(v as string)}
        options={filtered}
        searchQuery={search}
        onSearchChange={setSearch}
        onCreate={handleCreate}
        placeholder="Search or create..."
      >
        <Button variant="outline">{selected ? selected.title : 'Select or create...'}</Button>
      </RelationPicker>
    </div>
  );
};

export const Loading: Story = () => {
  const [open, setOpen] = React.useState(true);

  return (
    <div className="p-6">
      <RelationPicker
        open={open}
        onOpenChange={setOpen}
        options={[]}
        loading
        placeholder="Loading..."
      >
        <Button variant="outline">Loading state</Button>
      </RelationPicker>
    </div>
  );
};

export const Empty: Story = () => {
  const [open, setOpen] = React.useState(true);

  return (
    <div className="p-6">
      <RelationPicker
        open={open}
        onOpenChange={setOpen}
        options={[]}
        searchQuery="xyz"
        placeholder="No results"
      >
        <Button variant="outline">Empty state</Button>
      </RelationPicker>
    </div>
  );
};
```

**Step 4: Add to patterns index**

Add to `packages/design-system/src/patterns/index.ts`:

```ts
export { RelationPicker } from './RelationPicker/index.js';
export type { RelationPickerProps, RelationOption } from './RelationPicker/index.js';
```

**Step 5: Verify**

Run:

```bash
pnpm --filter @typenote/design-system typecheck
```

Expected: No errors

**Step 6: Test in Ladle**

Open http://localhost:61000, navigate to Patterns/RelationPicker:

- Verify single select works (closes on selection)
- Verify multi-select works (checkmarks, stays open)
- Verify keyboard navigation
- Verify create option appears when typing

**Step 7: Commit**

```bash
git add packages/design-system/src/patterns/RelationPicker packages/design-system/src/patterns/index.ts
git commit -m "feat(design-system): add RelationPicker pattern for object references"
```

---

## Task 7: ObjectDataGrid Feature (Types)

This task creates the type definitions. The next tasks will create the components.

**Files:**

- Create: `packages/design-system/src/features/ObjectDataGrid/types.ts`

**Step 1: Create types.ts**

Create `packages/design-system/src/features/ObjectDataGrid/types.ts`:

```ts
import type { RelationOption } from '../../patterns/RelationPicker/RelationPicker.js';

export type DataGridColumnType =
  | 'title'
  | 'text'
  | 'number'
  | 'boolean'
  | 'date'
  | 'datetime'
  | 'select'
  | 'multiselect'
  | 'ref'
  | 'refs';

export interface DataGridRowAction<T> {
  id: string;
  label: string;
  icon?: React.ReactNode;
  destructive?: boolean;
  disabled?: boolean | ((row: T) => boolean);
  onClick: (row: T) => void;
}

export interface DataGridColumn<T> {
  key: string;
  header: string;
  type: DataGridColumnType;
  isTitle?: boolean;
  options?: string[];
  allowedTypeKeys?: string[];
  onSearch?: (query: string) => Promise<RelationOption[]>;
  onCreate?: (title: string) => Promise<string>;
  width?: number;
  minWidth?: number;
  pinned?: 'left' | 'right';
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
  editable?: boolean;
  render?: (value: unknown, row: T) => React.ReactNode;
  getValue?: (row: T) => unknown;
}

export interface ObjectDataGridProps<T extends { id: string }> {
  data: T[];
  columns: DataGridColumn<T>[];
  selectedIds?: Set<string>;
  onSelectionChange?: (ids: Set<string>) => void;
  sortColumn?: string;
  sortDirection?: 'asc' | 'desc';
  onSortChange?: (column: string, direction: 'asc' | 'desc') => void;
  onRowOpen?: (row: T) => void;
  onRowDelete?: (row: T) => void;
  rowActions?: DataGridRowAction<T>[];
  onCellChange?: (rowId: string, columnKey: string, value: unknown) => void;
  loading?: boolean;
  emptyMessage?: string;
  className?: string;
}

export interface EditingCell {
  rowId: string;
  columnKey: string;
}
```

**Step 2: Verify**

Run:

```bash
pnpm --filter @typenote/design-system typecheck
```

Expected: No errors

---

## Task 8: ObjectDataGrid Feature (Cell Component)

**Files:**

- Create: `packages/design-system/src/features/ObjectDataGrid/ObjectDataGridCell.tsx`

**Step 1: Create ObjectDataGridCell.tsx**

Create `packages/design-system/src/features/ObjectDataGrid/ObjectDataGridCell.tsx`:

```tsx
import * as React from 'react';
import { ArrowSquareOut } from '@phosphor-icons/react/ssr';

import { cn } from '../../lib/utils.js';
import { TableCell } from '../../primitives/Table/Table.js';
import { Input } from '../../primitives/Input/Input.js';
import { Checkbox } from '../../primitives/Checkbox/Checkbox.js';
import { IconButton } from '../../primitives/IconButton/IconButton.js';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '../../primitives/Select/Select.js';
import { DatePicker } from '../../patterns/DatePicker/DatePicker.js';
import type { DataGridColumn, DataGridColumnType } from './types.js';

interface ObjectDataGridCellProps<T extends { id: string }> {
  row: T;
  column: DataGridColumn<T>;
  isEditing: boolean;
  onStartEdit: () => void;
  onEndEdit: () => void;
  onValueChange: (value: unknown) => void;
  onRowOpen?: () => void;
}

export function ObjectDataGridCell<T extends { id: string }>({
  row,
  column,
  isEditing,
  onStartEdit,
  onEndEdit,
  onValueChange,
  onRowOpen,
}: ObjectDataGridCellProps<T>) {
  const value = column.getValue
    ? column.getValue(row)
    : (row as Record<string, unknown>)[column.key];

  // Custom render
  if (column.render) {
    return (
      <TableCell align={column.align} pinned={column.pinned}>
        {column.render(value, row)}
      </TableCell>
    );
  }

  // Non-editable display
  if (!column.editable || !isEditing) {
    return (
      <TableCell
        align={column.align}
        pinned={column.pinned}
        className={cn('cursor-pointer', column.editable && 'hover:bg-gray-50')}
        onClick={column.editable ? onStartEdit : undefined}
      >
        <div className="group flex items-center gap-2">
          {renderDisplayValue(value, column.type, column.options)}
          {column.isTitle && onRowOpen && (
            <IconButton
              variant="ghost"
              size="sm"
              className="h-6 w-6 opacity-0 group-hover:opacity-100"
              onClick={(e) => {
                e.stopPropagation();
                onRowOpen();
              }}
              aria-label="Open"
            >
              <ArrowSquareOut className="h-3.5 w-3.5" />
            </IconButton>
          )}
        </div>
      </TableCell>
    );
  }

  // Editing mode
  return (
    <TableCell align={column.align} pinned={column.pinned} className="p-1">
      <CellEditor
        type={column.type}
        value={value}
        options={column.options}
        onChange={onValueChange}
        onBlur={onEndEdit}
      />
    </TableCell>
  );
}

function renderDisplayValue(
  value: unknown,
  type: DataGridColumnType,
  options?: string[]
): React.ReactNode {
  if (value === null || value === undefined) {
    return <span className="text-muted-foreground">—</span>;
  }

  switch (type) {
    case 'boolean':
      return <Checkbox checked={Boolean(value)} disabled size="sm" />;
    case 'date':
    case 'datetime':
      if (value instanceof Date) {
        return type === 'datetime' ? value.toLocaleString() : value.toLocaleDateString();
      }
      return String(value);
    case 'select':
      return String(value);
    case 'multiselect':
      if (Array.isArray(value)) {
        return value.join(', ');
      }
      return String(value);
    default:
      return String(value);
  }
}

interface CellEditorProps {
  type: DataGridColumnType;
  value: unknown;
  options?: string[];
  onChange: (value: unknown) => void;
  onBlur: () => void;
}

function CellEditor({ type, value, options, onChange, onBlur }: CellEditorProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === 'Tab') {
      onBlur();
    }
    if (e.key === 'Escape') {
      onBlur();
    }
  };

  switch (type) {
    case 'text':
    case 'title':
      return (
        <Input
          ref={inputRef}
          value={String(value ?? '')}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          onKeyDown={handleKeyDown}
          size="sm"
          className="h-7"
        />
      );

    case 'number':
      return (
        <Input
          ref={inputRef}
          type="number"
          value={String(value ?? '')}
          onChange={(e) => onChange(e.target.value ? Number(e.target.value) : null)}
          onBlur={onBlur}
          onKeyDown={handleKeyDown}
          size="sm"
          className="h-7"
        />
      );

    case 'boolean':
      return (
        <div className="flex items-center justify-center">
          <Checkbox
            checked={Boolean(value)}
            onCheckedChange={(checked) => {
              onChange(checked);
              onBlur();
            }}
            size="sm"
          />
        </div>
      );

    case 'date':
    case 'datetime':
      return (
        <DatePicker
          value={value instanceof Date ? value : null}
          onChange={(date) => {
            onChange(date);
            onBlur();
          }}
        />
      );

    case 'select':
      return (
        <Select
          value={String(value ?? '')}
          onValueChange={(v) => {
            onChange(v);
            onBlur();
          }}
        >
          <SelectTrigger className="h-7" size="sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {options?.map((opt) => (
              <SelectItem key={opt} value={opt}>
                {opt}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );

    default:
      return (
        <Input
          ref={inputRef}
          value={String(value ?? '')}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          onKeyDown={handleKeyDown}
          size="sm"
          className="h-7"
        />
      );
  }
}
```

**Step 2: Verify**

Run:

```bash
pnpm --filter @typenote/design-system typecheck
```

Expected: No errors (may have some issues to fix based on exact API)

---

## Task 9: ObjectDataGrid Feature (Main Component)

**Files:**

- Create: `packages/design-system/src/features/ObjectDataGrid/ObjectDataGrid.tsx`
- Create: `packages/design-system/src/features/ObjectDataGrid/index.ts`
- Create: `packages/design-system/src/features/ObjectDataGrid/ObjectDataGrid.stories.tsx`
- Modify: `packages/design-system/src/features/index.ts`

**Step 1: Create ObjectDataGrid.tsx**

Create `packages/design-system/src/features/ObjectDataGrid/ObjectDataGrid.tsx`:

```tsx
import * as React from 'react';

import { cn } from '../../lib/utils.js';
import {
  Table,
  TableContainer,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
} from '../../primitives/Table/Table.js';
import {
  DataGridHeaderCheckbox,
  DataGridRowCheckbox,
} from '../../patterns/DataGridSelection/DataGridSelection.js';
import { DataGridHeaderCell } from '../../patterns/DataGridHeaderCell/DataGridHeaderCell.js';
import { DataGridRowActions } from '../../patterns/DataGridRowActions/DataGridRowActions.js';
import { ObjectDataGridCell } from './ObjectDataGridCell.js';
import type { ObjectDataGridProps, EditingCell, DataGridColumn } from './types.js';

export function ObjectDataGrid<T extends { id: string }>({
  data,
  columns,
  selectedIds = new Set(),
  onSelectionChange,
  sortColumn,
  sortDirection = 'asc',
  onSortChange,
  onRowOpen,
  onRowDelete,
  rowActions = [],
  onCellChange,
  loading = false,
  emptyMessage = 'No data',
  className,
}: ObjectDataGridProps<T>) {
  const [editingCell, setEditingCell] = React.useState<EditingCell | null>(null);

  const allSelected = data.length > 0 && data.every((row) => selectedIds.has(row.id));
  const someSelected = data.some((row) => selectedIds.has(row.id)) && !allSelected;

  const handleSelectAll = () => {
    if (!onSelectionChange) return;
    if (allSelected) {
      onSelectionChange(new Set());
    } else {
      onSelectionChange(new Set(data.map((row) => row.id)));
    }
  };

  const handleSelectRow = (rowId: string) => {
    if (!onSelectionChange) return;
    const newSet = new Set(selectedIds);
    if (newSet.has(rowId)) {
      newSet.delete(rowId);
    } else {
      newSet.add(rowId);
    }
    onSelectionChange(newSet);
  };

  const handleSort = (column: DataGridColumn<T>) => {
    if (!column.sortable || !onSortChange) return;
    const newDirection = sortColumn === column.key && sortDirection === 'asc' ? 'desc' : 'asc';
    onSortChange(column.key, newDirection);
  };

  const handleCellChange = (rowId: string, columnKey: string, value: unknown) => {
    onCellChange?.(rowId, columnKey, value);
    setEditingCell(null);
  };

  const defaultActions = onRowDelete
    ? [
        {
          id: 'delete',
          label: 'Delete',
          destructive: true,
          onClick: onRowDelete,
        },
      ]
    : [];

  const allActions = [...rowActions, ...defaultActions];

  return (
    <TableContainer className={className}>
      <Table>
        <TableHeader sticky>
          <TableRow>
            {onSelectionChange && (
              <TableHead className="w-10" align="center">
                <DataGridHeaderCheckbox
                  selection={allSelected ? 'all' : someSelected ? 'some' : 'none'}
                  onToggle={handleSelectAll}
                />
              </TableHead>
            )}
            {columns.map((column) => (
              <TableHead
                key={column.key}
                align={column.align}
                pinned={column.pinned}
                style={{ width: column.width, minWidth: column.minWidth }}
              >
                <DataGridHeaderCell
                  label={column.header}
                  sortable={column.sortable}
                  sort={
                    sortColumn === column.key ? (sortDirection === 'asc' ? 'asc' : 'desc') : 'none'
                  }
                  onSort={() => handleSort(column)}
                />
              </TableHead>
            ))}
            {allActions.length > 0 && <TableHead className="w-10" align="center" />}
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <td
                colSpan={
                  columns.length + (onSelectionChange ? 1 : 0) + (allActions.length > 0 ? 1 : 0)
                }
                className="py-8 text-center text-muted-foreground"
              >
                Loading...
              </td>
            </TableRow>
          ) : data.length === 0 ? (
            <TableRow>
              <td
                colSpan={
                  columns.length + (onSelectionChange ? 1 : 0) + (allActions.length > 0 ? 1 : 0)
                }
                className="py-8 text-center text-muted-foreground"
              >
                {emptyMessage}
              </td>
            </TableRow>
          ) : (
            data.map((row) => (
              <TableRow key={row.id} hover selected={selectedIds.has(row.id)}>
                {onSelectionChange && (
                  <td className="w-10 px-2 text-center">
                    <DataGridRowCheckbox
                      checked={selectedIds.has(row.id)}
                      onToggle={() => handleSelectRow(row.id)}
                    />
                  </td>
                )}
                {columns.map((column) => (
                  <ObjectDataGridCell
                    key={column.key}
                    row={row}
                    column={column}
                    isEditing={
                      editingCell?.rowId === row.id && editingCell?.columnKey === column.key
                    }
                    onStartEdit={() => setEditingCell({ rowId: row.id, columnKey: column.key })}
                    onEndEdit={() => setEditingCell(null)}
                    onValueChange={(value) => handleCellChange(row.id, column.key, value)}
                    onRowOpen={onRowOpen ? () => onRowOpen(row) : undefined}
                  />
                ))}
                {allActions.length > 0 && (
                  <td className="w-10 px-2 text-center">
                    <DataGridRowActions
                      actions={allActions.map((action) => ({
                        ...action,
                        onClick: () => action.onClick(row),
                        disabled:
                          typeof action.disabled === 'function'
                            ? action.disabled(row)
                            : action.disabled,
                      }))}
                    />
                  </td>
                )}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

ObjectDataGrid.displayName = 'ObjectDataGrid';
```

**Step 2: Create index.ts**

Create `packages/design-system/src/features/ObjectDataGrid/index.ts`:

```ts
export { ObjectDataGrid } from './ObjectDataGrid.js';
export type {
  ObjectDataGridProps,
  DataGridColumn,
  DataGridColumnType,
  DataGridRowAction,
  EditingCell,
} from './types.js';
```

**Step 3: Create stories**

Create `packages/design-system/src/features/ObjectDataGrid/ObjectDataGrid.stories.tsx`:

```tsx
import * as React from 'react';
import type { Story } from '@ladle/react';

import { ObjectDataGrid } from './ObjectDataGrid.js';
import type { DataGridColumn } from './types.js';

export default {
  title: 'Features/ObjectDataGrid',
};

interface MockObject {
  id: string;
  title: string;
  type: string;
  status: string;
  createdAt: Date;
  count: number;
  active: boolean;
}

const mockData: MockObject[] = [
  {
    id: '1',
    title: 'Project Roadmap',
    type: 'Page',
    status: 'Active',
    createdAt: new Date('2026-01-15'),
    count: 42,
    active: true,
  },
  {
    id: '2',
    title: 'Meeting Notes',
    type: 'Page',
    status: 'Draft',
    createdAt: new Date('2026-01-14'),
    count: 15,
    active: false,
  },
  {
    id: '3',
    title: 'John Smith',
    type: 'Person',
    status: 'Active',
    createdAt: new Date('2026-01-10'),
    count: 8,
    active: true,
  },
  {
    id: '4',
    title: 'Q1 Planning',
    type: 'Event',
    status: 'Completed',
    createdAt: new Date('2026-01-05'),
    count: 23,
    active: false,
  },
  {
    id: '5',
    title: 'Office HQ',
    type: 'Place',
    status: 'Active',
    createdAt: new Date('2026-01-01'),
    count: 5,
    active: true,
  },
];

const columns: DataGridColumn<MockObject>[] = [
  { key: 'title', header: 'Title', type: 'title', isTitle: true, sortable: true, editable: true },
  { key: 'type', header: 'Type', type: 'text', sortable: true },
  {
    key: 'status',
    header: 'Status',
    type: 'select',
    options: ['Active', 'Draft', 'Completed'],
    editable: true,
  },
  { key: 'createdAt', header: 'Created', type: 'date', sortable: true, editable: true },
  { key: 'count', header: 'Count', type: 'number', align: 'right', editable: true },
  { key: 'active', header: 'Active', type: 'boolean', align: 'center', editable: true },
];

export const Default: Story = () => {
  const [data, setData] = React.useState(mockData);
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());
  const [sortColumn, setSortColumn] = React.useState<string | undefined>();
  const [sortDirection, setSortDirection] = React.useState<'asc' | 'desc'>('asc');

  const handleCellChange = (rowId: string, columnKey: string, value: unknown) => {
    setData((prev) => prev.map((row) => (row.id === rowId ? { ...row, [columnKey]: value } : row)));
  };

  const handleSort = (column: string, direction: 'asc' | 'desc') => {
    setSortColumn(column);
    setSortDirection(direction);
  };

  const sortedData = React.useMemo(() => {
    if (!sortColumn) return data;
    return [...data].sort((a, b) => {
      const aVal = a[sortColumn as keyof MockObject];
      const bVal = b[sortColumn as keyof MockObject];
      const cmp = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      return sortDirection === 'asc' ? cmp : -cmp;
    });
  }, [data, sortColumn, sortDirection]);

  return (
    <div className="p-6">
      <ObjectDataGrid
        data={sortedData}
        columns={columns}
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        sortColumn={sortColumn}
        sortDirection={sortDirection}
        onSortChange={handleSort}
        onRowOpen={(row) => alert(`Open: ${row.title}`)}
        onRowDelete={(row) => {
          if (confirm(`Delete ${row.title}?`)) {
            setData((prev) => prev.filter((r) => r.id !== row.id));
          }
        }}
        onCellChange={handleCellChange}
      />
      <p className="mt-4 text-sm text-muted-foreground">Selected: {selectedIds.size} rows</p>
    </div>
  );
};

export const Empty: Story = () => (
  <div className="p-6">
    <ObjectDataGrid data={[]} columns={columns} emptyMessage="No objects found" />
  </div>
);

export const Loading: Story = () => (
  <div className="p-6">
    <ObjectDataGrid data={[]} columns={columns} loading />
  </div>
);

export const ReadOnly: Story = () => (
  <div className="p-6">
    <ObjectDataGrid data={mockData} columns={columns.map((c) => ({ ...c, editable: false }))} />
  </div>
);
```

**Step 4: Add to features index**

Check and add to `packages/design-system/src/features/index.ts`:

```ts
export { ObjectDataGrid } from './ObjectDataGrid/index.js';
export type {
  ObjectDataGridProps,
  DataGridColumn,
  DataGridColumnType,
  DataGridRowAction,
} from './ObjectDataGrid/index.js';
```

**Step 5: Verify**

Run:

```bash
pnpm --filter @typenote/design-system typecheck
```

Expected: No errors (fix any issues)

**Step 6: Test in Ladle**

Open http://localhost:61000, navigate to Features/ObjectDataGrid:

- Verify table renders with data
- Verify selection checkboxes work
- Verify sorting works
- Verify clicking cells enters edit mode
- Verify cell changes persist

**Step 7: Commit**

```bash
git add packages/design-system/src/features/ObjectDataGrid packages/design-system/src/features/index.ts
git commit -m "feat(design-system): add ObjectDataGrid feature with inline editing"
```

---

## Task 10: Final Verification

**Step 1: Run full typecheck**

```bash
pnpm typecheck
```

Expected: No errors

**Step 2: Run lint**

```bash
pnpm lint
```

Expected: No errors (fix any)

**Step 3: Run tests**

```bash
pnpm test
```

Expected: All pass

**Step 4: Final Ladle review**

Navigate through all new components in Ladle, verify they work as expected.

**Step 5: Final commit (if any fixes)**

```bash
git add -A
git commit -m "fix(design-system): address review feedback"
```

---

## Summary

| Task | Component          | Type      |
| ---- | ------------------ | --------- |
| 1    | Dependencies       | Setup     |
| 2    | Popover            | Primitive |
| 3    | Calendar           | Pattern   |
| 4    | DatePicker         | Pattern   |
| 5    | DismissibleTag     | Pattern   |
| 6    | RelationPicker     | Pattern   |
| 7-9  | ObjectDataGrid     | Feature   |
| 10   | Final verification | QA        |

Total: 10 tasks, ~6 new components
