import * as React from 'react';
import * as LucideIcons from 'lucide-react';
import { cn } from '../../utils/cn.js';
import { ScrollArea } from '../ScrollArea/ScrollArea.js';
import { Skeleton } from '../Skeleton/Skeleton.js';

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

/** Default icon color (warm gray, matches BacklinkItem) */
const DEFAULT_ICON_COLOR = '#78716c';

const NotesCreatedList = React.forwardRef<HTMLDivElement, NotesCreatedListProps>(
  ({ date, items, onItemClick, showHeader = true, isLoading = false, className }, ref) => {
    // Render type icon by name (matches BacklinkItem pattern)
    const renderTypeIcon = (typeIcon?: string | null, typeColor?: string | null) => {
      if (!typeIcon) return null;

      // Dynamically get icon component from Lucide
      const iconsRecord = LucideIcons as unknown as Record<
        string,
        React.ComponentType<{ className?: string }>
      >;
      const IconComponent = iconsRecord[typeIcon];
      if (!IconComponent) return null;

      return (
        <div className="flex-shrink-0" style={{ color: typeColor ?? DEFAULT_ICON_COLOR }}>
          <IconComponent className="w-4 h-4" />
        </div>
      );
    };

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
              {items.map((item) => (
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
                    {renderTypeIcon(item.typeIcon, item.typeColor)}
                    <span className="text-sm text-gray-700 truncate">{item.title}</span>
                  </button>
                </li>
              ))}
            </ul>
          </ScrollArea>
        )}
      </div>
    );
  }
);

NotesCreatedList.displayName = 'NotesCreatedList';

export { NotesCreatedList };
