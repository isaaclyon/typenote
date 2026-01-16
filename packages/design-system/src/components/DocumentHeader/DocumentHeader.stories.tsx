import * as React from 'react';
import type { Story } from '@ladle/react';
import { DocumentHeader } from './DocumentHeader.js';
import { EditableTitle } from './EditableTitle.js';

export default {
  title: 'Components/DocumentHeader',
};

/**
 * Default - Page with editable title
 */
export const Default: Story = () => {
  const [title, setTitle] = React.useState('My Document Title');

  return (
    <div className="p-6 max-w-2xl">
      <DocumentHeader title={title} typeLabel="Page" onTitleChange={setTitle} />
      <div className="prose prose-sm">
        <p>This is the document content below the header. Click the title to edit it.</p>
      </div>
    </div>
  );
};

/**
 * Daily Note - Immutable date header
 */
export const DailyNote: Story = () => (
  <div className="p-6 max-w-2xl">
    <DocumentHeader title="" typeLabel="Thursday" dailyNoteDateKey="2026-01-16" />
    <div className="prose prose-sm">
      <h2>Priorities for today</h2>
      <ul>
        <li>Review pull requests</li>
        <li>Write documentation</li>
        <li>Team standup at 10am</li>
      </ul>
    </div>
  </div>
);

/**
 * Different object types
 */
export const DifferentTypes: Story = () => {
  const [titles, setTitles] = React.useState({
    page: 'Meeting Notes - Q1 Planning',
    task: 'Fix authentication bug',
    person: 'John Smith',
    project: 'Website Redesign 2026',
  });

  return (
    <div className="p-6 space-y-12 max-w-2xl">
      <div>
        <DocumentHeader
          title={titles.page}
          typeLabel="Page"
          onTitleChange={(t) => setTitles((prev) => ({ ...prev, page: t }))}
        />
        <p className="text-sm text-gray-500">Regular page with editable title</p>
      </div>

      <div>
        <DocumentHeader
          title={titles.task}
          typeLabel="Task"
          onTitleChange={(t) => setTitles((prev) => ({ ...prev, task: t }))}
        />
        <p className="text-sm text-gray-500">Task item with editable title</p>
      </div>

      <div>
        <DocumentHeader
          title={titles.person}
          typeLabel="Person"
          onTitleChange={(t) => setTitles((prev) => ({ ...prev, person: t }))}
        />
        <p className="text-sm text-gray-500">Person record with editable name</p>
      </div>

      <div>
        <DocumentHeader
          title={titles.project}
          typeLabel="Project"
          onTitleChange={(t) => setTitles((prev) => ({ ...prev, project: t }))}
        />
        <p className="text-sm text-gray-500">Project with editable title</p>
      </div>
    </div>
  );
};

/**
 * Long title - Shows truncation behavior
 */
export const LongTitle: Story = () => {
  const [title, setTitle] = React.useState(
    'This is a very long document title that might need to wrap or truncate depending on the container width'
  );

  return (
    <div className="p-6 max-w-2xl">
      <DocumentHeader title={title} typeLabel="Page" onTitleChange={setTitle} />
      <p className="text-sm text-gray-500 mt-4">
        Long titles wrap naturally. Click to edit and see how the input handles long text.
      </p>
    </div>
  );
};

/**
 * Empty title - Shows placeholder
 */
export const EmptyTitle: Story = () => {
  const [title, setTitle] = React.useState('');

  return (
    <div className="p-6 max-w-2xl">
      <DocumentHeader title={title} typeLabel="Page" onTitleChange={setTitle} />
      <p className="text-sm text-gray-500 mt-4">
        Empty titles show "Untitled" placeholder. Click to add a title.
      </p>
    </div>
  );
};

/**
 * Read-only mode (no onTitleChange)
 */
export const ReadOnly: Story = () => (
  <div className="p-6 max-w-2xl">
    <DocumentHeader title="Read-only Document" typeLabel="Page" />
    <p className="text-sm text-gray-500 mt-4">
      When no onTitleChange is provided, the title is read-only and not clickable.
    </p>
  </div>
);

/**
 * EditableTitle component in isolation
 */
export const EditableTitleIsolated: Story = () => {
  const [title, setTitle] = React.useState('Click me to edit');

  return (
    <div className="p-6 max-w-2xl space-y-8">
      <div>
        <p className="text-sm text-gray-500 mb-2">Editable (click to edit):</p>
        <EditableTitle value={title} onChange={setTitle} />
      </div>

      <div>
        <p className="text-sm text-gray-500 mb-2">Disabled (immutable):</p>
        <EditableTitle value="This cannot be edited" onChange={() => {}} disabled />
      </div>

      <div>
        <p className="text-sm text-gray-500 mb-2">Empty with placeholder:</p>
        <EditableTitle value="" onChange={setTitle} placeholder="Type something..." />
      </div>
    </div>
  );
};

/**
 * Interactive demo - full editing workflow
 */
export const InteractiveDemo: Story = () => {
  const [title, setTitle] = React.useState('Click this title to edit');
  const [history, setHistory] = React.useState<string[]>([]);

  const handleChange = (newTitle: string) => {
    setHistory((prev) => [...prev, `"${title}" → "${newTitle}"`]);
    setTitle(newTitle);
  };

  return (
    <div className="p-6 max-w-2xl">
      <DocumentHeader title={title} typeLabel="Page" onTitleChange={handleChange} />

      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <p className="text-sm font-medium text-gray-700 mb-2">Instructions:</p>
        <ol className="text-sm text-gray-600 list-decimal list-inside space-y-1">
          <li>Click the title to enter edit mode</li>
          <li>Type a new title</li>
          <li>Press Enter or click outside to save</li>
          <li>Press Escape to cancel</li>
        </ol>
      </div>

      {history.length > 0 && (
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm font-medium text-blue-700 mb-2">Edit history:</p>
          <ul className="text-sm text-blue-600 space-y-1">
            {history.map((h, i) => (
              <li key={i}>{h}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

/**
 * Daily Notes for different dates
 */
export const DailyNoteDates: Story = () => (
  <div className="p-6 space-y-8 max-w-2xl">
    <DocumentHeader title="" typeLabel="Wednesday" dailyNoteDateKey="2026-01-15" />
    <DocumentHeader title="" typeLabel="Thursday" dailyNoteDateKey="2026-01-16" />
    <DocumentHeader title="" typeLabel="Friday" dailyNoteDateKey="2026-01-17" />
    <DocumentHeader title="" typeLabel="Saturday" dailyNoteDateKey="2026-07-04" />
    <DocumentHeader title="" typeLabel="Thursday" dailyNoteDateKey="2026-12-25" />
  </div>
);
