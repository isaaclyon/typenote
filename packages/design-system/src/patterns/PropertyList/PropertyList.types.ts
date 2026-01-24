import type * as React from 'react';

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
