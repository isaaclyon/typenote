/**
 * SlashCommandItem Component
 *
 * Individual command item in the slash command menu.
 */

import type { SlashCommand } from '../../extensions/SlashCommand/types.js';
import { cn } from '../../lib/utils.js';

interface SlashCommandItemProps {
  command: SlashCommand;
  isSelected: boolean;
  onClick: () => void;
}

export function SlashCommandItem({ command, isSelected, onClick }: SlashCommandItemProps) {
  const Icon = command.icon;

  return (
    <button
      className={cn(
        'w-full flex items-center gap-3 px-3 py-2 text-sm text-left',
        isSelected ? 'bg-accent' : 'hover:bg-accent'
      )}
      onClick={onClick}
      data-testid={`slash-command-${command.id}`}
    >
      <Icon className="h-4 w-4 shrink-0" />
      <div className="flex flex-col min-w-0">
        <span className="font-semibold">{command.label}</span>
        <span className="text-xs text-muted-foreground">{command.description}</span>
      </div>
    </button>
  );
}
