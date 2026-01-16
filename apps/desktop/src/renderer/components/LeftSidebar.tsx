import type { ReactElement } from 'react';
import { FileText, CheckSquare, Settings, CalendarDays, StickyNote } from 'lucide-react';
import {
  Sidebar,
  SidebarSection,
  SidebarSearchTrigger,
  SidebarTypesList,
  SidebarTypeItem,
  SidebarPinnedSection,
  SidebarActionButton,
  Button,
} from '@typenote/design-system';
import type { PinnedObjectSummary } from '@typenote/storage';

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
  typeCounts: Record<string, number>;
  onOpenSettings: () => void;
  /** Currently selected type key (for TypeBrowser view) */
  selectedTypeKey: string | null;
  /** Called when a type is clicked in the sidebar */
  onSelectType: (typeKey: string) => void;
}

// Map typeKey to icon
const typeIcons: Record<string, typeof FileText> = {
  Page: FileText,
  Task: CheckSquare,
  DailyNote: CalendarDays,
  Note: StickyNote,
};

function getIconForType(typeKey: string): typeof FileText {
  return typeIcons[typeKey] ?? FileText;
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
  typeCounts,
  onOpenSettings,
  selectedTypeKey,
  onSelectType,
}: LeftSidebarProps): ReactElement {
  // Get sorted type keys for consistent display order
  const typeKeys = Object.keys(typeCounts).sort();

  return (
    <Sidebar collapsed={collapsed}>
      {/* Search trigger */}
      <SidebarSearchTrigger onClick={onOpenCommandPalette} />

      {/* Today's Note button */}
      <div className="mt-3 px-2">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start"
          onClick={onCreateDailyNote}
          data-testid="create-daily-note-button"
        >
          <CalendarDays className="w-4 h-4 mr-2" />
          Today's Note
        </Button>
      </div>

      {/* Types section */}
      {typeKeys.length > 0 && (
        <SidebarSection title="Types">
          <SidebarTypesList>
            {typeKeys.map((typeKey) => (
              <SidebarTypeItem
                key={typeKey}
                icon={getIconForType(typeKey)}
                label={typeKey}
                count={typeCounts[typeKey] ?? 0}
                selected={viewMode === 'type' && selectedTypeKey === typeKey}
                onClick={() => onSelectType(typeKey)}
              />
            ))}
          </SidebarTypesList>
        </SidebarSection>
      )}

      {/* Pinned section */}
      {pinnedObjects.length > 0 && (
        <SidebarSection title="Pinned">
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

      {/* Settings - at bottom */}
      <SidebarActionButton icon={Settings} label="Settings" onClick={onOpenSettings} withDivider />
    </Sidebar>
  );
}
