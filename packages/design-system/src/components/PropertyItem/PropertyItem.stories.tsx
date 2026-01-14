import type { Story } from '@ladle/react';
import { useState } from 'react';
import { PropertyItem } from './PropertyItem.js';

export default {
  title: 'Components/PropertyItem',
};

export const EmptyStates: Story = () => {
  return (
    <div className="flex flex-col gap-4 w-96">
      <section>
        <h2 className="text-lg font-semibold mb-4">Empty Values</h2>
        <div className="space-y-2">
          <PropertyItem
            label="Author"
            type="text"
            placeholder="Add author"
            onSave={(val) => alert(`Saved: ${val}`)}
          />
          <PropertyItem label="Pages" type="number" onSave={(val) => alert(`Saved: ${val}`)} />
          <PropertyItem label="Published" type="date" onSave={(val) => alert(`Saved: ${val}`)} />
          <PropertyItem
            label="Status"
            type="select"
            options={['Draft', 'Published', 'Archived']}
            onSave={(val) => alert(`Saved: ${val}`)}
          />
        </div>
        <p className="text-xs text-gray-500 mt-4">Click to edit • Shows placeholder when empty</p>
      </section>
    </div>
  );
};

export const TextProperty: Story = () => {
  const [value, setValue] = useState('');

  return (
    <div className="w-96">
      <PropertyItem
        label="Title"
        value={value}
        type="text"
        placeholder="Enter title"
        onSave={(val) => setValue(val as string)}
      />
      <p className="text-xs text-gray-500 mt-2">Click to edit • Enter to save • Escape to cancel</p>
    </div>
  );
};

export const NumberProperty: Story = () => {
  const [value, setValue] = useState<number | undefined>(42);

  return (
    <div className="w-96">
      <PropertyItem
        label="Count"
        value={value}
        type="number"
        onSave={(val) => setValue(val as number)}
      />
      <p className="text-xs text-gray-500 mt-2">Current value: {value ?? 'empty'}</p>
    </div>
  );
};

export const SelectProperty: Story = () => {
  const [value, setValue] = useState('In Progress');

  return (
    <div className="w-96">
      <PropertyItem
        label="Status"
        value={value}
        type="select"
        options={['Not Started', 'In Progress', 'Completed', 'Blocked']}
        onSave={(val) => setValue(val as string)}
      />
      <p className="text-xs text-gray-500 mt-2">Current: {value}</p>
    </div>
  );
};

export const DateProperty: Story = () => {
  const [value, setValue] = useState('2026-01-10');

  return (
    <div className="w-96">
      <PropertyItem
        label="Due Date"
        value={value}
        type="date"
        onSave={(val) => setValue(val as string)}
      />
      <p className="text-xs text-gray-500 mt-2">Current: {value}</p>
    </div>
  );
};

export const WithError: Story = () => {
  return (
    <div className="w-96 space-y-2">
      <PropertyItem
        label="Email"
        value="invalid-email"
        type="text"
        error="Invalid email format"
        onSave={(val) => alert(`Saved: ${val}`)}
      />
      <p className="text-xs text-gray-500">Validation errors show below input</p>
    </div>
  );
};

export const BookExample: Story = () => {
  const [author, setAuthor] = useState('Isaac Asimov');
  const [title, setTitle] = useState('Foundation');
  const [pages, setPages] = useState(255);
  const [published, setPublished] = useState('1951-05-01');
  const [status, setStatus] = useState('Read');
  const [rating, setRating] = useState<number | undefined>(5);

  return (
    <div className="w-96 p-4 border border-gray-200 rounded-md">
      <h3 className="text-sm font-medium text-gray-900 mb-4">Book Properties</h3>
      <div className="space-y-3">
        <PropertyItem
          label="Title"
          value={title}
          type="text"
          onSave={(val) => setTitle(val as string)}
        />
        <PropertyItem
          label="Author"
          value={author}
          type="text"
          onSave={(val) => setAuthor(val as string)}
        />
        <PropertyItem
          label="Pages"
          value={pages}
          type="number"
          onSave={(val) => setPages(val as number)}
        />
        <PropertyItem
          label="Published"
          value={published}
          type="date"
          onSave={(val) => setPublished(val as string)}
        />
        <PropertyItem
          label="Status"
          value={status}
          type="select"
          options={['Want to Read', 'Reading', 'Read', 'Abandoned']}
          onSave={(val) => setStatus(val as string)}
        />
        <PropertyItem
          label="Rating"
          value={rating}
          type="number"
          placeholder="Not rated"
          onSave={(val) => setRating(val as number)}
        />
      </div>
    </div>
  );
};

export const BooleanProperty: Story = () => {
  const [completed, setCompleted] = useState(false);
  const [featured, setFeatured] = useState(true);
  const [archived, setArchived] = useState(false);

  return (
    <div className="w-96 space-y-3">
      <h2 className="text-lg font-semibold mb-4">Boolean Properties</h2>
      <PropertyItem
        label="Completed"
        value={completed}
        type="boolean"
        onSave={(val) => setCompleted(val as boolean)}
      />
      <PropertyItem
        label="Featured"
        value={featured}
        type="boolean"
        onSave={(val) => setFeatured(val as boolean)}
      />
      <PropertyItem
        label="Archived"
        value={archived}
        type="boolean"
        onSave={(val) => setArchived(val as boolean)}
      />
      <p className="text-xs text-gray-500 mt-4">Click checkbox to toggle • Saves immediately</p>
    </div>
  );
};

export const DateTimeProperty: Story = () => {
  const [meetingTime, setMeetingTime] = useState('2026-01-15T14:30');
  const [dueDate, setDueDate] = useState('2026-01-20T09:00');

  return (
    <div className="w-96 space-y-3">
      <h2 className="text-lg font-semibold mb-4">DateTime Properties</h2>
      <PropertyItem
        label="Meeting"
        value={meetingTime}
        type="datetime"
        onSave={(val) => setMeetingTime(val as string)}
      />
      <PropertyItem
        label="Due"
        value={dueDate}
        type="datetime"
        onSave={(val) => setDueDate(val as string)}
      />
      <p className="text-xs text-gray-500 mt-4">
        Click to edit • Separate date and time inputs • Blur to save
      </p>
    </div>
  );
};

export const MultiSelectProperty: Story = () => {
  const [tags, setTags] = useState<string[]>(['Fiction', 'Classic']);
  const [categories, setCategories] = useState<string[]>([]);

  return (
    <div className="w-96 space-y-3">
      <h2 className="text-lg font-semibold mb-4">Multi-Select Properties</h2>
      <PropertyItem
        label="Genres"
        value={tags}
        type="multiselect"
        options={['Fiction', 'Non-Fiction', 'Classic', 'Modern', 'Science Fiction', 'Fantasy']}
        onSave={(val) => setTags(val as string[])}
      />
      <PropertyItem
        label="Categories"
        value={categories}
        type="multiselect"
        options={['Work', 'Personal', 'Urgent', 'Reference', 'Archive']}
        placeholder="None selected"
        onSave={(val) => setCategories(val as string[])}
      />
      <p className="text-xs text-gray-500 mt-4">
        Current genres: {tags.length > 0 ? tags.join(', ') : 'none'}
        <br />
        Current categories: {categories.length > 0 ? categories.join(', ') : 'none'}
      </p>
    </div>
  );
};

export const RefProperty: Story = () => {
  const [authorRef, setAuthorRef] = useState<string | undefined>('author-001');

  // Mock data
  const mockAuthors = [
    { id: 'author-001', title: 'Isaac Asimov' },
    { id: 'author-002', title: 'Arthur C. Clarke' },
    { id: 'author-003', title: 'Philip K. Dick' },
    { id: 'author-004', title: 'Ursula K. Le Guin' },
  ];

  // Mock search function
  const handleSearch = async (query: string) => {
    await new Promise((resolve) => setTimeout(resolve, 100));
    return mockAuthors.filter((a) => a.title.toLowerCase().includes(query.toLowerCase()));
  };

  // Mock resolve function - converts IDs to titles for display
  const handleResolve = async (ids: string[]) => {
    await new Promise((resolve) => setTimeout(resolve, 50));
    return mockAuthors.filter((a) => ids.includes(a.id));
  };

  return (
    <div className="w-96 space-y-3">
      <h2 className="text-lg font-semibold mb-4">Object Reference Property</h2>
      <PropertyItem
        label="Author"
        value={authorRef}
        type="ref"
        onSave={(val) => setAuthorRef(val as string)}
        onSearch={handleSearch}
        resolveRefs={handleResolve}
      />
      <p className="text-xs text-gray-500 mt-4">
        Click to search • Type to filter results • Select from dropdown
        <br />
        Current value (ID): {authorRef ?? 'none'}
        <br />
        <strong>Note:</strong> Shows "Isaac Asimov" not "author-001" thanks to resolveRefs
      </p>
    </div>
  );
};

export const RefsProperty: Story = () => {
  const [relatedRefs, setRelatedRefs] = useState<string[]>(['doc-001', 'doc-003']);

  // Mock data
  const mockDocs = [
    { id: 'doc-001', title: 'Design System Architecture' },
    { id: 'doc-002', title: 'Component Guidelines' },
    { id: 'doc-003', title: 'TypeScript Patterns' },
    { id: 'doc-004', title: 'Testing Strategy' },
    { id: 'doc-005', title: 'Performance Optimization' },
  ];

  // Mock search function
  const handleSearch = async (query: string) => {
    await new Promise((resolve) => setTimeout(resolve, 100));
    return mockDocs.filter((d) => d.title.toLowerCase().includes(query.toLowerCase()));
  };

  // Mock resolve function - converts IDs to titles for display
  const handleResolve = async (ids: string[]) => {
    await new Promise((resolve) => setTimeout(resolve, 50));
    return mockDocs.filter((d) => ids.includes(d.id));
  };

  return (
    <div className="w-96 space-y-3">
      <h2 className="text-lg font-semibold mb-4">Multiple References Property</h2>
      <PropertyItem
        label="Related"
        value={relatedRefs}
        type="refs"
        onSave={(val) => setRelatedRefs(val as string[])}
        onSearch={handleSearch}
        resolveRefs={handleResolve}
      />
      <p className="text-xs text-gray-500 mt-4">
        Click to search • Add multiple • X to remove
        <br />
        Current refs (IDs): {relatedRefs.length > 0 ? relatedRefs.join(', ') : 'none'}
        <br />
        <strong>Note:</strong> Shows titles like "Design System Architecture" instead of IDs
      </p>
    </div>
  );
};

export const AllPropertyTypes: Story = () => {
  const [text, setText] = useState('Sample text');
  const [number, setNumber] = useState(42);
  const [bool, setBool] = useState(true);
  const [date, setDate] = useState('2026-01-15');
  const [datetime, setDatetime] = useState('2026-01-15T14:30');
  const [select, setSelect] = useState('Option B');
  const [multiselect, setMultiselect] = useState<string[]>(['Tag 1', 'Tag 3']);
  const [ref, setRef] = useState('ref-001');
  const [refs, setRefs] = useState<string[]>(['ref-001', 'ref-002']);

  const mockItems = [
    { id: 'ref-001', title: 'Item One' },
    { id: 'ref-002', title: 'Item Two' },
    { id: 'ref-003', title: 'Item Three' },
  ];

  const mockSearch = async (query: string) => {
    await new Promise((resolve) => setTimeout(resolve, 100));
    return mockItems.filter((item) => item.title.toLowerCase().includes(query.toLowerCase()));
  };

  const mockResolve = async (ids: string[]) => {
    await new Promise((resolve) => setTimeout(resolve, 50));
    return mockItems.filter((item) => ids.includes(item.id));
  };

  return (
    <div className="w-[600px] p-4 border border-gray-200 rounded-md">
      <h3 className="text-sm font-medium text-gray-900 mb-4">All 8 Property Types</h3>
      <div className="space-y-3">
        <PropertyItem
          label="Text"
          value={text}
          type="text"
          onSave={(val) => setText(val as string)}
        />
        <PropertyItem
          label="Number"
          value={number}
          type="number"
          onSave={(val) => setNumber(val as number)}
        />
        <PropertyItem
          label="Boolean"
          value={bool}
          type="boolean"
          onSave={(val) => setBool(val as boolean)}
        />
        <PropertyItem
          label="Date"
          value={date}
          type="date"
          onSave={(val) => setDate(val as string)}
        />
        <PropertyItem
          label="DateTime"
          value={datetime}
          type="datetime"
          onSave={(val) => setDatetime(val as string)}
        />
        <PropertyItem
          label="Select"
          value={select}
          type="select"
          options={['Option A', 'Option B', 'Option C']}
          onSave={(val) => setSelect(val as string)}
        />
        <PropertyItem
          label="Multi"
          value={multiselect}
          type="multiselect"
          options={['Tag 1', 'Tag 2', 'Tag 3', 'Tag 4']}
          onSave={(val) => setMultiselect(val as string[])}
        />
        <PropertyItem
          label="Ref"
          value={ref}
          type="ref"
          onSave={(val) => setRef(val as string)}
          onSearch={mockSearch}
          resolveRefs={mockResolve}
        />
        <PropertyItem
          label="Refs"
          value={refs}
          type="refs"
          onSave={(val) => setRefs(val as string[])}
          onSearch={mockSearch}
          resolveRefs={mockResolve}
        />
      </div>
    </div>
  );
};

export const TaskExample: Story = () => {
  const [title, setTitle] = useState('Implement property inputs');
  const [completed, setCompleted] = useState(false);
  const [priority, setPriority] = useState('High');
  const [dueDate, setDueDate] = useState('2026-01-20T17:00');
  const [tags, setTags] = useState<string[]>(['frontend', 'design-system']);
  const [assignee, setAssignee] = useState('user-001');

  const mockUsers = [
    { id: 'user-001', title: 'Isaac Lyon' },
    { id: 'user-002', title: 'Jane Smith' },
    { id: 'user-003', title: 'Bob Johnson' },
  ];

  const mockUserSearch = async (query: string) => {
    await new Promise((resolve) => setTimeout(resolve, 100));
    return mockUsers.filter((u) => u.title.toLowerCase().includes(query.toLowerCase()));
  };

  const mockUserResolve = async (ids: string[]) => {
    await new Promise((resolve) => setTimeout(resolve, 50));
    return mockUsers.filter((u) => ids.includes(u.id));
  };

  return (
    <div className="w-[600px] p-4 border border-gray-200 rounded-md">
      <h3 className="text-sm font-medium text-gray-900 mb-4">Task Properties</h3>
      <div className="space-y-3">
        <PropertyItem
          label="Title"
          value={title}
          type="text"
          onSave={(val) => setTitle(val as string)}
        />
        <PropertyItem
          label="Done"
          value={completed}
          type="boolean"
          onSave={(val) => setCompleted(val as boolean)}
        />
        <PropertyItem
          label="Priority"
          value={priority}
          type="select"
          options={['Low', 'Medium', 'High', 'Critical']}
          onSave={(val) => setPriority(val as string)}
        />
        <PropertyItem
          label="Due"
          value={dueDate}
          type="datetime"
          onSave={(val) => setDueDate(val as string)}
        />
        <PropertyItem
          label="Tags"
          value={tags}
          type="multiselect"
          options={['frontend', 'backend', 'design-system', 'bug', 'feature', 'docs']}
          onSave={(val) => setTags(val as string[])}
        />
        <PropertyItem
          label="Assignee"
          value={assignee}
          type="ref"
          onSave={(val) => setAssignee(val as string)}
          onSearch={mockUserSearch}
          resolveRefs={mockUserResolve}
        />
      </div>
    </div>
  );
};
