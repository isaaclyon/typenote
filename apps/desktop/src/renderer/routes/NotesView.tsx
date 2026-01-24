import { useParams } from 'react-router-dom';
import { File } from '@phosphor-icons/react/dist/ssr/File';

/**
 * Notes view - displays document editor or empty state.
 * Route: /#/notes and /#/notes/:objectId
 */
export function NotesView() {
  const { objectId } = useParams<{ objectId: string }>();

  if (!objectId) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center text-muted-foreground">
          <File className="mx-auto mb-2 h-12 w-12 opacity-50" />
          <p className="text-sm">Select a document from the sidebar</p>
          <p className="text-xs mt-1">or create a new one with ⌘N</p>
        </div>
      </div>
    );
  }

  // TODO: Replace with Editor component and useDocument hook
  return (
    <div className="flex h-full flex-col p-4">
      <h1 className="text-lg font-semibold">Document: {objectId}</h1>
      <p className="text-sm text-muted-foreground mt-2">Editor will be wired in next phase</p>
    </div>
  );
}
