/**
 * AppLayout Component
 *
 * Main layout component that provides the app shell with sidebars and modals.
 * Uses React Router's Outlet to render child routes in the main content area.
 */

/// <reference path="../global.d.ts" />

import { useState } from 'react';
import type { ReactElement } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { AppShell, Toaster } from '@typenote/design-system';
import { LeftSidebar } from '../components/LeftSidebar.js';
import { PropertiesPanel } from '../components/PropertiesPanel.js';
import { SettingsModalWrapper } from '../components/SettingsModalWrapper.js';
import { TagPickerModal } from '../components/TagPickerModal.js';
import { TypeSettingsModal } from '../components/TypeSettingsModal.js';
import { CommandPalette } from '../components/CommandPalette/index.js';
import { useCommandPalette } from '../hooks/useCommandPalette.js';
import { usePinnedObjects } from '../hooks/usePinnedObjects.js';
import { useTypeMetadata } from '../hooks/useTypeMetadata.js';
import { useSelectedObject } from '../hooks/useSelectedObject.js';

type ViewMode = 'notes' | 'calendar' | 'type';

export function AppLayout(): ReactElement {
  const navigate = useNavigate();
  const location = useLocation();

  // Extract objectId and typeKey from URL
  const objectIdMatch = location.pathname.match(/\/notes\/([^/]+)/);
  const selectedObjectId = objectIdMatch?.[1] ?? null;

  const typeKeyMatch = location.pathname.match(/\/types\/([^/]+)/);
  const selectedTypeKey = typeKeyMatch?.[1] ?? null;

  // Determine view mode from URL
  const viewMode: ViewMode = location.pathname.startsWith('/calendar')
    ? 'calendar'
    : location.pathname.startsWith('/types')
      ? 'type'
      : 'notes';

  // Modal state (kept in component state, not URL)
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

  // Navigation handlers
  const handleSelectObject = (objectId: string) => {
    navigate(`/notes/${objectId}`);
  };

  const handleSelectType = (typeKey: string) => {
    navigate(`/types/${typeKey}`);
  };

  const handleCreateDailyNote = async () => {
    const result = await window.typenoteAPI.getOrCreateTodayDailyNote();
    if (result.success) {
      navigate(`/notes/${result.result.dailyNote.id}`);
    }
  };

  // Tag handlers
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

  // Type handlers
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
        navigate('/notes');
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
            onSelectObject={handleSelectObject}
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
        {/* Main content area - renders child routes */}
        <Outlet />
      </AppShell>

      <Toaster />
      <CommandPalette isOpen={isOpen} onClose={close} onNavigate={handleSelectObject} />
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
