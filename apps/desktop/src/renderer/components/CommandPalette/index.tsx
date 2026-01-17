/**
 * CommandPalette Component
 *
 * Global command palette for searching objects and quick actions.
 * Triggered by Cmd+K (Mac) or Ctrl+K (Windows/Linux).
 *
 * Now uses @typenote/design-system components (no cmdk dependency).
 */

import { useState, useMemo, useCallback } from 'react';
import * as Icons from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import {
  CommandPalette as CommandPaletteRoot,
  CommandPaletteInput,
  CommandPaletteList,
  CommandPaletteGroup,
  CommandPaletteItem,
  CommandPaletteEmpty,
  CommandPaletteLoading,
  useCommandPaletteKeyboard,
} from '@typenote/design-system';

import { useCommandSearch } from '../../hooks/useCommandSearch.js';
import { useCommandActions } from '../../hooks/useCommandActions.js';
import { useRecentObjects } from '../../hooks/useRecentObjects.js';
import { commandRegistry } from './commands/registry.js';
import type { Command, NavigationCommand, CreationCommand } from './commands/types.js';

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

export interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate?: ((objectId: string) => void) | undefined;
}

// Unified item type for keyboard navigation
interface FlatItem {
  type: 'recent' | 'search' | 'create';
  command: Command;
}

// -----------------------------------------------------------------------------
// Icon Helper
// -----------------------------------------------------------------------------

function getIcon(iconName: string | undefined): LucideIcon {
  if (!iconName) return Icons.File;
  const icon = Icons[iconName as keyof typeof Icons] as LucideIcon | undefined;
  return icon ?? Icons.File;
}

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export function CommandPalette({ isOpen, onClose, onNavigate }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const searchState = useCommandSearch(query);
  const { recentObjects, isLoading: isLoadingRecent } = useRecentObjects(10);
  const { handleCommand } = useCommandActions({ onNavigate, onClose });

  // Get creation commands when there's a query
  const creationCommands = query.trim() ? commandRegistry.getCreationCommands(query) : [];

  // Show recent objects only when query is empty
  const showRecent = !query.trim() && recentObjects.length > 0;

  // Flatten all items for keyboard navigation
  const flatItems: FlatItem[] = useMemo(() => {
    const items: FlatItem[] = [];

    // Recent items (when no query)
    if (showRecent) {
      recentObjects.forEach((obj) => {
        items.push({
          type: 'recent',
          command: {
            type: 'navigation',
            id: obj.id,
            label: obj.title,
            objectId: obj.id,
            objectType: obj.typeKey,
            icon: undefined,
          } as NavigationCommand,
        });
      });
    }

    // Search results (when query)
    if (searchState.status === 'success' && searchState.commands.length > 0) {
      searchState.commands.forEach((cmd) => {
        items.push({ type: 'search', command: cmd });
      });
    }

    // Creation commands (when query)
    if (creationCommands.length > 0) {
      creationCommands.forEach((cmd) => {
        items.push({ type: 'create', command: cmd });
      });
    }

    return items;
  }, [showRecent, recentObjects, searchState, creationCommands]);

  // Handle selection
  const handleSelect = useCallback(
    (command: Command) => {
      void handleCommand(command);
      setQuery(''); // Reset query after selection
    },
    [handleCommand]
  );

  // Keyboard navigation
  const { selectedIndex } = useCommandPaletteKeyboard({
    itemCount: flatItems.length,
    onSelect: (index) => {
      const item = flatItems[index];
      if (item) {
        handleSelect(item.command);
      }
    },
    onEscape: onClose,
    enabled: isOpen,
  });

  // Track cumulative index for rendering
  let itemIndex = -1;

  const isLoading = searchState.status === 'loading' || (isLoadingRecent && !query.trim());

  return (
    <CommandPaletteRoot
      open={isOpen}
      onOpenChange={(open) => !open && onClose()}
      data-testid="command-palette"
    >
      <CommandPaletteInput
        value={query}
        onValueChange={setQuery}
        placeholder="Search or create..."
      />
      <CommandPaletteList>
        {/* Loading state */}
        {isLoading && <CommandPaletteLoading />}

        {/* Empty state - no query, no recent */}
        {!isLoading &&
          searchState.status === 'success' &&
          searchState.commands.length === 0 &&
          !query.trim() &&
          !showRecent && <CommandPaletteEmpty>Type to search...</CommandPaletteEmpty>}

        {/* Empty state - query but no results */}
        {!isLoading &&
          searchState.status === 'success' &&
          searchState.commands.length === 0 &&
          query.trim() &&
          creationCommands.length === 0 && (
            <CommandPaletteEmpty>No results found.</CommandPaletteEmpty>
          )}

        {/* Error state */}
        {searchState.status === 'error' && (
          <CommandPaletteEmpty>Search failed: {searchState.message}</CommandPaletteEmpty>
        )}

        {/* Recent objects */}
        {showRecent && (
          <CommandPaletteGroup heading="Recent">
            {recentObjects.map((obj) => {
              itemIndex++;
              return (
                <CommandPaletteItem
                  key={obj.id}
                  value={`${obj.id}-${obj.title}`}
                  selected={selectedIndex === itemIndex}
                  onSelect={() => {
                    const navCommand: NavigationCommand = {
                      type: 'navigation',
                      id: obj.id,
                      label: obj.title,
                      objectId: obj.id,
                      objectType: obj.typeKey,
                      icon: undefined,
                    };
                    handleSelect(navCommand);
                  }}
                  data-testid={`command-recent-${obj.id}`}
                >
                  <Icons.Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="flex-1 truncate">{obj.title}</span>
                  <span className="text-xs text-muted-foreground">{obj.typeKey}</span>
                </CommandPaletteItem>
              );
            })}
          </CommandPaletteGroup>
        )}

        {/* Search results */}
        {searchState.status === 'success' && searchState.commands.length > 0 && (
          <CommandPaletteGroup heading="Go to">
            {searchState.commands.map((cmd: NavigationCommand) => {
              itemIndex++;
              const Icon = getIcon(cmd.icon);
              return (
                <CommandPaletteItem
                  key={cmd.id}
                  value={`${cmd.id}-${cmd.label}`}
                  selected={selectedIndex === itemIndex}
                  onSelect={() => handleSelect(cmd)}
                  data-testid={`command-item-${cmd.objectId}`}
                >
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  <span className="flex-1 truncate">{cmd.label}</span>
                  <span className="text-xs text-muted-foreground">{cmd.objectType}</span>
                </CommandPaletteItem>
              );
            })}
          </CommandPaletteGroup>
        )}

        {/* Creation commands */}
        {creationCommands.length > 0 && (
          <CommandPaletteGroup heading="Create new">
            {creationCommands.map((cmd: CreationCommand) => {
              itemIndex++;
              const Icon = getIcon(cmd.icon);
              return (
                <CommandPaletteItem
                  key={cmd.id}
                  value={`${cmd.id}-${cmd.typeKey}`}
                  selected={selectedIndex === itemIndex}
                  onSelect={() => handleSelect(cmd)}
                  data-testid={`command-create-${cmd.typeKey}`}
                >
                  <Icons.Plus className="h-4 w-4 text-accent-500" />
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  <span className="flex-1">
                    {cmd.typeKey}: {cmd.description?.replace(/"/g, '') ?? 'New'}
                  </span>
                </CommandPaletteItem>
              );
            })}
          </CommandPaletteGroup>
        )}
      </CommandPaletteList>
    </CommandPaletteRoot>
  );
}
