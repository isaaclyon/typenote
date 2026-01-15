/// <reference path="./global.d.ts" />

import { useState } from 'react';
import type { ReactElement } from 'react';
import { AppShell } from '@typenote/design-system';
import { NoteEditor } from './components/NoteEditor.js';
import { CalendarView } from './components/calendar/index.js';
import { TypeBrowserView } from './components/TypeBrowserView.js';
import { LeftSidebar } from './components/LeftSidebar.js';
import { PropertiesPanel } from './components/PropertiesPanel.js';
import { SettingsModalWrapper } from './components/SettingsModalWrapper.js';
import { TagPickerModal } from './components/TagPickerModal.js';
import { Toaster } from './components/ui/sonner.js';
import { CommandPalette } from './components/CommandPalette/index.js';
import { useCommandPalette } from './hooks/useCommandPalette.js';
import { usePinnedObjects } from './hooks/usePinnedObjects.js';
import { useTypeCounts } from './hooks/useTypeCounts.js';
import { useSelectedObject } from './hooks/useSelectedObject.js';

type ViewMode = 'notes' | 'calendar' | 'type';

function App(): ReactElement {
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);
  const [selectedTypeKey, setSelectedTypeKey] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('notes');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [tagPickerOpen, setTagPickerOpen] = useState(false);

  // Hooks
  const { isOpen, close, open } = useCommandPalette();
  const { pinnedObjects, reorderPinnedObjects } = usePinnedObjects();
  const { counts: typeCounts } = useTypeCounts();
  const { object: selectedObject, refetch: refetchSelectedObject } =
    useSelectedObject(selectedObjectId);

  const handleCreateDailyNote = async () => {
    const result = await window.typenoteAPI.getOrCreateTodayDailyNote();
    if (result.success) {
      setSelectedObjectId(result.result.dailyNote.id);
      setViewMode('notes');
    }
  };

  const handleNavigateToDailyNote = async (dateKey: string) => {
    const result = await window.typenoteAPI.getOrCreateDailyNoteByDate(dateKey);
    if (result.success) {
      setSelectedObjectId(result.result.dailyNote.id);
      setViewMode('notes');
    }
  };

  const handleSelectType = (typeKey: string) => {
    setSelectedTypeKey(typeKey);
    setViewMode('type');
  };

  const handleOpenObjectFromTypeBrowser = (objectId: string) => {
    setSelectedObjectId(objectId);
    setViewMode('notes');
  };

  const handleRemoveTag = async (tagId: string) => {
    if (!selectedObjectId) return;
    const result = await window.typenoteAPI.removeTags(selectedObjectId, [tagId]);
    if (result.success) {
      refetchSelectedObject();
    }
  };

  const handleAddTag = async (tagId: string) => {
    if (!selectedObjectId) return;
    const result = await window.typenoteAPI.assignTags(selectedObjectId, [tagId]);
    if (result.success) {
      refetchSelectedObject();
    }
  };

  // Show right sidebar only when viewing a note
  const showRightSidebar = viewMode === 'notes' && selectedObjectId !== null;

  // Conditionally build AppShell props to satisfy exactOptionalPropertyTypes
  const rightSidebarProp = showRightSidebar
    ? {
        rightSidebar: ({ collapsed }: { collapsed: boolean }) => (
          <PropertiesPanel
            collapsed={collapsed}
            object={selectedObject}
            onRemoveTag={(tagId) => void handleRemoveTag(tagId)}
            onAddTagClick={() => setTagPickerOpen(true)}
          />
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
            onOpenCommandPalette={open}
            onCreateDailyNote={() => void handleCreateDailyNote()}
            pinnedObjects={pinnedObjects}
            onReorderPinned={reorderPinnedObjects}
            selectedObjectId={selectedObjectId}
            onSelectObject={setSelectedObjectId}
            typeCounts={typeCounts}
            onOpenSettings={() => setSettingsOpen(true)}
            selectedTypeKey={selectedTypeKey}
            onSelectType={handleSelectType}
            onNavigateToDailyNote={(dateKey) => void handleNavigateToDailyNote(dateKey)}
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
        ) : viewMode === 'type' && selectedTypeKey ? (
          <TypeBrowserView
            typeKey={selectedTypeKey}
            onOpenObject={handleOpenObjectFromTypeBrowser}
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
      <SettingsModalWrapper open={settingsOpen} onClose={() => setSettingsOpen(false)} />
      <TagPickerModal
        open={tagPickerOpen}
        onClose={() => setTagPickerOpen(false)}
        existingTagIds={selectedObject?.tags.map((t) => t.id) ?? []}
        onSelectTag={(tagId) => void handleAddTag(tagId)}
      />
    </>
  );
}

export default App;
