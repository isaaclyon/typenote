import { Button } from '@typenote/design-system';

/**
 * Root application component.
 *
 * This is a minimal placeholder that demonstrates the design system
 * is properly integrated. Full routing and features will be added
 * in subsequent phases.
 */
export function App() {
  return (
    <div className="flex h-screen items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-semibold text-foreground">TypeNote</h1>
        <p className="text-muted-foreground">Design system reset complete</p>
        <div className="flex gap-2 justify-center">
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
        </div>
      </div>
    </div>
  );
}
