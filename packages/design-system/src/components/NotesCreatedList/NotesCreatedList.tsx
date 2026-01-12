import * as React from 'react';
import { cn } from '../../utils/cn.js';
import { ScrollArea } from '../ScrollArea/ScrollArea.js';
import { Skeleton } from '../Skeleton/Skeleton.js';

export interface NotesCreatedItem {
  id: string;
  title: string;
  typeIcon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  typeColor?: string;
}

export interface NotesCreatedListProps {
  /** Date to show creations for (YYYY-MM-DD) */
  date: string;

  /** Objects created on this date */
  items: NotesCreatedItem[];

  /** Called when user clicks an item */
  onItemClick?: (id: string) => void;

  /** Show header with date? Default: true */
  showHeader?: boolean;

  /** Loading state */
  isLoading?: boolean;

  /** Additional class names */
  className?: string;
}

/**
 * Format date for header display: "Created Jan 11"
 */
function formatHeaderDate(dateKey: string): string {
  const [year, month, day] = dateKey.split('-').map(Number);
  const date = new Date(year!, month! - 1, day);
  return `Created ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
}

const NotesCreatedList = React.forwardRef<HTMLDivElement, NotesCreatedListProps>(
  ({ date, items, onItemClick, showHeader = true, isLoading = false, className }, ref) => {
    return (
      <div ref={ref} className={cn('w-56', className)}>
        {/* Header */}
        {showHeader && (
          <h3 className="text-xs font-medium text-gray-500 mb-2">{formatHeaderDate(date)}</h3>
        )}

        {/* Loading state */}
        {isLoading && (
          <div className="space-y-1">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-2 px-2 py-1.5">
                <Skeleton className="w-4 h-4 rounded" />
                <Skeleton className="h-4 flex-1 rounded" />
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && items.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-4">No notes created</p>
        )}

        {/* Items list */}
        {!isLoading && items.length > 0 && (
          <ScrollArea className="max-h-[200px]">
            <ul role="list" className="space-y-0.5">
              {items.map((item) => {
                const Icon = item.typeIcon;
                return (
                  <li key={item.id} role="listitem">
                    <button
                      type="button"
                      onClick={() => onItemClick?.(item.id)}
                      className={cn(
                        'w-full flex items-center gap-2 px-2 py-1.5 rounded',
                        'text-left',
                        'hover:bg-gray-50 transition-colors',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset'
                      )}
                    >
                      <Icon
                        className="w-4 h-4 flex-shrink-0"
                        {...(item.typeColor ? { style: { color: item.typeColor } } : {})}
                      />
                      <span className="text-sm text-gray-700 truncate">{item.title}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </ScrollArea>
        )}
      </div>
    );
  }
);

NotesCreatedList.displayName = 'NotesCreatedList';

export { NotesCreatedList };
