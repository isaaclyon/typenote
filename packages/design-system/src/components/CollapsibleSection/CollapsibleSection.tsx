import * as React from 'react';
import { cn } from '../../utils/cn.js';
import { ChevronRight } from 'lucide-react';
import type { Icon as PhosphorIcon } from '@phosphor-icons/react';

export interface CollapsibleSectionProps {
  title: string;
  icon?: PhosphorIcon; // Optional Phosphor icon for visual differentiation
  count?: number;
  collapsible?: boolean;
  defaultExpanded?: boolean;
  storageKey?: string; // For localStorage persistence
  children: React.ReactNode;
  className?: string;
}

const CollapsibleSection = React.forwardRef<HTMLDivElement, CollapsibleSectionProps>(
  (
    {
      title,
      icon: Icon,
      count,
      collapsible = true,
      defaultExpanded = true,
      storageKey,
      children,
      className,
    },
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
            {Icon && <Icon className="w-4 h-4 text-gray-600" weight="regular" />}
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

        {/* Divider */}
        <div className="border-t border-gray-200" />

        {/* Section Content */}
        {isExpanded && <div className="px-3 py-2">{children}</div>}
      </div>
    );
  }
);

CollapsibleSection.displayName = 'CollapsibleSection';

export { CollapsibleSection };
