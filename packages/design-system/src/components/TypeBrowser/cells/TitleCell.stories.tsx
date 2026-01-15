import * as React from 'react';
import type { Story } from '@ladle/react';
import { TitleCell } from './TitleCell.js';

export default {
  title: 'Components/TypeBrowser/Cells/TitleCell',
};

/**
 * Default - Basic title cell display
 */
export const Default: Story = () => (
  <div className="w-64 p-2 border rounded">
    <TitleCell
      value="My Document Title"
      onSave={(value) => console.log('Saved:', value)}
      onOpen={() => console.log('Open clicked')}
    />
  </div>
);

/**
 * Interactive - With state management
 */
export const Interactive: Story = () => {
  const [value, setValue] = React.useState('Project Roadmap 2026');

  return (
    <div className="space-y-4">
      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
        <strong>Tip:</strong> Click the text to edit inline. Hover to see the "Open" button on the
        right. Press Enter to save, Escape to cancel.
      </div>
      <div className="w-72 p-2 border rounded">
        <TitleCell
          value={value}
          onSave={(newValue) => {
            setValue(newValue);
            console.log('Saved:', newValue);
          }}
          onOpen={() => alert('Opening: ' + value)}
        />
      </div>
      <div className="text-sm text-gray-600">
        Current value: <code className="bg-gray-100 px-1 rounded">{value}</code>
      </div>
    </div>
  );
};

/**
 * Long Text - Tests truncation behavior
 */
export const LongText: Story = () => (
  <div className="space-y-4">
    <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700">
      The title is truncated when it overflows. Hover to see the Open button appears cleanly.
    </div>
    <div className="w-48 p-2 border rounded">
      <TitleCell
        value="This is a very long document title that should be truncated when it doesn't fit"
        onSave={(value) => console.log('Saved:', value)}
        onOpen={() => console.log('Open clicked')}
      />
    </div>
  </div>
);

/**
 * Empty Value - Shows placeholder for empty titles
 */
export const EmptyValue: Story = () => (
  <div className="space-y-4">
    <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
      Empty values display a dash placeholder. Click to add a title.
    </div>
    <div className="w-64 p-2 border rounded">
      <TitleCell
        value=""
        onSave={(value) => console.log('Saved:', value)}
        onOpen={() => console.log('Open clicked')}
      />
    </div>
  </div>
);

/**
 * Multiple Cells - Shows behavior in a list context
 */
export const MultipleCells: Story = () => {
  const [items, setItems] = React.useState([
    { id: '1', title: 'Meeting Notes - Q1 Planning' },
    { id: '2', title: 'Product Roadmap' },
    { id: '3', title: 'Bug Triage List' },
    { id: '4', title: '' },
  ]);

  const handleSave = (id: string, newValue: string) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, title: newValue } : item)));
    console.log('Saved:', { id, newValue });
  };

  return (
    <div className="space-y-4">
      <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800">
        <strong>List Context:</strong> Each row has its own TitleCell. Hover any row to see the Open
        button. Click to edit.
      </div>
      <div className="w-80 border rounded divide-y">
        {items.map((item) => (
          <div key={item.id} className="px-3 py-2">
            <TitleCell
              value={item.title}
              onSave={(newValue) => handleSave(item.id, newValue)}
              onOpen={() => alert('Opening: ' + (item.title || 'Untitled'))}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Hover State - Demonstrates the Open button appearance
 */
export const HoverState: Story = () => (
  <div className="space-y-4">
    <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg text-sm text-purple-800">
      <strong>Hover Behavior:</strong> The "Open" icon button (arrow pointing out of square) appears
      on hover, anchored to the right. It has its own hover state and can be clicked independently
      from editing.
    </div>
    <div className="w-64 p-2 border rounded">
      <TitleCell
        value="Hover over me"
        onSave={(value) => console.log('Saved:', value)}
        onOpen={() => alert('Open button clicked!')}
      />
    </div>
  </div>
);

/**
 * In Table Context - Shows how TitleCell looks in a table row
 */
export const InTableContext: Story = () => {
  const [data, setData] = React.useState([
    { id: '1', title: 'Weekly Team Meeting', status: 'Active' },
    { id: '2', title: 'Product Launch Checklist', status: 'In Progress' },
    { id: '3', title: 'Customer Feedback Analysis', status: 'Completed' },
  ]);

  return (
    <div className="space-y-4">
      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
        <strong>Table Context:</strong> This simulates how TitleCell looks alongside other columns.
        The title column has the Open button, other columns don't.
      </div>
      <table className="w-full border rounded-lg overflow-hidden">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase w-64">
              Title
            </th>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase w-32">
              Status
            </th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {data.map((row) => (
            <tr key={row.id} className="hover:bg-gray-50">
              <td className="px-3 py-2">
                <TitleCell
                  value={row.title}
                  onSave={(newValue) => {
                    setData((prev) =>
                      prev.map((r) => (r.id === row.id ? { ...r, title: newValue } : r))
                    );
                  }}
                  onOpen={() => alert('Opening: ' + row.title)}
                />
              </td>
              <td className="px-3 py-2 text-sm text-gray-600">{row.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
