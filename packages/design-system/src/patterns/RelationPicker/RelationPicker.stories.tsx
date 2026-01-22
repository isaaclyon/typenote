import * as React from 'react';
import type { Story } from '@ladle/react';
import { File } from '@phosphor-icons/react/dist/ssr/File';
import { User } from '@phosphor-icons/react/dist/ssr/User';
import { CalendarBlank } from '@phosphor-icons/react/dist/ssr/CalendarBlank';

import { RelationPicker, type RelationOption } from './RelationPicker.js';
import { Button } from '../../primitives/Button/Button.js';
import { DismissibleTag } from '../DismissibleTag/DismissibleTag.js';

export default {
  title: 'Patterns/RelationPicker',
};

const mockOptions: RelationOption[] = [
  { id: '1', title: 'Project Roadmap', typeKey: 'Page', typeName: 'Page', icon: File },
  { id: '2', title: 'Meeting Notes', typeKey: 'Page', typeName: 'Page', icon: File },
  { id: '3', title: 'John Smith', typeKey: 'Person', typeName: 'Person', icon: User },
  { id: '4', title: 'Jane Doe', typeKey: 'Person', typeName: 'Person', icon: User },
  { id: '5', title: 'Team Standup', typeKey: 'Event', typeName: 'Event', icon: CalendarBlank },
];

export const SingleSelect: Story = () => {
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState<string>('');
  const [search, setSearch] = React.useState('');

  const filtered = mockOptions.filter((o) => o.title.toLowerCase().includes(search.toLowerCase()));
  const selected = mockOptions.find((o) => o.id === value);

  return (
    <div className="p-6">
      <RelationPicker
        open={open}
        onOpenChange={setOpen}
        value={value}
        onChange={(v) => setValue(v as string)}
        options={filtered}
        searchQuery={search}
        onSearchChange={setSearch}
        placeholder="Search objects..."
      >
        <Button variant="outline">{selected ? selected.title : 'Select object...'}</Button>
      </RelationPicker>
    </div>
  );
};

export const MultiSelect: Story = () => {
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState<string[]>([]);
  const [search, setSearch] = React.useState('');

  const filtered = mockOptions.filter((o) => o.title.toLowerCase().includes(search.toLowerCase()));
  const selectedOptions = mockOptions.filter((o) => value.includes(o.id));

  const removeOption = (id: string) => {
    setValue((prev) => prev.filter((v) => v !== id));
  };

  return (
    <div className="space-y-4 p-6">
      <div className="flex flex-wrap gap-2">
        {selectedOptions.map((opt) => (
          <DismissibleTag key={opt.id} label={opt.title} onRemove={() => removeOption(opt.id)} />
        ))}
        <RelationPicker
          open={open}
          onOpenChange={setOpen}
          value={value}
          onChange={(v) => setValue(v as string[])}
          multiple
          options={filtered}
          searchQuery={search}
          onSearchChange={setSearch}
          placeholder="Search objects..."
        >
          <Button variant="outline" size="sm">
            + Add
          </Button>
        </RelationPicker>
      </div>
    </div>
  );
};

export const WithCreate: Story = () => {
  const [open, setOpen] = React.useState(false);
  const [options, setOptions] = React.useState(mockOptions);
  const [value, setValue] = React.useState<string>('');
  const [search, setSearch] = React.useState('');

  const filtered = options.filter((o) => o.title.toLowerCase().includes(search.toLowerCase()));

  const handleCreate = (title: string) => {
    const newOption: RelationOption = {
      id: String(Date.now()),
      title,
      typeKey: 'Page',
      typeName: 'Page',
      icon: File,
    };
    setOptions((prev) => [...prev, newOption]);
    setValue(newOption.id);
    setSearch('');
  };

  const selected = options.find((o) => o.id === value);

  return (
    <div className="p-6">
      <RelationPicker
        open={open}
        onOpenChange={setOpen}
        value={value}
        onChange={(v) => setValue(v as string)}
        options={filtered}
        searchQuery={search}
        onSearchChange={setSearch}
        onCreate={handleCreate}
        placeholder="Search or create..."
      >
        <Button variant="outline">{selected ? selected.title : 'Select or create...'}</Button>
      </RelationPicker>
    </div>
  );
};

export const Loading: Story = () => {
  const [open, setOpen] = React.useState(true);

  return (
    <div className="p-6">
      <RelationPicker
        open={open}
        onOpenChange={setOpen}
        options={[]}
        loading
        placeholder="Loading..."
      >
        <Button variant="outline">Loading state</Button>
      </RelationPicker>
    </div>
  );
};

export const Empty: Story = () => {
  const [open, setOpen] = React.useState(true);

  return (
    <div className="p-6">
      <RelationPicker
        open={open}
        onOpenChange={setOpen}
        options={[]}
        searchQuery="xyz"
        placeholder="No results"
      >
        <Button variant="outline">Empty state</Button>
      </RelationPicker>
    </div>
  );
};
