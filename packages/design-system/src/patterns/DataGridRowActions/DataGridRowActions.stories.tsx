import * as React from 'react';
import type { Story } from '@ladle/react';
import { DataGridRowActions, type DataGridRowAction } from './DataGridRowActions.js';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '../../primitives/Table/Table.js';

export default {
  title: 'Patterns/DataGridRowActions',
};

// Inline SVG icons (12x12px as per contract - NOT Phosphor)
const EditIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const CopyIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);

const TrashIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);

const MoreIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="1" />
    <circle cx="19" cy="12" r="1" />
    <circle cx="5" cy="12" r="1" />
  </svg>
);

// ============================================================================
// Default (Hover Visibility)
// ============================================================================

export const Default: Story = () => {
  const actions: DataGridRowAction[] = [
    { id: 'edit', icon: <EditIcon />, label: 'Edit', onClick: () => console.log('Edit') },
    { id: 'copy', icon: <CopyIcon />, label: 'Copy', onClick: () => console.log('Copy') },
    {
      id: 'delete',
      icon: <TrashIcon />,
      label: 'Delete',
      onClick: () => console.log('Delete'),
      destructive: true,
    },
  ];

  return (
    <div className="p-6">
      <h2 className="mb-4 text-sm font-semibold text-fg-secondary">
        Hover over rows to see actions
      </h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[100px]" align="right">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {['Document A', 'Document B', 'Document C'].map((name) => (
            <TableRow key={name} className="group">
              <TableCell className="font-medium">{name}</TableCell>
              <TableCell>Published</TableCell>
              <TableCell align="right">
                <DataGridRowActions actions={actions} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

// ============================================================================
// Visibility Variants
// ============================================================================

export const VisibilityVariants: Story = () => {
  const actions: DataGridRowAction[] = [
    { id: 'edit', icon: <EditIcon />, label: 'Edit', onClick: () => {} },
    { id: 'delete', icon: <TrashIcon />, label: 'Delete', onClick: () => {}, destructive: true },
  ];

  return (
    <div className="space-y-8 p-6">
      <section>
        <h2 className="mb-4 text-sm font-semibold text-fg-secondary">Always Visible</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead className="w-[100px]" align="right">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow className="group">
              <TableCell>Document A</TableCell>
              <TableCell align="right">
                <DataGridRowActions actions={actions} visible="always" />
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </section>

      <section>
        <h2 className="mb-4 text-sm font-semibold text-fg-secondary">Visible on Hover (default)</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead className="w-[100px]" align="right">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow className="group">
              <TableCell>Document B</TableCell>
              <TableCell align="right">
                <DataGridRowActions actions={actions} visible="hover" />
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </section>

      <section>
        <h2 className="mb-4 text-sm font-semibold text-fg-secondary">Visible on Focus Only</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead className="w-[100px]" align="right">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow className="group">
              <TableCell>Document C (tab to focus)</TableCell>
              <TableCell align="right">
                <DataGridRowActions actions={actions} visible="focus" />
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </section>
    </div>
  );
};

// ============================================================================
// Single Action
// ============================================================================

export const SingleAction: Story = () => {
  const actions: DataGridRowAction[] = [
    { id: 'more', icon: <MoreIcon />, label: 'More options', onClick: () => console.log('More') },
  ];

  return (
    <div className="p-6">
      <h2 className="mb-4 text-sm font-semibold text-fg-secondary">Single Action</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead className="w-[60px]" align="right">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {['Item 1', 'Item 2', 'Item 3'].map((name) => (
            <TableRow key={name} className="group">
              <TableCell>{name}</TableCell>
              <TableCell align="right">
                <DataGridRowActions actions={actions} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

// ============================================================================
// With Disabled Actions
// ============================================================================

export const WithDisabledActions: Story = () => {
  const actions: DataGridRowAction[] = [
    { id: 'edit', icon: <EditIcon />, label: 'Edit', onClick: () => {}, disabled: true },
    { id: 'copy', icon: <CopyIcon />, label: 'Copy', onClick: () => {} },
    {
      id: 'delete',
      icon: <TrashIcon />,
      label: 'Delete',
      onClick: () => {},
      destructive: true,
      disabled: true,
    },
  ];

  return (
    <div className="p-6">
      <h2 className="mb-4 text-sm font-semibold text-fg-secondary">Some Actions Disabled</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead className="w-[100px]" align="right">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow className="group">
            <TableCell>Read-only Document</TableCell>
            <TableCell align="right">
              <DataGridRowActions actions={actions} visible="always" />
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
};

// ============================================================================
// Row States
// ============================================================================

export const RowStates: Story = () => {
  const actions: DataGridRowAction[] = [
    { id: 'edit', icon: <EditIcon />, label: 'Edit', onClick: () => {} },
    { id: 'delete', icon: <TrashIcon />, label: 'Delete', onClick: () => {}, destructive: true },
  ];

  return (
    <div className="p-6">
      <h2 className="mb-4 text-sm font-semibold text-fg-secondary">
        Actions in Different Row States
      </h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>State</TableHead>
            <TableHead className="w-[100px]" align="right">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow className="group">
            <TableCell>Normal Row</TableCell>
            <TableCell>Default</TableCell>
            <TableCell align="right">
              <DataGridRowActions actions={actions} visible="always" rowState="default" />
            </TableCell>
          </TableRow>
          <TableRow className="group" selected>
            <TableCell>Selected Row</TableCell>
            <TableCell>Selected</TableCell>
            <TableCell align="right">
              <DataGridRowActions actions={actions} visible="always" rowState="selected" />
            </TableCell>
          </TableRow>
          <TableRow className="group" disabled>
            <TableCell>Disabled Row</TableCell>
            <TableCell>Disabled</TableCell>
            <TableCell align="right">
              <DataGridRowActions actions={actions} visible="always" rowState="disabled" />
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
};

// ============================================================================
// Left Alignment
// ============================================================================

export const LeftAlignment: Story = () => {
  const actions: DataGridRowAction[] = [
    { id: 'edit', icon: <EditIcon />, label: 'Edit', onClick: () => {} },
    { id: 'copy', icon: <CopyIcon />, label: 'Copy', onClick: () => {} },
  ];

  return (
    <div className="p-6">
      <h2 className="mb-4 text-sm font-semibold text-fg-secondary">Left-Aligned Actions</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Actions</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {['Doc A', 'Doc B', 'Doc C'].map((name) => (
            <TableRow key={name} className="group">
              <TableCell>
                <DataGridRowActions actions={actions} align="left" />
              </TableCell>
              <TableCell className="font-medium">{name}</TableCell>
              <TableCell>Active</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

// ============================================================================
// Empty State
// ============================================================================

export const EmptyActions: Story = () => {
  return (
    <div className="p-6">
      <h2 className="mb-4 text-sm font-semibold text-fg-secondary">No Actions Available</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead className="w-[100px]" align="right">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow className="group">
            <TableCell>System Document</TableCell>
            <TableCell align="right">
              <DataGridRowActions actions={[]} visible="always" />
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
      <p className="mt-4 text-sm text-fg-tertiary">
        Actions cell is empty when no actions are provided
      </p>
    </div>
  );
};
