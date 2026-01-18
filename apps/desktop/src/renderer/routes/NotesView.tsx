import { useParams } from 'react-router-dom';

/**
 * Notes view - displays document editor or empty state.
 * Route: /#/notes/:objectId?
 */
export function NotesView() {
  const { objectId } = useParams<{ objectId?: string }>();

  if (!objectId) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center text-muted-foreground">
          <p className="text-lg">No note selected</p>
          <p className="text-sm">Select a note from the sidebar or create a new one</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col p-4">
      <h1 className="text-lg font-semibold">Document: {objectId}</h1>
      <p className="text-sm text-muted-foreground">Editor will be implemented in Phase 4</p>
    </div>
  );
}
