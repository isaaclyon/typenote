/**
 * NotesRoute Component
 *
 * Route component for displaying the document editor.
 * Gets the objectId from URL params and renders DocumentEditor or DailyNoteLayout.
 */

/// <reference path="../global.d.ts" />

import type { ReactElement } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ScrollArea } from '@typenote/design-system';
import { DocumentEditor } from '../components/DocumentEditor.js';
import { DailyNoteLayout } from '../components/DailyNoteLayout.js';
import { useSelectedObject } from '../hooks/useSelectedObject.js';

export function NotesRoute(): ReactElement {
  const { objectId } = useParams<{ objectId: string }>();
  const navigate = useNavigate();
  const { object: selectedObject } = useSelectedObject(objectId ?? null);

  const isDailyNote = selectedObject?.typeKey === 'DailyNote';

  const handleNavigate = (id: string) => {
    navigate(`/notes/${id}`);
  };

  const handleNavigateToDate = async (dateKey: string) => {
    const result = await window.typenoteAPI.getOrCreateDailyNoteByDate(dateKey);
    if (result.success) {
      navigate(`/notes/${result.result.dailyNote.id}`);
    }
  };

  // No object selected - show placeholder
  if (!objectId) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        Select an object to view
      </div>
    );
  }

  // Daily note - wrap in DailyNoteLayout
  if (isDailyNote) {
    return (
      <DailyNoteLayout
        dateKey={(selectedObject?.properties?.['date_key'] as string) ?? ''}
        onNavigateToDate={(dateKey) => void handleNavigateToDate(dateKey)}
        onNavigateToObject={handleNavigate}
      >
        <DocumentEditor objectId={objectId} onNavigate={handleNavigate} />
      </DailyNoteLayout>
    );
  }

  // Regular document
  return (
    <ScrollArea className="h-full">
      <DocumentEditor objectId={objectId} onNavigate={handleNavigate} />
    </ScrollArea>
  );
}
