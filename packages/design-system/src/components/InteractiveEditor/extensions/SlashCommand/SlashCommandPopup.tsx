import * as React from 'react';
import { SlashCommandMenu, type SlashCommandMenuRef } from './SlashCommandMenu.js';
import type { SlashCommand } from '../../mocks/mockCommands.js';

export interface SlashCommandPopupProps {
  isOpen: boolean;
  items: SlashCommand[];
  clientRect: (() => DOMRect | null) | null;
  onSelect: (item: SlashCommand) => void;
  onKeyDown?: (event: KeyboardEvent) => boolean;
}

/**
 * SlashCommandPopup - Positioned popup for the slash command menu.
 *
 * Uses absolute positioning relative to the cursor position via clientRect.
 */
export const SlashCommandPopup = React.forwardRef<SlashCommandMenuRef, SlashCommandPopupProps>(
  ({ isOpen, items, clientRect, onSelect }, ref) => {
    const menuRef = React.useRef<SlashCommandMenuRef>(null);
    const containerRef = React.useRef<HTMLDivElement>(null);
    const [position, setPosition] = React.useState<{ top: number; left: number } | null>(null);

    // Update position when clientRect changes
    React.useEffect(() => {
      if (!isOpen || !clientRect) {
        setPosition(null);
        return;
      }

      const rect = clientRect();
      if (rect) {
        // Position below the cursor with 8px offset
        setPosition({
          top: rect.bottom + 8,
          left: rect.left,
        });
      }
    }, [isOpen, clientRect]);

    // Expose the menu ref's onKeyDown through our ref
    React.useImperativeHandle(ref, () => ({
      onKeyDown: (props: { event: KeyboardEvent }) => {
        if (!menuRef.current) {
          return false;
        }
        return menuRef.current.onKeyDown(props);
      },
    }));

    if (!isOpen || !position) {
      return null;
    }

    return (
      <div
        ref={containerRef}
        style={{
          position: 'fixed',
          top: position.top,
          left: position.left,
          zIndex: 9999,
        }}
      >
        <SlashCommandMenu ref={menuRef} items={items} selectedIndex={0} onSelect={onSelect} />
      </div>
    );
  }
);

SlashCommandPopup.displayName = 'SlashCommandPopup';
