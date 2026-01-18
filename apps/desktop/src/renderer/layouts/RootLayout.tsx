import { Outlet, useNavigate, useParams, useLocation } from 'react-router-dom';
import { AppShell, Sidebar, SidebarSection, SidebarItem } from '@typenote/design-system';
import { useTypeCounts } from '../hooks/useTypeCounts.js';
import { FileText, Calendar, Settings } from 'lucide-react';

/**
 * Root layout that provides the AppShell with sidebar navigation.
 * All routes render inside the <Outlet />.
 */
export function RootLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { typeKey } = useParams<{ typeKey?: string }>();
  const { data: typeCounts, isLoading } = useTypeCounts();

  // Determine active route
  const isNotesActive = location.pathname.startsWith('/notes');
  const isCalendarActive = location.pathname === '/calendar';

  return (
    <AppShell
      sidebar={
        <Sidebar
          header={
            <div className="px-2 py-1">
              <span className="text-sm font-semibold text-foreground">TypeNote</span>
            </div>
          }
          footer={
            <SidebarItem
              icon={<Settings className="h-4 w-4" />}
              label="Settings"
              onClick={() => {
                // Settings will open a modal in Phase 5
              }}
            />
          }
        >
          {/* Quick Access */}
          <SidebarSection>
            <SidebarItem
              icon={<FileText className="h-4 w-4" />}
              label="All Notes"
              active={isNotesActive && !typeKey}
              onClick={() => navigate('/notes')}
            />
            <SidebarItem
              icon={<Calendar className="h-4 w-4" />}
              label="Calendar"
              active={isCalendarActive}
              onClick={() => navigate('/calendar')}
            />
          </SidebarSection>

          {/* Types */}
          <SidebarSection title="Types">
            {isLoading ? (
              <div className="px-2 py-1 text-xs text-muted-foreground">Loading...</div>
            ) : typeCounts && typeCounts.length > 0 ? (
              typeCounts.map((type) => (
                <SidebarItem
                  key={type.typeKey}
                  label={type.typeName}
                  count={type.count}
                  active={typeKey === type.typeKey}
                  onClick={() => navigate(`/types/${type.typeKey}`)}
                />
              ))
            ) : (
              <div className="px-2 py-1 text-xs text-muted-foreground">No types yet</div>
            )}
          </SidebarSection>
        </Sidebar>
      }
      sidebarCollapsed={false}
      rightPanelCollapsed={true}
    >
      <Outlet />
    </AppShell>
  );
}
