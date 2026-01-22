import * as React from 'react';
import type { Story } from '@ladle/react';
import {
  Table,
  TableContainer,
  TableHeader,
  TableBody,
  TableFooter,
  TableRow,
  TableHead,
  TableCell,
  TableCaption,
} from './Table.js';
import { Checkbox } from '../Checkbox/Checkbox.js';
import { Badge } from '../Badge/Badge.js';
import { IconButton } from '../IconButton/IconButton.js';

export default {
  title: 'Primitives/Table',
};

// Sample data
const invoices = [
  { id: 'INV001', status: 'Paid', method: 'Credit Card', amount: 250.0 },
  { id: 'INV002', status: 'Pending', method: 'PayPal', amount: 150.0 },
  { id: 'INV003', status: 'Unpaid', method: 'Bank Transfer', amount: 350.0 },
  { id: 'INV004', status: 'Paid', method: 'Credit Card', amount: 450.0 },
  { id: 'INV005', status: 'Paid', method: 'PayPal', amount: 550.0 },
  { id: 'INV006', status: 'Pending', method: 'Bank Transfer', amount: 200.0 },
  { id: 'INV007', status: 'Unpaid', method: 'Credit Card', amount: 300.0 },
];

const statusIntent = (status: string) => {
  switch (status) {
    case 'Paid':
      return 'success' as const;
    case 'Pending':
      return 'warning' as const;
    case 'Unpaid':
      return 'danger' as const;
    default:
      return 'neutral' as const;
  }
};

export const Overview: Story = () => (
  <div className="space-y-10 p-6">
    <section className="space-y-4">
      <h2 className="text-sm font-semibold text-fg-secondary">Default Table</h2>
      <Table>
        <TableCaption>A list of recent invoices.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Invoice</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Method</TableHead>
            <TableHead align="right">Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices.slice(0, 5).map((invoice) => (
            <TableRow key={invoice.id}>
              <TableCell className="font-medium">{invoice.id}</TableCell>
              <TableCell>
                <Badge intent={statusIntent(invoice.status)}>{invoice.status}</Badge>
              </TableCell>
              <TableCell>{invoice.method}</TableCell>
              <TableCell align="right">${invoice.amount.toFixed(2)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={3}>Total</TableCell>
            <TableCell align="right">
              $
              {invoices
                .slice(0, 5)
                .reduce((sum, i) => sum + i.amount, 0)
                .toFixed(2)}
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </section>
  </div>
);

export const StickyHeader: Story = () => (
  <div className="space-y-4 p-6">
    <h2 className="text-sm font-semibold text-fg-secondary">
      Sticky Header (scroll to see effect)
    </h2>
    <div className="h-[300px] overflow-auto border border-neutral-200 rounded-lg dark:border-neutral-800">
      <Table>
        <TableHeader sticky>
          <TableRow>
            <TableHead className="w-[100px]">Invoice</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Method</TableHead>
            <TableHead align="right">Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {[...invoices, ...invoices, ...invoices].map((invoice, idx) => (
            <TableRow key={`${invoice.id}-${idx}`}>
              <TableCell className="font-medium">{invoice.id}</TableCell>
              <TableCell>
                <Badge intent={statusIntent(invoice.status)}>{invoice.status}</Badge>
              </TableCell>
              <TableCell>{invoice.method}</TableCell>
              <TableCell align="right">${invoice.amount.toFixed(2)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  </div>
);

const wideData = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    role: 'Admin',
    department: 'Engineering',
    location: 'NYC',
    status: 'Active',
    joined: '2023-01-15',
  },
  {
    id: 2,
    name: 'Jane Smith',
    email: 'jane@example.com',
    role: 'Editor',
    department: 'Marketing',
    location: 'LA',
    status: 'Active',
    joined: '2023-02-20',
  },
  {
    id: 3,
    name: 'Bob Wilson',
    email: 'bob@example.com',
    role: 'Viewer',
    department: 'Sales',
    location: 'Chicago',
    status: 'Inactive',
    joined: '2023-03-10',
  },
  {
    id: 4,
    name: 'Alice Brown',
    email: 'alice@example.com',
    role: 'Admin',
    department: 'HR',
    location: 'Boston',
    status: 'Active',
    joined: '2023-04-05',
  },
  {
    id: 5,
    name: 'Charlie Davis',
    email: 'charlie@example.com',
    role: 'Editor',
    department: 'Design',
    location: 'Seattle',
    status: 'Active',
    joined: '2023-05-12',
  },
];

export const PinnedColumns: Story = () => (
  <div className="space-y-4 p-6">
    <h2 className="text-sm font-semibold text-fg-secondary">
      Pinned Columns (scroll horizontally)
    </h2>
    <TableContainer className="w-[600px] border border-neutral-200 rounded-lg dark:border-neutral-800">
      <Table>
        <TableHeader sticky>
          <TableRow>
            <TableHead pinned="left" className="w-[50px]">
              ID
            </TableHead>
            <TableHead className="min-w-[150px]">Name</TableHead>
            <TableHead className="min-w-[200px]">Email</TableHead>
            <TableHead className="min-w-[100px]">Role</TableHead>
            <TableHead className="min-w-[120px]">Department</TableHead>
            <TableHead className="min-w-[100px]">Location</TableHead>
            <TableHead className="min-w-[100px]">Status</TableHead>
            <TableHead pinned="right" className="w-[80px]" align="center">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {wideData.map((row) => (
            <TableRow key={row.id}>
              <TableCell pinned="left" className="font-medium">
                {row.id}
              </TableCell>
              <TableCell>{row.name}</TableCell>
              <TableCell>{row.email}</TableCell>
              <TableCell>{row.role}</TableCell>
              <TableCell>{row.department}</TableCell>
              <TableCell>{row.location}</TableCell>
              <TableCell>
                <Badge intent={row.status === 'Active' ? 'success' : 'neutral'}>{row.status}</Badge>
              </TableCell>
              <TableCell pinned="right" align="center">
                <IconButton variant="ghost" size="sm" aria-label="Edit">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 20h9" />
                    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                  </svg>
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  </div>
);

export const WithSelection: Story = () => {
  const [selected, setSelected] = React.useState<Set<string>>(new Set());

  const toggleAll = () => {
    if (selected.size === invoices.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(invoices.map((i) => i.id)));
    }
  };

  const toggleOne = (id: string) => {
    const newSelected = new Set(selected);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelected(newSelected);
  };

  return (
    <div className="space-y-4 p-6">
      <h2 className="text-sm font-semibold text-fg-secondary">With Selection</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">
              <Checkbox
                checked={
                  selected.size === invoices.length
                    ? true
                    : selected.size > 0
                      ? 'indeterminate'
                      : false
                }
                onCheckedChange={toggleAll}
                aria-label="Select all"
              />
            </TableHead>
            <TableHead>Invoice</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Method</TableHead>
            <TableHead align="right">Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices.map((invoice) => (
            <TableRow key={invoice.id} selected={selected.has(invoice.id)}>
              <TableCell>
                <Checkbox
                  checked={selected.has(invoice.id)}
                  onCheckedChange={() => toggleOne(invoice.id)}
                  aria-label={`Select ${invoice.id}`}
                />
              </TableCell>
              <TableCell className="font-medium">{invoice.id}</TableCell>
              <TableCell>
                <Badge intent={statusIntent(invoice.status)}>{invoice.status}</Badge>
              </TableCell>
              <TableCell>{invoice.method}</TableCell>
              <TableCell align="right">${invoice.amount.toFixed(2)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <p className="text-sm text-fg-tertiary">
        Selected: {selected.size} of {invoices.length}
      </p>
    </div>
  );
};

export const RowStates: Story = () => (
  <div className="space-y-4 p-6">
    <h2 className="text-sm font-semibold text-fg-secondary">Row States</h2>
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>State</TableHead>
          <TableHead>Description</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell className="font-medium">Default</TableCell>
          <TableCell>Normal row with hover effect</TableCell>
        </TableRow>
        <TableRow hover={false}>
          <TableCell className="font-medium">No Hover</TableCell>
          <TableCell>Row without hover effect</TableCell>
        </TableRow>
        <TableRow selected>
          <TableCell className="font-medium">Selected</TableCell>
          <TableCell>Row in selected state</TableCell>
        </TableRow>
        <TableRow active>
          <TableCell className="font-medium">Active</TableCell>
          <TableCell>Row in active/focused state</TableCell>
        </TableRow>
        <TableRow disabled>
          <TableCell className="font-medium">Disabled</TableCell>
          <TableCell>Row in disabled state</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  </div>
);

export const CellAlignment: Story = () => (
  <div className="space-y-4 p-6">
    <h2 className="text-sm font-semibold text-fg-secondary">Cell Alignment</h2>
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead align="left">Left Aligned</TableHead>
          <TableHead align="center">Center Aligned</TableHead>
          <TableHead align="right">Right Aligned</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell align="left">Text on the left</TableCell>
          <TableCell align="center">Text in the center</TableCell>
          <TableCell align="right">Text on the right</TableCell>
        </TableRow>
        <TableRow>
          <TableCell align="left">Another left</TableCell>
          <TableCell align="center">Another center</TableCell>
          <TableCell align="right">$1,234.56</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  </div>
);

export const Variants: Story = () => (
  <div className="space-y-10 p-6">
    <section className="space-y-4">
      <h2 className="text-sm font-semibold text-fg-secondary">Default</h2>
      <Table variant="default">
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>John Doe</TableCell>
            <TableCell>john@example.com</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Jane Smith</TableCell>
            <TableCell>jane@example.com</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </section>

    <section className="space-y-4">
      <h2 className="text-sm font-semibold text-fg-secondary">Bordered</h2>
      <Table variant="bordered">
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>John Doe</TableCell>
            <TableCell>john@example.com</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Jane Smith</TableCell>
            <TableCell>jane@example.com</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </section>
  </div>
);

export const Truncation: Story = () => (
  <div className="space-y-4 p-6">
    <h2 className="text-sm font-semibold text-fg-secondary">Cell Truncation</h2>
    <div className="w-[500px]">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead truncate>Long Header That Should Truncate</TableHead>
            <TableHead>Normal</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell truncate>
              This is a very long cell content that should be truncated with an ellipsis when it
              exceeds the maximum width
            </TableCell>
            <TableCell>Short text</TableCell>
          </TableRow>
          <TableRow>
            <TableCell truncate>
              Another long piece of text that demonstrates the truncation behavior in action
            </TableCell>
            <TableCell>More text</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  </div>
);
