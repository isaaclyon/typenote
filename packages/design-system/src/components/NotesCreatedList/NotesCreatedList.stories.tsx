import * as React from 'react';
import type { Story } from '@ladle/react';
import { DEMO_TYPE_COLORS } from '../../constants/demoColors.js';
import { NotesCreatedList, type NotesCreatedItem } from './NotesCreatedList.js';
import { MiniCalendar } from '../MiniCalendar/MiniCalendar.js';
import { getTodayKey } from '../MiniCalendar/utils.js';

export default {
  title: 'Components/NotesCreatedList',
};

// Sample items with different types (using Lucide icon names - matches BacklinkItem pattern)
const sampleItems: NotesCreatedItem[] = [
  {
    id: '1',
    title: 'Project kickoff notes',
    typeIcon: 'FileText',
    typeColor: DEMO_TYPE_COLORS.notes,
  },
  {
    id: '2',
    title: 'Review API design',
    typeIcon: 'CheckSquare',
    typeColor: DEMO_TYPE_COLORS.success,
  },
  { id: '3', title: 'Meeting with Sarah', typeIcon: 'FileText', typeColor: DEMO_TYPE_COLORS.notes },
  { id: '4', title: 'Alex Thompson', typeIcon: 'User', typeColor: DEMO_TYPE_COLORS.people },
];

const manyItems: NotesCreatedItem[] = [
  {
    id: '1',
    title: 'Morning standup notes',
    typeIcon: 'FileText',
    typeColor: DEMO_TYPE_COLORS.notes,
  },
  {
    id: '2',
    title: 'Bug fix: login flow',
    typeIcon: 'CheckSquare',
    typeColor: DEMO_TYPE_COLORS.success,
  },
  {
    id: '3',
    title: 'Design review feedback',
    typeIcon: 'FileText',
    typeColor: DEMO_TYPE_COLORS.notes,
  },
  {
    id: '4',
    title: 'Q1 Planning document',
    typeIcon: 'Folder',
    typeColor: DEMO_TYPE_COLORS.dailyNote,
  },
  {
    id: '5',
    title: 'Research: competitor analysis',
    typeIcon: 'Lightbulb',
    typeColor: DEMO_TYPE_COLORS.ideas,
  },
  { id: '6', title: 'Team retrospective', typeIcon: 'FileText', typeColor: DEMO_TYPE_COLORS.notes },
  {
    id: '7',
    title: 'Deploy checklist',
    typeIcon: 'CheckSquare',
    typeColor: DEMO_TYPE_COLORS.success,
  },
  {
    id: '8',
    title: 'Client meeting prep',
    typeIcon: 'FileText',
    typeColor: DEMO_TYPE_COLORS.notes,
  },
  {
    id: '9',
    title: 'New feature brainstorm',
    typeIcon: 'Lightbulb',
    typeColor: DEMO_TYPE_COLORS.ideas,
  },
  {
    id: '10',
    title: 'Performance metrics review',
    typeIcon: 'FileText',
    typeColor: DEMO_TYPE_COLORS.notes,
  },
];

export const AllVariants: Story = () => (
  <div className="flex flex-col gap-8">
    <section>
      <h2 className="text-lg font-semibold mb-4">Default</h2>
      <p className="text-sm text-gray-500 mb-4">
        Shows notes created on a specific date with type icons
      </p>
      <NotesCreatedList
        date={getTodayKey()}
        items={sampleItems}
        onItemClick={(id) => console.log('Clicked:', id)}
      />
    </section>

    <section>
      <h2 className="text-lg font-semibold mb-4">Empty State</h2>
      <p className="text-sm text-gray-500 mb-4">When no notes were created that day</p>
      <NotesCreatedList
        date={getTodayKey()}
        items={[]}
        onItemClick={(id) => console.log('Clicked:', id)}
      />
    </section>

    <section>
      <h2 className="text-lg font-semibold mb-4">Loading State</h2>
      <p className="text-sm text-gray-500 mb-4">While fetching data</p>
      <NotesCreatedList date={getTodayKey()} items={[]} isLoading />
    </section>

    <section>
      <h2 className="text-lg font-semibold mb-4">Many Items (Scrollable)</h2>
      <p className="text-sm text-gray-500 mb-4">List scrolls when there are many items</p>
      <NotesCreatedList
        date={getTodayKey()}
        items={manyItems}
        onItemClick={(id) => console.log('Clicked:', id)}
      />
    </section>
  </div>
);

export const Default: Story = () => (
  <NotesCreatedList
    date={getTodayKey()}
    items={sampleItems}
    onItemClick={(id) => console.log('Clicked:', id)}
  />
);

export const Empty: Story = () => <NotesCreatedList date={getTodayKey()} items={[]} />;

export const Loading: Story = () => <NotesCreatedList date={getTodayKey()} items={[]} isLoading />;

export const ManyItems: Story = () => (
  <NotesCreatedList
    date={getTodayKey()}
    items={manyItems}
    onItemClick={(id) => console.log('Clicked:', id)}
  />
);

export const WithoutHeader: Story = () => (
  <NotesCreatedList
    date={getTodayKey()}
    items={sampleItems}
    showHeader={false}
    onItemClick={(id) => console.log('Clicked:', id)}
  />
);

export const Interactive: Story = () => {
  const [clickedId, setClickedId] = React.useState<string | null>(null);

  return (
    <div className="space-y-4">
      <NotesCreatedList date={getTodayKey()} items={sampleItems} onItemClick={setClickedId} />
      <p className="text-sm text-gray-500">
        {clickedId ? `Clicked item: ${clickedId}` : 'Click an item to see navigation callback'}
      </p>
    </div>
  );
};
Interactive.meta = {
  description: 'Click items to see navigation callback',
};

export const WithMiniCalendar: Story = () => {
  const [selectedDate, setSelectedDate] = React.useState(getTodayKey());

  // Simulate different items for different dates
  const getItemsForDate = (date: string): NotesCreatedItem[] => {
    // Just show items for today, empty for other days (in real app, would fetch)
    if (date === getTodayKey()) {
      return sampleItems;
    }
    return [];
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500 mb-4">Combined view: Calendar + Notes created list</p>
      <div className="p-4 border border-gray-200 rounded-lg bg-white">
        <MiniCalendar
          selectedDate={selectedDate}
          datesWithNotes={new Set([getTodayKey()])}
          onDateSelect={setSelectedDate}
        />
        <div className="mt-4 pt-4 border-t border-gray-100">
          <NotesCreatedList
            date={selectedDate}
            items={getItemsForDate(selectedDate)}
            onItemClick={(id) => console.log('Navigate to:', id)}
          />
        </div>
      </div>
    </div>
  );
};
WithMiniCalendar.meta = {
  description: 'Shows how the two components work together in the daily note sidebar',
};

export const LongTitles: Story = () => {
  const itemsWithLongTitles: NotesCreatedItem[] = [
    {
      id: '1',
      title: 'This is a very long title that should be truncated with an ellipsis',
      typeIcon: 'FileText',
      typeColor: DEMO_TYPE_COLORS.notes,
    },
    {
      id: '2',
      title:
        'Another extremely long title for testing purposes to ensure truncation works correctly',
      typeIcon: 'CheckSquare',
      typeColor: DEMO_TYPE_COLORS.success,
    },
    { id: '3', title: 'Short title', typeIcon: 'User', typeColor: DEMO_TYPE_COLORS.people },
  ];

  return (
    <NotesCreatedList
      date={getTodayKey()}
      items={itemsWithLongTitles}
      onItemClick={(id) => console.log('Clicked:', id)}
    />
  );
};
LongTitles.meta = {
  description: 'Long titles are truncated with ellipsis',
};

export const NoIcons: Story = () => {
  const itemsWithoutIcons: NotesCreatedItem[] = [
    { id: '1', title: 'Note without icon' },
    { id: '2', title: 'Another note without icon' },
    { id: '3', title: 'Third note' },
  ];

  return (
    <NotesCreatedList
      date={getTodayKey()}
      items={itemsWithoutIcons}
      onItemClick={(id) => console.log('Clicked:', id)}
    />
  );
};
NoIcons.meta = {
  description: 'Items without icons still render correctly',
};

export const ResponsiveWidths: Story = () => {
  const items: NotesCreatedItem[] = [
    {
      id: '1',
      title: 'Meeting Notes',
      typeIcon: 'FileText',
      typeColor: DEMO_TYPE_COLORS.notes,
    },
    {
      id: '2',
      title: 'Very Long Project Title That Should Truncate Gracefully When Space Is Limited',
      typeIcon: 'Folder',
      typeColor: DEMO_TYPE_COLORS.projects,
    },
    {
      id: '3',
      title: 'Task',
      typeIcon: 'CheckSquare',
      typeColor: DEMO_TYPE_COLORS.success,
    },
  ];

  return (
    <div className="space-y-8">
      <section>
        <h3 className="mb-2 text-sm font-medium text-gray-700">At 280px (minimum sidebar width)</h3>
        <div style={{ width: '280px' }} className="border border-gray-200 bg-gray-50/50">
          <div className="px-6 py-4">
            <NotesCreatedList date="2026-01-16" items={items} isLoading={false} />
          </div>
        </div>
      </section>

      <section>
        <h3 className="mb-2 text-sm font-medium text-gray-700">
          At 340px (mid-range) - More title visible
        </h3>
        <div style={{ width: '340px' }} className="border border-gray-200 bg-gray-50/50">
          <div className="px-6 py-4">
            <NotesCreatedList date="2026-01-16" items={items} isLoading={false} />
          </div>
        </div>
      </section>

      <section>
        <h3 className="mb-2 text-sm font-medium text-gray-700">
          At 400px (maximum sidebar width) - Full titles visible
        </h3>
        <div style={{ width: '400px' }} className="border border-gray-200 bg-gray-50/50">
          <div className="px-6 py-4">
            <NotesCreatedList date="2026-01-16" items={items} isLoading={false} />
          </div>
        </div>
      </section>
    </div>
  );
};
ResponsiveWidths.meta = {
  description: 'Shows how list items expand and more title text becomes visible at wider widths',
};

export const InFixedHeightContainer: Story = () => {
  const manyItems = Array.from({ length: 20 }, (_, i) => ({
    id: `item-${i}`,
    title: `Page ${i + 1}`,
    typeIcon: 'FileText',
    typeColor: DEMO_TYPE_COLORS.notes,
  }));

  return (
    <div
      style={{ height: '400px', display: 'flex', flexDirection: 'column' }}
      className="border border-gray-200"
    >
      <div className="p-4 border-b">
        <MiniCalendar selectedDate={getTodayKey()} datesWithNotes={new Set()} />
      </div>
      <div className="flex-1 overflow-auto p-4">
        <NotesCreatedList date={getTodayKey()} items={manyItems} />
      </div>
    </div>
  );
};
InFixedHeightContainer.meta = {
  description:
    'Demonstrates component works correctly when parent container handles scrolling (realistic usage)',
};
