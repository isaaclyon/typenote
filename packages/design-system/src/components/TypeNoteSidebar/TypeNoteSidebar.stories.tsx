import * as React from 'react';
import type { Story } from '@ladle/react';
import {
  FileText,
  CheckSquare,
  User,
  Folder,
  Archive,
  Settings,
  MoreHorizontal,
  Pencil,
  Trash,
} from 'lucide-react';
import { DEMO_TYPE_COLORS } from '../../constants/demoColors.js';
import {
  TypeNoteSidebarSearchTrigger,
  TypeNoteSidebarCalendarButton,
  TypeNoteSidebarTypeItem,
  TypeNoteSidebarNewTypeButton,
  TypeNoteSidebarActionButton,
} from './index.js';
import {
  SidebarProvider,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  Button,
} from '../index.js';

export default {
  title: 'Components/TypeNoteSidebar',
};

// Wrapper that provides SidebarProvider context (required by SidebarMenuButton)
const WithSidebarContext = ({ children }: { children: React.ReactNode }) => (
  <SidebarProvider defaultOpen>{children}</SidebarProvider>
);

// ============================================================================
// SearchTrigger Stories
// ============================================================================

export const SearchTrigger: Story = () => (
  <div className="space-y-4 max-w-sm">
    <section>
      <h3 className="text-sm font-semibold mb-2">Default</h3>
      <TypeNoteSidebarSearchTrigger onClick={() => alert('Search clicked')} />
    </section>
    <section>
      <h3 className="text-sm font-semibold mb-2">Custom Shortcut</h3>
      <TypeNoteSidebarSearchTrigger onClick={() => alert('Search clicked')} shortcut="⌘P" />
    </section>
  </div>
);
SearchTrigger.meta = {
  description: 'Search trigger button with keyboard shortcut hint',
};

// ============================================================================
// CalendarButton Stories
// ============================================================================

export const CalendarButton: Story = () => (
  <div className="space-y-4 max-w-sm">
    <section>
      <h3 className="text-sm font-semibold mb-2">Default (not today)</h3>
      <TypeNoteSidebarCalendarButton onClick={() => alert('Calendar clicked')} />
    </section>
    <section>
      <h3 className="text-sm font-semibold mb-2">Today (highlighted)</h3>
      <TypeNoteSidebarCalendarButton onClick={() => alert('Calendar clicked')} isToday />
    </section>
  </div>
);
CalendarButton.meta = {
  description: 'Calendar/Today button with optional highlighting for current day',
};

// ============================================================================
// TypeItem Stories
// ============================================================================

const MOCK_TYPES = [
  { id: '1', icon: FileText, label: 'Notes', count: 42, color: DEMO_TYPE_COLORS.notes },
  { id: '2', icon: CheckSquare, label: 'Tasks', count: 18, color: DEMO_TYPE_COLORS.tasks },
  { id: '3', icon: User, label: 'People', count: 7, color: DEMO_TYPE_COLORS.events },
  { id: '4', icon: Folder, label: 'Projects', count: 5, color: DEMO_TYPE_COLORS.projects },
];

export const TypeItem: Story = () => (
  <WithSidebarContext>
    <div className="space-y-6 max-w-sm">
      <section>
        <h3 className="text-sm font-semibold mb-2">Default States</h3>
        <div className="border border-gray-200 rounded p-2 bg-white space-y-1">
          {MOCK_TYPES.map((type) => (
            <TypeNoteSidebarTypeItem
              key={type.id}
              icon={type.icon}
              label={type.label}
              count={type.count}
              color={type.color}
              onClick={() => alert(`Clicked ${type.label}`)}
            />
          ))}
        </div>
      </section>

      <section>
        <h3 className="text-sm font-semibold mb-2">Selected State</h3>
        <div className="border border-gray-200 rounded p-2 bg-white space-y-1">
          <TypeNoteSidebarTypeItem
            icon={FileText}
            label="Notes"
            count={42}
            color={DEMO_TYPE_COLORS.notes}
            selected
          />
          <TypeNoteSidebarTypeItem
            icon={CheckSquare}
            label="Tasks"
            count={18}
            color={DEMO_TYPE_COLORS.tasks}
          />
        </div>
      </section>

      <section>
        <h3 className="text-sm font-semibold mb-2">Edge Cases</h3>
        <div className="border border-gray-200 rounded p-2 bg-white space-y-1">
          <TypeNoteSidebarTypeItem
            icon={FileText}
            label="This is a very long type name that should truncate nicely"
            count={999}
            color={DEMO_TYPE_COLORS.notes}
          />
          <TypeNoteSidebarTypeItem icon={FileText} label="Zero Count" count={0} />
        </div>
      </section>
    </div>
  </WithSidebarContext>
);
TypeItem.meta = {
  description: 'Type item with icon, label, count (revealed on hover), and optional color',
};

export const TypeItemWithActions: Story = () => (
  <WithSidebarContext>
    <div className="space-y-4 max-w-sm">
      <h3 className="text-sm font-semibold mb-2">Type Items with Dropdown Actions</h3>
      <div className="border border-gray-200 rounded p-2 bg-white space-y-1">
        <TypeNoteSidebarTypeItem
          icon={FileText}
          label="Notes"
          count={42}
          color={DEMO_TYPE_COLORS.notes}
          actions={
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="h-6 w-6 p-0 hover:bg-gray-200"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreHorizontal className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={() => alert('Edit Notes')}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit Type
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive" onSelect={() => alert('Delete Notes')}>
                  <Trash className="mr-2 h-4 w-4" />
                  Delete Type
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          }
        />
        <TypeNoteSidebarTypeItem
          icon={CheckSquare}
          label="Tasks"
          count={18}
          color={DEMO_TYPE_COLORS.tasks}
          // No actions - shows item without menu
        />
      </div>
      <p className="text-xs text-muted-foreground">
        Hover over items to reveal count and actions (if provided)
      </p>
    </div>
  </WithSidebarContext>
);
TypeItemWithActions.meta = {
  description: 'Type items can have optional action menus revealed on hover',
};

// ============================================================================
// NewTypeButton Stories
// ============================================================================

export const NewTypeButton: Story = () => (
  <WithSidebarContext>
    <div className="max-w-sm">
      <h3 className="text-sm font-semibold mb-2">New Type Button</h3>
      <div className="border border-gray-200 rounded p-2 bg-white">
        <TypeNoteSidebarNewTypeButton onClick={() => alert('Create new type')} />
      </div>
    </div>
  </WithSidebarContext>
);
NewTypeButton.meta = {
  description: 'Button to create a new object type',
};

// ============================================================================
// ActionButton Stories
// ============================================================================

export const ActionButton: Story = () => (
  <WithSidebarContext>
    <div className="space-y-6 max-w-sm">
      <section>
        <h3 className="text-sm font-semibold mb-2">Default Action Buttons</h3>
        <div className="border border-gray-200 rounded p-2 bg-white space-y-1">
          <TypeNoteSidebarActionButton
            icon={Archive}
            label="Archive"
            onClick={() => alert('Archive clicked')}
          />
          <TypeNoteSidebarActionButton
            icon={Settings}
            label="Settings"
            onClick={() => alert('Settings clicked')}
          />
        </div>
      </section>

      <section>
        <h3 className="text-sm font-semibold mb-2">With Divider</h3>
        <div className="border border-gray-200 rounded p-2 bg-white">
          <TypeNoteSidebarActionButton
            icon={Settings}
            label="Settings"
            onClick={() => alert('Settings clicked')}
            withDivider
          />
        </div>
      </section>
    </div>
  </WithSidebarContext>
);
ActionButton.meta = {
  description: 'Action buttons for sidebar footer (Archive, Settings, etc.)',
};

// ============================================================================
// Interactive Demo
// ============================================================================

export const InteractiveDemo: Story = () => {
  const [selectedType, setSelectedType] = React.useState<string>('1');

  return (
    <WithSidebarContext>
      <div className="max-w-sm space-y-4">
        <h3 className="text-sm font-semibold">Interactive Type Selection</h3>
        <div className="border border-gray-200 rounded bg-white">
          <div className="p-2 space-y-2">
            <TypeNoteSidebarSearchTrigger onClick={() => alert('Open search')} />
            <TypeNoteSidebarCalendarButton onClick={() => alert('Go to today')} isToday />
          </div>
          <div className="border-t p-2 space-y-1">
            {MOCK_TYPES.map((type) => (
              <TypeNoteSidebarTypeItem
                key={type.id}
                icon={type.icon}
                label={type.label}
                count={type.count}
                color={type.color}
                selected={selectedType === type.id}
                onClick={() => setSelectedType(type.id)}
              />
            ))}
            <TypeNoteSidebarNewTypeButton onClick={() => alert('Create type')} />
          </div>
          <div className="border-t p-2 space-y-1">
            <TypeNoteSidebarActionButton
              icon={Archive}
              label="Archive"
              onClick={() => alert('Archive')}
            />
            <TypeNoteSidebarActionButton
              icon={Settings}
              label="Settings"
              onClick={() => alert('Settings')}
            />
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          Selected: {MOCK_TYPES.find((t) => t.id === selectedType)?.label}
        </p>
      </div>
    </WithSidebarContext>
  );
};
InteractiveDemo.meta = {
  description: 'Full interactive demo showing all TypeNoteSidebar components working together',
};
