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
    { label: 'Name', value: 'John Doe' },
    { label: 'Email', value: 'john@example.com' },
    { label: 'Role', value: 'Administrator' },
    { label: 'Status', value: 'Active' },
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
    { label: 'Name', value: 'Jane Smith' },
    {
      label: 'Email',
      value: (
        <a href="#" className="text-primary hover:underline">
          jane@example.com
        </a>
      ),
    },
    { label: 'Status', value: <Badge intent="success">Active</Badge> },
    { label: 'Role', value: <Badge intent="info">Editor</Badge> },
    { label: 'Created', value: <span className="text-fg-tertiary">Jan 15, 2024</span> },
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
    { label: 'Project', value: 'TypeNote App' },
    {
      label: 'Tags',
      value: (
        <div className="flex flex-wrap gap-1">
          <Badge intent="neutral">react</Badge>
          <Badge intent="neutral">typescript</Badge>
          <Badge intent="neutral">electron</Badge>
        </div>
      ),
    },
    { label: 'Priority', value: <Badge intent="warning">High</Badge> },
    { label: 'Assignee', value: 'Sarah Connor' },
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
    { label: 'Title', value: 'A Very Long Document Title That Wraps to Multiple Lines' },
    {
      label: 'Description',
      value:
        'This is a longer description that demonstrates how the PropertyList handles multi-line content. It will wrap naturally within the available space.',
    },
    { label: 'URL', value: 'https://example.com/very/long/path/to/some/resource/that/wraps' },
    { label: 'ID', value: 'doc_2024_01_15_abc123xyz789' },
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
    { label: 'Name', value: 'Test Document' },
    {
      label: 'Description',
      value: <span className="text-fg-tertiary italic">No description</span>,
    },
    { label: 'Tags', value: <span className="text-fg-tertiary italic">None</span> },
    { label: 'Status', value: <Badge intent="neutral">Draft</Badge> },
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
    { label: 'Created', value: 'Jan 15, 2024 at 10:30 AM' },
    { label: 'Modified', value: 'Jan 20, 2024 at 3:45 PM' },
    { label: 'Author', value: 'Alice Johnson' },
    { label: 'Version', value: '1.2.3' },
    { label: 'Status', value: <Badge intent="success">Published</Badge> },
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
    { label: 'Status', value: <Badge intent="info">In Progress</Badge> },
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
    label: `Property ${i + 1}`,
    value: `Value for property ${i + 1}`,
  }));

  return (
    <div className="max-w-md p-6">
      <PropertyList items={items} />
    </div>
  );
};
