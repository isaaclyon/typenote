import * as React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn.js';
import type { SidebarPinnedItemProps } from './types.js';

const pinnedItemVariants = cva(
  'flex items-center gap-3 h-7 px-3 rounded-md transition-colors cursor-pointer group',
  {
    variants: {
      selected: {
        true: 'bg-accent-50 text-accent-700',
        false: 'hover:bg-gray-50',
      },
    },
    defaultVariants: {
      selected: false,
    },
  }
);

export interface PinnedItemVariantProps extends VariantProps<typeof pinnedItemVariants> {}

const SidebarPinnedItem = React.forwardRef<HTMLDivElement, SidebarPinnedItemProps>(
  ({ id, icon: Icon, label, color, selected = false, onClick }, ref) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
      id,
    });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
    };

    return (
      <div
        ref={(node) => {
          setNodeRef(node);
          if (typeof ref === 'function') {
            ref(node);
          } else if (ref) {
            ref.current = node;
          }
        }}
        style={style}
        className={cn(
          pinnedItemVariants({ selected }),
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          isDragging && 'opacity-50 shadow-lg z-10'
        )}
        onClick={onClick}
      >
        {/* Drag handle */}
        <div
          {...attributes}
          {...listeners}
          className={cn(
            'flex items-center justify-center',
            'touch-none cursor-grab active:cursor-grabbing',
            'opacity-0 group-hover:opacity-100 transition-opacity'
          )}
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="w-3.5 h-3.5 text-gray-300" />
        </div>

        <Icon className="w-3.5 h-3.5 shrink-0" style={color ? { color } : undefined} />
        <span className="text-sm font-medium flex-1 truncate text-left">{label}</span>
      </div>
    );
  }
);

SidebarPinnedItem.displayName = 'SidebarPinnedItem';

export { SidebarPinnedItem, pinnedItemVariants };
