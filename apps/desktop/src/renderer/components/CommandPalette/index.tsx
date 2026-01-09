/**
 * CommandPalette Component
 *
 * Global command palette for searching objects and quick actions.
 * Triggered by Cmd+K (Mac) or Ctrl+K (Windows/Linux).
 */

import { useState } from 'react';
import * as Icons from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandLoading,
} from '../ui/command.js';
import { useCommandSearch } from '../../hooks/useCommandSearch.js';
import { useCommandActions } from '../../hooks/useCommandActions.js';
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
  const { handleCommand } = useCommandActions({ onNavigate, onClose });

  // Get creation commands when there's a query
  const creationCommands = query.trim() ? commandRegistry.getCreationCommands(query) : [];

  // Handle selection
  const handleSelect = (command: Command) => {
    void handleCommand(command);
    setQuery(''); // Reset query after selection
  };

  return (
    <CommandDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <CommandInput
        placeholder="Search or create..."
        value={query}
        onValueChange={setQuery}
        autoFocus
      />
      <CommandList>
        {/* Loading state */}
        {searchState.status === 'loading' && <CommandLoading />}

        {/* Empty state */}
        {searchState.status === 'success' && searchState.commands.length === 0 && !query.trim() && (
          <CommandEmpty>Type to search...</CommandEmpty>
        )}

        {searchState.status === 'success' && searchState.commands.length === 0 && query.trim() && (
          <CommandEmpty>No results found.</CommandEmpty>
        )}

        {/* Error state */}
        {searchState.status === 'error' && (
          <CommandEmpty>Search failed: {searchState.message}</CommandEmpty>
        )}

        {/* Search results */}
        {searchState.status === 'success' && searchState.commands.length > 0 && (
          <CommandGroup heading="Go to">
            {searchState.commands.map((cmd: NavigationCommand) => {
              const Icon = getIcon(cmd.icon);
              return (
                <CommandItem
                  key={cmd.id}
                  value={`${cmd.id}-${cmd.label}`}
                  onSelect={() => handleSelect(cmd)}
                  data-testid={`command-item-${cmd.objectId}`}
                >
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  <span className="flex-1 truncate">{cmd.label}</span>
                  <span className="text-xs text-muted-foreground">{cmd.objectType}</span>
                </CommandItem>
              );
            })}
          </CommandGroup>
        )}

        {/* Creation commands */}
        {creationCommands.length > 0 && (
          <CommandGroup heading="Create new">
            {creationCommands.map((cmd: CreationCommand) => {
              const Icon = getIcon(cmd.icon);
              return (
                <CommandItem
                  key={cmd.id}
                  value={`${cmd.id}-${cmd.typeKey}`}
                  onSelect={() => handleSelect(cmd)}
                  data-testid={`command-create-${cmd.typeKey}`}
                >
                  <Icons.Plus className="h-4 w-4 text-primary" />
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  <span className="flex-1">
                    {cmd.typeKey}: {cmd.description?.replace(/"/g, '') ?? 'New'}
                  </span>
                </CommandItem>
              );
            })}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  );
}
