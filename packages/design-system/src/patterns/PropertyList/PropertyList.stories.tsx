import * as React from 'react';
import type { Story } from '@ladle/react';
import { PropertyList, type PropertyListItem } from './PropertyList.js';
import { Badge } from '../../primitives/Badge/Badge.js';

export default {
  title: 'Patterns/PropertyList',
};

// ============================================================================
// Default
// ============================================================================

export const Default: Story = () => {
  const items: PropertyListItem[] = [
    { key: 'name', label: 'Name', value: 'John Doe' },
    { key: 'email', label: 'Email', value: 'john@example.com' },
    { key: 'role', label: 'Role', value: 'Administrator' },
    { key: 'status', label: 'Status', value: 'Active' },
  ];

  return (
    <div className="max-w-md p-6">
      <PropertyList items={items} />
    </div>
  );
};

// ============================================================================
// With Rich Values
// ============================================================================

export const WithRichValues: Story = () => {
  const items: PropertyListItem[] = [
    { key: 'name', label: 'Name', value: 'Jane Smith' },
    {
      key: 'email',
      label: 'Email',
      value: (
        <a href="#" className="text-primary hover:underline">
          jane@example.com
        </a>
      ),
    },
    { key: 'status', label: 'Status', value: <Badge intent="success">Active</Badge> },
    { key: 'role', label: 'Role', value: <Badge intent="info">Editor</Badge> },
    {
      key: 'created',
      label: 'Created',
      value: <span className="text-fg-tertiary">Jan 15, 2024</span>,
    },
  ];

  return (
    <div className="max-w-md p-6">
      <h2 className="mb-4 text-sm font-semibold text-fg-secondary">Values can be any ReactNode</h2>
      <PropertyList items={items} />
    </div>
  );
};

// ============================================================================
// With Multiple Badges
// ============================================================================

export const WithMultipleBadges: Story = () => {
  const items: PropertyListItem[] = [
    { key: 'project', label: 'Project', value: 'TypeNote App' },
    {
      key: 'tags',
      label: 'Tags',
      value: (
        <div className="flex flex-wrap gap-1">
          <Badge intent="neutral">react</Badge>
          <Badge intent="neutral">typescript</Badge>
          <Badge intent="neutral">electron</Badge>
        </div>
      ),
    },
    { key: 'priority', label: 'Priority', value: <Badge intent="warning">High</Badge> },
    { key: 'assignee', label: 'Assignee', value: 'Sarah Connor' },
  ];

  return (
    <div className="max-w-md p-6">
      <PropertyList items={items} />
    </div>
  );
};

// ============================================================================
// Long Values
// ============================================================================

export const LongValues: Story = () => {
  const items: PropertyListItem[] = [
    {
      key: 'title',
      label: 'Title',
      value: 'A Very Long Document Title That Wraps to Multiple Lines',
    },
    {
      key: 'description',
      label: 'Description',
      value:
        'This is a longer description that demonstrates how the PropertyList handles multi-line content. It will wrap naturally within the available space.',
    },
    {
      key: 'url',
      label: 'URL',
      value: 'https://example.com/very/long/path/to/some/resource/that/wraps',
    },
    { key: 'id', label: 'ID', value: 'doc_2024_01_15_abc123xyz789' },
  ];

  return (
    <div className="max-w-md p-6">
      <PropertyList items={items} />
    </div>
  );
};

// ============================================================================
// Empty Values
// ============================================================================

export const EmptyValues: Story = () => {
  const items: PropertyListItem[] = [
    { key: 'name', label: 'Name', value: 'Test Document' },
    {
      key: 'description',
      label: 'Description',
      value: <span className="text-fg-tertiary italic">No description</span>,
    },
    { key: 'tags', label: 'Tags', value: <span className="text-fg-tertiary italic">None</span> },
    { key: 'status', label: 'Status', value: <Badge intent="neutral">Draft</Badge> },
  ];

  return (
    <div className="max-w-md p-6">
      <h2 className="mb-4 text-sm font-semibold text-fg-secondary">
        Handling empty/missing values
      </h2>
      <PropertyList items={items} />
    </div>
  );
};

// ============================================================================
// In Context (Card)
// ============================================================================

export const InContext: Story = () => {
  const items: PropertyListItem[] = [
    { key: 'created', label: 'Created', value: 'Jan 15, 2024 at 10:30 AM' },
    { key: 'modified', label: 'Modified', value: 'Jan 20, 2024 at 3:45 PM' },
    { key: 'author', label: 'Author', value: 'Alice Johnson' },
    { key: 'version', label: 'Version', value: '1.2.3' },
    { key: 'status', label: 'Status', value: <Badge intent="success">Published</Badge> },
  ];

  return (
    <div className="max-w-md p-6">
      <div className="rounded-lg border border-border bg-background p-4">
        <h3 className="mb-4 text-base font-semibold">Document Details</h3>
        <PropertyList items={items} />
      </div>
    </div>
  );
};

// ============================================================================
// Single Item
// ============================================================================

export const SingleItem: Story = () => {
  const items: PropertyListItem[] = [
    { key: 'status', label: 'Status', value: <Badge intent="info">In Progress</Badge> },
  ];

  return (
    <div className="max-w-md p-6">
      <PropertyList items={items} />
    </div>
  );
};

// ============================================================================
// Many Items
// ============================================================================

export const ManyItems: Story = () => {
  const items: PropertyListItem[] = Array.from({ length: 10 }, (_, i) => ({
    key: `property-${i + 1}`,
    label: `Property ${i + 1}`,
    value: `Value for property ${i + 1}`,
  }));

  return (
    <div className="max-w-md p-6">
      <PropertyList items={items} />
    </div>
  );
};
