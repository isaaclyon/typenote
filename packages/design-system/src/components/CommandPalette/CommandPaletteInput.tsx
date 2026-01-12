import * as React from 'react';
import { Search } from 'lucide-react';
import { cn } from '../../utils/cn.js';
import type { CommandPaletteInputProps } from './types.js';

const CommandPaletteInput = React.forwardRef<HTMLInputElement, CommandPaletteInputProps>(
  ({ value, onChange, placeholder = 'Search commands...', className }, ref) => {
    return (
      <div
        className={cn(
          'relative flex items-center border-b border-gray-200 rounded-t-lg',
          className
        )}
      >
        <Search className="absolute left-3 h-4 w-4 text-gray-400" />
        <input
          ref={ref}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-10 pr-4 py-3 text-sm bg-transparent outline-none"
          autoFocus
        />
      </div>
    );
  }
);

CommandPaletteInput.displayName = 'CommandPaletteInput';

export { CommandPaletteInput };
