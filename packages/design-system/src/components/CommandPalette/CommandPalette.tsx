import * as React from 'react';
import { cn } from '../../utils/cn.js';
import { CommandPaletteInput } from './CommandPaletteInput.js';
import { CommandPaletteList } from './CommandPaletteList.js';
import { CommandPaletteItem } from './CommandPaletteItem.js';
import type { CommandPaletteProps } from './types.js';

const CommandPalette = React.forwardRef<HTMLDivElement, CommandPaletteProps>(
  ({ open, onClose, commands, placeholder, className }, ref) => {
    const [search, setSearch] = React.useState('');
    const [selectedIndex, setSelectedIndex] = React.useState(0);

    // Filter commands based on search
    const filteredCommands = React.useMemo(() => {
      if (!search) return commands;
      const lowerSearch = search.toLowerCase();
      return commands.filter(
        (cmd) =>
          cmd.label.toLowerCase().includes(lowerSearch) ||
          cmd.category?.toLowerCase().includes(lowerSearch)
      );
    }, [commands, search]);

    // Reset state when opened
    React.useEffect(() => {
      if (open) {
        setSearch('');
        setSelectedIndex(0);
      }
    }, [open]);

    // Keyboard navigation
    React.useEffect(() => {
      if (!open) return;

      const handleKeyDown = (e: KeyboardEvent) => {
        switch (e.key) {
          case 'Escape':
            e.preventDefault();
            onClose();
            break;
          case 'ArrowDown':
            e.preventDefault();
            setSelectedIndex((prev) => (prev < filteredCommands.length - 1 ? prev + 1 : prev));
            break;
          case 'ArrowUp':
            e.preventDefault();
            setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
            break;
          case 'Enter':
            e.preventDefault();
            if (filteredCommands[selectedIndex]) {
              filteredCommands[selectedIndex].onSelect();
              onClose();
            }
            break;
        }
      };

      document.addEventListener('keydown', handleKeyDown);
      // Prevent body scroll
      document.body.style.overflow = 'hidden';

      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        document.body.style.overflow = '';
      };
    }, [open, onClose, filteredCommands, selectedIndex]);

    if (!open) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-20">
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          onClick={onClose}
          aria-hidden="true"
        />

        {/* Command Palette */}
        <div
          ref={ref}
          role="dialog"
          aria-modal="true"
          aria-label="Command palette"
          className={cn(
            'relative bg-white rounded-lg shadow-2xl w-full max-w-lg mx-4',
            'animate-[slide-in-from-bottom_200ms_ease-out]',
            className
          )}
        >
          <CommandPaletteInput
            value={search}
            onChange={setSearch}
            {...(placeholder && { placeholder })}
          />

          <CommandPaletteList>
            {filteredCommands.length === 0 ? (
              <div className="px-3 py-8 text-center text-sm text-gray-400">No commands found</div>
            ) : (
              filteredCommands.map((item, index) => (
                <CommandPaletteItem
                  key={item.id}
                  item={item}
                  selected={index === selectedIndex}
                  onClick={() => {
                    item.onSelect();
                    onClose();
                  }}
                />
              ))
            )}
          </CommandPaletteList>
        </div>
      </div>
    );
  }
);

CommandPalette.displayName = 'CommandPalette';

export { CommandPalette };
