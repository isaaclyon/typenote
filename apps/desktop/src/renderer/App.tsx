/// <reference path="./global.d.ts" />

import { useState } from 'react';
import type { ReactElement } from 'react';
import { AppShell } from '@typenote/design-system';
import { NoteEditor } from './components/NoteEditor.js';
import { CalendarView } from './components/calendar/index.js';
import { LeftSidebar } from './components/LeftSidebar.js';
import { PropertiesPanel } from './components/PropertiesPanel.js';
import { Toaster } from './components/ui/sonner.js';
import { CommandPalette } from './components/CommandPalette/index.js';
import { useCommandPalette } from './hooks/useCommandPalette.js';
import { usePinnedObjects } from './hooks/usePinnedObjects.js';
import { useTypeCounts } from './hooks/useTypeCounts.js';
import { useSelectedObject } from './hooks/useSelectedObject.js';

type ViewMode = 'notes' | 'calendar';

function App(): ReactElement {
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('notes');

  // Hooks
  const { isOpen, close, open } = useCommandPalette();
  const { pinnedObjects, reorderPinnedObjects } = usePinnedObjects();
  const { counts: typeCounts } = useTypeCounts();
  const { object: selectedObject } = useSelectedObject(selectedObjectId);

  const handleCreateDailyNote = async () => {
    const result = await window.typenoteAPI.getOrCreateTodayDailyNote();
    if (result.success) {
      setSelectedObjectId(result.result.dailyNote.id);
      setViewMode('notes');
    }
  };

  // Show right sidebar only when viewing a note
  const showRightSidebar = viewMode === 'notes' && selectedObjectId !== null;

  // Conditionally build AppShell props to satisfy exactOptionalPropertyTypes
  const rightSidebarProp = showRightSidebar
    ? {
        rightSidebar: ({ collapsed }: { collapsed: boolean }) => (
          <PropertiesPanel collapsed={collapsed} object={selectedObject} />
        ),
      }
    : {};

  return (
    <>
      <AppShell
        leftSidebar={({ collapsed }) => (
          <LeftSidebar
            collapsed={collapsed}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            onOpenCommandPalette={open}
            onCreateDailyNote={() => void handleCreateDailyNote()}
            pinnedObjects={pinnedObjects}
            onReorderPinned={reorderPinnedObjects}
            selectedObjectId={selectedObjectId}
            onSelectObject={setSelectedObjectId}
            typeCounts={typeCounts}
          />
        )}
        {...rightSidebarProp}
        leftSidebarStorageKey="typenote.sidebar.left.collapsed"
        rightSidebarStorageKey="typenote.sidebar.right.collapsed"
        className="h-screen"
      >
        {/* Main content area */}
        {viewMode === 'calendar' ? (
          <CalendarView
            onNavigate={(id) => {
              setSelectedObjectId(id);
              setViewMode('notes');
            }}
          />
        ) : selectedObjectId ? (
          <NoteEditor objectId={selectedObjectId} onNavigate={setSelectedObjectId} />
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            Select an object to view
          </div>
        )}
      </AppShell>

      <Toaster />
      <CommandPalette isOpen={isOpen} onClose={close} onNavigate={setSelectedObjectId} />
    </>
  );
}

export default App;
