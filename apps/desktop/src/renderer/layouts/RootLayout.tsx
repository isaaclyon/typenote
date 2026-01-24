import { useState } from 'react';
import { Outlet, useNavigate, useLocation, useParams } from 'react-router-dom';
import {
  AppShell,
  SidebarHeader,
  SidebarSection,
  SidebarItem,
  SidebarFooter,
} from '@typenote/design-system';
import { File } from '@phosphor-icons/react/dist/ssr/File';
import { Calendar } from '@phosphor-icons/react/dist/ssr/Calendar';
import { Gear } from '@phosphor-icons/react/dist/ssr/Gear';
import { PushPin } from '@phosphor-icons/react/dist/ssr/PushPin';
import { Trash } from '@phosphor-icons/react/dist/ssr/Trash';
import { useSidebarData } from '../hooks/useSidebarData.js';

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

  // Determine which route is active
  const isCalendarActive = location.pathname === '/calendar';
  const activeTypeKey = typeKey ?? (location.pathname.startsWith('/notes') ? 'page' : null);

  const handleNewClick = () => {
    // TODO: Open command palette or create new page
    console.log('New clicked');
  };

  const handleSearchClick = () => {
    // TODO: Open command palette
    console.log('Search clicked');
  };

  // Build a map of typeKey -> typeColor for pinned objects
  const typeColorMap = new Map(typeCounts.map((t) => [t.typeKey, t.typeColor]));

  // Render sidebar content
  const sidebarContent = (
    <>
      <SidebarHeader
        onNewClick={handleNewClick}
        newLabel="New"
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
    <AppShell
      sidebarCollapsed={collapsed}
      onSidebarCollapsedChange={setCollapsed}
      sidebarContent={sidebarContent}
    >
      <Outlet />
    </AppShell>
  );
}
