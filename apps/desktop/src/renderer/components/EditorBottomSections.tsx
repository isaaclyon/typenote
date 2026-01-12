/**
 * EditorBottomSections Component
 *
 * Container for backlinks and unlinked mentions sections at the bottom of the editor.
 */

import { BacklinksSection } from './BacklinksSection.js';
import { UnlinkedMentionsSection } from './UnlinkedMentionsSection.js';

export interface EditorBottomSectionsProps {
  objectId: string;
  onNavigate?: (objectId: string) => void;
}

export function EditorBottomSections({ objectId, onNavigate }: EditorBottomSectionsProps) {
  return (
    <div className="mt-8 space-y-6">
      <BacklinksSection objectId={objectId} {...(onNavigate && { onNavigate })} />
      <UnlinkedMentionsSection objectId={objectId} {...(onNavigate && { onNavigate })} />
    </div>
  );
}
