import * as React from 'react';
import { cn } from '../../lib/utils.js';

export interface AppShellProps {
  /** Left sidebar content */
  sidebar?: React.ReactNode;
  /** Right panel content (e.g., properties panel) */
  rightPanel?: React.ReactNode;
  /** Main content area */
  children: React.ReactNode;
  /** Whether left sidebar is collapsed */
  sidebarCollapsed?: boolean;
  /** Whether right panel is collapsed */
  rightPanelCollapsed?: boolean;
  /** Additional className */
  className?: string;
}

/**
 * Three-column layout shell for the application.
 *
 * Provides:
 * - Fixed-width left sidebar (256px, collapses to 0)
 * - Flexible main content area
 * - Fixed-width right panel (320px, collapses to 0)
 *
 * @example
 * <AppShell
 *   sidebar={<Sidebar />}
 *   rightPanel={<PropertiesPanel />}
 *   sidebarCollapsed={false}
 *   rightPanelCollapsed={true}
 * >
 *   <MainContent />
 * </AppShell>
 */
export function AppShell({
  sidebar,
  rightPanel,
  children,
  sidebarCollapsed = false,
  rightPanelCollapsed = true,
  className,
}: AppShellProps) {
  return (
    <div className={cn('flex h-screen w-full overflow-hidden bg-background', className)}>
      {/* Left Sidebar */}
      {sidebar && (
        <aside
          className={cn(
            'h-full flex-shrink-0 border-r border-border bg-sidebar transition-[width] duration-200 ease-out overflow-hidden',
            sidebarCollapsed ? 'w-0' : 'w-64'
          )}
        >
          <div className="h-full w-64">{sidebar}</div>
        </aside>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">{children}</main>

      {/* Right Panel */}
      {rightPanel && (
        <aside
          className={cn(
            'h-full flex-shrink-0 border-l border-border bg-background transition-[width] duration-200 ease-out overflow-hidden',
            rightPanelCollapsed ? 'w-0' : 'w-80'
          )}
        >
          <div className="h-full w-80">{rightPanel}</div>
        </aside>
      )}
    </div>
  );
}
