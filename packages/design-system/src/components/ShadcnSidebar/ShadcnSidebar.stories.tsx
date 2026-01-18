import * as React from 'react';
import type { Story } from '@ladle/react';
import {
  FileText,
  CheckSquare,
  User,
  Folder,
  BookOpen,
  Archive,
  Settings,
  MoreHorizontal,
  Pencil,
  Trash,
} from 'lucide-react';
import { DEMO_TYPE_COLORS } from '../../constants/demoColors.js';
import {
  SidebarProvider,
  useSidebar,
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarRail,
  SidebarTrigger,
  SidebarInset,
} from './index.js';
import { Skeleton } from '../Skeleton/index.js';
import { EmptyState } from '../EmptyState/index.js';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  Button,
} from '../index.js';
import {
  TypeNoteSidebarSearchTrigger,
  TypeNoteSidebarCalendarButton,
  TypeNoteSidebarTypeItem,
  TypeNoteSidebarNewTypeButton,
  TypeNoteSidebarActionButton,
} from '../TypeNoteSidebar/index.js';

export default {
  title: 'Components/ShadcnSidebar',
};

// ============================================================================
// MOCK DATA (same as existing Sidebar stories)
// ============================================================================

const MOCK_TYPES = [
  { id: '1', icon: FileText, label: 'Notes', count: 42, color: DEMO_TYPE_COLORS.notes },
  { id: '2', icon: CheckSquare, label: 'Tasks', count: 18, color: DEMO_TYPE_COLORS.tasks },
  { id: '3', icon: User, label: 'People', count: 7, color: DEMO_TYPE_COLORS.events },
  { id: '4', icon: Folder, label: 'Projects', count: 5, color: DEMO_TYPE_COLORS.projects },
  { id: '5', icon: BookOpen, label: 'Resources', count: 23, color: DEMO_TYPE_COLORS.resources },
];

const MOCK_MANY_TYPES = Array.from({ length: 25 }, (_, i) => ({
  id: `type-${i}`,
  icon: FileText,
  label: `Type ${i + 1}`,
  count: Math.floor(Math.random() * 100),
  color: DEMO_TYPE_COLORS.notes,
}));

// ============================================================================
// WRAPPER
// ============================================================================

const StoryWrapper = ({ children }: { children: React.ReactNode }) => (
  <div className="h-[600px] w-full border border-gray-200 rounded-lg overflow-hidden">
    {children}
  </div>
);

// ============================================================================
// STORIES (matching existing Sidebar stories 1:1)
// ============================================================================

export const AllVariants: Story = () => (
  <div className="flex gap-8">
    <section>
      <h2 className="text-lg font-semibold mb-4">Full Sidebar (ShadcnSidebar)</h2>
      <StoryWrapper>
        <SidebarProvider>
          <Sidebar>
            <SidebarHeader className="space-y-2">
              <TypeNoteSidebarSearchTrigger onClick={() => alert('Open search')} />
              <TypeNoteSidebarCalendarButton onClick={() => alert('Open today')} isToday />
            </SidebarHeader>

            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupLabel>Types</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {MOCK_TYPES.map((type) => (
                      <TypeNoteSidebarTypeItem
                        key={type.id}
                        icon={type.icon}
                        label={type.label}
                        count={type.count}
                        color={type.color}
                        selected={type.id === '1'}
                      />
                    ))}
                    <TypeNoteSidebarNewTypeButton onClick={() => alert('Create type')} />
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>

            <SidebarFooter>
              <SidebarMenu>
                <TypeNoteSidebarActionButton
                  icon={Settings}
                  label="Settings"
                  onClick={() => alert('Settings')}
                  withDivider
                />
                <TypeNoteSidebarActionButton
                  icon={Archive}
                  label="Archive"
                  onClick={() => alert('Archive')}
                />
              </SidebarMenu>
            </SidebarFooter>
          </Sidebar>
          <SidebarInset>
            <div className="p-4">
              <p className="text-muted-foreground">
                Press <kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">⌘B</kbd> to toggle
              </p>
            </div>
          </SidebarInset>
        </SidebarProvider>
      </StoryWrapper>
    </section>

    <section>
      <h2 className="text-lg font-semibold mb-4">Type Item States</h2>
      <div className="border border-gray-200 rounded p-4 bg-white space-y-2">
        <div>
          <p className="text-xs text-gray-500 mb-2">Default</p>
          <TypeNoteSidebarTypeItem
            icon={FileText}
            label="Notes"
            count={42}
            color={DEMO_TYPE_COLORS.notes}
          />
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-2">Selected</p>
          <TypeNoteSidebarTypeItem
            icon={FileText}
            label="Notes"
            count={42}
            color={DEMO_TYPE_COLORS.notes}
            selected
          />
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-2">Long Label</p>
          <TypeNoteSidebarTypeItem
            icon={FileText}
            label="This is a very long type name that should truncate"
            count={999}
            color={DEMO_TYPE_COLORS.notes}
          />
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-2">Zero Count</p>
          <TypeNoteSidebarTypeItem
            icon={FileText}
            label="Empty Type"
            count={0}
            color={DEMO_TYPE_COLORS.notes}
          />
        </div>
      </div>
    </section>
  </div>
);

export const Default: Story = () => (
  <StoryWrapper>
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="space-y-2">
          <TypeNoteSidebarSearchTrigger onClick={() => alert('Open search')} />
          <TypeNoteSidebarCalendarButton onClick={() => alert('Open today')} />
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Types</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
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
                <TypeNoteSidebarNewTypeButton onClick={() => alert('Create type')} />
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter>
          <SidebarMenu>
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
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <div className="p-4">Main content area</div>
      </SidebarInset>
    </SidebarProvider>
  </StoryWrapper>
);

export const Interactive: Story = () => {
  const [selectedType, setSelectedType] = React.useState<string>('1');

  return (
    <StoryWrapper>
      <SidebarProvider>
        <Sidebar>
          <SidebarHeader className="space-y-2">
            <TypeNoteSidebarSearchTrigger onClick={() => alert('Open search')} />
            <TypeNoteSidebarCalendarButton onClick={() => alert('Open today')} isToday />
          </SidebarHeader>

          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Types</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
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
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter>
            <SidebarMenu>
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
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>
        <SidebarInset>
          <div className="p-4">
            <p>Selected type: {MOCK_TYPES.find((t) => t.id === selectedType)?.label}</p>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </StoryWrapper>
  );
};

export const WithManyItems: Story = () => {
  const [selectedType, setSelectedType] = React.useState<string>('type-0');

  return (
    <StoryWrapper>
      <SidebarProvider>
        <Sidebar>
          <SidebarHeader className="space-y-2">
            <TypeNoteSidebarSearchTrigger onClick={() => alert('Open search')} />
            <TypeNoteSidebarCalendarButton onClick={() => alert('Open today')} />
          </SidebarHeader>

          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Types</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {MOCK_MANY_TYPES.map((type) => (
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
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter>
            <SidebarMenu>
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
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>
        <SidebarInset>
          <div className="p-4">Scroll the types list</div>
        </SidebarInset>
      </SidebarProvider>
    </StoryWrapper>
  );
};

export const Empty: Story = () => (
  <StoryWrapper>
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="space-y-2">
          <TypeNoteSidebarSearchTrigger onClick={() => alert('Open search')} />
          <TypeNoteSidebarCalendarButton onClick={() => alert('Open today')} />
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Types</SidebarGroupLabel>
            <SidebarGroupContent>
              <div className="p-4">
                <EmptyState
                  title="No types yet"
                  description="Create your first type to get started"
                />
              </div>
              <SidebarMenu>
                <TypeNoteSidebarNewTypeButton onClick={() => alert('Create type')} />
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter>
          <SidebarMenu>
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
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <div className="p-4">Empty state</div>
      </SidebarInset>
    </SidebarProvider>
  </StoryWrapper>
);

export const Loading: Story = () => (
  <StoryWrapper>
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="space-y-2">
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-full" />
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Types</SidebarGroupLabel>
            <SidebarGroupContent>
              <div className="space-y-2 px-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-7 w-full" />
                ))}
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter>
          <div className="space-y-1">
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
          </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <div className="p-4">Loading state</div>
      </SidebarInset>
    </SidebarProvider>
  </StoryWrapper>
);

export const TypeItemWithActions: Story = () => (
  <div className="space-y-4 max-w-md">
    <section>
      <h3 className="text-sm font-semibold mb-4">Type Items with Action Menus</h3>
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
                <DropdownMenuItem
                  onSelect={(e) => {
                    e.preventDefault();
                    alert('Edit Notes type');
                  }}
                >
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit Type
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  onSelect={(e) => {
                    e.preventDefault();
                    alert('Delete Notes type');
                  }}
                >
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
                <DropdownMenuItem
                  onSelect={(e) => {
                    e.preventDefault();
                    alert('Edit Tasks type');
                  }}
                >
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit Type
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  onSelect={(e) => {
                    e.preventDefault();
                    alert('Delete Tasks type');
                  }}
                >
                  <Trash className="mr-2 h-4 w-4" />
                  Delete Type
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          }
        />
        <TypeNoteSidebarTypeItem
          icon={User}
          label="People"
          count={7}
          color={DEMO_TYPE_COLORS.events}
          // No actions prop - shows item without menu
        />
      </div>
    </section>
  </div>
);

TypeItemWithActions.storyName = 'Type Items with Actions';

/**
 * Side-by-side comparison with the legacy Sidebar.
 */
export const WithCollapsibleTrigger: Story = () => (
  <StoryWrapper>
    <SidebarProvider defaultOpen={true}>
      <Sidebar>
        <SidebarHeader className="space-y-2">
          <TypeNoteSidebarSearchTrigger onClick={() => alert('Open search')} />
          <TypeNoteSidebarCalendarButton onClick={() => alert('Open today')} isToday />
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Types</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {MOCK_TYPES.map((type) => (
                  <TypeNoteSidebarTypeItem
                    key={type.id}
                    icon={type.icon}
                    label={type.label}
                    count={type.count}
                    color={type.color}
                  />
                ))}
                <TypeNoteSidebarNewTypeButton onClick={() => alert('Create type')} />
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter>
          <SidebarMenu>
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
          </SidebarMenu>
        </SidebarFooter>

        <SidebarRail />
      </Sidebar>
      <SidebarInset>
        <div className="border-b p-2 flex items-center gap-2">
          <SidebarTrigger />
          <span className="text-sm font-medium">TypeNote</span>
        </div>
        <div className="p-4">
          <h1 className="text-xl font-semibold mb-2">Collapsible Sidebar Demo</h1>
          <p className="text-muted-foreground">
            Use the rail (edge of sidebar), trigger button, or ⌘B to toggle.
          </p>
        </div>
      </SidebarInset>
    </SidebarProvider>
  </StoryWrapper>
);

/**
 * Shows the useSidebar hook state values.
 */
export const StateDisplay: Story = () => {
  const StateInfo = () => {
    const { state, open, isMobile } = useSidebar();
    return (
      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">State:</span>
          <span
            className={`px-2 py-0.5 rounded text-xs font-medium ${state === 'expanded' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}
          >
            {state}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">Open:</span>
          <span>{String(open)}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">Mobile:</span>
          <span>{String(isMobile)}</span>
        </div>
      </div>
    );
  };

  return (
    <StoryWrapper>
      <SidebarProvider storageKey="shadcn-sidebar-state-demo">
        <Sidebar>
          <SidebarHeader className="space-y-2">
            <TypeNoteSidebarSearchTrigger onClick={() => alert('Open search')} />
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Types</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {MOCK_TYPES.slice(0, 3).map((type) => (
                    <TypeNoteSidebarTypeItem
                      key={type.id}
                      icon={type.icon}
                      label={type.label}
                      count={type.count}
                      color={type.color}
                    />
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarRail />
        </Sidebar>
        <SidebarInset>
          <div className="border-b p-2">
            <SidebarTrigger />
          </div>
          <div className="p-4">
            <h2 className="font-semibold mb-4">Sidebar State</h2>
            <StateInfo />
            <p className="text-muted-foreground mt-4 text-sm">
              State persists to localStorage (refresh to test)
            </p>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </StoryWrapper>
  );
};
