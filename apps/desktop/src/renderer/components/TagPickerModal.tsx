/**
 * TagPickerModal Component
 *
 * Modal for selecting and adding tags to an object.
 * Shows available tags with search filtering.
 */

import { useState, useEffect, useCallback } from 'react';
import type { ReactElement } from 'react';
import { Search } from 'lucide-react';
import {
  Modal,
  ModalHeader,
  ModalContent,
  ModalFooter,
  Button,
  Input,
  Tag,
  ScrollArea,
} from '@typenote/design-system';
import type { Tag as TagType } from '@typenote/api';

interface TagPickerModalProps {
  open: boolean;
  onClose: () => void;
  /** Tags already assigned to the object (to show as "already added") */
  existingTagIds: string[];
  /** Called when user selects a tag to add */
  onSelectTag: (tagId: string) => void;
}

export function TagPickerModal({
  open,
  onClose,
  existingTagIds,
  onSelectTag,
}: TagPickerModalProps): ReactElement {
  const [tags, setTags] = useState<TagType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch tags when modal opens
  useEffect(() => {
    if (!open) return;

    setIsLoading(true);
    void window.typenoteAPI
      .listTags({ includeUsageCount: true })
      .then((result) => {
        if (result.success) {
          setTags(result.result);
        }
      })
      .finally(() => setIsLoading(false));
  }, [open]);

  // Reset search when modal closes
  useEffect(() => {
    if (!open) {
      setSearchQuery('');
    }
  }, [open]);

  // Filter tags by search query
  const filteredTags = tags.filter((tag) =>
    tag.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Separate into available and already added
  const existingSet = new Set(existingTagIds);
  const availableTags = filteredTags.filter((tag) => !existingSet.has(tag.id));
  const alreadyAddedTags = filteredTags.filter((tag) => existingSet.has(tag.id));

  const handleSelectTag = useCallback(
    (tagId: string) => {
      onSelectTag(tagId);
      onClose();
    },
    [onSelectTag, onClose]
  );

  return (
    <Modal open={open} onClose={onClose}>
      <ModalHeader title="Add Tag" subtitle="Select a tag to add to this object" />
      <ModalContent>
        {/* Search input */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
            autoFocus
          />
        </div>

        {/* Tags list */}
        <ScrollArea className="max-h-64">
          {isLoading ? (
            <div className="py-8 text-center text-sm text-gray-400">Loading tags...</div>
          ) : filteredTags.length === 0 ? (
            <div className="py-8 text-center text-sm text-gray-400">
              {searchQuery ? 'No tags found' : 'No tags created yet'}
            </div>
          ) : (
            <div className="space-y-3">
              {/* Available tags */}
              {availableTags.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-2">Available</p>
                  <div className="flex flex-wrap gap-2">
                    {availableTags.map((tag) => (
                      <button
                        key={tag.id}
                        onClick={() => handleSelectTag(tag.id)}
                        className="focus:outline-none focus:ring-2 focus:ring-accent-500 rounded"
                      >
                        <Tag className="cursor-pointer hover:bg-gray-100 transition-colors">
                          {tag.name}
                        </Tag>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Already added tags */}
              {alreadyAddedTags.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-2">Already added</p>
                  <div className="flex flex-wrap gap-2">
                    {alreadyAddedTags.map((tag) => (
                      <Tag key={tag.id} className="opacity-50">
                        {tag.name}
                      </Tag>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </ScrollArea>
      </ModalContent>
      <ModalFooter>
        <Button variant="ghost" onClick={onClose}>
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  );
}
