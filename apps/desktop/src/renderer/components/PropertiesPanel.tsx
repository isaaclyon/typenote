import type { ReactElement } from 'react';
import {
  RightSidebar,
  PropertyItem,
  PropertyTags,
  Tag,
  TagAddButton,
  Text,
} from '@typenote/design-system';
import type { ObjectDetails } from '@typenote/storage';

interface PropertiesPanelProps {
  collapsed: boolean;
  object: ObjectDetails | null;
  onAddTagClick?: () => void;
  /** Called when user clicks remove on a tag. Receives the tag ID. */
  onRemoveTag?: (tagId: string) => void;
}

function formatDateTime(date: Date): string {
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

/**
 * Right sidebar component showing object properties (metadata).
 * Only rendered when an object is selected in notes view.
 */
export function PropertiesPanel({
  collapsed,
  object,
  onAddTagClick,
  onRemoveTag,
}: PropertiesPanelProps): ReactElement | null {
  if (!object) {
    return null;
  }

  return (
    <RightSidebar collapsed={collapsed}>
      <div className="space-y-4">
        {/* Section header */}
        <Text variant="label" className="font-semibold text-gray-900">
          Properties
        </Text>

        {/* Property items */}
        <div className="space-y-3">
          <PropertyItem
            label="Created"
            value={formatDateTime(object.createdAt)}
            type="text"
            // Read-only - no onSave
          />

          <PropertyItem
            label="Modified"
            value={formatDateTime(object.updatedAt)}
            type="text"
            // Read-only - no onSave
          />

          <PropertyItem label="Type" value={object.typeKey} type="text" />
        </div>

        {/* Tags section */}
        <div className="pt-2">
          <PropertyTags label="Tags">
            {object.tags.map((tag) =>
              onRemoveTag ? (
                <Tag key={tag.id} onRemove={() => onRemoveTag(tag.id)}>
                  {tag.name}
                </Tag>
              ) : (
                <Tag key={tag.id}>{tag.name}</Tag>
              )
            )}
            {onAddTagClick && <TagAddButton onClick={onAddTagClick} />}
          </PropertyTags>
        </div>
      </div>
    </RightSidebar>
  );
}
