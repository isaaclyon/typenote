import * as React from 'react';
import type { Story } from '@ladle/react';
import {
  FileText,
  CheckSquare,
  User,
  Folder,
  Archive,
  Settings,
  Link as LinkIcon,
  Link2 as Link2Icon,
} from 'lucide-react';
import { DEMO_TYPE_COLORS } from '../../constants/demoColors.js';
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
import { InteractiveEditor } from '../InteractiveEditor/InteractiveEditor.js';
import { BacklinkItem } from '../BacklinkItem/BacklinkItem.js';
import { EmptyState } from '../EmptyState/EmptyState.js';
import { DailyNoteNav } from '../DailyNoteNav/DailyNoteNav.js';
import { MiniCalendar } from '../MiniCalendar/MiniCalendar.js';
import { NotesCreatedList } from '../NotesCreatedList/NotesCreatedList.js';

export default {
  title: 'Components/AppShell',
};

// Mock data for sidebar
const MOCK_TYPES = [
  { id: '1', icon: FileText, label: 'Notes', count: 42, color: DEMO_TYPE_COLORS.notes },
  { id: '2', icon: CheckSquare, label: 'Tasks', count: 18, color: DEMO_TYPE_COLORS.tasks },
  { id: '3', icon: User, label: 'People', count: 7, color: DEMO_TYPE_COLORS.events },
  { id: '4', icon: Folder, label: 'Projects', count: 5, color: DEMO_TYPE_COLORS.projects },
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

// Reusable right sidebar content (Properties + Tags only - Backlinks are at bottom of editor)
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
 * Resizable sidebars - drag handles to resize between 180-400px
 * Drag below 120px to snap-collapse to rail
 */
export const ResizableSidebars: Story = () => (
  <div className="space-y-4">
    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
      <p className="text-sm text-green-800">
        <strong>Resizable Sidebars:</strong> Hover over the inner edge of each sidebar to reveal the
        resize handle. Drag to resize (180-400px). Drag below 120px to snap-collapse to rail. Widths
        persist to localStorage.
      </p>
    </div>
    <div className="h-[600px] border border-gray-200 rounded-lg overflow-hidden">
      <AppShell
        leftSidebar={({ collapsed }) => <LeftSidebarContent collapsed={collapsed} />}
        rightSidebar={({ collapsed }) => <RightSidebarContent collapsed={collapsed} />}
        leftSidebarStorageKey="appshell-resizable.left.collapsed"
        rightSidebarStorageKey="appshell-resizable.right.collapsed"
        leftSidebarWidthStorageKey="appshell-resizable.left.width"
        rightSidebarWidthStorageKey="appshell-resizable.right.width"
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

/**
 * With Daily Note Editor - Full experience with InteractiveEditor for daily notes
 * Daily notes have special layout: DailyNoteNav + MiniCalendar + NotesCreatedList (NO properties/tags)
 */
export const WithDailyNoteEditor: Story = () => {
  const today = new Date();
  const todayKey = today.toISOString().split('T')[0] ?? '2026-01-12';
  const todayDate = today.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Mock dates with notes for calendar
  const datesWithNotes = new Set(['2026-01-10', '2026-01-11', '2026-01-12', '2026-01-09']);

  // Mock notes created today
  const notesCreatedToday = [
    {
      id: 'note-1',
      title: 'TypeNote Design System Progress',
      typeIcon: 'FileText',
      typeColor: DEMO_TYPE_COLORS.page,
    },
    {
      id: 'note-2',
      title: 'AppShell Component',
      typeIcon: 'Folder',
      typeColor: DEMO_TYPE_COLORS.projects,
    },
    {
      id: 'task-1',
      title: 'Fix navigation bug',
      typeIcon: 'CheckSquare',
      typeColor: DEMO_TYPE_COLORS.tasks,
    },
  ];

  const mockBacklinks = [
    {
      id: '1',
      title: 'Weekly Review - Jan 7-13',
      snippet: 'Reviewed progress on the daily note system implementation.',
      typeIcon: 'FileText',
      typeColor: DEMO_TYPE_COLORS.page,
    },
    {
      id: '2',
      title: 'Project Planning',
      snippet: "Referenced today's goals and action items in project roadmap.",
      typeIcon: 'Folder',
      typeColor: DEMO_TYPE_COLORS.projects,
    },
  ];

  const dailyNoteContent = {
    type: 'doc',
    content: [
      {
        type: 'heading',
        attrs: { level: 2 },
        content: [{ type: 'text', text: '🌅 Morning Journal' }],
      },
      {
        type: 'paragraph',
        content: [
          {
            type: 'text',
            text: "Started the day with a review of yesterday's progress. Feeling energized and ready to tackle the design system work.",
          },
        ],
      },
      {
        type: 'heading',
        attrs: { level: 2 },
        content: [{ type: 'text', text: "✅ Today's Goals" }],
      },
      {
        type: 'taskList',
        content: [
          {
            type: 'taskItem',
            attrs: { checked: true },
            content: [
              {
                type: 'paragraph',
                content: [{ type: 'text', text: 'Review and merge AppShell PR' }],
              },
            ],
          },
          {
            type: 'taskItem',
            attrs: { checked: true },
            content: [
              {
                type: 'paragraph',
                content: [{ type: 'text', text: 'Add keyboard navigation to slash menu' }],
              },
            ],
          },
          {
            type: 'taskItem',
            attrs: { checked: false },
            content: [
              {
                type: 'paragraph',
                content: [{ type: 'text', text: 'Create full experience stories in Ladle' }],
              },
            ],
          },
        ],
      },
      {
        type: 'heading',
        attrs: { level: 2 },
        content: [{ type: 'text', text: '🔗 Connections' }],
      },
      {
        type: 'paragraph',
        content: [
          { type: 'text', text: 'Working on ' },
          {
            type: 'refNode',
            attrs: { id: 'proj-001', label: 'TypeNote Design System', type: 'project' },
          },
          { type: 'text', text: ' with focus on ' },
          { type: 'tagNode', attrs: { id: 'tag-ui', label: 'ui', color: null } },
          { type: 'text', text: ' and ' },
          {
            type: 'tagNode',
            attrs: { id: 'tag-dx', label: 'developer-experience', color: DEMO_TYPE_COLORS.notes },
          },
          { type: 'text', text: '.' },
        ],
      },
    ],
  };

  return (
    <div className="h-[800px] border border-gray-200 rounded-lg overflow-hidden">
      <AppShell
        leftSidebar={({ collapsed }) => (
          <LeftSidebarContent collapsed={collapsed} selectedType="daily-notes" />
        )}
        rightSidebar={({ collapsed }) => (
          <RightSidebar collapsed={collapsed}>
            <MiniCalendar
              selectedDate={todayKey}
              datesWithNotes={datesWithNotes}
              onDateSelect={(date) => console.log('Navigate to:', date)}
              className="mb-6"
            />

            <NotesCreatedList date={todayKey} items={notesCreatedToday} />
          </RightSidebar>
        )}
      >
        <div className="h-full overflow-y-auto bg-white">
          <div className="max-w-3xl mx-auto px-8 py-6">
            {/* Daily Note Navigation */}
            <DailyNoteNav
              onPrevious={() => console.log('Previous day')}
              onNext={() => console.log('Next day')}
              onToday={() => console.log('Go to today')}
              isToday
              className="mb-6"
            />

            <h1 className="text-3xl font-semibold text-gray-900 mb-8">{todayDate}</h1>

            <InteractiveEditor initialContent={dailyNoteContent} minHeight="400px" />

            {/* Editor Bottom Sections - Backlinks */}
            <div className="mt-12 space-y-6">
              <CollapsibleSection
                title="Backlinks"
                icon={LinkIcon}
                count={mockBacklinks.length}
                storageKey="appshell.daily.backlinks"
              >
                <div className="space-y-2">
                  {mockBacklinks.map((backlink) => (
                    <BacklinkItem
                      key={backlink.id}
                      title={backlink.title}
                      snippet={backlink.snippet}
                      typeIcon={backlink.typeIcon}
                      typeColor={backlink.typeColor}
                    />
                  ))}
                </div>
              </CollapsibleSection>
            </div>
          </div>
        </div>
      </AppShell>
    </div>
  );
};

/**
 * With Note Editor - Full experience with InteractiveEditor for general notes
 */
export const WithNoteEditor: Story = () => {
  const mockBacklinks = [
    {
      id: '1',
      title: 'Design System Architecture',
      snippet: 'References this strategy document for component hierarchy decisions.',
      typeIcon: 'FileText',
      typeColor: DEMO_TYPE_COLORS.page,
    },
    {
      id: '2',
      title: 'Q1 2026 Roadmap',
      snippet: 'Links to product strategy as key dependency for planning.',
      typeIcon: 'Folder',
      typeColor: DEMO_TYPE_COLORS.projects,
    },
    {
      id: '3',
      title: 'Competitive Analysis',
      snippet: 'Compares our strategy with market positioning of competitors.',
      typeIcon: 'FileText',
      typeColor: DEMO_TYPE_COLORS.page,
    },
  ];

  const noteContent = {
    type: 'doc',
    content: [
      {
        type: 'callout',
        attrs: { type: 'info' },
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                marks: [{ type: 'bold' }],
                text: 'Last updated: ',
              },
              { type: 'text', text: 'January 12, 2026' },
            ],
          },
        ],
      },
      {
        type: 'heading',
        attrs: { level: 2 },
        content: [{ type: 'text', text: 'Executive Summary' }],
      },
      {
        type: 'paragraph',
        content: [
          {
            type: 'text',
            text: 'Our product strategy for 2026 focuses on three key pillars: local-first architecture, exceptional design quality, and developer experience. This positions us uniquely in the knowledge management space.',
          },
        ],
      },
      {
        type: 'heading',
        attrs: { level: 2 },
        content: [{ type: 'text', text: 'Strategic Priorities' }],
      },
      {
        type: 'orderedList',
        content: [
          {
            type: 'listItem',
            content: [
              {
                type: 'paragraph',
                content: [
                  {
                    type: 'text',
                    marks: [{ type: 'bold' }],
                    text: 'Design System Excellence',
                  },
                  {
                    type: 'text',
                    text: ' - Build Ladle-first components with ',
                  },
                  {
                    type: 'tagNode',
                    attrs: { id: 'tag-precision', label: 'precision', color: null },
                  },
                  { type: 'text', text: ' and ' },
                  {
                    type: 'tagNode',
                    attrs: { id: 'tag-craft', label: 'craft', color: DEMO_TYPE_COLORS.notes },
                  },
                ],
              },
            ],
          },
          {
            type: 'listItem',
            content: [
              {
                type: 'paragraph',
                content: [
                  {
                    type: 'text',
                    marks: [{ type: 'bold' }],
                    text: 'Local-First Architecture',
                  },
                  {
                    type: 'text',
                    text: ' - SQLite foundation with instant sync',
                  },
                ],
              },
            ],
          },
          {
            type: 'listItem',
            content: [
              {
                type: 'paragraph',
                content: [
                  {
                    type: 'text',
                    marks: [{ type: 'bold' }],
                    text: 'Developer Experience',
                  },
                  {
                    type: 'text',
                    text: ' - TypeScript-first with strong contracts',
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        type: 'heading',
        attrs: { level: 2 },
        content: [{ type: 'text', text: 'Key Initiatives' }],
      },
      {
        type: 'paragraph',
        content: [
          { type: 'text', text: 'Working with ' },
          {
            type: 'refNode',
            attrs: { id: 'person-001', label: 'Product Team', type: 'person' },
          },
          { type: 'text', text: ' to execute on ' },
          {
            type: 'refNode',
            attrs: { id: 'proj-ds', label: 'Design System Initiative', type: 'project' },
          },
          { type: 'text', text: '. Tagged with ' },
          {
            type: 'tagNode',
            attrs: { id: 'tag-strategy', label: 'strategy', color: DEMO_TYPE_COLORS.projects },
          },
          { type: 'text', text: ' and ' },
          {
            type: 'tagNode',
            attrs: { id: 'tag-product', label: 'product', color: DEMO_TYPE_COLORS.tasks },
          },
          { type: 'text', text: '.' },
        ],
      },
      {
        type: 'callout',
        attrs: { type: 'success' },
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                marks: [{ type: 'bold' }],
                text: 'Impact:',
              },
              {
                type: 'text',
                text: ' This strategy will differentiate us in a crowded market and build sustainable competitive advantage.',
              },
            ],
          },
        ],
      },
    ],
  };

  return (
    <div className="h-[800px] border border-gray-200 rounded-lg overflow-hidden">
      <AppShell
        leftSidebar={({ collapsed }) => (
          <LeftSidebarContent collapsed={collapsed} selectedType="1" />
        )}
        rightSidebar={({ collapsed }) => (
          <RightSidebar collapsed={collapsed}>
            <CollapsibleSection title="Properties" defaultExpanded>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span className="text-gray-500">Created</span>
                  <span>Dec 15, 2025</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Modified</span>
                  <span>Jan 12, 2026</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Type</span>
                  <span>Note</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Status</span>
                  <span>Active</span>
                </div>
              </div>
            </CollapsibleSection>

            <CollapsibleSection title="Tags" count={4} defaultExpanded>
              <div className="flex flex-wrap gap-1">
                <span className="px-2 py-0.5 bg-gray-100 rounded text-xs">strategy</span>
                <span className="px-2 py-0.5 bg-gray-100 rounded text-xs">product</span>
                <span className="px-2 py-0.5 bg-gray-100 rounded text-xs">2026</span>
                <span className="px-2 py-0.5 bg-gray-100 rounded text-xs">planning</span>
              </div>
            </CollapsibleSection>
          </RightSidebar>
        )}
      >
        <div className="h-full overflow-y-auto bg-white">
          <div className="max-w-3xl mx-auto px-8 py-12">
            <h1 className="text-3xl font-semibold text-gray-900 mb-8">Product Strategy 2026</h1>

            <InteractiveEditor initialContent={noteContent} minHeight="400px" />

            {/* Editor Bottom Sections - Backlinks */}
            <div className="mt-12 space-y-6">
              <CollapsibleSection
                title="Backlinks"
                icon={LinkIcon}
                count={mockBacklinks.length}
                storageKey="appshell.note.backlinks"
              >
                <div className="space-y-2">
                  {mockBacklinks.map((backlink) => (
                    <BacklinkItem
                      key={backlink.id}
                      title={backlink.title}
                      snippet={backlink.snippet}
                      typeIcon={backlink.typeIcon}
                      typeColor={backlink.typeColor}
                    />
                  ))}
                </div>
              </CollapsibleSection>

              <CollapsibleSection
                title="Unlinked Mentions"
                icon={Link2Icon}
                count={0}
                storageKey="appshell.note.mentions"
                defaultExpanded={false}
              >
                <EmptyState
                  title="No unlinked mentions"
                  description="Documents that mention this title without linking will appear here."
                />
              </CollapsibleSection>
            </div>
          </div>
        </div>
      </AppShell>
    </div>
  );
};
