/**
 * UnlinkedMentionsSection Component
 *
 * Displays unlinked mentions for an object in a collapsible section.
 */

import { Link2 as LinkSimpleIcon } from 'lucide-react';
import { CollapsibleSection, BacklinkItem, EmptyState, Skeleton } from '@typenote/design-system';
import { useUnlinkedMentions } from '../hooks/useUnlinkedMentions.js';

export interface UnlinkedMentionsSectionProps {
  objectId: string;
  onNavigate?: (objectId: string) => void;
}

export function UnlinkedMentionsSection({ objectId, onNavigate }: UnlinkedMentionsSectionProps) {
  const { mentions, isLoading, error } = useUnlinkedMentions({ objectId });

  // Loading state
  if (isLoading) {
    return (
      <CollapsibleSection title="Unlinked Mentions" icon={LinkSimpleIcon} defaultExpanded={false}>
        <div className="space-y-2">
          <Skeleton className="h-10 w-full rounded-md" />
          <Skeleton className="h-10 w-full rounded-md" />
          <Skeleton className="h-10 w-full rounded-md" />
        </div>
      </CollapsibleSection>
    );
  }

  // Error state
  if (error) {
    return (
      <CollapsibleSection title="Unlinked Mentions" icon={LinkSimpleIcon} defaultExpanded={false}>
        <div className="text-sm text-destructive">{error}</div>
      </CollapsibleSection>
    );
  }

  // Empty state
  if (mentions.length === 0) {
    return (
      <CollapsibleSection
        title="Unlinked Mentions"
        icon={LinkSimpleIcon}
        count={0}
        defaultExpanded={false}
      >
        <EmptyState
          title="No unlinked mentions"
          description="Documents that mention this title without linking will appear here."
        />
      </CollapsibleSection>
    );
  }

  // Mentions list
  return (
    <CollapsibleSection
      title="Unlinked Mentions"
      icon={LinkSimpleIcon}
      count={mentions.length}
      defaultExpanded={false}
      storageKey="editor.sections.unlinkedMentions"
    >
      <div className="space-y-2">
        {mentions.map((mention) => (
          <BacklinkItem
            key={mention.sourceBlockId}
            title={mention.sourceObjectTitle}
            typeIcon={mention.sourceTypeIcon}
            typeColor={mention.sourceTypeColor}
            {...(onNavigate && {
              onClick: () => onNavigate(mention.sourceObjectId),
            })}
          />
        ))}
      </div>
    </CollapsibleSection>
  );
}
