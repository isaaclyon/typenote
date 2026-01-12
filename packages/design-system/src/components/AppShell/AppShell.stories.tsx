import * as React from 'react';
import type { Story } from '@ladle/react';
import { FileText, CheckSquare, User, Folder, Archive, Settings } from 'lucide-react';
import { AppShell } from './AppShell.js';
import { ContentArea } from './ContentArea.js';
import { Sidebar } from '../Sidebar/Sidebar.js';
import { SidebarSection } from '../Sidebar/SidebarSection.js';
import { SidebarSearchTrigger } from '../Sidebar/SidebarSearchTrigger.js';
import { SidebarCalendarButton } from '../Sidebar/SidebarCalendarButton.js';
import { SidebarTypesList } from '../Sidebar/SidebarTypesList.js';
import { SidebarTypeItem } from '../Sidebar/SidebarTypeItem.js';
import { SidebarActionButton } from '../Sidebar/SidebarActionButton.js';
import { SidebarNewTypeButton } from '../Sidebar/SidebarNewTypeButton.js';
import { RightSidebar } from '../RightSidebar/RightSidebar.js';
import { CollapsibleSection } from '../CollapsibleSection/CollapsibleSection.js';

export default {
  title: 'Components/AppShell',
};

// Mock data for sidebar
const MOCK_TYPES = [
  { id: '1', icon: FileText, label: 'Notes', count: 42, color: '#6495ED' },
  { id: '2', icon: CheckSquare, label: 'Tasks', count: 18, color: '#81c784' },
  { id: '3', icon: User, label: 'People', count: 7, color: '#ffb74d' },
  { id: '4', icon: Folder, label: 'Projects', count: 5, color: '#e57373' },
];

// Reusable left sidebar content
const LeftSidebarContent = ({
  collapsed,
  selectedType = '1',
  onSelectType,
}: {
  collapsed: boolean;
  selectedType?: string;
  onSelectType?: (id: string) => void;
}) => (
  <Sidebar collapsed={collapsed}>
    <SidebarSection className="p-2 space-y-2">
      <SidebarSearchTrigger onClick={() => {}} />
      <SidebarCalendarButton onClick={() => {}} isToday />
    </SidebarSection>

    <SidebarSection title="Types">
      <SidebarTypesList>
        {MOCK_TYPES.map((type) => (
          <SidebarTypeItem
            key={type.id}
            icon={type.icon}
            label={type.label}
            count={type.count}
            color={type.color}
            selected={selectedType === type.id}
            onClick={() => onSelectType?.(type.id)}
          />
        ))}
        <SidebarNewTypeButton onClick={() => {}} />
      </SidebarTypesList>
    </SidebarSection>

    <SidebarSection className="p-2 space-y-1 mt-auto">
      <SidebarActionButton icon={Archive} label="Archive" onClick={() => {}} />
      <SidebarActionButton icon={Settings} label="Settings" onClick={() => {}} />
    </SidebarSection>
  </Sidebar>
);

// Reusable right sidebar content
const RightSidebarContent = ({ collapsed }: { collapsed: boolean }) => (
  <RightSidebar collapsed={collapsed}>
    <CollapsibleSection title="Properties" defaultExpanded>
      <div className="space-y-2 text-sm text-gray-600">
        <div className="flex justify-between">
          <span className="text-gray-500">Created</span>
          <span>Jan 10, 2025</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Modified</span>
          <span>Jan 11, 2025</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Type</span>
          <span>Note</span>
        </div>
      </div>
    </CollapsibleSection>

    <CollapsibleSection title="Tags" count={3} defaultExpanded>
      <div className="flex flex-wrap gap-1">
        <span className="px-2 py-0.5 bg-gray-100 rounded text-xs">design</span>
        <span className="px-2 py-0.5 bg-gray-100 rounded text-xs">ui</span>
        <span className="px-2 py-0.5 bg-gray-100 rounded text-xs">components</span>
      </div>
    </CollapsibleSection>

    <CollapsibleSection title="Backlinks" count={2} defaultExpanded={false}>
      <div className="space-y-2 text-sm">
        <div className="p-2 hover:bg-gray-50 rounded cursor-pointer">
          <div className="font-medium">Related Document</div>
          <div className="text-gray-500 text-xs">Last edited yesterday</div>
        </div>
        <div className="p-2 hover:bg-gray-50 rounded cursor-pointer">
          <div className="font-medium">Another Reference</div>
          <div className="text-gray-500 text-xs">Last edited 3 days ago</div>
        </div>
      </div>
    </CollapsibleSection>
  </RightSidebar>
);

// Default content area
const MainContent = () => (
  <div className="h-full p-8 bg-gray-50">
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-semibold text-gray-900 mb-4">Document Title</h1>
      <p className="text-gray-600 leading-relaxed mb-4">
        This is the main content area. It expands fluidly when sidebars are collapsed, giving you
        more room to focus on your content. Try clicking the chevron buttons on the sidebar edges.
      </p>
      <p className="text-gray-600 leading-relaxed mb-4">
        The sidebars animate smoothly to a 48px rail when collapsed, showing only an expand button.
        The content fades out during the transition for a polished feel.
      </p>
      <p className="text-gray-500 text-sm">
        Click the collapse buttons (chevrons) on the inner edges of each sidebar to toggle them.
      </p>
    </div>
  </div>
);

/**
 * Default 3-column layout with both sidebars expanded
 */
export const Default: Story = () => (
  <div className="h-[600px] border border-gray-200 rounded-lg overflow-hidden">
    <AppShell
      leftSidebar={({ collapsed }) => <LeftSidebarContent collapsed={collapsed} />}
      rightSidebar={({ collapsed }) => <RightSidebarContent collapsed={collapsed} />}
    >
      <MainContent />
    </AppShell>
  </div>
);

/**
 * With localStorage persistence - collapse state remembers across refreshes
 */
export const WithPersistence: Story = () => (
  <div className="space-y-4">
    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <p className="text-sm text-blue-800">
        <strong>localStorage Persistence:</strong> Collapse either sidebar, then refresh the page.
        The sidebar will remain collapsed. Clear localStorage to reset.
      </p>
    </div>
    <div className="h-[600px] border border-gray-200 rounded-lg overflow-hidden">
      <AppShell
        leftSidebar={({ collapsed }) => <LeftSidebarContent collapsed={collapsed} />}
        rightSidebar={({ collapsed }) => <RightSidebarContent collapsed={collapsed} />}
        leftSidebarStorageKey="appshell-demo.left.collapsed"
        rightSidebarStorageKey="appshell-demo.right.collapsed"
      >
        <MainContent />
      </AppShell>
    </div>
  </div>
);

/**
 * Left sidebar only layout
 */
export const LeftSidebarOnly: Story = () => (
  <div className="h-[600px] border border-gray-200 rounded-lg overflow-hidden">
    <AppShell leftSidebar={({ collapsed }) => <LeftSidebarContent collapsed={collapsed} />}>
      <div className="h-full p-8 bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Left sidebar only. Content expands to fill available space.</p>
      </div>
    </AppShell>
  </div>
);

/**
 * Right sidebar only layout
 */
export const RightSidebarOnly: Story = () => (
  <div className="h-[600px] border border-gray-200 rounded-lg overflow-hidden">
    <AppShell rightSidebar={({ collapsed }) => <RightSidebarContent collapsed={collapsed} />}>
      <div className="h-full p-8 bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">
          Right sidebar only. Content expands to fill available space.
        </p>
      </div>
    </AppShell>
  </div>
);

/**
 * Both sidebars start collapsed
 */
export const DefaultCollapsed: Story = () => (
  <div className="space-y-4">
    <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
      <p className="text-sm text-amber-800">
        <strong>Default Collapsed:</strong> Both sidebars start in collapsed state. Click the expand
        buttons (chevrons) to open them.
      </p>
    </div>
    <div className="h-[600px] border border-gray-200 rounded-lg overflow-hidden">
      <AppShell
        leftSidebar={({ collapsed }) => <LeftSidebarContent collapsed={collapsed} />}
        rightSidebar={({ collapsed }) => <RightSidebarContent collapsed={collapsed} />}
        defaultLeftCollapsed
        defaultRightCollapsed
      >
        <div className="h-full p-8 bg-gray-50 flex items-center justify-center">
          <p className="text-gray-500">Maximum content space with both sidebars collapsed.</p>
        </div>
      </AppShell>
    </div>
  </div>
);

/**
 * Interactive demo with type selection
 */
export const Interactive: Story = () => {
  const [selectedType, setSelectedType] = React.useState('1');

  const selectedTypeData = MOCK_TYPES.find((t) => t.id === selectedType);

  return (
    <div className="h-[600px] border border-gray-200 rounded-lg overflow-hidden">
      <AppShell
        leftSidebar={({ collapsed }) => (
          <LeftSidebarContent
            collapsed={collapsed}
            selectedType={selectedType}
            onSelectType={setSelectedType}
          />
        )}
        rightSidebar={({ collapsed }) => <RightSidebarContent collapsed={collapsed} />}
      >
        <div className="h-full p-8 bg-gray-50">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-2xl font-semibold text-gray-900 mb-4">
              {selectedTypeData?.label ?? 'Select a type'}
            </h1>
            <p className="text-gray-600 mb-2">
              Selected type: <strong>{selectedTypeData?.label}</strong> with{' '}
              <strong>{selectedTypeData?.count}</strong> items
            </p>
            <p className="text-gray-500 text-sm">
              Click different types in the left sidebar to change the selection. Toggle sidebars
              using the edge buttons.
            </p>
          </div>
        </div>
      </AppShell>
    </div>
  );
};

/**
 * Content only (no sidebars) - useful for focused modes
 */
export const ContentOnly: Story = () => (
  <div className="h-[600px] border border-gray-200 rounded-lg overflow-hidden">
    <AppShell>
      <div className="h-full p-8 bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Focus Mode</h2>
          <p className="text-gray-500">No sidebars - maximum content space</p>
        </div>
      </div>
    </AppShell>
  </div>
);

/**
 * ContentArea component standalone
 */
export const ContentAreaStandalone: Story = () => (
  <div className="border border-gray-200 rounded-lg overflow-hidden">
    <ContentArea className="bg-gradient-to-br from-gray-50 to-gray-100 p-8 min-h-[300px]">
      <h2 className="text-lg font-semibold mb-2">ContentArea Component</h2>
      <p className="text-gray-600">
        The ContentArea component can be used standalone. It provides flex-1 behavior with proper
        overflow handling.
      </p>
    </ContentArea>
  </div>
);
