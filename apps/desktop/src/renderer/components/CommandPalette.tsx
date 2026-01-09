import { useCallback, useEffect, useState } from 'react';
import type { ReactElement } from 'react';
import {
  CalendarDays,
  FileText,
  Search,
  Plus,
} from 'lucide-react';

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from './ui/command.js';

interface ObjectSummary {
  id: string;
  title: string;
  typeId: string;
  typeKey: string;
  updatedAt: Date;
}

interface CommandPaletteProps {
  onNavigate: (objectId: string) => void;
  onCreateDailyNote: () => void;
}

export function CommandPalette({
  onNavigate,
  onCreateDailyNote,
}: CommandPaletteProps): ReactElement {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [objects, setObjects] = useState<ObjectSummary[]>([]);
  const [allObjects, setAllObjects] = useState<ObjectSummary[]>([]);

  // Register keyboard shortcut
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  // Load all objects when dialog opens
  useEffect(() => {
    if (!open) {
      setSearch('');
      setAllObjects([]);
      setObjects([]);
      return;
    }

    const loadObjects = async () => {
      const result = await window.typenoteAPI.listObjects();
      if (result.success) {
        setAllObjects(result.result);
        setObjects(result.result.slice(0, 10));
      }
    };

    void loadObjects();
  }, [open]);

  // Filter objects based on search
  useEffect(() => {
    if (!open) return;

    if (search.trim() === '') {
      setObjects(allObjects.slice(0, 10));
    } else {
      const searchLower = search.toLowerCase();
      const filtered = allObjects.filter((obj) =>
        obj.title.toLowerCase().includes(searchLower)
      );
      setObjects(filtered.slice(0, 10));
    }
  }, [search, allObjects, open]);

  const handleSelect = useCallback(
    (objectId: string) => {
      onNavigate(objectId);
      setOpen(false);
    },
    [onNavigate]
  );

  const handleCreateDailyNote = useCallback(() => {
    onCreateDailyNote();
    setOpen(false);
  }, [onCreateDailyNote]);

  const getIconForType = (typeKey: string) => {
    switch (typeKey) {
      case 'DailyNote':
        return <CalendarDays className="mr-2 h-4 w-4" />;
      default:
        return <FileText className="mr-2 h-4 w-4" />;
    }
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput
        placeholder="Type a command or search..."
        value={search}
        onValueChange={setSearch}
        data-testid="command-palette-input"
      />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        <CommandGroup heading="Actions">
          <CommandItem onSelect={handleCreateDailyNote} data-testid="command-create-daily-note">
            <Plus className="mr-2 h-4 w-4" />
            <span>Create Today's Note</span>
            <CommandShortcut>Daily</CommandShortcut>
          </CommandItem>
        </CommandGroup>

        {objects.length > 0 && (
          <CommandGroup heading="Objects">
            {objects.map((obj) => (
              <CommandItem
                key={obj.id}
                value={obj.title}
                onSelect={() => handleSelect(obj.id)}
                data-testid={`command-object-${obj.id}`}
              >
                {getIconForType(obj.typeKey)}
                <span>{obj.title}</span>
                <CommandShortcut>{obj.typeKey}</CommandShortcut>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {search.length === 0 && objects.length === 0 && (
          <CommandGroup heading="Quick Search">
            <CommandItem disabled>
              <Search className="mr-2 h-4 w-4" />
              <span className="text-muted-foreground">Start typing to search objects...</span>
            </CommandItem>
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  );
}
