import * as React from 'react';
import type { Story } from '@ladle/react';
import { NotesCreatedList, type NotesCreatedItem } from './NotesCreatedList.js';
import { MiniCalendar } from '../MiniCalendar/MiniCalendar.js';
import { getTodayKey } from '../MiniCalendar/utils.js';
import { FileTextIcon } from '@phosphor-icons/react/dist/csr/FileText';
import { CheckSquareIcon } from '@phosphor-icons/react/dist/csr/CheckSquare';
import { UserIcon } from '@phosphor-icons/react/dist/csr/User';
import { FolderIcon } from '@phosphor-icons/react/dist/csr/Folder';
import { LightbulbIcon } from '@phosphor-icons/react/dist/csr/Lightbulb';

export default {
  title: 'Components/NotesCreatedList',
};

// Sample items with different types
const sampleItems: NotesCreatedItem[] = [
  { id: '1', title: 'Project kickoff notes', typeIcon: FileTextIcon, typeColor: '#6495ED' },
  { id: '2', title: 'Review API design', typeIcon: CheckSquareIcon, typeColor: '#10B981' },
  { id: '3', title: 'Meeting with Sarah', typeIcon: FileTextIcon, typeColor: '#6495ED' },
  { id: '4', title: 'Alex Thompson', typeIcon: UserIcon, typeColor: '#8B5CF6' },
];

const manyItems: NotesCreatedItem[] = [
  { id: '1', title: 'Morning standup notes', typeIcon: FileTextIcon, typeColor: '#6495ED' },
  { id: '2', title: 'Bug fix: login flow', typeIcon: CheckSquareIcon, typeColor: '#10B981' },
  { id: '3', title: 'Design review feedback', typeIcon: FileTextIcon, typeColor: '#6495ED' },
  { id: '4', title: 'Q1 Planning document', typeIcon: FolderIcon, typeColor: '#F59E0B' },
  {
    id: '5',
    title: 'Research: competitor analysis',
    typeIcon: LightbulbIcon,
    typeColor: '#EC4899',
  },
  { id: '6', title: 'Team retrospective', typeIcon: FileTextIcon, typeColor: '#6495ED' },
  { id: '7', title: 'Deploy checklist', typeIcon: CheckSquareIcon, typeColor: '#10B981' },
  { id: '8', title: 'Client meeting prep', typeIcon: FileTextIcon, typeColor: '#6495ED' },
  { id: '9', title: 'New feature brainstorm', typeIcon: LightbulbIcon, typeColor: '#EC4899' },
  { id: '10', title: 'Performance metrics review', typeIcon: FileTextIcon, typeColor: '#6495ED' },
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
      typeIcon: FileTextIcon,
      typeColor: '#6495ED',
    },
    {
      id: '2',
      title:
        'Another extremely long title for testing purposes to ensure truncation works correctly',
      typeIcon: CheckSquareIcon,
      typeColor: '#10B981',
    },
    { id: '3', title: 'Short title', typeIcon: UserIcon, typeColor: '#8B5CF6' },
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
