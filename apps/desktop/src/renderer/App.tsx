/// <reference path="./global.d.ts" />

import { useState } from 'react';
import type { ReactElement } from 'react';
import { AppShell, Toaster, ScrollArea } from '@typenote/design-system';
import { DocumentEditor } from './components/DocumentEditor.js';
import { DailyNoteLayout } from './components/DailyNoteLayout.js';
import { CalendarView } from './components/calendar/index.js';
import { TypeBrowserView } from './components/TypeBrowserView.js';
import { LeftSidebar } from './components/LeftSidebar.js';
import { PropertiesPanel } from './components/PropertiesPanel.js';
import { SettingsModalWrapper } from './components/SettingsModalWrapper.js';
import { TagPickerModal } from './components/TagPickerModal.js';
import { TypeSettingsModal } from './components/TypeSettingsModal.js';
import { CommandPalette } from './components/CommandPalette/index.js';
import { useCommandPalette } from './hooks/useCommandPalette.js';
import { usePinnedObjects } from './hooks/usePinnedObjects.js';
import { useTypeMetadata } from './hooks/useTypeMetadata.js';
import { useSelectedObject } from './hooks/useSelectedObject.js';

type ViewMode = 'notes' | 'calendar' | 'type';

function App(): ReactElement {
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);
  const [selectedTypeKey, setSelectedTypeKey] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('notes');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [tagPickerOpen, setTagPickerOpen] = useState(false);
  const [typeSettingsOpen, setTypeSettingsOpen] = useState(false);
  const [editingTypeId, setEditingTypeId] = useState<string | null>(null);

  // Hooks
  const { isOpen, close, open } = useCommandPalette();
  const { pinnedObjects, reorderPinnedObjects } = usePinnedObjects();
  const { types: typeMetadata, refetch: refetchTypes } = useTypeMetadata();
  const { object: selectedObject, refetch: refetchSelectedObject } =
    useSelectedObject(selectedObjectId);

  const handleCreateDailyNote = async () => {
    const result = await window.typenoteAPI.getOrCreateTodayDailyNote();
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

  const handleNavigateToDailyNote = async (dateKey: string) => {
    const result = await window.typenoteAPI.getOrCreateDailyNoteByDate(dateKey);
    if (result.success) {
      setSelectedObjectId(result.result.dailyNote.id);
      setViewMode('notes');
    }
  };

  const handleCreateType = () => {
    setEditingTypeId(null);
    setTypeSettingsOpen(true);
  };

  const handleEditType = (typeId: string) => {
    setEditingTypeId(typeId);
    setTypeSettingsOpen(true);
  };

  const handleDeleteType = async (typeId: string) => {
    const type = typeMetadata.find((t) => t.id === typeId);
    if (!type) return;

    const confirmed = confirm(`Delete type "${type.name}"? This action cannot be undone.`);
    if (!confirmed) return;

    const result = await window.typenoteAPI.deleteObjectType(typeId);
    if (result.success) {
      refetchTypes();
      // If viewing this type, switch to notes view
      if (viewMode === 'type' && selectedTypeKey === type.key) {
        setViewMode('notes');
        setSelectedTypeKey(null);
      }
    } else {
      alert(`Failed to delete type: ${result.error.message}`);
    }
  };

  const handleOpenArchive = () => {
    alert('Archive view not yet implemented. Will show soft-deleted objects that can be restored.');
  };

  // Show right sidebar only when viewing a note (but not for Daily Notes)
  const isDailyNote = selectedObject?.typeKey === 'DailyNote';
  const showRightSidebar = viewMode === 'notes' && selectedObjectId !== null && !isDailyNote;

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
            typeMetadata={typeMetadata}
            onOpenSettings={() => setSettingsOpen(true)}
            selectedTypeKey={selectedTypeKey}
            onSelectType={handleSelectType}
            onCreateType={handleCreateType}
            onEditType={handleEditType}
            onDeleteType={(typeId) => void handleDeleteType(typeId)}
            onOpenArchive={handleOpenArchive}
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
        ) : selectedObjectId && isDailyNote ? (
          <DailyNoteLayout
            dateKey={(selectedObject?.properties?.['date_key'] as string) ?? ''}
            onNavigateToDate={(dateKey) => void handleNavigateToDailyNote(dateKey)}
            onNavigateToObject={setSelectedObjectId}
          >
            <DocumentEditor objectId={selectedObjectId} onNavigate={setSelectedObjectId} />
          </DailyNoteLayout>
        ) : selectedObjectId ? (
          <ScrollArea className="h-full">
            <DocumentEditor objectId={selectedObjectId} onNavigate={setSelectedObjectId} />
          </ScrollArea>
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
      <TypeSettingsModal
        open={typeSettingsOpen}
        onClose={() => setTypeSettingsOpen(false)}
        typeId={editingTypeId}
        mode={editingTypeId ? 'edit' : 'create'}
        onSuccess={refetchTypes}
      />
    </>
  );
}

export default App;
