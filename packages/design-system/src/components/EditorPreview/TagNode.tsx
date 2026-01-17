import * as React from 'react';
import { Hash } from 'lucide-react';
import { cn } from '../../utils/cn.js';

interface TagNodeProps {
  value: string;
  showIcon?: boolean;
  className?: string;
}

/**
 * TagNode preview - hashtag styling matching Tag component.
 */
export function TagNode({ value, showIcon = true, className }: TagNodeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded px-2 h-6 text-sm font-medium',
        'bg-secondary text-foreground hover:bg-accent-50',
        'cursor-pointer transition-colors duration-150',
        className
      )}
    >
      {showIcon && <Hash className="h-3 w-3" />}
      <span>{value}</span>
    </span>
  );
}
