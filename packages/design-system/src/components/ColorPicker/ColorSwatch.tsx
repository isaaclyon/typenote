import * as React from 'react';
import { Check } from 'lucide-react';
import { cn } from '../../utils/cn.js';

export interface ColorSwatchProps {
  color: string;
  selected?: boolean;
  onClick?: () => void;
}

export const ColorSwatch = React.forwardRef<HTMLButtonElement, ColorSwatchProps>(
  ({ color, selected, onClick }, ref) => {
    return (
      <button
        ref={ref}
        type="button"
        onClick={onClick}
        className={cn(
          'relative h-8 w-8 rounded-sm transition-all duration-150',
          'hover:scale-110',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2',
          selected && 'ring-2 ring-gray-900 ring-offset-2'
        )}
        style={{ backgroundColor: color }}
        title={color}
        aria-label={`Select color ${color}`}
      >
        {selected && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Check className="h-4 w-4 text-white drop-shadow-md" strokeWidth={3} />
          </div>
        )}
      </button>
    );
  }
);

ColorSwatch.displayName = 'ColorSwatch';
