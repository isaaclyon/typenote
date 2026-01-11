import * as React from 'react';
import { cn } from '../../utils/cn.js';

export interface PropertyTagsProps {
  label: string;
  children: React.ReactNode; // Tag components + TagAddButton
  className?: string;
}

const PropertyTags = React.forwardRef<HTMLDivElement, PropertyTagsProps>(
  ({ label, children, className }, ref) => {
    return (
      <div ref={ref} className={cn('flex items-start gap-3 group', className)}>
        {/* Label column */}
        <div className="w-20 flex-shrink-0 flex items-center h-7">
          <span className="text-sm text-gray-600">{label}</span>
        </div>

        {/* Tags column */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap gap-2">{children}</div>
        </div>
      </div>
    );
  }
);

PropertyTags.displayName = 'PropertyTags';

export { PropertyTags };
