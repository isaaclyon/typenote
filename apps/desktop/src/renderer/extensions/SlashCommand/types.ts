import type { Editor } from '@tiptap/react';
import type { LucideIcon } from 'lucide-react';

export type CommandSection = 'Basic' | 'Headings' | 'Lists' | 'Formatting' | 'Advanced';

export interface SlashCommand {
  id: string;
  label: string;
  description: string;
  section: CommandSection;
  icon: LucideIcon;
  aliases?: string[];
  execute: (editor: Editor) => void;
}

export interface SlashCommandGroup {
  section: CommandSection;
  commands: SlashCommand[];
}
