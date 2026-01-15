import * as React from 'react';
import type { Story } from '@ladle/react';
import { FileText, Calendar, CheckSquare, User } from 'lucide-react';
import { DEMO_TYPE_COLORS } from '../../constants/demoColors.js';
import { SidebarPinnedSection } from './SidebarPinnedSection.js';
import { SidebarPinnedItem } from './SidebarPinnedItem.js';

export default {
  title: 'Components/Sidebar/PinnedSection',
};

// Mock data
const MOCK_PINNED_ITEMS = [
  { id: 'pin-1', title: 'TypeNote Architecture', typeKey: 'Page', color: DEMO_TYPE_COLORS.notes },
  { id: 'pin-2', title: 'Q1 Goals', typeKey: 'Task', color: DEMO_TYPE_COLORS.tasks },
  { id: 'pin-3', title: 'Today', typeKey: 'DailyNote', color: DEMO_TYPE_COLORS.events },
];

const MOCK_MANY_PINNED_ITEMS = Array.from({ length: 15 }, (_, i) => ({
  id: `pin-${i}`,
  title: `Pinned Item ${i + 1}`,
  typeKey: i % 4 === 0 ? 'Page' : i % 4 === 1 ? 'Task' : i % 4 === 2 ? 'DailyNote' : 'Person',
  color:
    i % 4 === 0
      ? DEMO_TYPE_COLORS.notes
      : i % 4 === 1
        ? DEMO_TYPE_COLORS.tasks
        : i % 4 === 2
          ? DEMO_TYPE_COLORS.events
          : DEMO_TYPE_COLORS.projects,
}));

export const Default: Story = () => {
  const [items, setItems] = React.useState(MOCK_PINNED_ITEMS);
  const [selectedId, setSelectedId] = React.useState<string | null>(null);

  const handleReorder = (orderedIds: string[]) => {
    const reordered = orderedIds
      .map((id) => items.find((item) => item.id === id))
      .filter((item): item is (typeof items)[0] => item !== undefined);
    setItems(reordered);
  };

  return (
    <div className="w-64 border border-gray-200 rounded p-2 bg-white">
      <SidebarPinnedSection
        items={items}
        onReorder={handleReorder}
        onSelect={setSelectedId}
        selectedId={selectedId}
      />
    </div>
  );
};

export const Empty: Story = () => {
  return (
    <div className="w-64 border border-gray-200 rounded p-2 bg-white">
      <SidebarPinnedSection items={[]} onReorder={() => {}} onSelect={() => {}} selectedId={null} />
      <p className="text-sm text-gray-400 text-center py-4">No pinned items (renders nothing)</p>
    </div>
  );
};

export const Interactive: Story = () => {
  const [items, setItems] = React.useState(MOCK_PINNED_ITEMS);
  const [selectedId, setSelectedId] = React.useState<string | null>('pin-1');

  const handleReorder = (orderedIds: string[]) => {
    const reordered = orderedIds
      .map((id) => items.find((item) => item.id === id))
      .filter((item): item is (typeof items)[0] => item !== undefined);
    setItems(reordered);
    console.log('Reordered:', orderedIds);
  };

  const handleSelect = (id: string) => {
    setSelectedId(id);
    console.log('Selected:', id);
  };

  return (
    <div className="space-y-4">
      <div className="w-64 border border-gray-200 rounded p-2 bg-white">
        <div className="px-2 py-1 mb-2">
          <p className="text-xs font-semibold text-gray-500">PINNED</p>
        </div>
        <SidebarPinnedSection
          items={items}
          onReorder={handleReorder}
          onSelect={handleSelect}
          selectedId={selectedId}
        />
      </div>
      <div className="text-sm text-gray-600">
        <p>Try dragging items to reorder them.</p>
        <p>Click items to select them.</p>
        <p className="mt-2 font-mono text-xs">Selected: {selectedId || 'none'}</p>
      </div>
    </div>
  );
};

export const ManyItems: Story = () => {
  const [items, setItems] = React.useState(MOCK_MANY_PINNED_ITEMS);
  const [selectedId, setSelectedId] = React.useState<string | null>(null);

  const handleReorder = (orderedIds: string[]) => {
    const reordered = orderedIds
      .map((id) => items.find((item) => item.id === id))
      .filter((item): item is (typeof items)[0] => item !== undefined);
    setItems(reordered);
  };

  return (
    <div className="w-64 border border-gray-200 rounded bg-white">
      <div className="px-4 py-2 border-b border-gray-200">
        <p className="text-xs font-semibold text-gray-500">PINNED ({items.length})</p>
      </div>
      <div className="max-h-96 overflow-y-auto p-2">
        <SidebarPinnedSection
          items={items}
          onReorder={handleReorder}
          onSelect={setSelectedId}
          selectedId={selectedId}
        />
      </div>
    </div>
  );
};

export const SingleItem: Story = () => {
  const [selectedId, setSelectedId] = React.useState<string | null>(null);

  return (
    <div className="w-64 border border-gray-200 rounded p-2 bg-white">
      <SidebarPinnedItem
        id="single"
        icon={FileText}
        label="Single Pinned Item"
        color={DEMO_TYPE_COLORS.notes}
        selected={selectedId === 'single'}
        onClick={() => setSelectedId('single')}
      />
    </div>
  );
};

export const ItemStates: Story = () => (
  <div className="space-y-4 w-64">
    <section>
      <h3 className="text-sm font-semibold mb-2">Default</h3>
      <div className="border border-gray-200 rounded p-2 bg-white">
        <SidebarPinnedItem
          id="default"
          icon={FileText}
          label="Default Item"
          color={DEMO_TYPE_COLORS.notes}
        />
      </div>
    </section>

    <section>
      <h3 className="text-sm font-semibold mb-2">Selected</h3>
      <div className="border border-gray-200 rounded p-2 bg-white">
        <SidebarPinnedItem
          id="selected"
          icon={FileText}
          label="Selected Item"
          color={DEMO_TYPE_COLORS.notes}
          selected
        />
      </div>
    </section>

    <section>
      <h3 className="text-sm font-semibold mb-2">With Different Icons</h3>
      <div className="border border-gray-200 rounded p-2 bg-white space-y-1">
        <SidebarPinnedItem id="page" icon={FileText} label="Page" color={DEMO_TYPE_COLORS.notes} />
        <SidebarPinnedItem
          id="task"
          icon={CheckSquare}
          label="Task"
          color={DEMO_TYPE_COLORS.tasks}
        />
        <SidebarPinnedItem
          id="daily"
          icon={Calendar}
          label="Daily Note"
          color={DEMO_TYPE_COLORS.events}
        />
        <SidebarPinnedItem
          id="person"
          icon={User}
          label="Person"
          color={DEMO_TYPE_COLORS.projects}
        />
      </div>
    </section>

    <section>
      <h3 className="text-sm font-semibold mb-2">Long Label</h3>
      <div className="border border-gray-200 rounded p-2 bg-white">
        <SidebarPinnedItem
          id="long"
          icon={FileText}
          label="This is a very long pinned item label that should truncate gracefully"
          color={DEMO_TYPE_COLORS.notes}
        />
      </div>
    </section>
  </div>
);
