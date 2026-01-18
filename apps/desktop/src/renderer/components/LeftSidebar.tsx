import type { ReactElement } from 'react';
import { Settings, Archive, MoreHorizontal, Pencil, Trash } from 'lucide-react';
import {
  // shadcn Sidebar primitives
  SidebarProvider,
  ShadcnSidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  // TypeNote-specific components
  TypeNoteSidebarSearchTrigger,
  TypeNoteSidebarCalendarButton,
  TypeNoteSidebarTypeItem,
  TypeNoteSidebarNewTypeButton,
  TypeNoteSidebarActionButton,
  // Legacy components (for pinned section until migrated)
  SidebarPinnedSection,
  // Common components
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
    <SidebarProvider defaultOpen={!collapsed}>
      <ShadcnSidebar hasTitleBarPadding className="app-region-drag">
        {/* Header: Search + Calendar */}
        <SidebarHeader className="space-y-2 app-region-no-drag">
          <TypeNoteSidebarSearchTrigger onClick={onOpenCommandPalette} />
          <TypeNoteSidebarCalendarButton onClick={onCreateDailyNote} isToday={false} />
        </SidebarHeader>

        <SidebarContent className="app-region-no-drag">
          {/* Types section */}
          {typeMetadata.length > 0 && (
            <SidebarGroup>
              <SidebarGroupLabel>Types</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {typeMetadata
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map((type) => (
                      <TypeNoteSidebarTypeItem
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
                                  className="h-6 w-6 p-0 hover:bg-secondary"
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
                  <TypeNoteSidebarNewTypeButton onClick={onCreateType} />
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )}

          {/* Pinned section - using legacy component for drag-drop support */}
          {pinnedObjects.length > 0 && (
            <SidebarGroup>
              <SidebarGroupLabel>Pinned</SidebarGroupLabel>
              <SidebarGroupContent>
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
              </SidebarGroupContent>
            </SidebarGroup>
          )}
        </SidebarContent>

        {/* Footer: Archive + Settings */}
        <SidebarFooter className="app-region-no-drag">
          <SidebarMenu>
            <TypeNoteSidebarActionButton
              icon={Archive}
              label="Archive"
              onClick={onOpenArchive}
              withDivider
            />
            <TypeNoteSidebarActionButton
              icon={Settings}
              label="Settings"
              onClick={onOpenSettings}
            />
          </SidebarMenu>
        </SidebarFooter>
      </ShadcnSidebar>
    </SidebarProvider>
  );
}
