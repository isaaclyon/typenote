/**
 * BacklinksSection Component
 *
 * Displays backlinks for an object in a collapsible section.
 */

import { Link as LinkIcon } from 'lucide-react';
import { CollapsibleSection, BacklinkItem, EmptyState } from '@typenote/design-system';
import { useBacklinks } from '../hooks/useBacklinks.js';

export interface BacklinksSectionProps {
  objectId: string;
  onNavigate?: (objectId: string) => void;
}

export function BacklinksSection({ objectId, onNavigate }: BacklinksSectionProps) {
  const { backlinks, isLoading, error } = useBacklinks({ objectId });

  // Loading state
  if (isLoading) {
    return (
      <CollapsibleSection title="Backlinks" icon={LinkIcon}>
        <div className="space-y-2">
          <div className="h-10 w-full bg-gray-100 rounded-md animate-pulse" />
          <div className="h-10 w-full bg-gray-100 rounded-md animate-pulse" />
          <div className="h-10 w-full bg-gray-100 rounded-md animate-pulse" />
        </div>
      </CollapsibleSection>
    );
  }

  // Error state
  if (error) {
    return (
      <CollapsibleSection title="Backlinks" icon={LinkIcon}>
        <div className="text-sm text-destructive">{error}</div>
      </CollapsibleSection>
    );
  }

  // Empty state
  if (backlinks.length === 0) {
    return (
      <CollapsibleSection title="Backlinks" icon={LinkIcon} count={0}>
        <EmptyState
          title="No backlinks yet"
          description="Other documents that link to this one will appear here."
        />
      </CollapsibleSection>
    );
  }

  // Backlinks list
  return (
    <CollapsibleSection
      title="Backlinks"
      icon={LinkIcon}
      count={backlinks.length}
      storageKey="editor.backlinks.collapsed"
    >
      <div className="space-y-2">
        {backlinks.map((backlink) => (
          <BacklinkItem
            key={backlink.sourceBlockId}
            title={backlink.sourceObjectTitle}
            typeIcon={backlink.sourceTypeIcon}
            typeColor={backlink.sourceTypeColor}
            {...(onNavigate && {
              onClick: () => onNavigate(backlink.sourceObjectId),
            })}
          />
        ))}
      </div>
    </CollapsibleSection>
  );
}
