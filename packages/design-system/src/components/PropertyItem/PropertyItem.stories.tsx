import type { Story } from '@ladle/react';
import { useState } from 'react';
import { PropertyItem } from './PropertyItem.js';

export default {
  title: 'Components/PropertyItem',
};

export const AllTypes: Story = () => {
  const [textValue, setTextValue] = useState('Isaac Asimov');
  const [numberValue, setNumberValue] = useState(255);
  const [dateValue, setDateValue] = useState('1951-10-21');
  const [selectValue, setSelectValue] = useState('Read');

  return (
    <div className="flex flex-col gap-4 w-96">
      <section>
        <h2 className="text-lg font-semibold mb-4">All Property Types</h2>
        <div className="space-y-2">
          <PropertyItem
            label="Author"
            value={textValue}
            type="text"
            onSave={(val) => setTextValue(val as string)}
          />
          <PropertyItem
            label="Pages"
            value={numberValue}
            type="number"
            onSave={(val) => setNumberValue(val as number)}
          />
          <PropertyItem
            label="Published"
            value={dateValue}
            type="date"
            onSave={(val) => setDateValue(val as string)}
          />
          <PropertyItem
            label="Status"
            value={selectValue}
            type="select"
            options={['Not Started', 'Reading', 'Read', 'Abandoned']}
            onSave={(val) => setSelectValue(val as string)}
          />
        </div>
      </section>
    </div>
  );
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
