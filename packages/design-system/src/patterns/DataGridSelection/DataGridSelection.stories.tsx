import * as React from 'react';
import type { Story } from '@ladle/react';
import { DataGridHeaderCheckbox, DataGridRowCheckbox } from './DataGridSelection.js';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '../../primitives/Table/Table.js';

export default {
  title: 'Patterns/DataGridSelection',
};

// ============================================================================
// Header Checkbox States
// ============================================================================

export const HeaderCheckboxStates: Story = () => {
  return (
    <div className="space-y-6 p-6">
      <h2 className="text-sm font-semibold text-fg-secondary">Header Checkbox States</h2>
      <div className="flex items-center gap-8">
        <div className="flex flex-col items-center gap-2">
          <DataGridHeaderCheckbox selection="none" onToggle={() => {}} />
          <span className="text-xs text-fg-tertiary">None</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <DataGridHeaderCheckbox selection="some" onToggle={() => {}} />
          <span className="text-xs text-fg-tertiary">Some (indeterminate)</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <DataGridHeaderCheckbox selection="all" onToggle={() => {}} />
          <span className="text-xs text-fg-tertiary">All</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <DataGridHeaderCheckbox selection="none" onToggle={() => {}} disabled />
          <span className="text-xs text-fg-tertiary">Disabled</span>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// Row Checkbox States
// ============================================================================

export const RowCheckboxStates: Story = () => {
  return (
    <div className="space-y-6 p-6">
      <h2 className="text-sm font-semibold text-fg-secondary">Row Checkbox States</h2>
      <div className="flex items-center gap-8">
        <div className="flex flex-col items-center gap-2">
          <DataGridRowCheckbox checked={false} onToggle={() => {}} />
          <span className="text-xs text-fg-tertiary">Unchecked</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <DataGridRowCheckbox checked={true} onToggle={() => {}} />
          <span className="text-xs text-fg-tertiary">Checked</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <DataGridRowCheckbox checked={false} onToggle={() => {}} disabled />
          <span className="text-xs text-fg-tertiary">Disabled</span>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// Interactive Example
// ============================================================================

const sampleData = [
  { id: '1', name: 'Document A', status: 'Published' },
  { id: '2', name: 'Document B', status: 'Draft' },
  { id: '3', name: 'Document C', status: 'Published' },
  { id: '4', name: 'Document D', status: 'Archived' },
  { id: '5', name: 'Document E', status: 'Draft' },
];

export const Interactive: Story = () => {
  const [selected, setSelected] = React.useState<Set<string>>(new Set());

  const getSelectionState = (): 'none' | 'some' | 'all' => {
    if (selected.size === 0) return 'none';
    if (selected.size === sampleData.length) return 'all';
    return 'some';
  };

  const toggleAll = () => {
    if (selected.size === sampleData.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(sampleData.map((d) => d.id)));
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
      <h2 className="text-sm font-semibold text-fg-secondary">Interactive Selection</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">
              <DataGridHeaderCheckbox
                selection={getSelectionState()}
                onToggle={toggleAll}
                aria-label="Select all documents"
              />
            </TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sampleData.map((row) => (
            <TableRow key={row.id} selected={selected.has(row.id)}>
              <TableCell>
                <DataGridRowCheckbox
                  checked={selected.has(row.id)}
                  onToggle={() => toggleOne(row.id)}
                  aria-label={`Select ${row.name}`}
                />
              </TableCell>
              <TableCell className="font-medium">{row.name}</TableCell>
              <TableCell>{row.status}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <p className="text-sm text-fg-tertiary">
        Selected: {selected.size} of {sampleData.length}
      </p>
    </div>
  );
};

// ============================================================================
// With Disabled Rows
// ============================================================================

export const WithDisabledRows: Story = () => {
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const disabledIds = new Set(['2', '4']);
  const enabledData = sampleData.filter((d) => !disabledIds.has(d.id));

  const getSelectionState = (): 'none' | 'some' | 'all' => {
    const selectedEnabled = [...selected].filter((id) => !disabledIds.has(id));
    if (selectedEnabled.length === 0) return 'none';
    if (selectedEnabled.length === enabledData.length) return 'all';
    return 'some';
  };

  const toggleAll = () => {
    const selectedEnabled = [...selected].filter((id) => !disabledIds.has(id));
    if (selectedEnabled.length === enabledData.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(enabledData.map((d) => d.id)));
    }
  };

  const toggleOne = (id: string) => {
    if (disabledIds.has(id)) return;
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
      <h2 className="text-sm font-semibold text-fg-secondary">With Disabled Rows</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">
              <DataGridHeaderCheckbox
                selection={getSelectionState()}
                onToggle={toggleAll}
                aria-label="Select all enabled documents"
              />
            </TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sampleData.map((row) => {
            const isDisabled = disabledIds.has(row.id);
            return (
              <TableRow key={row.id} selected={selected.has(row.id)} disabled={isDisabled}>
                <TableCell>
                  <DataGridRowCheckbox
                    checked={selected.has(row.id)}
                    onToggle={() => toggleOne(row.id)}
                    disabled={isDisabled}
                    aria-label={`Select ${row.name}`}
                  />
                </TableCell>
                <TableCell className="font-medium">{row.name}</TableCell>
                <TableCell>{row.status}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      <p className="text-sm text-fg-tertiary">Rows 2 and 4 are disabled and cannot be selected.</p>
    </div>
  );
};

// ============================================================================
// Empty State
// ============================================================================

export const EmptyState: Story = () => {
  return (
    <div className="space-y-4 p-6">
      <h2 className="text-sm font-semibold text-fg-secondary">Empty Table</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">
              <DataGridHeaderCheckbox selection="none" onToggle={() => {}} disabled />
            </TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow hover={false}>
            <TableCell colSpan={3} className="text-center text-fg-tertiary py-8">
              No documents found
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
};
