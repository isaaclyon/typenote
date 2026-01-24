import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation, useParams } from 'react-router-dom';
import {
  AppShell,
  SidebarHeader,
  SidebarSection,
  SidebarItem,
  SidebarFooter,
  CommandPalette,
} from '@typenote/design-system';
import { File } from '@phosphor-icons/react/dist/ssr/File';
import { Calendar } from '@phosphor-icons/react/dist/ssr/Calendar';
import { Gear } from '@phosphor-icons/react/dist/ssr/Gear';
import { PushPin } from '@phosphor-icons/react/dist/ssr/PushPin';
import { Trash } from '@phosphor-icons/react/dist/ssr/Trash';
import { useSidebarData } from '../hooks/useSidebarData.js';
import { useCommandPalette } from '../hooks/useCommandPalette.js';
import { useCreateObject } from '../hooks/useCreateObject.js';

/** Map type keys to Phosphor icons */
function getTypeIcon(_iconName: string | null): typeof File {
  // For now, use File as default. Can expand icon mapping later.
  return File;
}

export function RootLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { objectId, typeKey } = useParams();
  const { typeCounts, pinnedObjects, isLoading } = useSidebarData();
  const [collapsed, setCollapsed] = useState(false);
  const commandPalette = useCommandPalette();
  const { createObject, isCreating } = useCreateObject();

  // Determine which route is active
  const isCalendarActive = location.pathname === '/calendar';
  const activeTypeKey = typeKey ?? (location.pathname.startsWith('/notes') ? 'page' : null);

  // Global keyboard shortcut (⌘K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        commandPalette.setIsOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [commandPalette]);

  const handleNewClick = async () => {
    await createObject('page', 'Untitled', {});
  };

  const handleSearchClick = () => {
    commandPalette.setIsOpen(true);
  };

  // Build a map of typeKey -> typeColor for pinned objects
  const typeColorMap = new Map(typeCounts.map((t) => [t.typeKey, t.typeColor]));

  // Render sidebar content
  const sidebarContent = (
    <>
      <SidebarHeader
        onNewClick={handleNewClick}
        newLabel="New"
        newLoading={isCreating}
        onSearchClick={handleSearchClick}
        searchShortcut="⌘K"
      />

      {/* Pinned Objects */}
      {pinnedObjects.length > 0 && (
        <SidebarSection label="Favorites">
          {pinnedObjects.map((pinned) => {
            const iconColor = typeColorMap.get(pinned.typeKey);
            return (
              <SidebarItem
                key={pinned.id}
                icon={PushPin}
                label={pinned.title}
                {...(iconColor != null && { iconColor })}
                active={objectId === pinned.id}
                onClick={() => navigate(`/notes/${pinned.id}`)}
              />
            );
          })}
        </SidebarSection>
      )}

      {/* Object Types */}
      <SidebarSection label="Types">
        {isLoading ? (
          <div className="px-2 py-1 text-xs text-muted-foreground">Loading...</div>
        ) : (
          typeCounts.map((type) => (
            <SidebarItem
              key={type.typeKey}
              icon={getTypeIcon(type.typeIcon)}
              label={type.typeName}
              count={type.count}
              {...(type.typeColor != null && { iconColor: type.typeColor })}
              active={activeTypeKey === type.typeKey}
              onClick={() => navigate(`/types/${type.typeKey}`)}
            />
          ))
        )}
      </SidebarSection>

      {/* Calendar */}
      <SidebarSection>
        <SidebarItem
          icon={Calendar}
          label="Calendar"
          active={isCalendarActive}
          onClick={() => navigate('/calendar')}
        />
      </SidebarSection>

      <SidebarFooter
        actions={[
          {
            icon: Trash,
            label: 'Trash',
            onClick: () => console.log('Trash clicked'),
          },
          {
            icon: Gear,
            label: 'Settings',
            onClick: () => console.log('Settings clicked'),
          },
        ]}
      />
    </>
  );

  return (
    <>
      <AppShell
        sidebarCollapsed={collapsed}
        onSidebarCollapsedChange={setCollapsed}
        sidebarContent={sidebarContent}
      >
        <Outlet />
      </AppShell>

      {/* CommandPalette rendered at root level */}
      <CommandPalette
        open={commandPalette.isOpen}
        onOpenChange={commandPalette.setIsOpen}
        recentItems={commandPalette.recentItems}
        actions={commandPalette.actions}
        searchResults={commandPalette.searchResultsItems}
        searchQuery={commandPalette.searchQuery}
        onSearchChange={commandPalette.handleSearchChange}
        onSelect={commandPalette.handleSelect}
      />
    </>
  );
}
