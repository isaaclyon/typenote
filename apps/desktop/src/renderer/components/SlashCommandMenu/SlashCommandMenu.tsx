/**
 * SlashCommandMenu Component
 *
 * React menu component that displays slash commands in a popup.
 * Handles keyboard navigation and command execution.
 */

import { forwardRef, useImperativeHandle, useState, useEffect } from 'react';
import type {
  SlashCommand,
  SlashCommandGroup,
  CommandSection,
} from '../../extensions/SlashCommand/types.js';
import { SlashCommandItem } from './SlashCommandItem.js';
import { SlashCommandSection } from './SlashCommandSection.js';

interface SlashCommandMenuProps {
  items: SlashCommand[];
  command: (item: SlashCommand) => void;
}

export interface SlashCommandMenuHandle {
  onKeyDown: (props: { event: KeyboardEvent }) => boolean;
}

/**
 * Groups commands by section for display.
 * Only called when items.length >= 8.
 */
function groupBySection(items: SlashCommand[]): SlashCommandGroup[] {
  const sections: CommandSection[] = ['Basic', 'Headings', 'Lists', 'Formatting', 'Advanced'];
  return sections
    .map((section) => ({
      section,
      commands: items.filter((cmd) => cmd.section === section),
    }))
    .filter((group) => group.commands.length > 0);
}

export const SlashCommandMenu = forwardRef<SlashCommandMenuHandle, SlashCommandMenuProps>(
  ({ items, command }, ref) => {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const shouldGroup = items.length >= 8;

    // Reset selection when items change
    useEffect(() => {
      setSelectedIndex(0);
    }, [items]);

    // Expose keyboard handler via ref
    useImperativeHandle(ref, () => ({
      onKeyDown: ({ event }) => {
        if (event.key === 'ArrowDown') {
          event.preventDefault();
          setSelectedIndex((prev) => (prev + 1) % items.length);
          return true;
        }

        if (event.key === 'ArrowUp') {
          event.preventDefault();
          setSelectedIndex((prev) => (prev - 1 + items.length) % items.length);
          return true;
        }

        if (event.key === 'Enter') {
          event.preventDefault();
          const selectedItem = items[selectedIndex];
          if (selectedItem) {
            command(selectedItem);
          }
          return true;
        }

        return false;
      },
    }));

    // Empty state
    if (items.length === 0) {
      return (
        <div
          className="bg-popover border rounded-md shadow-md py-1 px-3"
          data-testid="slash-command-menu"
        >
          <div className="text-sm text-muted-foreground py-2">No commands found</div>
        </div>
      );
    }

    // Flat list (< 8 items)
    if (!shouldGroup) {
      return (
        <div
          className="bg-popover border rounded-md shadow-md max-h-[300px] overflow-y-auto py-1"
          data-testid="slash-command-menu"
        >
          {items.map((item, index) => (
            <SlashCommandItem
              key={item.id}
              command={item}
              isSelected={index === selectedIndex}
              onClick={() => command(item)}
            />
          ))}
        </div>
      );
    }

    // Grouped list (>= 8 items)
    const groups = groupBySection(items);
    let currentIndex = 0;

    return (
      <div
        className="bg-popover border rounded-md shadow-md max-h-[300px] overflow-y-auto py-1"
        data-testid="slash-command-menu"
      >
        {groups.map((group) => (
          <div key={group.section}>
            <SlashCommandSection title={group.section} />
            {group.commands.map((cmd) => {
              const index = currentIndex++;
              return (
                <SlashCommandItem
                  key={cmd.id}
                  command={cmd}
                  isSelected={index === selectedIndex}
                  onClick={() => command(cmd)}
                />
              );
            })}
          </div>
        ))}
      </div>
    );
  }
);

SlashCommandMenu.displayName = 'SlashCommandMenu';
