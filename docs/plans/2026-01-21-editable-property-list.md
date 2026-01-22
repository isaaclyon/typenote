# Editable PropertyList Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Extend PropertyList with inline editing support for text, number, boolean, date, datetime, select, and multiselect property types using Notion-style click-to-edit UX.

**Architecture:** Add `editable` prop to PropertyList that switches value rendering to EditableValue component. Each property type has a dedicated editor component. Edit state is managed per-row (not global). Blur/Tab saves, Escape cancels.

**Tech Stack:** React, TypeScript, react-day-picker (already installed), existing Select primitive, Tailwind CSS

---

## Task 1: Extend PropertyListItem Type

**Files:**

- Modify: `packages/design-system/src/patterns/PropertyList/PropertyList.tsx:8-22`

**Step 1: Update the PropertyListItem interface**

Add new fields for editing support:

```typescript
export type PropertyType =
  | 'text'
  | 'number'
  | 'boolean'
  | 'date'
  | 'datetime'
  | 'select'
  | 'multiselect';

export interface PropertyListItem {
  /** Unique identifier for onPropertyChange callback */
  key: string;
  /** Label for the property */
  label: string;
  /** Value to display (can be any React node for badges, dates, etc.) */
  value: React.ReactNode;
  /** Property type for editing - required when editable */
  type?: PropertyType;
  /** Raw value for editing (string, number, boolean, Date, string[]) */
  rawValue?: unknown;
  /** Options for select/multiselect types */
  options?: string[];
  /** Placeholder text for empty values */
  placeholder?: string;
  /** Disable editing for this row */
  disabled?: boolean;
  /** Optional additional CSS class for the row */
  className?: string;
}

export interface PropertyListProps {
  /** Array of property items to display */
  items: PropertyListItem[];
  /** Additional CSS classes for the container */
  className?: string;
  /** Enable inline editing */
  editable?: boolean;
  /** Callback when a property value changes */
  onPropertyChange?: (key: string, value: unknown) => void;
}
```

**Step 2: Run typecheck to verify**

Run: `pnpm --filter @typenote/design-system typecheck`
Expected: PASS (no implementation changes yet, just types)

**Step 3: Commit**

```bash
git add packages/design-system/src/patterns/PropertyList/PropertyList.tsx
git commit -m "feat(design-system): extend PropertyListItem types for editing"
```

---

## Task 2: Create TextEditor Component

**Files:**

- Create: `packages/design-system/src/patterns/PropertyList/editors/TextEditor.tsx`
- Create: `packages/design-system/src/patterns/PropertyList/editors/index.ts`

**Step 1: Create TextEditor component**

```typescript
// editors/TextEditor.tsx
import * as React from 'react';
import { cn } from '../../../lib/utils.js';

export interface TextEditorProps {
  value: string;
  onSave: (value: string) => void;
  onCancel: () => void;
  type?: 'text' | 'number';
  placeholder?: string;
  className?: string;
}

const TextEditor = React.forwardRef<HTMLInputElement, TextEditorProps>(
  ({ value, onSave, onCancel, type = 'text', placeholder, className }, ref) => {
    const [localValue, setLocalValue] = React.useState(value);
    const inputRef = React.useRef<HTMLInputElement>(null);

    // Merge refs
    React.useImperativeHandle(ref, () => inputRef.current!);

    // Auto-focus and select on mount
    React.useEffect(() => {
      const input = inputRef.current;
      if (input) {
        input.focus();
        input.select();
      }
    }, []);

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        onSave(type === 'number' ? localValue : localValue);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onCancel();
      }
    };

    const handleBlur = () => {
      onSave(localValue);
    };

    return (
      <input
        ref={inputRef}
        type={type}
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        placeholder={placeholder}
        className={cn(
          'w-full bg-transparent text-sm text-foreground',
          'border-b border-accent-500 outline-none',
          'focus:border-accent-600',
          'placeholder:text-fg-tertiary placeholder:italic',
          className
        )}
      />
    );
  }
);

TextEditor.displayName = 'TextEditor';

export { TextEditor };
```

**Step 2: Create barrel export**

```typescript
// editors/index.ts
export { TextEditor } from './TextEditor.js';
export type { TextEditorProps } from './TextEditor.js';
```

**Step 3: Run typecheck**

Run: `pnpm --filter @typenote/design-system typecheck`
Expected: PASS

**Step 4: Commit**

```bash
git add packages/design-system/src/patterns/PropertyList/editors/
git commit -m "feat(design-system): add TextEditor for inline property editing"
```

---

## Task 3: Create BooleanEditor Component

**Files:**

- Create: `packages/design-system/src/patterns/PropertyList/editors/BooleanEditor.tsx`
- Modify: `packages/design-system/src/patterns/PropertyList/editors/index.ts`

**Step 1: Create BooleanEditor component**

```typescript
// editors/BooleanEditor.tsx
import * as React from 'react';
import { Checkbox } from '../../../primitives/Checkbox/Checkbox.js';

export interface BooleanEditorProps {
  value: boolean;
  onSave: (value: boolean) => void;
  disabled?: boolean;
}

const BooleanEditor: React.FC<BooleanEditorProps> = ({ value, onSave, disabled }) => {
  const handleChange = (checked: boolean) => {
    onSave(checked);
  };

  return (
    <Checkbox
      checked={value}
      onCheckedChange={handleChange}
      disabled={disabled}
    />
  );
};

BooleanEditor.displayName = 'BooleanEditor';

export { BooleanEditor };
```

**Step 2: Update barrel export**

```typescript
// editors/index.ts
export { TextEditor } from './TextEditor.js';
export type { TextEditorProps } from './TextEditor.js';

export { BooleanEditor } from './BooleanEditor.js';
export type { BooleanEditorProps } from './BooleanEditor.js';
```

**Step 3: Run typecheck**

Run: `pnpm --filter @typenote/design-system typecheck`
Expected: PASS

**Step 4: Commit**

```bash
git add packages/design-system/src/patterns/PropertyList/editors/
git commit -m "feat(design-system): add BooleanEditor for inline property editing"
```

---

## Task 4: Create SelectEditor Component

**Files:**

- Create: `packages/design-system/src/patterns/PropertyList/editors/SelectEditor.tsx`
- Modify: `packages/design-system/src/patterns/PropertyList/editors/index.ts`

**Step 1: Create SelectEditor component**

```typescript
// editors/SelectEditor.tsx
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
      disabled={disabled}
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
```

**Step 2: Update barrel export**

```typescript
// editors/index.ts
export { TextEditor } from './TextEditor.js';
export type { TextEditorProps } from './TextEditor.js';

export { BooleanEditor } from './BooleanEditor.js';
export type { BooleanEditorProps } from './BooleanEditor.js';

export { SelectEditor } from './SelectEditor.js';
export type { SelectEditorProps } from './SelectEditor.js';
```

**Step 3: Run typecheck**

Run: `pnpm --filter @typenote/design-system typecheck`
Expected: PASS

**Step 4: Commit**

```bash
git add packages/design-system/src/patterns/PropertyList/editors/
git commit -m "feat(design-system): add SelectEditor for inline property editing"
```

---

## Task 5: Create MultiselectEditor Component

**Files:**

- Create: `packages/design-system/src/patterns/PropertyList/editors/MultiselectEditor.tsx`
- Modify: `packages/design-system/src/patterns/PropertyList/editors/index.ts`

**Step 1: Create MultiselectEditor component**

```typescript
// editors/MultiselectEditor.tsx
import * as React from 'react';
import { cn } from '../../../lib/utils.js';
import { Badge } from '../../../primitives/Badge/Badge.js';
import { Popover, PopoverTrigger, PopoverContent } from '../../../primitives/Popover/Popover.js';
import { Checkbox } from '../../../primitives/Checkbox/Checkbox.js';

export interface MultiselectEditorProps {
  value: string[];
  options: string[];
  onSave: (value: string[]) => void;
  onCancel: () => void;
  placeholder?: string;
  disabled?: boolean;
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

  const handleToggle = (option: string) => {
    setLocalValue((prev) =>
      prev.includes(option)
        ? prev.filter((v) => v !== option)
        : [...prev, option]
    );
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      // Save on close
      onSave(localValue);
    }
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild disabled={disabled}>
        <button
          className={cn(
            'flex flex-wrap gap-1 min-h-7 w-full items-center rounded px-2 py-1',
            'text-sm text-left',
            'border border-border bg-background',
            'hover:bg-surface-hover focus:outline-none focus:ring-2 focus:ring-accent-500'
          )}
        >
          {localValue.length > 0 ? (
            localValue.map((v) => (
              <Badge key={v} intent="neutral" size="sm">
                {v}
              </Badge>
            ))
          ) : (
            <span className="text-fg-tertiary italic">{placeholder}</span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-48 p-2" align="start">
        <div className="flex flex-col gap-1">
          {options.map((option) => (
            <label
              key={option}
              className={cn(
                'flex items-center gap-2 rounded px-2 py-1.5 text-sm',
                'cursor-pointer hover:bg-surface-hover'
              )}
            >
              <Checkbox
                checked={localValue.includes(option)}
                onCheckedChange={() => handleToggle(option)}
              />
              {option}
            </label>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};

MultiselectEditor.displayName = 'MultiselectEditor';

export { MultiselectEditor };
```

**Step 2: Update barrel export**

```typescript
// editors/index.ts
export { TextEditor } from './TextEditor.js';
export type { TextEditorProps } from './TextEditor.js';

export { BooleanEditor } from './BooleanEditor.js';
export type { BooleanEditorProps } from './BooleanEditor.js';

export { SelectEditor } from './SelectEditor.js';
export type { SelectEditorProps } from './SelectEditor.js';

export { MultiselectEditor } from './MultiselectEditor.js';
export type { MultiselectEditorProps } from './MultiselectEditor.js';
```

**Step 3: Run typecheck**

Run: `pnpm --filter @typenote/design-system typecheck`
Expected: PASS

**Step 4: Commit**

```bash
git add packages/design-system/src/patterns/PropertyList/editors/
git commit -m "feat(design-system): add MultiselectEditor for inline property editing"
```

---

## Task 6: Create DateEditor Component

**Files:**

- Create: `packages/design-system/src/patterns/PropertyList/editors/DateEditor.tsx`
- Modify: `packages/design-system/src/patterns/PropertyList/editors/index.ts`

**Step 1: Create DateEditor component**

```typescript
// editors/DateEditor.tsx
import * as React from 'react';
import { format } from 'date-fns';
import { DayPicker } from 'react-day-picker';
import { cn } from '../../../lib/utils.js';
import { Popover, PopoverTrigger, PopoverContent } from '../../../primitives/Popover/Popover.js';
import { Button } from '../../../primitives/Button/Button.js';
import { Calendar } from 'lucide-react';

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
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(
    value ?? undefined
  );

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
    return includeTime
      ? format(date, 'MMM d, yyyy h:mm a')
      : format(date, 'MMM d, yyyy');
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild disabled={disabled}>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            'justify-start text-left font-normal',
            !value && 'text-fg-tertiary'
          )}
        >
          <Calendar className="mr-2 h-4 w-4" />
          {value ? formatDate(value) : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <DayPicker
          mode="single"
          selected={selectedDate}
          onSelect={handleSelect}
          initialFocus
          className="p-3"
        />
      </PopoverContent>
    </Popover>
  );
};

DateEditor.displayName = 'DateEditor';

export { DateEditor };
```

**Step 2: Update barrel export**

```typescript
// editors/index.ts
export { TextEditor } from './TextEditor.js';
export type { TextEditorProps } from './TextEditor.js';

export { BooleanEditor } from './BooleanEditor.js';
export type { BooleanEditorProps } from './BooleanEditor.js';

export { SelectEditor } from './SelectEditor.js';
export type { SelectEditorProps } from './SelectEditor.js';

export { MultiselectEditor } from './MultiselectEditor.js';
export type { MultiselectEditorProps } from './MultiselectEditor.js';

export { DateEditor } from './DateEditor.js';
export type { DateEditorProps } from './DateEditor.js';
```

**Step 3: Run typecheck**

Run: `pnpm --filter @typenote/design-system typecheck`
Expected: PASS

**Step 4: Commit**

```bash
git add packages/design-system/src/patterns/PropertyList/editors/
git commit -m "feat(design-system): add DateEditor for inline property editing"
```

---

## Task 7: Create EditableValue Component

**Files:**

- Create: `packages/design-system/src/patterns/PropertyList/EditableValue.tsx`

**Step 1: Create EditableValue component**

```typescript
// EditableValue.tsx
import * as React from 'react';
import { cn } from '../../lib/utils.js';
import type { PropertyListItem, PropertyType } from './PropertyList.js';
import { TextEditor } from './editors/TextEditor.js';
import { BooleanEditor } from './editors/BooleanEditor.js';
import { SelectEditor } from './editors/SelectEditor.js';
import { MultiselectEditor } from './editors/MultiselectEditor.js';
import { DateEditor } from './editors/DateEditor.js';

export interface EditableValueProps {
  item: PropertyListItem;
  onSave: (value: unknown) => void;
}

const EditableValue: React.FC<EditableValueProps> = ({ item, onSave }) => {
  const [isEditing, setIsEditing] = React.useState(false);

  const handleSave = (value: unknown) => {
    onSave(value);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleClick = () => {
    if (!item.disabled && item.type !== 'boolean') {
      setIsEditing(true);
    }
  };

  // Boolean is always "editable" - just a toggle
  if (item.type === 'boolean') {
    return (
      <BooleanEditor
        value={Boolean(item.rawValue)}
        onSave={handleSave}
        disabled={item.disabled}
      />
    );
  }

  // Editing mode
  if (isEditing && item.type) {
    switch (item.type) {
      case 'text':
        return (
          <TextEditor
            value={String(item.rawValue ?? '')}
            onSave={handleSave}
            onCancel={handleCancel}
            type="text"
            placeholder={item.placeholder}
          />
        );

      case 'number':
        return (
          <TextEditor
            value={String(item.rawValue ?? '')}
            onSave={(v) => handleSave(v === '' ? null : Number(v))}
            onCancel={handleCancel}
            type="number"
            placeholder={item.placeholder}
          />
        );

      case 'select':
        return (
          <SelectEditor
            value={String(item.rawValue ?? '')}
            options={item.options ?? []}
            onSave={handleSave}
            onCancel={handleCancel}
            placeholder={item.placeholder}
            disabled={item.disabled}
          />
        );

      case 'multiselect':
        return (
          <MultiselectEditor
            value={Array.isArray(item.rawValue) ? item.rawValue : []}
            options={item.options ?? []}
            onSave={handleSave}
            onCancel={handleCancel}
            placeholder={item.placeholder}
            disabled={item.disabled}
          />
        );

      case 'date':
        return (
          <DateEditor
            value={item.rawValue instanceof Date ? item.rawValue : null}
            onSave={handleSave}
            onCancel={handleCancel}
            includeTime={false}
            placeholder={item.placeholder}
            disabled={item.disabled}
          />
        );

      case 'datetime':
        return (
          <DateEditor
            value={item.rawValue instanceof Date ? item.rawValue : null}
            onSave={handleSave}
            onCancel={handleCancel}
            includeTime={true}
            placeholder={item.placeholder}
            disabled={item.disabled}
          />
        );
    }
  }

  // View mode - render the display value
  const isEmpty = item.rawValue === null || item.rawValue === undefined || item.rawValue === '';

  return (
    <div
      onClick={handleClick}
      className={cn(
        'rounded px-1 -mx-1 min-h-[1.5rem]',
        !item.disabled && 'cursor-pointer hover:bg-surface-hover',
        item.disabled && 'cursor-not-allowed text-fg-tertiary'
      )}
      role={!item.disabled ? 'button' : undefined}
      tabIndex={!item.disabled ? 0 : undefined}
      onKeyDown={(e) => {
        if (!item.disabled && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      {isEmpty ? (
        <span className="text-fg-tertiary italic">
          {item.placeholder ?? 'Empty'}
        </span>
      ) : (
        item.value
      )}
    </div>
  );
};

EditableValue.displayName = 'EditableValue';

export { EditableValue };
```

**Step 2: Run typecheck**

Run: `pnpm --filter @typenote/design-system typecheck`
Expected: PASS

**Step 3: Commit**

```bash
git add packages/design-system/src/patterns/PropertyList/EditableValue.tsx
git commit -m "feat(design-system): add EditableValue orchestrator component"
```

---

## Task 8: Integrate EditableValue into PropertyList

**Files:**

- Modify: `packages/design-system/src/patterns/PropertyList/PropertyList.tsx`

**Step 1: Update PropertyList to use EditableValue**

Replace the entire PropertyList.tsx with:

```typescript
import * as React from 'react';
import { cn } from '../../lib/utils.js';
import { EditableValue } from './EditableValue.js';

// ============================================================================
// Types
// ============================================================================

export type PropertyType =
  | 'text'
  | 'number'
  | 'boolean'
  | 'date'
  | 'datetime'
  | 'select'
  | 'multiselect';

export interface PropertyListItem {
  /** Unique identifier for onPropertyChange callback */
  key: string;
  /** Label for the property */
  label: string;
  /** Value to display (can be any React node for badges, dates, etc.) */
  value: React.ReactNode;
  /** Property type for editing - required when editable */
  type?: PropertyType;
  /** Raw value for editing (string, number, boolean, Date, string[]) */
  rawValue?: unknown;
  /** Options for select/multiselect types */
  options?: string[];
  /** Placeholder text for empty values */
  placeholder?: string;
  /** Disable editing for this row */
  disabled?: boolean;
  /** Optional additional CSS class for the row */
  className?: string;
}

export interface PropertyListProps {
  /** Array of property items to display */
  items: PropertyListItem[];
  /** Additional CSS classes for the container */
  className?: string;
  /** Enable inline editing */
  editable?: boolean;
  /** Callback when a property value changes */
  onPropertyChange?: (key: string, value: unknown) => void;
}

// ============================================================================
// PropertyList
// ============================================================================

const PropertyList = React.forwardRef<HTMLDListElement, PropertyListProps>(
  ({ items, className, editable, onPropertyChange }, ref) => {
    return (
      <dl
        ref={ref}
        className={cn('tn-property-list grid gap-3', className)}
        data-component="property-list"
        data-editable={editable ? 'true' : undefined}
      >
        {items.map((item) => (
          <div
            key={item.key}
            className={cn(
              'tn-property-list-item grid grid-cols-[120px_1fr] items-start gap-4',
              item.className
            )}
            data-property={item.key}
          >
            <dt className="text-sm font-medium text-fg-secondary">{item.label}</dt>
            <dd className="text-sm text-foreground">
              {editable && item.type ? (
                <EditableValue
                  item={item}
                  onSave={(value) => onPropertyChange?.(item.key, value)}
                />
              ) : (
                item.value
              )}
            </dd>
          </div>
        ))}
      </dl>
    );
  }
);

PropertyList.displayName = 'PropertyList';

export { PropertyList };
```

**Step 2: Run typecheck**

Run: `pnpm --filter @typenote/design-system typecheck`
Expected: PASS

**Step 3: Commit**

```bash
git add packages/design-system/src/patterns/PropertyList/PropertyList.tsx
git commit -m "feat(design-system): integrate EditableValue into PropertyList"
```

---

## Task 9: Update PropertyList Index Export

**Files:**

- Modify: `packages/design-system/src/patterns/PropertyList/index.ts`

**Step 1: Update exports**

```typescript
export { PropertyList } from './PropertyList.js';
export type { PropertyListProps, PropertyListItem, PropertyType } from './PropertyList.js';
export { EditableValue } from './EditableValue.js';
export type { EditableValueProps } from './EditableValue.js';
```

**Step 2: Run typecheck**

Run: `pnpm --filter @typenote/design-system typecheck`
Expected: PASS

**Step 3: Commit**

```bash
git add packages/design-system/src/patterns/PropertyList/index.ts
git commit -m "feat(design-system): export EditableValue and PropertyType"
```

---

## Task 10: Add Editable Stories

**Files:**

- Modify: `packages/design-system/src/patterns/PropertyList/PropertyList.stories.tsx`

**Step 1: Add editable stories**

Append to the existing stories file:

```typescript
// ============================================================================
// Editable Stories
// ============================================================================

export const EditableText: Story = () => {
  const [data, setData] = React.useState({ name: 'John Doe', email: 'john@example.com' });

  const handleChange = (key: string, value: unknown) => {
    setData((prev) => ({ ...prev, [key]: value }));
  };

  const items: PropertyListItem[] = [
    { key: 'name', label: 'Name', type: 'text', rawValue: data.name, value: data.name },
    { key: 'email', label: 'Email', type: 'text', rawValue: data.email, value: data.email },
  ];

  return (
    <div className="max-w-md p-6">
      <h2 className="mb-4 text-sm font-semibold text-fg-secondary">Click to edit text values</h2>
      <PropertyList items={items} editable onPropertyChange={handleChange} />
      <pre className="mt-4 text-xs text-fg-tertiary">{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
};

export const EditableNumber: Story = () => {
  const [data, setData] = React.useState({ age: 30, score: 95.5 });

  const handleChange = (key: string, value: unknown) => {
    setData((prev) => ({ ...prev, [key]: value }));
  };

  const items: PropertyListItem[] = [
    { key: 'age', label: 'Age', type: 'number', rawValue: data.age, value: String(data.age) },
    { key: 'score', label: 'Score', type: 'number', rawValue: data.score, value: String(data.score) },
  ];

  return (
    <div className="max-w-md p-6">
      <h2 className="mb-4 text-sm font-semibold text-fg-secondary">Click to edit number values</h2>
      <PropertyList items={items} editable onPropertyChange={handleChange} />
      <pre className="mt-4 text-xs text-fg-tertiary">{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
};

export const EditableBoolean: Story = () => {
  const [data, setData] = React.useState({ active: true, verified: false });

  const handleChange = (key: string, value: unknown) => {
    setData((prev) => ({ ...prev, [key]: value }));
  };

  const items: PropertyListItem[] = [
    { key: 'active', label: 'Active', type: 'boolean', rawValue: data.active, value: data.active ? 'Yes' : 'No' },
    { key: 'verified', label: 'Verified', type: 'boolean', rawValue: data.verified, value: data.verified ? 'Yes' : 'No' },
  ];

  return (
    <div className="max-w-md p-6">
      <h2 className="mb-4 text-sm font-semibold text-fg-secondary">Toggle boolean values</h2>
      <PropertyList items={items} editable onPropertyChange={handleChange} />
      <pre className="mt-4 text-xs text-fg-tertiary">{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
};

export const EditableSelect: Story = () => {
  const [data, setData] = React.useState({ status: 'active', priority: 'medium' });

  const handleChange = (key: string, value: unknown) => {
    setData((prev) => ({ ...prev, [key]: value }));
  };

  const items: PropertyListItem[] = [
    {
      key: 'status',
      label: 'Status',
      type: 'select',
      rawValue: data.status,
      value: <Badge intent={data.status === 'active' ? 'success' : 'neutral'}>{data.status}</Badge>,
      options: ['active', 'inactive', 'pending'],
    },
    {
      key: 'priority',
      label: 'Priority',
      type: 'select',
      rawValue: data.priority,
      value: <Badge intent={data.priority === 'high' ? 'warning' : 'neutral'}>{data.priority}</Badge>,
      options: ['low', 'medium', 'high'],
    },
  ];

  return (
    <div className="max-w-md p-6">
      <h2 className="mb-4 text-sm font-semibold text-fg-secondary">Click to change select values</h2>
      <PropertyList items={items} editable onPropertyChange={handleChange} />
      <pre className="mt-4 text-xs text-fg-tertiary">{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
};

export const EditableMultiselect: Story = () => {
  const [data, setData] = React.useState({ tags: ['react', 'typescript'] });

  const handleChange = (key: string, value: unknown) => {
    setData((prev) => ({ ...prev, [key]: value }));
  };

  const items: PropertyListItem[] = [
    {
      key: 'tags',
      label: 'Tags',
      type: 'multiselect',
      rawValue: data.tags,
      value: (
        <div className="flex flex-wrap gap-1">
          {data.tags.map((tag) => (
            <Badge key={tag} intent="neutral">{tag}</Badge>
          ))}
        </div>
      ),
      options: ['react', 'typescript', 'electron', 'tailwind', 'vite'],
    },
  ];

  return (
    <div className="max-w-md p-6">
      <h2 className="mb-4 text-sm font-semibold text-fg-secondary">Click to edit multi-select values</h2>
      <PropertyList items={items} editable onPropertyChange={handleChange} />
      <pre className="mt-4 text-xs text-fg-tertiary">{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
};

export const EditableDate: Story = () => {
  const [data, setData] = React.useState({
    startDate: new Date('2026-01-15'),
    deadline: new Date('2026-02-28'),
  });

  const handleChange = (key: string, value: unknown) => {
    setData((prev) => ({ ...prev, [key]: value }));
  };

  const formatDate = (date: Date) => date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const items: PropertyListItem[] = [
    {
      key: 'startDate',
      label: 'Start Date',
      type: 'date',
      rawValue: data.startDate,
      value: formatDate(data.startDate),
    },
    {
      key: 'deadline',
      label: 'Deadline',
      type: 'date',
      rawValue: data.deadline,
      value: formatDate(data.deadline),
    },
  ];

  return (
    <div className="max-w-md p-6">
      <h2 className="mb-4 text-sm font-semibold text-fg-secondary">Click to pick dates</h2>
      <PropertyList items={items} editable onPropertyChange={handleChange} />
      <pre className="mt-4 text-xs text-fg-tertiary">{JSON.stringify(data, null, 2, (key, value) =>
        value instanceof Date ? value.toISOString() : value
      )}</pre>
    </div>
  );
};

export const EditableMixed: Story = () => {
  const [data, setData] = React.useState({
    name: 'Project Alpha',
    status: 'active',
    priority: 'high',
    budget: 50000,
    approved: true,
    startDate: new Date('2026-01-15'),
    tags: ['frontend', 'urgent'],
  });

  const handleChange = (key: string, value: unknown) => {
    setData((prev) => ({ ...prev, [key]: value }));
  };

  const items: PropertyListItem[] = [
    { key: 'name', label: 'Name', type: 'text', rawValue: data.name, value: data.name },
    {
      key: 'status',
      label: 'Status',
      type: 'select',
      rawValue: data.status,
      value: <Badge intent="success">{data.status}</Badge>,
      options: ['active', 'paused', 'completed'],
    },
    {
      key: 'priority',
      label: 'Priority',
      type: 'select',
      rawValue: data.priority,
      value: <Badge intent="warning">{data.priority}</Badge>,
      options: ['low', 'medium', 'high'],
    },
    { key: 'budget', label: 'Budget', type: 'number', rawValue: data.budget, value: `$${data.budget.toLocaleString()}` },
    { key: 'approved', label: 'Approved', type: 'boolean', rawValue: data.approved, value: data.approved ? 'Yes' : 'No' },
    {
      key: 'startDate',
      label: 'Start Date',
      type: 'date',
      rawValue: data.startDate,
      value: data.startDate.toLocaleDateString(),
    },
    {
      key: 'tags',
      label: 'Tags',
      type: 'multiselect',
      rawValue: data.tags,
      value: (
        <div className="flex flex-wrap gap-1">
          {data.tags.map((tag) => (
            <Badge key={tag} intent="neutral">{tag}</Badge>
          ))}
        </div>
      ),
      options: ['frontend', 'backend', 'urgent', 'research', 'design'],
    },
  ];

  return (
    <div className="max-w-md p-6">
      <h2 className="mb-4 text-sm font-semibold text-fg-secondary">All property types together</h2>
      <PropertyList items={items} editable onPropertyChange={handleChange} />
      <pre className="mt-4 text-xs text-fg-tertiary overflow-auto max-h-40">
        {JSON.stringify(data, (key, value) => (value instanceof Date ? value.toISOString() : value), 2)}
      </pre>
    </div>
  );
};

export const EditableEmpty: Story = () => {
  const [data, setData] = React.useState<Record<string, unknown>>({
    name: '',
    status: null,
    tags: [],
  });

  const handleChange = (key: string, value: unknown) => {
    setData((prev) => ({ ...prev, [key]: value }));
  };

  const items: PropertyListItem[] = [
    { key: 'name', label: 'Name', type: 'text', rawValue: data.name, value: data.name || '', placeholder: 'Enter name...' },
    {
      key: 'status',
      label: 'Status',
      type: 'select',
      rawValue: data.status,
      value: data.status ? <Badge>{String(data.status)}</Badge> : null,
      options: ['active', 'inactive'],
      placeholder: 'Select status...',
    },
    {
      key: 'tags',
      label: 'Tags',
      type: 'multiselect',
      rawValue: data.tags,
      value: Array.isArray(data.tags) && data.tags.length > 0 ? (
        <div className="flex flex-wrap gap-1">
          {(data.tags as string[]).map((tag) => (
            <Badge key={tag} intent="neutral">{tag}</Badge>
          ))}
        </div>
      ) : null,
      options: ['important', 'review', 'draft'],
      placeholder: 'Add tags...',
    },
  ];

  return (
    <div className="max-w-md p-6">
      <h2 className="mb-4 text-sm font-semibold text-fg-secondary">Empty values with placeholders</h2>
      <PropertyList items={items} editable onPropertyChange={handleChange} />
      <pre className="mt-4 text-xs text-fg-tertiary">{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
};

export const EditableDisabled: Story = () => {
  const items: PropertyListItem[] = [
    { key: 'id', label: 'ID', type: 'text', rawValue: 'obj_12345', value: 'obj_12345', disabled: true },
    { key: 'name', label: 'Name', type: 'text', rawValue: 'Editable Name', value: 'Editable Name' },
    { key: 'createdAt', label: 'Created', type: 'date', rawValue: new Date(), value: 'Jan 21, 2026', disabled: true },
    { key: 'status', label: 'Status', type: 'select', rawValue: 'active', value: <Badge>active</Badge>, options: ['active', 'inactive'] },
  ];

  return (
    <div className="max-w-md p-6">
      <h2 className="mb-4 text-sm font-semibold text-fg-secondary">Mixed enabled/disabled rows</h2>
      <PropertyList items={items} editable onPropertyChange={(k, v) => console.log(k, v)} />
    </div>
  );
};
```

**Step 2: Run Ladle to verify stories**

Run: `pnpm --filter @typenote/design-system sandbox`
Expected: All new stories render without errors

**Step 3: Commit**

```bash
git add packages/design-system/src/patterns/PropertyList/PropertyList.stories.tsx
git commit -m "feat(design-system): add editable PropertyList stories"
```

---

## Task 11: Final Typecheck and Lint

**Files:** None (validation only)

**Step 1: Run full typecheck**

Run: `pnpm typecheck`
Expected: PASS

**Step 2: Run lint**

Run: `pnpm lint`
Expected: PASS (or fix any issues)

**Step 3: Run format**

Run: `pnpm format`

**Step 4: Final commit if any fixes**

```bash
git add -A
git commit -m "chore: lint and format editable PropertyList"
```

---

## Summary

| Task | Description                       | Files                         |
| ---- | --------------------------------- | ----------------------------- |
| 1    | Extend PropertyListItem types     | PropertyList.tsx              |
| 2    | Create TextEditor                 | editors/TextEditor.tsx        |
| 3    | Create BooleanEditor              | editors/BooleanEditor.tsx     |
| 4    | Create SelectEditor               | editors/SelectEditor.tsx      |
| 5    | Create MultiselectEditor          | editors/MultiselectEditor.tsx |
| 6    | Create DateEditor                 | editors/DateEditor.tsx        |
| 7    | Create EditableValue orchestrator | EditableValue.tsx             |
| 8    | Integrate into PropertyList       | PropertyList.tsx              |
| 9    | Update exports                    | index.ts                      |
| 10   | Add Ladle stories                 | PropertyList.stories.tsx      |
| 11   | Final validation                  | —                             |

**Estimated time:** 2-3 hours
**Commits:** 11
