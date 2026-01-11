import * as React from 'react';
import { cn } from '../../utils/cn.js';
import { ChevronRight } from 'lucide-react';

export interface RightPanelSectionProps {
  title: string;
  count?: number;
  collapsible?: boolean;
  defaultExpanded?: boolean;
  storageKey?: string; // For localStorage persistence
  children: React.ReactNode;
  className?: string;
}

const RightPanelSection = React.forwardRef<HTMLDivElement, RightPanelSectionProps>(
  (
    { title, count, collapsible = true, defaultExpanded = true, storageKey, children, className },
    ref
  ) => {
    // Initialize from localStorage if storageKey provided
    const [isExpanded, setIsExpanded] = React.useState(() => {
      if (storageKey && typeof window !== 'undefined') {
        const stored = localStorage.getItem(storageKey);
        if (stored !== null) {
          return stored === 'true';
        }
      }
      return defaultExpanded;
    });

    // Persist to localStorage when state changes
    React.useEffect(() => {
      if (storageKey && typeof window !== 'undefined') {
        localStorage.setItem(storageKey, isExpanded.toString());
      }
    }, [isExpanded, storageKey]);

    const handleToggle = () => {
      if (collapsible) {
        setIsExpanded(!isExpanded);
      }
    };

    return (
      <div ref={ref} className={cn('flex flex-col', className)}>
        {/* Section Header */}
        <button
          type="button"
          onClick={handleToggle}
          className={cn(
            'flex items-center justify-between px-3 py-2 text-sm font-medium text-gray-700 transition-colors',
            collapsible && 'hover:bg-gray-50 cursor-pointer',
            !collapsible && 'cursor-default'
          )}
          disabled={!collapsible}
          aria-expanded={isExpanded}
        >
          <div className="flex items-center gap-2">
            <span>{title}</span>
            {count !== undefined && <span className="text-xs text-gray-500">({count})</span>}
          </div>
          {collapsible && (
            <ChevronRight
              className={cn(
                'w-4 h-4 text-gray-500 transition-transform duration-200',
                isExpanded && 'rotate-90'
              )}
            />
          )}
        </button>

        {/* Section Content */}
        {isExpanded && <div className="px-3 py-2">{children}</div>}
      </div>
    );
  }
);

RightPanelSection.displayName = 'RightPanelSection';

export { RightPanelSection };
