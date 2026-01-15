/// <reference path="./global.d.ts" />

import { useState } from 'react';
import type { ReactElement } from 'react';
import { ObjectList } from './components/ObjectList.js';
import { NoteEditor } from './components/NoteEditor.js';
import { CalendarView } from './components/calendar/index.js';
import { Button, SidebarPinnedSection } from '@typenote/design-system';
import { Toaster } from './components/ui/sonner.js';
import { CommandPalette } from './components/CommandPalette/index.js';
import { useCommandPalette } from './hooks/useCommandPalette.js';
import { usePinnedObjects } from './hooks/usePinnedObjects.js';

type ViewMode = 'notes' | 'calendar';

function App(): ReactElement {
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('notes');
  const { isOpen, close } = useCommandPalette();
  const { pinnedObjects, reorderPinnedObjects, unpinObject, isPinned, pinObject } =
    usePinnedObjects();

  const handleCreateDailyNote = async () => {
    const result = await window.typenoteAPI.getOrCreateTodayDailyNote();
    if (result.success) {
      // Select the newly created/retrieved daily note
      setSelectedObjectId(result.result.dailyNote.id);
    }
  };

  return (
    <>
      <div className="flex h-screen">
        {/* Sidebar */}
        <aside className="w-64 border-r bg-muted/30 flex flex-col">
          <div className="p-4 border-b">
            <h1 className="font-semibold">TypeNote</h1>
          </div>
          <div className="p-2 space-y-1">
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start"
              onClick={() => void handleCreateDailyNote()}
              data-testid="create-daily-note-button"
            >
              + Today's Note
            </Button>
            <Button
              variant={viewMode === 'notes' ? 'secondary' : 'ghost'}
              size="sm"
              className="w-full justify-start"
              onClick={() => setViewMode('notes')}
              data-testid="notes-button"
            >
              Notes
            </Button>
            <Button
              variant={viewMode === 'calendar' ? 'secondary' : 'ghost'}
              size="sm"
              className="w-full justify-start"
              onClick={() => setViewMode('calendar')}
              data-testid="calendar-button"
            >
              Calendar
            </Button>
          </div>
          <div className="flex-1 overflow-hidden flex flex-col">
            {pinnedObjects.length > 0 && (
              <div className="px-2 py-1 border-b">
                <div className="text-xs font-medium text-gray-500 px-3 mb-1">Pinned</div>
                <SidebarPinnedSection
                  items={pinnedObjects.map((p) => ({
                    id: p.id,
                    title: p.title,
                    typeKey: p.typeKey,
                  }))}
                  onReorder={reorderPinnedObjects}
                  onSelect={setSelectedObjectId}
                  selectedId={selectedObjectId}
                />
              </div>
            )}
            <div className="flex-1 overflow-hidden">
              <ObjectList
                onSelect={setSelectedObjectId}
                selectedId={selectedObjectId}
                onPin={pinObject}
                onUnpin={unpinObject}
                isPinned={isPinned}
              />
            </div>
          </div>
        </aside>

        {/* Main content area */}
        <main className="flex-1">
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
        </main>
      </div>
      <Toaster />
      <CommandPalette isOpen={isOpen} onClose={close} onNavigate={setSelectedObjectId} />
    </>
  );
}

export default App;
