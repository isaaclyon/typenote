import * as React from 'react';
import { cn } from '../../../../utils/cn.js';
import type { SlashCommand } from '../../mocks/mockCommands.js';

export interface SlashCommandMenuProps {
  items: SlashCommand[];
  selectedIndex: number;
  onSelect: (item: SlashCommand) => void;
}

export interface SlashCommandMenuRef {
  onKeyDown: (props: { event: KeyboardEvent }) => boolean;
}

/**
 * SlashCommandMenu - Dropdown menu component for slash command selection.
 *
 * Displays filtered commands with icons, labels, and descriptions.
 * Supports keyboard navigation (up/down arrows, Enter to select).
 */
export const SlashCommandMenu = React.forwardRef<SlashCommandMenuRef, SlashCommandMenuProps>(
  ({ items, selectedIndex, onSelect }, ref) => {
    const [localIndex, setLocalIndex] = React.useState(selectedIndex);
    // Store refs to all button elements for scrollIntoView
    const itemRefs = React.useRef<(HTMLButtonElement | null)[]>([]);

    // Sync with parent's selectedIndex
    React.useEffect(() => {
      setLocalIndex(selectedIndex);
    }, [selectedIndex]);

    // Auto-scroll selected item into view when navigating with keyboard
    React.useEffect(() => {
      const selectedElement = itemRefs.current[localIndex];
      if (selectedElement) {
        selectedElement.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'nearest',
        });
      }
    }, [localIndex]);

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
        <div className="bg-background border border-border rounded-lg shadow-lg p-3 min-w-[280px]">
          <p className="text-sm text-muted-foreground">No commands found</p>
        </div>
      );
    }

    return (
      <div className="bg-background border border-border rounded-lg shadow-lg py-1 min-w-[280px] max-h-[320px] overflow-y-auto">
        {items.map((item, index) => {
          const Icon = item.icon;
          const isSelected = index === localIndex;

          return (
            <button
              key={item.id}
              type="button"
              data-testid={`slash-command-${item.id}`}
              ref={(el) => {
                itemRefs.current[index] = el;
              }}
              className={cn(
                'w-full flex items-start gap-3 px-3 py-2 text-left transition-colors duration-150',
                isSelected ? 'bg-accent-50' : 'hover:bg-muted'
              )}
              onClick={() => onSelect(item)}
              onMouseEnter={() => setLocalIndex(index)}
            >
              <div
                className={cn(
                  'flex-shrink-0 w-8 h-8 rounded flex items-center justify-center',
                  isSelected ? 'bg-accent-100' : 'bg-secondary'
                )}
              >
                <Icon
                  className={cn(
                    'w-4 h-4',
                    isSelected ? 'text-accent-600' : 'text-muted-foreground'
                  )}
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-foreground">{item.label}</div>
                <div className="text-xs text-muted-foreground truncate">{item.description}</div>
              </div>
            </button>
          );
        })}
      </div>
    );
  }
);

SlashCommandMenu.displayName = 'SlashCommandMenu';
