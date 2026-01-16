import type { ReactElement } from 'react';
import { Settings, Archive, MoreHorizontal, Pencil, Trash } from 'lucide-react';
import {
  Sidebar,
  SidebarSection,
  SidebarSearchTrigger,
  SidebarCalendarButton,
  SidebarTypesList,
  SidebarTypeItem,
  SidebarNewTypeButton,
  SidebarPinnedSection,
  SidebarActionButton,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  Button,
} from '@typenote/design-system';
import type { PinnedObjectSummary } from '@typenote/storage';
import { getIconForType } from '../../config/typeMetadata.js';
import { BUILT_IN_TYPE_KEYS } from '@typenote/api';

type ViewMode = 'notes' | 'calendar' | 'type';

interface LeftSidebarProps {
  collapsed: boolean;
  viewMode: ViewMode;
  onOpenCommandPalette: () => void;
  onCreateDailyNote: () => void;
  pinnedObjects: PinnedObjectSummary[];
  onReorderPinned: (ids: string[]) => void;
  selectedObjectId: string | null;
  onSelectObject: (id: string) => void;
  typeMetadata: Array<{
    id: string;
    key: string;
    name: string;
    color: string | null;
    icon: string | null;
    count: number;
  }>;
  onOpenSettings: () => void;
  /** Currently selected type key (for TypeBrowser view) */
  selectedTypeKey: string | null;
  /** Called when a type is clicked in the sidebar */
  onSelectType: (typeKey: string) => void;
  onCreateType: () => void;
  onEditType: (typeId: string) => void;
  onDeleteType: (typeId: string) => void;
  onOpenArchive: () => void;
}

/**
 * Left sidebar component that wraps design-system Sidebar with app-specific content.
 * Includes search trigger, view toggles, type navigation, pinned items, and settings.
 */
export function LeftSidebar({
  collapsed,
  viewMode,
  onOpenCommandPalette,
  onCreateDailyNote,
  pinnedObjects,
  onReorderPinned,
  selectedObjectId,
  onSelectObject,
  typeMetadata,
  onOpenSettings,
  selectedTypeKey,
  onSelectType,
  onCreateType,
  onEditType,
  onDeleteType,
  onOpenArchive,
}: LeftSidebarProps): ReactElement {
  const isBuiltInType = (typeKey: string): boolean => {
    return BUILT_IN_TYPE_KEYS.includes(typeKey as never);
  };

  return (
    <Sidebar collapsed={collapsed} hasTitleBarPadding className="app-region-drag">
      {/* Top section */}
      <SidebarSection className="p-2 space-y-2 app-region-no-drag">
        <SidebarSearchTrigger onClick={onOpenCommandPalette} />
        <SidebarCalendarButton
          onClick={onCreateDailyNote}
          isToday={false}
          data-testid="create-daily-note-button"
        />
      </SidebarSection>

      {/* Types section */}
      {typeMetadata.length > 0 && (
        <SidebarSection title="Types" className="app-region-no-drag">
          <SidebarTypesList>
            {typeMetadata
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((type) => (
                <SidebarTypeItem
                  key={type.key}
                  data-testid={`sidebar-type-${type.key}`}
                  icon={getIconForType(type.key)}
                  label={type.name}
                  count={type.count}
                  {...(type.color ? { color: type.color } : {})}
                  selected={viewMode === 'type' && selectedTypeKey === type.key}
                  onClick={() => onSelectType(type.key)}
                  actions={
                    !isBuiltInType(type.key) ? (
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
                              onEditType(type.id);
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
                              onDeleteType(type.id);
                            }}
                          >
                            <Trash className="mr-2 h-4 w-4" />
                            Delete Type
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    ) : undefined
                  }
                />
              ))}
            <SidebarNewTypeButton onClick={onCreateType} />
          </SidebarTypesList>
        </SidebarSection>
      )}

      {/* Pinned section */}
      {pinnedObjects.length > 0 && (
        <SidebarSection title="Pinned" className="app-region-no-drag">
          <SidebarPinnedSection
            items={pinnedObjects.map((p) => ({
              id: p.id,
              title: p.title,
              typeKey: p.typeKey,
            }))}
            onReorder={onReorderPinned}
            onSelect={onSelectObject}
            selectedId={selectedObjectId}
          />
        </SidebarSection>
      )}

      {/* Spacer */}
      <div className="flex-1" />

      {/* Bottom section */}
      <SidebarSection className="p-2 space-y-1 mt-auto app-region-no-drag">
        <SidebarActionButton icon={Archive} label="Archive" onClick={onOpenArchive} withDivider />
        <SidebarActionButton icon={Settings} label="Settings" onClick={onOpenSettings} />
      </SidebarSection>
    </Sidebar>
  );
}
