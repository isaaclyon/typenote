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
  ({ items, className, editable = false, onPropertyChange }, ref) => {
    const handlePropertyChange = (key: string, value: unknown) => {
      onPropertyChange?.(key, value);
    };

    return (
      <dl
        ref={ref}
        className={cn('tn-property-list grid gap-3', className)}
        data-component="property-list"
      >
        {items.map((item) => (
          <div
            key={item.key}
            className={cn(
              'tn-property-list-item grid grid-cols-[120px_1fr] items-start gap-4',
              item.className
            )}
            data-property={item.label.toLowerCase().replace(/\s+/g, '-')}
          >
            <dt className="text-sm font-medium text-fg-secondary">{item.label}</dt>
            <dd className="text-sm text-foreground">
              {editable && item.type ? (
                <EditableValue
                  item={item}
                  onSave={(value) => handlePropertyChange(item.key, value)}
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
