import { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDebouncedCallback } from 'use-debounce';
import type {
  CommandPaletteItemData,
  CommandPaletteActionItem,
  CommandPaletteObjectItem,
} from '@typenote/design-system';
import { useRecentObjects } from './useRecentObjects.js';
import { useSearchObjects } from './useSearchObjects.js';
import { useTypesMetadata } from './useTypesMetadata.js';
import { useCreateObject } from './useCreateObject.js';
import { getTypeIcon } from '../lib/getTypeIcon.js';
import { Plus } from '@phosphor-icons/react/dist/ssr/Plus';
import { CalendarBlank } from '@phosphor-icons/react/dist/ssr/CalendarBlank';
import { Gear } from '@phosphor-icons/react/dist/ssr/Gear';

/**
 * Composite hook for CommandPalette state management.
 * Handles search, recent objects, quick actions, and navigation.
 */
export function useCommandPalette() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  const { recentObjects } = useRecentObjects(10);
  const { searchResults } = useSearchObjects(debouncedQuery);
  const { typesMetadata } = useTypesMetadata();
  const { createObject } = useCreateObject();

  // Debounce search input (300ms)
  const debouncedSetQuery = useDebouncedCallback((query: string) => {
    setDebouncedQuery(query);
  }, 300);

  const handleSearchChange = useCallback(
    (query: string) => {
      setSearchQuery(query);
      debouncedSetQuery(query);
    },
    [debouncedSetQuery]
  );

  // Convert recent objects to CommandPaletteObjectItem format
  const recentItems: CommandPaletteObjectItem[] = useMemo(() => {
    return recentObjects.map((obj) => {
      const typeMetadata = typesMetadata.find((t) => t.key === obj.typeKey);
      return {
        type: 'object' as const,
        id: obj.id,
        icon: getTypeIcon(typeMetadata?.icon ?? null),
        title: obj.title,
        objectType: typeMetadata?.name ?? obj.typeKey,
      };
    });
  }, [recentObjects, typesMetadata]);

  // Convert search results to CommandPaletteObjectItem format
  const searchResultsItems: CommandPaletteObjectItem[] = useMemo(() => {
    return searchResults.map((result) => {
      return {
        type: 'object' as const,
        id: result.objectId,
        icon: getTypeIcon(result.typeIcon),
        title: result.objectTitle,
        objectType: result.typeKey,
      };
    });
  }, [searchResults]);

  // Quick actions
  const actions: CommandPaletteActionItem[] = useMemo(
    () => [
      {
        type: 'action' as const,
        id: 'new-page',
        icon: Plus,
        title: 'New Page',
        shortcut: '⌘N',
      },
      {
        type: 'action' as const,
        id: 'new-daily',
        icon: CalendarBlank,
        title: 'New Daily Note',
        shortcut: '⌘D',
      },
      {
        type: 'action' as const,
        id: 'settings',
        icon: Gear,
        title: 'Settings',
        shortcut: '⌘,',
      },
    ],
    []
  );

  const handleQuickAction = useCallback(
    async (actionId: string) => {
      switch (actionId) {
        case 'new-page': {
          await createObject('page', 'Untitled', {});
          break;
        }
        case 'new-daily': {
          const result = await window.typenoteAPI.getOrCreateTodayDailyNote();
          if (result.success) {
            navigate(`/notes/${result.result.dailyNote.id}`);
          }
          break;
        }
        case 'settings':
          console.log('Settings not implemented yet');
          break;
      }
    },
    [createObject, navigate]
  );

  const handleSelect = useCallback(
    (item: CommandPaletteItemData) => {
      if (item.type === 'object') {
        navigate(`/notes/${item.id}`);
        setIsOpen(false);
      } else if (item.type === 'action') {
        void handleQuickAction(item.id);
        setIsOpen(false);
      }
    },
    [navigate, handleQuickAction]
  );

  return {
    isOpen,
    setIsOpen,
    searchQuery,
    handleSearchChange,
    recentItems,
    searchResultsItems,
    actions,
    handleSelect,
  };
}
