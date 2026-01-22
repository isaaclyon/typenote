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

// ============================================================================
// Editable: Text
// ============================================================================

export const EditableText: Story = () => {
  const [data, setData] = React.useState({
    title: 'My Document',
    description: 'A short description here',
    notes: '',
  });

  const items: PropertyListItem[] = [
    { key: 'title', label: 'Title', value: data.title, type: 'text', rawValue: data.title },
    {
      key: 'description',
      label: 'Description',
      value: data.description,
      type: 'text',
      rawValue: data.description,
      placeholder: 'Add description...',
    },
    {
      key: 'notes',
      label: 'Notes',
      value: data.notes || <span className="text-fg-tertiary italic">Empty</span>,
      type: 'text',
      rawValue: data.notes,
      placeholder: 'Add notes...',
    },
  ];

  return (
    <div className="max-w-md p-6">
      <h2 className="mb-4 text-sm font-semibold text-fg-secondary">Click any value to edit</h2>
      <PropertyList
        items={items}
        editable
        onPropertyChange={(key, value) => {
          setData((prev) => ({ ...prev, [key]: value }));
        }}
      />
      <div className="mt-4 text-xs text-fg-tertiary">
        Current data: <code>{JSON.stringify(data)}</code>
      </div>
    </div>
  );
};

// ============================================================================
// Editable: Number
// ============================================================================

export const EditableNumber: Story = () => {
  const [data, setData] = React.useState({
    count: 42,
    price: 19.99,
    quantity: 0,
  });

  const items: PropertyListItem[] = [
    {
      key: 'count',
      label: 'Count',
      value: String(data.count),
      type: 'number',
      rawValue: data.count,
    },
    { key: 'price', label: 'Price', value: `$${data.price}`, type: 'number', rawValue: data.price },
    {
      key: 'quantity',
      label: 'Quantity',
      value: data.quantity || <span className="text-fg-tertiary italic">0</span>,
      type: 'number',
      rawValue: data.quantity,
    },
  ];

  return (
    <div className="max-w-md p-6">
      <PropertyList
        items={items}
        editable
        onPropertyChange={(key, value) => {
          setData((prev) => ({ ...prev, [key]: Number(value) || 0 }));
        }}
      />
    </div>
  );
};

// ============================================================================
// Editable: Boolean
// ============================================================================

export const EditableBoolean: Story = () => {
  const [data, setData] = React.useState({
    published: true,
    featured: false,
    archived: false,
  });

  const items: PropertyListItem[] = [
    {
      key: 'published',
      label: 'Published',
      value: data.published ? 'Yes' : 'No',
      type: 'boolean',
      rawValue: data.published,
    },
    {
      key: 'featured',
      label: 'Featured',
      value: data.featured ? 'Yes' : 'No',
      type: 'boolean',
      rawValue: data.featured,
    },
    {
      key: 'archived',
      label: 'Archived',
      value: data.archived ? 'Yes' : 'No',
      type: 'boolean',
      rawValue: data.archived,
    },
  ];

  return (
    <div className="max-w-md p-6">
      <h2 className="mb-4 text-sm font-semibold text-fg-secondary">Boolean toggles immediately</h2>
      <PropertyList
        items={items}
        editable
        onPropertyChange={(key, value) => {
          setData((prev) => ({ ...prev, [key]: value }));
        }}
      />
    </div>
  );
};

// ============================================================================
// Editable: Select
// ============================================================================

export const EditableSelect: Story = () => {
  const [data, setData] = React.useState({
    status: 'draft',
    priority: 'medium',
    category: '',
  });

  const items: PropertyListItem[] = [
    {
      key: 'status',
      label: 'Status',
      value: (
        <Badge intent={data.status === 'published' ? 'success' : 'neutral'}>{data.status}</Badge>
      ),
      type: 'select',
      rawValue: data.status,
      options: ['draft', 'review', 'published'],
    },
    {
      key: 'priority',
      label: 'Priority',
      value: (
        <Badge intent={data.priority === 'high' ? 'warning' : 'neutral'}>{data.priority}</Badge>
      ),
      type: 'select',
      rawValue: data.priority,
      options: ['low', 'medium', 'high'],
    },
    {
      key: 'category',
      label: 'Category',
      value: data.category || <span className="text-fg-tertiary italic">Uncategorized</span>,
      type: 'select',
      rawValue: data.category,
      options: ['work', 'personal', 'ideas'],
      placeholder: 'Select category...',
    },
  ];

  return (
    <div className="max-w-md p-6">
      <PropertyList
        items={items}
        editable
        onPropertyChange={(key, value) => {
          setData((prev) => ({ ...prev, [key]: value }));
        }}
      />
    </div>
  );
};

// ============================================================================
// Editable: Multiselect
// ============================================================================

export const EditableMultiselect: Story = () => {
  const [data, setData] = React.useState({
    tags: ['react', 'typescript'],
    assignees: [],
  });

  const items: PropertyListItem[] = [
    {
      key: 'tags',
      label: 'Tags',
      value:
        data.tags.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {data.tags.map((tag) => (
              <Badge key={tag} intent="neutral">
                {tag}
              </Badge>
            ))}
          </div>
        ) : (
          <span className="text-fg-tertiary italic">No tags</span>
        ),
      type: 'multiselect',
      rawValue: data.tags,
      options: ['react', 'typescript', 'electron', 'node', 'css'],
    },
    {
      key: 'assignees',
      label: 'Assignees',
      value:
        data.assignees.length > 0 ? (
          data.assignees.join(', ')
        ) : (
          <span className="text-fg-tertiary italic">Unassigned</span>
        ),
      type: 'multiselect',
      rawValue: data.assignees,
      options: ['Alice', 'Bob', 'Carol', 'Dave'],
      placeholder: 'Assign people...',
    },
  ];

  return (
    <div className="max-w-md p-6">
      <PropertyList
        items={items}
        editable
        onPropertyChange={(key, value) => {
          setData((prev) => ({ ...prev, [key]: value }));
        }}
      />
    </div>
  );
};

// ============================================================================
// Editable: Date
// ============================================================================

export const EditableDate: Story = () => {
  const [data, setData] = React.useState({
    dueDate: new Date('2024-06-15'),
    startDate: null as Date | null,
  });

  const formatDate = (date: Date | null) =>
    date
      ? date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      : null;

  const items: PropertyListItem[] = [
    {
      key: 'dueDate',
      label: 'Due Date',
      value: formatDate(data.dueDate) ?? <span className="text-fg-tertiary italic">No date</span>,
      type: 'date',
      rawValue: data.dueDate,
    },
    {
      key: 'startDate',
      label: 'Start Date',
      value: formatDate(data.startDate) ?? <span className="text-fg-tertiary italic">Not set</span>,
      type: 'date',
      rawValue: data.startDate,
      placeholder: 'Pick a date...',
    },
  ];

  return (
    <div className="max-w-md p-6">
      <PropertyList
        items={items}
        editable
        onPropertyChange={(key, value) => {
          setData((prev) => ({ ...prev, [key]: value }));
        }}
      />
    </div>
  );
};

// ============================================================================
// Editable: All Types (Comprehensive Demo)
// ============================================================================

export const EditableAllTypes: Story = () => {
  const [data, setData] = React.useState({
    title: 'My Project',
    count: 7,
    active: true,
    status: 'in-progress',
    tags: ['urgent', 'frontend'],
    dueDate: new Date('2024-12-01'),
  });

  const formatDate = (date: Date | null) =>
    date
      ? date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      : null;

  const items: PropertyListItem[] = [
    { key: 'title', label: 'Title', value: data.title, type: 'text', rawValue: data.title },
    {
      key: 'count',
      label: 'Count',
      value: String(data.count),
      type: 'number',
      rawValue: data.count,
    },
    {
      key: 'active',
      label: 'Active',
      value: data.active ? 'Yes' : 'No',
      type: 'boolean',
      rawValue: data.active,
    },
    {
      key: 'status',
      label: 'Status',
      value: <Badge intent="info">{data.status}</Badge>,
      type: 'select',
      rawValue: data.status,
      options: ['pending', 'in-progress', 'completed'],
    },
    {
      key: 'tags',
      label: 'Tags',
      value: (
        <div className="flex flex-wrap gap-1">
          {data.tags.map((tag) => (
            <Badge key={tag} intent="neutral">
              {tag}
            </Badge>
          ))}
        </div>
      ),
      type: 'multiselect',
      rawValue: data.tags,
      options: ['urgent', 'frontend', 'backend', 'design', 'research'],
    },
    {
      key: 'dueDate',
      label: 'Due Date',
      value: formatDate(data.dueDate),
      type: 'date',
      rawValue: data.dueDate,
    },
  ];

  return (
    <div className="max-w-md p-6">
      <h2 className="mb-4 text-base font-semibold">All Editable Types</h2>
      <PropertyList
        items={items}
        editable
        onPropertyChange={(key, value) => {
          setData((prev) => ({ ...prev, [key]: value }));
        }}
      />
      <div className="mt-4 rounded bg-surface-secondary p-3">
        <p className="text-xs font-medium text-fg-secondary">Live data:</p>
        <pre className="mt-1 text-xs text-fg-tertiary">{JSON.stringify(data, null, 2)}</pre>
      </div>
    </div>
  );
};

// ============================================================================
// Editable: With Disabled Items
// ============================================================================

export const EditableWithDisabled: Story = () => {
  const [data, setData] = React.useState({
    title: 'Editable',
    id: 'doc_abc123',
    created: 'Jan 15, 2024',
  });

  const items: PropertyListItem[] = [
    { key: 'title', label: 'Title', value: data.title, type: 'text', rawValue: data.title },
    {
      key: 'id',
      label: 'ID',
      value: <code className="text-xs">{data.id}</code>,
      type: 'text',
      rawValue: data.id,
      disabled: true,
    },
    {
      key: 'created',
      label: 'Created',
      value: data.created,
      type: 'text',
      rawValue: data.created,
      disabled: true,
    },
  ];

  return (
    <div className="max-w-md p-6">
      <h2 className="mb-4 text-sm font-semibold text-fg-secondary">ID and Created are disabled</h2>
      <PropertyList
        items={items}
        editable
        onPropertyChange={(key, value) => {
          setData((prev) => ({ ...prev, [key]: value }));
        }}
      />
    </div>
  );
};

// ============================================================================
// Editable vs Read-Only Comparison
// ============================================================================

export const EditableVsReadOnly: Story = () => {
  const [data, setData] = React.useState({ name: 'John Doe', email: 'john@example.com' });

  const items: PropertyListItem[] = [
    { key: 'name', label: 'Name', value: data.name, type: 'text', rawValue: data.name },
    { key: 'email', label: 'Email', value: data.email, type: 'text', rawValue: data.email },
  ];

  return (
    <div className="flex gap-8 p-6">
      <div className="flex-1">
        <h3 className="mb-4 text-sm font-semibold text-fg-secondary">Read-Only</h3>
        <PropertyList items={items} />
      </div>
      <div className="flex-1">
        <h3 className="mb-4 text-sm font-semibold text-fg-secondary">Editable (click values)</h3>
        <PropertyList
          items={items}
          editable
          onPropertyChange={(key, value) => {
            setData((prev) => ({ ...prev, [key]: value }));
          }}
        />
      </div>
    </div>
  );
};
