/**
 * SlashCommandSection Component
 *
 * Section header for grouped slash commands.
 */

interface SlashCommandSectionProps {
  title: string;
}

export function SlashCommandSection({ title }: SlashCommandSectionProps) {
  return (
    <div className="px-3 pt-2 pb-1 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
      {title.toUpperCase()}
    </div>
  );
}
