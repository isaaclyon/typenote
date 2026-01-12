import * as React from 'react';
import { cn } from '../../../../utils/cn.js';
import type { MockTag } from '../../mocks/mockTags.js';

export interface TagSuggestionMenuProps {
  items: MockTag[];
  selectedIndex: number;
  onSelect: (item: MockTag) => void;
}

export interface TagSuggestionMenuRef {
  onKeyDown: (props: { event: KeyboardEvent }) => boolean;
}

/**
 * TagSuggestionMenu - Dropdown menu component for tag selection.
 *
 * Displays filtered tags with color dots and values.
 * Supports keyboard navigation (up/down arrows, Enter to select).
 */
export const TagSuggestionMenu = React.forwardRef<TagSuggestionMenuRef, TagSuggestionMenuProps>(
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
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 min-w-[200px]">
          <p className="text-sm text-gray-500">No tags found</p>
        </div>
      );
    }

    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[200px] max-h-[320px] overflow-y-auto">
        {items.map((item, index) => {
          const isSelected = index === localIndex;

          return (
            <button
              key={item.id}
              type="button"
              className={cn(
                'w-full flex items-center gap-2 px-3 py-2 text-left transition-colors duration-100',
                isSelected ? 'bg-gray-100' : 'hover:bg-gray-50'
              )}
              onClick={() => onSelect(item)}
              onMouseEnter={() => setLocalIndex(index)}
            >
              {item.color ? (
                <span
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: item.color }}
                />
              ) : (
                <span className="w-3 h-3 rounded-full flex-shrink-0 bg-gray-300" />
              )}
              <span className="text-sm font-medium text-gray-900">#{item.value}</span>
            </button>
          );
        })}
      </div>
    );
  }
);

TagSuggestionMenu.displayName = 'TagSuggestionMenu';
