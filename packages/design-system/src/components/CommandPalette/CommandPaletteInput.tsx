import * as React from 'react';
import { Search } from 'lucide-react';
import { cn } from '../../utils/cn.js';
import type { CommandPaletteInputProps } from './types.js';

/**
 * CommandPaletteInput - Search input with magnifying glass icon.
 *
 * Controlled input that auto-focuses when mounted (configurable).
 */
const CommandPaletteInput = React.forwardRef<HTMLInputElement, CommandPaletteInputProps>(
  ({ value, onValueChange, placeholder = 'Search...', autoFocus = true, className }, ref) => {
    // Auto-focus on mount using native autoFocus or useEffect for delay
    const inputRef = React.useRef<HTMLInputElement | null>(null);

    // Merge refs: forward to parent + keep internal ref
    const setRefs = React.useCallback(
      (element: HTMLInputElement | null) => {
        inputRef.current = element;
        if (typeof ref === 'function') {
          ref(element);
        } else if (ref) {
          (ref as React.MutableRefObject<HTMLInputElement | null>).current = element;
        }
      },
      [ref]
    );

    // Auto-focus with small delay to ensure modal animation doesn't interfere
    React.useEffect(() => {
      if (autoFocus) {
        const timer = setTimeout(() => {
          inputRef.current?.focus();
        }, 50);
        return () => clearTimeout(timer);
      }
    }, [autoFocus]);

    return (
      <div className={cn('flex items-center gap-3 px-3 border-b border-gray-200', className)}>
        <Search className="h-4 w-4 shrink-0 text-gray-400" aria-hidden="true" />
        <input
          ref={setRefs}
          type="text"
          value={value}
          onChange={(e) => onValueChange(e.target.value)}
          placeholder={placeholder}
          className={cn(
            'flex-1 h-11 bg-transparent text-sm outline-none',
            'placeholder:text-gray-400'
          )}
          aria-label="Search commands"
        />
      </div>
    );
  }
);

CommandPaletteInput.displayName = 'CommandPaletteInput';

export { CommandPaletteInput };
