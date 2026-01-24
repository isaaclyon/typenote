import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation, useParams } from 'react-router-dom';
import {
  AppShell,
  SidebarHeader,
  SidebarSection,
  SidebarItem,
  SidebarFooter,
  CommandPalette,
  PlaceholderAction,
} from '@typenote/design-system';
import { File } from '@phosphor-icons/react/dist/ssr/File';
import { FileText } from '@phosphor-icons/react/dist/ssr/FileText';
import { Calendar } from '@phosphor-icons/react/dist/ssr/Calendar';
import { CalendarDot } from '@phosphor-icons/react/dist/ssr/CalendarDot';
import { User } from '@phosphor-icons/react/dist/ssr/User';
import { MapPin } from '@phosphor-icons/react/dist/ssr/MapPin';
import { CheckSquare } from '@phosphor-icons/react/dist/ssr/CheckSquare';
import { Gear } from '@phosphor-icons/react/dist/ssr/Gear';
import { PushPin } from '@phosphor-icons/react/dist/ssr/PushPin';
import { Archive } from '@phosphor-icons/react/dist/ssr/Archive';
import { Moon } from '@phosphor-icons/react/dist/ssr/Moon';
import { Plus } from '@phosphor-icons/react/dist/ssr/Plus';
import { useSidebarData } from '../hooks/useSidebarData.js';
import { useCommandPalette } from '../hooks/useCommandPalette.js';
import { useCreateObject } from '../hooks/useCreateObject.js';

/** Map type icon names to Phosphor icons */
function getTypeIcon(iconName: string | null): typeof File {
  switch (iconName) {
    case 'calendar':
      return Calendar;
    case 'calendar-clock':
      return CalendarDot;
    case 'file-text':
      return FileText;
    case 'user':
      return User;
    case 'map-pin':
      return MapPin;
    case 'check-square':
      return CheckSquare;
    default:
      return File;
  }
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
  const activeTypeKey = typeKey ?? (location.pathname.startsWith('/notes') ? 'Page' : null);

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
    await createObject('Page', 'Untitled', {});
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
        newLoading={isCreating}
        onSearchClick={handleSearchClick}
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
        <PlaceholderAction
          icon={Plus}
          label="Add new type"
          onClick={() => console.log('Add type')}
          collapsed={collapsed}
        />
      </SidebarSection>

      <SidebarFooter
        actions={[
          {
            icon: Archive,
            label: 'Archive',
            onClick: () => console.log('Archive clicked'),
          },
          {
            icon: Moon,
            label: 'Dark mode',
            onClick: () => console.log('Dark mode clicked'),
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
