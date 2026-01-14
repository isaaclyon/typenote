import type { Story } from '@ladle/react';
import { useState } from 'react';
import { MultiselectDropdown, type MultiselectOption } from './MultiselectDropdown.js';

export default {
  title: 'Components/MultiselectDropdown',
};

const genreOptions = [
  { value: 'fiction', label: 'Fiction' },
  { value: 'non-fiction', label: 'Non-Fiction' },
  { value: 'classic', label: 'Classic' },
  { value: 'modern', label: 'Modern' },
  { value: 'sci-fi', label: 'Science Fiction' },
  { value: 'fantasy', label: 'Fantasy' },
  { value: 'mystery', label: 'Mystery' },
  { value: 'romance', label: 'Romance' },
];

const tagOptions = [
  { value: 'frontend', label: 'Frontend' },
  { value: 'backend', label: 'Backend' },
  { value: 'design-system', label: 'Design System' },
  { value: 'bug', label: 'Bug' },
  { value: 'feature', label: 'Feature' },
  { value: 'docs', label: 'Documentation' },
  { value: 'testing', label: 'Testing' },
  { value: 'performance', label: 'Performance' },
];

export const Default: Story = () => {
  const [selected, setSelected] = useState<string[]>(['fiction', 'classic']);

  return (
    <div className="w-64">
      <MultiselectDropdown
        value={selected}
        onChange={setSelected}
        options={genreOptions}
        placeholder="Select genres..."
      />
      <p className="text-xs text-gray-500 mt-4">
        Selected: {selected.length > 0 ? selected.join(', ') : 'none'}
      </p>
    </div>
  );
};

export const Empty: Story = () => {
  const [selected, setSelected] = useState<string[]>([]);

  return (
    <div className="w-64">
      <MultiselectDropdown
        value={selected}
        onChange={setSelected}
        options={genreOptions}
        placeholder="Select genres..."
      />
      <p className="text-xs text-gray-500 mt-4">Click to open dropdown</p>
    </div>
  );
};

export const ManyOptions: Story = () => {
  const [selected, setSelected] = useState<string[]>(['frontend', 'design-system']);

  const manyOptions = [
    ...tagOptions,
    { value: 'api', label: 'API' },
    { value: 'database', label: 'Database' },
    { value: 'security', label: 'Security' },
    { value: 'deployment', label: 'Deployment' },
    { value: 'monitoring', label: 'Monitoring' },
    { value: 'logging', label: 'Logging' },
    { value: 'caching', label: 'Caching' },
    { value: 'auth', label: 'Authentication' },
  ];

  return (
    <div className="w-64">
      <MultiselectDropdown
        value={selected}
        onChange={setSelected}
        options={manyOptions}
        placeholder="Select tags..."
      />
      <p className="text-xs text-gray-500 mt-4">
        Scrollable list with {manyOptions.length} options
      </p>
    </div>
  );
};

export const WithSearch: Story = () => {
  const [selected, setSelected] = useState<string[]>([]);

  return (
    <div className="w-64">
      <h3 className="text-sm font-medium mb-2">Try searching "sci" or "fic"</h3>
      <MultiselectDropdown
        value={selected}
        onChange={setSelected}
        options={genreOptions}
        placeholder="Search and select..."
      />
      <p className="text-xs text-gray-500 mt-4">Type in the search box to filter options</p>
    </div>
  );
};

export const Disabled: Story = () => {
  return (
    <div className="w-64">
      <MultiselectDropdown
        value={['fiction']}
        onChange={() => {}}
        options={genreOptions}
        placeholder="Select genres..."
        disabled
      />
      <p className="text-xs text-gray-500 mt-4">Disabled state</p>
    </div>
  );
};

export const InForm: Story = () => {
  const [genres, setGenres] = useState<string[]>(['fiction']);
  const [tags, setTags] = useState<string[]>(['frontend', 'design-system']);

  return (
    <div className="w-80 p-4 border border-gray-200 rounded-md space-y-4">
      <h3 className="text-sm font-medium text-gray-900">Book Properties</h3>

      <div className="space-y-1">
        <label className="text-sm text-gray-600">Genres</label>
        <MultiselectDropdown
          value={genres}
          onChange={setGenres}
          options={genreOptions}
          placeholder="Select genres..."
        />
      </div>

      <div className="space-y-1">
        <label className="text-sm text-gray-600">Tags</label>
        <MultiselectDropdown
          value={tags}
          onChange={setTags}
          options={tagOptions}
          placeholder="Select tags..."
        />
      </div>

      <div className="pt-2 border-t border-gray-100 text-xs text-gray-500">
        <p>Genres: {genres.join(', ') || 'none'}</p>
        <p>Tags: {tags.join(', ') || 'none'}</p>
      </div>
    </div>
  );
};

export const AllStates: Story = () => {
  const [empty, setEmpty] = useState<string[]>([]);
  const [one, setOne] = useState<string[]>(['fiction']);
  const [many, setMany] = useState<string[]>(['fiction', 'classic', 'sci-fi', 'fantasy']);

  return (
    <div className="space-y-4 w-64">
      <div>
        <p className="text-xs text-gray-500 mb-1">Empty</p>
        <MultiselectDropdown
          value={empty}
          onChange={setEmpty}
          options={genreOptions}
          placeholder="Select..."
        />
      </div>

      <div>
        <p className="text-xs text-gray-500 mb-1">One selected</p>
        <MultiselectDropdown
          value={one}
          onChange={setOne}
          options={genreOptions}
          placeholder="Select..."
        />
      </div>

      <div>
        <p className="text-xs text-gray-500 mb-1">Many selected (shows count)</p>
        <MultiselectDropdown
          value={many}
          onChange={setMany}
          options={genreOptions}
          placeholder="Select..."
        />
      </div>

      <div>
        <p className="text-xs text-gray-500 mb-1">Disabled</p>
        <MultiselectDropdown
          value={['fiction']}
          onChange={() => {}}
          options={genreOptions}
          disabled
        />
      </div>
    </div>
  );
};

export const WithDragAndDrop: Story = () => {
  const [selected, setSelected] = useState<string[]>(['fiction', 'classic']);
  const [options, setOptions] = useState<MultiselectOption[]>([
    { value: 'fiction', label: 'Fiction' },
    { value: 'non-fiction', label: 'Non-Fiction' },
    { value: 'classic', label: 'Classic' },
    { value: 'modern', label: 'Modern' },
    { value: 'sci-fi', label: 'Science Fiction' },
    { value: 'fantasy', label: 'Fantasy' },
  ]);

  return (
    <div className="w-64">
      <h3 className="text-sm font-medium mb-2">Drag to reorder options</h3>
      <MultiselectDropdown
        value={selected}
        onChange={setSelected}
        options={options}
        onReorder={setOptions}
        placeholder="Select genres..."
      />
      <div className="mt-4 text-xs text-gray-500 space-y-1">
        <p>
          <strong>Order:</strong> {options.map((o) => o.label).join(' → ')}
        </p>
        <p>
          <strong>Selected:</strong> {selected.join(', ') || 'none'}
        </p>
        <p className="text-gray-400 mt-2">
          Drag the grip handle (⠿) to reorder. Drag is disabled while searching.
        </p>
      </div>
    </div>
  );
};
