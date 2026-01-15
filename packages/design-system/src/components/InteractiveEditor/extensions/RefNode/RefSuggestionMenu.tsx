import * as React from 'react';
import { Plus } from 'lucide-react';
import { cn } from '../../../../utils/cn.js';
import { TYPE_CONFIG, type ObjectType } from '../../../../constants/editorConfig.js';
import { type RefSuggestionItem, isCreateNewItem } from './useRefSuggestion.js';

export interface RefSuggestionMenuProps {
  items: RefSuggestionItem[];
  selectedIndex: number;
  onSelect: (item: RefSuggestionItem) => void;
}

export interface RefSuggestionMenuRef {
  onKeyDown: (props: { event: KeyboardEvent }) => boolean;
}

/**
 * RefSuggestionMenu - Dropdown menu component for wiki-link selection.
 *
 * Displays filtered notes with type icons, labels, and descriptions.
 * Supports keyboard navigation (up/down arrows, Enter to select).
 */
export const RefSuggestionMenu = React.forwardRef<RefSuggestionMenuRef, RefSuggestionMenuProps>(
  ({ items, selectedIndex, onSelect }, ref) => {
    const [localIndex, setLocalIndex] = React.useState(selectedIndex);

    // Sync with parent's selectedIndex
    React.useEffect(() => {
      setLocalIndex(selectedIndex);
    }, [selectedIndex]);

    // Expose keyboard handler via ref
    React.useImperativeHandle(ref, () => ({
      onKeyDown: ({ event }: { event: KeyboardEvent }) => {
        if (event.key === 'ArrowUp') {
          event.preventDefault();
          const newIndex = localIndex <= 0 ? items.length - 1 : localIndex - 1;
          setLocalIndex(newIndex);
          return true;
        }

        if (event.key === 'ArrowDown') {
          event.preventDefault();
          const newIndex = localIndex >= items.length - 1 ? 0 : localIndex + 1;
          setLocalIndex(newIndex);
          return true;
        }

        if (event.key === 'Enter') {
          event.preventDefault();
          const item = items[localIndex];
          if (item !== undefined) {
            onSelect(item);
          }
          return true;
        }

        return false;
      },
    }));

    if (items.length === 0) {
      return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 min-w-[280px]">
          <p className="text-sm text-gray-500">No notes found</p>
        </div>
      );
    }

    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[280px] max-h-[320px] overflow-y-auto">
        {items.map((item, index) => {
          const isSelected = index === localIndex;

          // Handle "Create new" item
          if (isCreateNewItem(item)) {
            return (
              <button
                key="create-new"
                type="button"
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2 text-left transition-colors duration-100',
                  isSelected ? 'bg-gray-100' : 'hover:bg-gray-50'
                )}
                onClick={() => onSelect(item)}
                onMouseEnter={() => setLocalIndex(index)}
              >
                <div
                  className={cn(
                    'flex-shrink-0 w-6 h-6 rounded flex items-center justify-center',
                    isSelected ? 'bg-accent-100' : 'bg-accent-50'
                  )}
                >
                  <Plus className="w-3.5 h-3.5 text-accent-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">
                    Create &quot;{item.title}&quot;
                  </div>
                  <div className="text-xs text-gray-500">Create new page</div>
                </div>
              </button>
            );
          }

          // Handle existing note item
          const type = item.type as ObjectType;
          const config = TYPE_CONFIG[type] || TYPE_CONFIG.note;
          const Icon = config.icon;

          return (
            <button
              key={item.id}
              type="button"
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2 text-left transition-colors duration-100',
                isSelected ? 'bg-gray-100' : 'hover:bg-gray-50'
              )}
              onClick={() => onSelect(item)}
              onMouseEnter={() => setLocalIndex(index)}
            >
              <div
                className={cn(
                  'flex-shrink-0 w-6 h-6 rounded flex items-center justify-center',
                  isSelected ? 'bg-gray-200' : 'bg-gray-100'
                )}
              >
                <Icon className={cn('w-3.5 h-3.5', config.colorClass)} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900 truncate">{item.title}</div>
                <div className="text-xs text-gray-500 capitalize">{item.type}</div>
              </div>
            </button>
          );
        })}
      </div>
    );
  }
);

RefSuggestionMenu.displayName = 'RefSuggestionMenu';
