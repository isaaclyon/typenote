import {
  forwardRef,
  type HTMLAttributes,
  type TdHTMLAttributes,
  type ThHTMLAttributes,
} from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils.js';

// =============================================================================
// TableContainer (scroll-aware wrapper)
// =============================================================================

interface TableContainerProps extends HTMLAttributes<HTMLDivElement> {
  /** Maximum height before scrolling vertically */
  maxHeight?: string | number;
}

const TableContainer = forwardRef<HTMLDivElement, TableContainerProps>(
  ({ className, maxHeight, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('tn-table-container relative w-full overflow-auto', className)}
      style={{ maxHeight }}
      {...props}
    >
      {children}
    </div>
  )
);
TableContainer.displayName = 'TableContainer';

// =============================================================================
// Table
// =============================================================================

const tableVariants = cva(['tn-table', 'w-full', 'caption-bottom', 'text-sm', 'border-collapse'], {
  variants: {
    variant: {
      default: '',
      bordered: 'border border-neutral-200 dark:border-neutral-800',
      striped: '',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

type TableVariant = NonNullable<VariantProps<typeof tableVariants>['variant']>;

interface TableProps extends HTMLAttributes<HTMLTableElement>, VariantProps<typeof tableVariants> {}

const Table = forwardRef<HTMLTableElement, TableProps>(({ className, variant, ...props }, ref) => (
  <table
    ref={ref}
    className={cn(tableVariants({ variant }), className)}
    data-variant={variant}
    {...props}
  />
));
Table.displayName = 'Table';

// =============================================================================
// TableHeader
// =============================================================================

const tableHeaderVariants = cva(
  [
    'tn-table-header',
    '[&_tr]:border-b',
    '[&_tr]:border-neutral-200',
    'dark:[&_tr]:border-neutral-800',
  ],
  {
    variants: {
      sticky: {
        true: 'sticky top-0 z-20 bg-background shadow-[0_1px_3px_rgba(0,0,0,0.05)]',
        false: '',
      },
    },
    defaultVariants: {
      sticky: false,
    },
  }
);

interface TableHeaderProps
  extends HTMLAttributes<HTMLTableSectionElement>, VariantProps<typeof tableHeaderVariants> {}

const TableHeader = forwardRef<HTMLTableSectionElement, TableHeaderProps>(
  ({ className, sticky, ...props }, ref) => (
    <thead
      ref={ref}
      className={cn(tableHeaderVariants({ sticky }), className)}
      data-sticky={sticky || undefined}
      {...props}
    />
  )
);
TableHeader.displayName = 'TableHeader';

// =============================================================================
// TableBody
// =============================================================================

const tableBodyVariants = cva(['tn-table-body', '[&_tr:last-child]:border-0']);

interface TableBodyProps extends HTMLAttributes<HTMLTableSectionElement> {}

const TableBody = forwardRef<HTMLTableSectionElement, TableBodyProps>(
  ({ className, ...props }, ref) => (
    <tbody ref={ref} className={cn(tableBodyVariants(), className)} {...props} />
  )
);
TableBody.displayName = 'TableBody';

// =============================================================================
// TableFooter
// =============================================================================

const tableFooterVariants = cva([
  'tn-table-footer',
  'border-t',
  'border-neutral-200',
  'dark:border-neutral-800',
  'bg-neutral-50/50',
  'dark:bg-neutral-900/50',
  'font-medium',
  '[&>tr]:last:border-b-0',
]);

interface TableFooterProps extends HTMLAttributes<HTMLTableSectionElement> {}

const TableFooter = forwardRef<HTMLTableSectionElement, TableFooterProps>(
  ({ className, ...props }, ref) => (
    <tfoot ref={ref} className={cn(tableFooterVariants(), className)} {...props} />
  )
);
TableFooter.displayName = 'TableFooter';

// =============================================================================
// TableRow
// =============================================================================

const tableRowVariants = cva(
  [
    'tn-table-row',
    'border-b',
    'border-neutral-200',
    'dark:border-neutral-800',
    'transition-colors',
  ],
  {
    variants: {
      hover: {
        true: 'hover:bg-muted/65 dark:hover:bg-muted/40',
        false: '',
      },
      selected: {
        true: 'bg-accent/10 dark:bg-accent/15',
        false: '',
      },
      active: {
        true: 'bg-accent/20 dark:bg-accent/25',
        false: '',
      },
      disabled: {
        true: 'opacity-50 pointer-events-none',
        false: '',
      },
    },
    defaultVariants: {
      hover: true,
      selected: false,
      active: false,
      disabled: false,
    },
  }
);

interface TableRowProps
  extends HTMLAttributes<HTMLTableRowElement>, VariantProps<typeof tableRowVariants> {}

const TableRow = forwardRef<HTMLTableRowElement, TableRowProps>(
  ({ className, hover, selected, active, disabled, ...props }, ref) => (
    <tr
      ref={ref}
      className={cn(tableRowVariants({ hover, selected, active, disabled }), className)}
      data-hover={hover || undefined}
      data-selected={selected || undefined}
      data-active={active || undefined}
      data-disabled={disabled || undefined}
      aria-selected={selected || undefined}
      aria-disabled={disabled || undefined}
      {...props}
    />
  )
);
TableRow.displayName = 'TableRow';

// =============================================================================
// TableHead (th element)
// =============================================================================

const tableHeadVariants = cva(
  [
    'tn-table-head',
    'h-10',
    'px-3',
    'font-medium',
    'text-fg-secondary',
    '[&:has([role=checkbox])]:pr-0',
    '[&>[role=checkbox]]:translate-y-[2px]',
  ],
  {
    variants: {
      align: {
        left: 'text-left',
        center: 'text-center',
        right: 'text-right',
      },
      pinned: {
        left: 'sticky left-0 z-10 bg-background',
        right: 'sticky right-0 z-10 bg-background',
        none: '',
      },
      truncate: {
        true: 'truncate max-w-[200px]',
        false: '',
      },
    },
    defaultVariants: {
      align: 'left',
      pinned: 'none',
      truncate: false,
    },
  }
);

type TableHeadAlign = NonNullable<VariantProps<typeof tableHeadVariants>['align']>;
type TableHeadPinned = NonNullable<VariantProps<typeof tableHeadVariants>['pinned']>;

interface TableHeadProps
  extends
    Omit<ThHTMLAttributes<HTMLTableCellElement>, 'align'>,
    VariantProps<typeof tableHeadVariants> {
  cellType?: string;
}

const TableHead = forwardRef<HTMLTableCellElement, TableHeadProps>(
  ({ className, align, pinned, truncate, cellType, ...props }, ref) => (
    <th
      ref={ref}
      className={cn(tableHeadVariants({ align, pinned, truncate }), className)}
      data-align={align}
      data-pinned={pinned !== 'none' ? pinned : undefined}
      data-cell-type={cellType}
      data-truncate={truncate || undefined}
      {...props}
    />
  )
);
TableHead.displayName = 'TableHead';

// =============================================================================
// TableCell (td element)
// =============================================================================

const tableCellVariants = cva(
  [
    'tn-table-cell',
    'p-3',
    '[&:has([role=checkbox])]:pr-0',
    '[&>[role=checkbox]]:translate-y-[2px]',
  ],
  {
    variants: {
      align: {
        left: 'text-left',
        center: 'text-center',
        right: 'text-right',
      },
      pinned: {
        left: 'sticky left-0 z-10 bg-background',
        right: 'sticky right-0 z-10 bg-background',
        none: '',
      },
      truncate: {
        true: 'truncate max-w-[200px]',
        false: '',
      },
    },
    defaultVariants: {
      align: 'left',
      pinned: 'none',
      truncate: false,
    },
  }
);

type TableCellAlign = NonNullable<VariantProps<typeof tableCellVariants>['align']>;
type TableCellPinned = NonNullable<VariantProps<typeof tableCellVariants>['pinned']>;

interface TableCellProps
  extends
    Omit<TdHTMLAttributes<HTMLTableCellElement>, 'align'>,
    VariantProps<typeof tableCellVariants> {
  cellType?: string;
}

const TableCell = forwardRef<HTMLTableCellElement, TableCellProps>(
  ({ className, align, pinned, truncate, cellType, ...props }, ref) => (
    <td
      ref={ref}
      className={cn(tableCellVariants({ align, pinned, truncate }), className)}
      data-align={align}
      data-pinned={pinned !== 'none' ? pinned : undefined}
      data-cell-type={cellType}
      data-truncate={truncate || undefined}
      {...props}
    />
  )
);
TableCell.displayName = 'TableCell';

// =============================================================================
// TableCaption
// =============================================================================

const tableCaptionVariants = cva(['tn-table-caption', 'mt-4', 'text-sm', 'text-fg-tertiary']);

interface TableCaptionProps extends HTMLAttributes<HTMLTableCaptionElement> {}

const TableCaption = forwardRef<HTMLTableCaptionElement, TableCaptionProps>(
  ({ className, ...props }, ref) => (
    <caption ref={ref} className={cn(tableCaptionVariants(), className)} {...props} />
  )
);
TableCaption.displayName = 'TableCaption';

// =============================================================================
// Exports
// =============================================================================

export {
  Table,
  TableContainer,
  TableHeader,
  TableBody,
  TableFooter,
  TableRow,
  TableHead,
  TableCell,
  TableCaption,
  tableVariants,
  tableHeaderVariants,
  tableBodyVariants,
  tableFooterVariants,
  tableRowVariants,
  tableHeadVariants,
  tableCellVariants,
  tableCaptionVariants,
};

export type {
  TableProps,
  TableContainerProps,
  TableVariant,
  TableHeaderProps,
  TableBodyProps,
  TableFooterProps,
  TableRowProps,
  TableHeadProps,
  TableHeadAlign,
  TableHeadPinned,
  TableCellProps,
  TableCellAlign,
  TableCellPinned,
  TableCaptionProps,
};
