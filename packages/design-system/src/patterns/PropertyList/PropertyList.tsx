import * as React from 'react';
import { cn } from '../../lib/utils.js';

// ============================================================================
// Types
// ============================================================================

export interface PropertyListItem {
  /** Label for the property */
  label: string;
  /** Value to display (can be any React node for badges, dates, etc.) */
  value: React.ReactNode;
  /** Optional additional CSS class for the row */
  className?: string;
}

export interface PropertyListProps {
  /** Array of property items to display */
  items: PropertyListItem[];
  /** Additional CSS classes for the container */
  className?: string;
}

// ============================================================================
// PropertyList
// ============================================================================

const PropertyList = React.forwardRef<HTMLDListElement, PropertyListProps>(
  ({ items, className }, ref) => {
    return (
      <dl
        ref={ref}
        className={cn('tn-property-list grid gap-3', className)}
        data-component="property-list"
      >
        {items.map((item, index) => (
          <div
            key={`${item.label}-${index}`}
            className={cn(
              'tn-property-list-item grid grid-cols-[120px_1fr] items-start gap-4',
              item.className
            )}
            data-property={item.label.toLowerCase().replace(/\s+/g, '-')}
          >
            <dt className="text-sm font-medium text-fg-secondary">{item.label}</dt>
            <dd className="text-sm text-foreground">{item.value}</dd>
          </div>
        ))}
      </dl>
    );
  }
);

PropertyList.displayName = 'PropertyList';

export { PropertyList };
