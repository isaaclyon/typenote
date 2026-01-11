import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn.js';
import { X } from 'lucide-react';

const tagVariants = cva(
  'inline-flex items-center gap-1 rounded px-2 h-6 text-sm font-medium transition-colors group',
  {
    variants: {
      variant: {
        default: 'bg-gray-100 text-gray-700 hover:bg-accent-50',
        primary: 'bg-accent-100 text-accent-700 hover:bg-accent-200',
      },
      clickable: {
        true: 'cursor-pointer',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      clickable: false,
    },
  }
);

export interface TagProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'onClick'>, VariantProps<typeof tagVariants> {
  onRemove?: () => void;
  onClick?: () => void;
}

function Tag({ className, variant, clickable, onRemove, onClick, children, ...props }: TagProps) {
  const handleClick = (e: React.MouseEvent<HTMLSpanElement>) => {
    // Don't trigger tag click when clicking remove button
    if (onClick && e.target === e.currentTarget) {
      onClick();
    }
  };

  return (
    <span
      className={cn(tagVariants({ variant, clickable: clickable ?? !!onClick }), className)}
      onClick={handleClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
      {...props}
    >
      {children}
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="opacity-0 group-hover:opacity-100 hover:bg-black/10 rounded-full p-0.5 transition-all"
          aria-label="Remove tag"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </span>
  );
}

export { Tag, tagVariants };
