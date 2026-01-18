import { Outlet } from 'react-router-dom';

/**
 * Root layout placeholder while design system is being rebuilt.
 * Will be updated with AppShell and Sidebar once components are ready.
 */
export function RootLayout() {
  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar placeholder */}
      <aside className="w-56 border-r border-border bg-surface p-4">
        <div className="text-sm font-semibold text-foreground mb-4">TypeNote</div>
        <p className="text-xs text-muted-foreground">Sidebar will be rebuilt in design system</p>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
