import * as React from 'react';
import { cn } from '../../lib/utils.js';
import { EditableValue } from './EditableValue.js';
import type { PropertyListProps } from './PropertyList.types.js';

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
export type { PropertyListItem, PropertyListProps, PropertyType } from './PropertyList.types.js';
