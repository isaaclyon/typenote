import * as React from 'react';
import type { LucideProps } from 'lucide-react';
import { cn } from '../../utils/cn.js';

export interface IconButtonProps {
  Icon: React.ComponentType<LucideProps>;
  iconName: string;
  selected?: boolean;
  onClick?: () => void;
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ Icon, iconName, selected, onClick }, ref) => {
    return (
      <button
        ref={ref}
        type="button"
        onClick={onClick}
        className={cn(
          'flex h-8 w-8 items-center justify-center rounded-sm',
          'transition-colors duration-150',
          'hover:bg-gray-100',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500',
          selected && 'bg-accent-50 ring-2 ring-accent-500 hover:bg-accent-100'
        )}
        title={iconName}
        aria-label={`Select ${iconName} icon`}
      >
        <Icon className="h-4 w-4" />
      </button>
    );
  }
);

IconButton.displayName = 'IconButton';
