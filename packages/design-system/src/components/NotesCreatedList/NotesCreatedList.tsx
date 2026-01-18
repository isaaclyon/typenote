import * as React from 'react';
import { cn } from '../../utils/cn.js';
import { Skeleton } from '../Skeleton/Skeleton.js';
import { BacklinkItem } from '../BacklinkItem/BacklinkItem.js';

export interface NotesCreatedItem {
  id: string;
  title: string;
  /** Icon name from Lucide (e.g., "FileText", "CheckSquare") */
  typeIcon?: string | null;
  /** Color for the icon (e.g., "#6495ED") */
  typeColor?: string | null;
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
  const parts = dateKey.split('-').map(Number);
  const year = parts[0] ?? 0;
  const month = parts[1] ?? 1;
  const day = parts[2] ?? 1;
  const date = new Date(year, month - 1, day);
  return `Created ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
}

const NotesCreatedList = React.forwardRef<HTMLDivElement, NotesCreatedListProps>(
  ({ date, items, onItemClick, showHeader = true, isLoading = false, className }, ref) => {
    return (
      <div ref={ref} className={cn('w-full', className)}>
        {/* Header */}
        {showHeader && (
          <h3 className="text-xs font-medium text-muted-foreground mb-2">
            {formatHeaderDate(date)}
          </h3>
        )}

        {/* Loading state */}
        {isLoading && (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-2 rounded border border-gray-100">
                <div className="flex items-center gap-2">
                  <Skeleton className="w-4 h-4 rounded" />
                  <Skeleton className="h-4 flex-1 rounded" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && items.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">No notes created</p>
        )}

        {/* Items list */}
        {!isLoading && items.length > 0 && (
          <ul role="list" className="space-y-2">
            {items.map((item) => (
              <li key={item.id} role="listitem">
                <BacklinkItem
                  title={item.title}
                  {...(item.typeIcon !== undefined && { typeIcon: item.typeIcon })}
                  {...(item.typeColor !== undefined && { typeColor: item.typeColor })}
                  {...(onItemClick && { onClick: () => onItemClick(item.id) })}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }
);

NotesCreatedList.displayName = 'NotesCreatedList';

export { NotesCreatedList };
