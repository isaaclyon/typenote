import * as React from 'react';
import { TagSuggestionMenu, type TagSuggestionMenuRef } from './TagSuggestionMenu.js';
import type { MockTag } from '../../mocks/mockTags.js';

export interface TagSuggestionPopupProps {
  isOpen: boolean;
  items: MockTag[];
  clientRect: (() => DOMRect | null) | null;
  onSelect: (item: MockTag) => void;
}

/**
 * TagSuggestionPopup - Positioned popup for the tag suggestion menu.
 *
 * Uses absolute positioning relative to the cursor position via clientRect.
 */
export const TagSuggestionPopup = React.forwardRef<TagSuggestionMenuRef, TagSuggestionPopupProps>(
  ({ isOpen, items, clientRect, onSelect }, ref) => {
    const menuRef = React.useRef<TagSuggestionMenuRef>(null);
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
        style={{
          position: 'fixed',
          top: position.top,
          left: position.left,
          zIndex: 9999,
        }}
      >
        <TagSuggestionMenu ref={menuRef} items={items} selectedIndex={0} onSelect={onSelect} />
      </div>
    );
  }
);

TagSuggestionPopup.displayName = 'TagSuggestionPopup';
