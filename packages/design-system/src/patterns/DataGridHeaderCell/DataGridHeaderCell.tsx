import * as React from 'react';
import { cva } from 'class-variance-authority';
import { CaretUp } from '@phosphor-icons/react/dist/ssr/CaretUp';
import { CaretDown } from '@phosphor-icons/react/dist/ssr/CaretDown';
import { CaretUpDown } from '@phosphor-icons/react/dist/ssr/CaretUpDown';
import { DotsThreeVertical } from '@phosphor-icons/react/dist/ssr/DotsThreeVertical';
import { DotsSixVertical } from '@phosphor-icons/react/dist/ssr/DotsSixVertical';
import { cn } from '../../lib/utils.js';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../primitives/DropdownMenu/DropdownMenu.js';

// ============================================================================
// Types
// ============================================================================

type SortDirection = 'none' | 'asc' | 'desc';
type HeaderAlign = 'left' | 'center' | 'right';
type HeaderPinned = 'left' | 'right' | 'none';

export interface DataGridHeaderMenuItem {
  /** Unique identifier */
  id: string;
  /** Menu item label */
  label: string;
  /** Icon to display (optional) */
  icon?: React.ReactNode;
  /** Click handler */
  onClick: () => void;
  /** Whether item is destructive */
  destructive?: boolean;
}

export interface DataGridHeaderCellProps {
  /** Column label */
  label: string;
  /** Current sort direction */
  sort?: SortDirection;
  /** Whether column is sortable */
  sortable?: boolean;
  /** Sort handler */
  onSort?: () => void;
  /** Whether column is draggable */
  draggable?: boolean;
  /** Whether column is currently being dragged */
  dragging?: boolean;
  /** Drop target position */
  dropTarget?: 'before' | 'after';
  /** Cell alignment */
  align?: HeaderAlign;
  /** Whether column is pinned */
  pinned?: HeaderPinned;
  /** Whether column is resizable */
  resizable?: boolean;
  /** Menu items for column options */
  menuItems?: DataGridHeaderMenuItem[];
  /** Additional CSS classes */
  className?: string;
}

// ============================================================================
// Variants
// ============================================================================

const headerCellVariants = cva(
  [
    'tn-grid-head',
    'group/header',
    'flex items-center gap-1',
    'h-10 px-3',
    'text-sm font-medium text-fg-secondary',
    'select-none',
  ],
  {
    variants: {
      align: {
        left: 'justify-start text-left',
        center: 'justify-center text-center',
        right: 'justify-end text-right',
      },
      sortable: {
        true: 'cursor-pointer hover:text-foreground transition-colors duration-150',
        false: '',
      },
      dragging: {
        true: 'opacity-50',
        false: '',
      },
    },
    defaultVariants: {
      align: 'left',
      sortable: false,
      dragging: false,
    },
  }
);

// ============================================================================
// DataGridHeaderCell
// ============================================================================

const DataGridHeaderCell = React.forwardRef<HTMLDivElement, DataGridHeaderCellProps>(
  (
    {
      label,
      sort = 'none',
      sortable = false,
      onSort,
      draggable = false,
      dragging = false,
      dropTarget,
      align = 'left',
      pinned = 'none',
      resizable = false,
      menuItems,
      className,
    },
    ref
  ) => {
    const [menuOpen, setMenuOpen] = React.useState(false);

    const handleClick = () => {
      if (sortable && onSort) {
        onSort();
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (sortable && onSort && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        onSort();
      }
    };

    const renderSortIcon = () => {
      if (!sortable) return null;

      switch (sort) {
        case 'asc':
          return <CaretUp className="h-3 w-3 text-foreground" weight="bold" />;
        case 'desc':
          return <CaretDown className="h-3 w-3 text-foreground" weight="bold" />;
        default:
          return <CaretUpDown className="h-3 w-3 text-fg-tertiary" weight="bold" />;
      }
    };

    const showMenu = menuItems && menuItems.length > 0;

    return (
      <div
        ref={ref}
        className={cn(
          headerCellVariants({ align, sortable, dragging }),
          dropTarget === 'before' && 'tn-grid-head-drop-before border-l-2 border-primary',
          dropTarget === 'after' && 'tn-grid-head-drop-after border-r-2 border-primary',
          className
        )}
        data-sort={sort}
        data-sortable={sortable}
        data-draggable={draggable}
        data-dragging={dragging || undefined}
        data-drop-target={dropTarget}
        data-align={align}
        data-pinned={pinned !== 'none' ? pinned : undefined}
        data-resizable={resizable}
        role={sortable ? 'button' : undefined}
        tabIndex={sortable ? 0 : undefined}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        aria-sort={sort === 'asc' ? 'ascending' : sort === 'desc' ? 'descending' : undefined}
      >
        <span className="tn-grid-head-label truncate">{label}</span>

        {sortable && <span className="tn-grid-head-sort shrink-0">{renderSortIcon()}</span>}

        {showMenu && (
          <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className={cn(
                  'tn-grid-head-menu',
                  'shrink-0 rounded p-0.5',
                  'text-fg-tertiary hover:text-foreground hover:bg-muted',
                  'transition-opacity duration-150',
                  'focus-visible:outline focus-visible:outline-1 focus-visible:outline-ring',
                  menuOpen ? 'opacity-100' : 'opacity-0 group-hover/header:opacity-100'
                )}
                onClick={(e) => e.stopPropagation()}
                aria-label={`${label} column options`}
              >
                <DotsThreeVertical className="h-3 w-3" weight="bold" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" sideOffset={4}>
              {menuItems.map((item) => (
                <DropdownMenuItem
                  key={item.id}
                  onClick={item.onClick}
                  {...(item.destructive === true && { destructive: true })}
                >
                  {item.icon}
                  {item.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {draggable && (
          <span
            className="tn-grid-head-handle shrink-0 cursor-grab text-fg-tertiary opacity-0 group-hover/header:opacity-100 transition-opacity duration-150"
            aria-hidden="true"
          >
            <DotsSixVertical className="h-3 w-3" weight="bold" />
          </span>
        )}
      </div>
    );
  }
);

DataGridHeaderCell.displayName = 'DataGridHeaderCell';

export { DataGridHeaderCell, headerCellVariants };
