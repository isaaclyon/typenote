import { useState } from 'react';
import type { ReactElement } from 'react';
import { ObjectList } from './components/ObjectList.js';
import { NoteEditor } from './components/NoteEditor.js';
import { Button } from './components/ui/button.js';

function App(): ReactElement {
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);

  const handleCreateDailyNote = async () => {
    const result = await window.typenoteAPI.getOrCreateTodayDailyNote();
    if (result.success) {
      // Select the newly created/retrieved daily note
      setSelectedObjectId(result.result.dailyNote.id);
    }
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-muted/30 flex flex-col">
        <div className="p-4 border-b">
          <h1 className="font-semibold">TypeNote</h1>
        </div>
        <div className="p-2">
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start"
            onClick={() => void handleCreateDailyNote()}
          >
            + Today's Note
          </Button>
        </div>
        <div className="flex-1 overflow-hidden">
          <ObjectList onSelect={setSelectedObjectId} selectedId={selectedObjectId} />
        </div>
      </aside>

      {/* Main content area */}
      <main className="flex-1">
        {selectedObjectId ? (
          <NoteEditor objectId={selectedObjectId} />
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            Select an object to view
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
