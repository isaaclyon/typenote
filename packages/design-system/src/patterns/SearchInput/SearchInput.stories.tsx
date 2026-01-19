import * as React from 'react';
import type { Story } from '@ladle/react';
import { SearchInput } from './SearchInput.js';

export const Overview: Story = () => {
  const [value, setValue] = React.useState('Project notes');
  const [emptyValue, setEmptyValue] = React.useState('');

  return (
    <div className="space-y-10 p-6">
      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-gray-600">Default</h2>
        <div className="space-y-3">
          <SearchInput
            placeholder="Search notes"
            value={emptyValue}
            onChange={(event) => setEmptyValue(event.target.value)}
            onClear={() => setEmptyValue('')}
          />
          <SearchInput
            placeholder="Search notes"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            onClear={() => setValue('')}
          />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-gray-600">Sizes</h2>
        <div className="space-y-3">
          <SearchInput
            size="sm"
            placeholder="Search"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            onClear={() => setValue('')}
          />
          <SearchInput
            size="md"
            placeholder="Search"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            onClear={() => setValue('')}
          />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-gray-600">Disabled</h2>
        <SearchInput placeholder="Search notes" value="Disabled" disabled />
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-gray-600">Long Placeholder</h2>
        <SearchInput
          placeholder="Search notes, projects, people, and tagged documents"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onClear={() => setValue('')}
        />
      </section>
    </div>
  );
};
