import * as React from 'react';
import type { Story } from '@ladle/react';
import { SortAscending } from '@phosphor-icons/react/dist/ssr/SortAscending';
import { SortDescending } from '@phosphor-icons/react/dist/ssr/SortDescending';
import { EyeSlash } from '@phosphor-icons/react/dist/ssr/EyeSlash';
import { ArrowLineLeft } from '@phosphor-icons/react/dist/ssr/ArrowLineLeft';
import { ArrowLineRight } from '@phosphor-icons/react/dist/ssr/ArrowLineRight';
import { DataGridHeaderCell, type DataGridHeaderMenuItem } from './DataGridHeaderCell.js';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '../../primitives/Table/Table.js';

export default {
  title: 'Patterns/DataGridHeaderCell',
};

// ============================================================================
// Sort States
// ============================================================================

export const SortStates: Story = () => {
  return (
    <div className="space-y-6 p-6">
      <h2 className="text-sm font-semibold text-fg-secondary">Sort States</h2>
      <div className="flex items-center gap-4">
        <div className="rounded border border-border">
          <DataGridHeaderCell label="Not Sortable" sortable={false} />
        </div>
        <div className="rounded border border-border">
          <DataGridHeaderCell label="Unsorted" sortable sort="none" onSort={() => {}} />
        </div>
        <div className="rounded border border-border">
          <DataGridHeaderCell label="Ascending" sortable sort="asc" onSort={() => {}} />
        </div>
        <div className="rounded border border-border">
          <DataGridHeaderCell label="Descending" sortable sort="desc" onSort={() => {}} />
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// Interactive Sorting
// ============================================================================

type SortKey = 'name' | 'status' | 'date';
type SortDir = 'none' | 'asc' | 'desc';

export const InteractiveSorting: Story = () => {
  const [sortConfig, setSortConfig] = React.useState<{ key: SortKey; direction: SortDir }>({
    key: 'name',
    direction: 'none',
  });

  const handleSort = (key: SortKey) => {
    setSortConfig((prev) => {
      if (prev.key !== key) {
        return { key, direction: 'asc' };
      }
      const nextDir: SortDir =
        prev.direction === 'none' ? 'asc' : prev.direction === 'asc' ? 'desc' : 'none';
      return { key, direction: nextDir };
    });
  };

  const getSortDirection = (key: SortKey): SortDir => {
    return sortConfig.key === key ? sortConfig.direction : 'none';
  };

  const data = [
    { name: 'Alice', status: 'Active', date: '2024-01-15' },
    { name: 'Bob', status: 'Pending', date: '2024-01-10' },
    { name: 'Charlie', status: 'Active', date: '2024-01-20' },
  ];

  const sortedData = [...data].sort((a, b) => {
    if (sortConfig.direction === 'none') return 0;
    const aVal = a[sortConfig.key];
    const bVal = b[sortConfig.key];
    const cmp = aVal.localeCompare(bVal);
    return sortConfig.direction === 'asc' ? cmp : -cmp;
  });

  return (
    <div className="space-y-4 p-6">
      <h2 className="text-sm font-semibold text-fg-secondary">Interactive Sorting</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="p-0">
              <DataGridHeaderCell
                label="Name"
                sortable
                sort={getSortDirection('name')}
                onSort={() => handleSort('name')}
              />
            </TableHead>
            <TableHead className="p-0">
              <DataGridHeaderCell
                label="Status"
                sortable
                sort={getSortDirection('status')}
                onSort={() => handleSort('status')}
              />
            </TableHead>
            <TableHead className="p-0">
              <DataGridHeaderCell
                label="Date"
                sortable
                sort={getSortDirection('date')}
                onSort={() => handleSort('date')}
              />
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedData.map((row) => (
            <TableRow key={row.name}>
              <TableCell>{row.name}</TableCell>
              <TableCell>{row.status}</TableCell>
              <TableCell>{row.date}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <p className="text-sm text-fg-tertiary">
        Current sort: {sortConfig.key} ({sortConfig.direction})
      </p>
    </div>
  );
};

// ============================================================================
// With Menu
// ============================================================================

export const WithMenu: Story = () => {
  const menuItems: DataGridHeaderMenuItem[] = [
    {
      id: 'sort-asc',
      label: 'Sort Ascending',
      icon: <SortAscending className="h-4 w-4" />,
      onClick: () => console.log('Sort Asc'),
    },
    {
      id: 'sort-desc',
      label: 'Sort Descending',
      icon: <SortDescending className="h-4 w-4" />,
      onClick: () => console.log('Sort Desc'),
    },
    {
      id: 'pin-left',
      label: 'Pin Left',
      icon: <ArrowLineLeft className="h-4 w-4" />,
      onClick: () => console.log('Pin Left'),
    },
    {
      id: 'pin-right',
      label: 'Pin Right',
      icon: <ArrowLineRight className="h-4 w-4" />,
      onClick: () => console.log('Pin Right'),
    },
    {
      id: 'hide',
      label: 'Hide Column',
      icon: <EyeSlash className="h-4 w-4" />,
      onClick: () => console.log('Hide'),
    },
  ];

  return (
    <div className="space-y-4 p-6">
      <h2 className="text-sm font-semibold text-fg-secondary">
        With Column Menu (hover to see menu icon)
      </h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="p-0">
              <DataGridHeaderCell
                label="Name"
                sortable
                sort="asc"
                onSort={() => {}}
                menuItems={menuItems}
              />
            </TableHead>
            <TableHead className="p-0">
              <DataGridHeaderCell
                label="Email"
                sortable
                sort="none"
                onSort={() => {}}
                menuItems={menuItems}
              />
            </TableHead>
            <TableHead className="p-0">
              <DataGridHeaderCell label="Role" menuItems={menuItems} />
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>John Doe</TableCell>
            <TableCell>john@example.com</TableCell>
            <TableCell>Admin</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
};

// ============================================================================
// Draggable Headers
// ============================================================================

export const DraggableHeaders: Story = () => {
  return (
    <div className="space-y-4 p-6">
      <h2 className="text-sm font-semibold text-fg-secondary">
        Draggable Headers (hover to see drag handle)
      </h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="p-0">
              <DataGridHeaderCell
                label="Column A"
                draggable
                sortable
                sort="none"
                onSort={() => {}}
              />
            </TableHead>
            <TableHead className="p-0">
              <DataGridHeaderCell
                label="Column B"
                draggable
                sortable
                sort="none"
                onSort={() => {}}
              />
            </TableHead>
            <TableHead className="p-0">
              <DataGridHeaderCell
                label="Column C"
                draggable
                sortable
                sort="none"
                onSort={() => {}}
              />
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>Value A</TableCell>
            <TableCell>Value B</TableCell>
            <TableCell>Value C</TableCell>
          </TableRow>
        </TableBody>
      </Table>
      <p className="text-sm text-fg-tertiary">
        Drag handles appear on hover. Actual drag-and-drop logic is handled by the consumer.
      </p>
    </div>
  );
};

// ============================================================================
// Drag States
// ============================================================================

export const DragStates: Story = () => {
  return (
    <div className="space-y-6 p-6">
      <h2 className="text-sm font-semibold text-fg-secondary">Drag States</h2>
      <div className="flex items-center gap-2">
        <div className="rounded border border-border">
          <DataGridHeaderCell label="Normal" draggable />
        </div>
        <div className="rounded border border-border">
          <DataGridHeaderCell label="Dragging" draggable dragging />
        </div>
        <div className="rounded border border-border">
          <DataGridHeaderCell label="Drop Before" draggable dropTarget="before" />
        </div>
        <div className="rounded border border-border">
          <DataGridHeaderCell label="Drop After" draggable dropTarget="after" />
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// Alignment Variants
// ============================================================================

export const AlignmentVariants: Story = () => {
  return (
    <div className="space-y-4 p-6">
      <h2 className="text-sm font-semibold text-fg-secondary">Alignment Variants</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="p-0 w-[200px]">
              <DataGridHeaderCell
                label="Left (default)"
                align="left"
                sortable
                sort="asc"
                onSort={() => {}}
              />
            </TableHead>
            <TableHead className="p-0 w-[200px]">
              <DataGridHeaderCell
                label="Center"
                align="center"
                sortable
                sort="none"
                onSort={() => {}}
              />
            </TableHead>
            <TableHead className="p-0 w-[200px]">
              <DataGridHeaderCell
                label="Right"
                align="right"
                sortable
                sort="desc"
                onSort={() => {}}
              />
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>Left content</TableCell>
            <TableCell align="center">Centered</TableCell>
            <TableCell align="right">$1,234.56</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
};

// ============================================================================
// Full Featured
// ============================================================================

export const FullFeatured: Story = () => {
  const [sortConfig, setSortConfig] = React.useState<{ key: string; direction: SortDir }>({
    key: 'name',
    direction: 'asc',
  });

  const handleSort = (key: string) => {
    setSortConfig((prev) => {
      if (prev.key !== key) return { key, direction: 'asc' };
      const next: SortDir =
        prev.direction === 'none' ? 'asc' : prev.direction === 'asc' ? 'desc' : 'none';
      return { key, direction: next };
    });
  };

  const getDirection = (key: string): SortDir =>
    sortConfig.key === key ? sortConfig.direction : 'none';

  const menuItems: DataGridHeaderMenuItem[] = [
    {
      id: 'sort-asc',
      label: 'Sort A to Z',
      icon: <SortAscending className="h-4 w-4" />,
      onClick: () => {},
    },
    {
      id: 'sort-desc',
      label: 'Sort Z to A',
      icon: <SortDescending className="h-4 w-4" />,
      onClick: () => {},
    },
    { id: 'hide', label: 'Hide Column', icon: <EyeSlash className="h-4 w-4" />, onClick: () => {} },
  ];

  return (
    <div className="space-y-4 p-6">
      <h2 className="text-sm font-semibold text-fg-secondary">Full Featured Headers</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="p-0">
              <DataGridHeaderCell
                label="Name"
                sortable
                sort={getDirection('name')}
                onSort={() => handleSort('name')}
                draggable
                menuItems={menuItems}
              />
            </TableHead>
            <TableHead className="p-0">
              <DataGridHeaderCell
                label="Email"
                sortable
                sort={getDirection('email')}
                onSort={() => handleSort('email')}
                draggable
                menuItems={menuItems}
              />
            </TableHead>
            <TableHead className="p-0">
              <DataGridHeaderCell
                label="Amount"
                sortable
                sort={getDirection('amount')}
                onSort={() => handleSort('amount')}
                align="right"
                menuItems={menuItems}
              />
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>Alice Johnson</TableCell>
            <TableCell>alice@example.com</TableCell>
            <TableCell align="right">$1,250.00</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Bob Smith</TableCell>
            <TableCell>bob@example.com</TableCell>
            <TableCell align="right">$850.00</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
};

// ============================================================================
// Non-Sortable
// ============================================================================

export const NonSortable: Story = () => {
  return (
    <div className="space-y-4 p-6">
      <h2 className="text-sm font-semibold text-fg-secondary">Non-Sortable Headers</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="p-0">
              <DataGridHeaderCell label="ID" />
            </TableHead>
            <TableHead className="p-0">
              <DataGridHeaderCell label="Name" />
            </TableHead>
            <TableHead className="p-0">
              <DataGridHeaderCell label="Actions" align="right" />
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>001</TableCell>
            <TableCell>Document A</TableCell>
            <TableCell align="right">Edit</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
};
