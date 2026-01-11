export type SaveState = 'idle' | 'saving' | 'saved' | 'error';

export interface SaveStatusProps {
  /** Current save state */
  state: SaveState;
  /** Custom className */
  className?: string;
  /** Custom saving text (default: "Saving...") */
  savingText?: string;
  /** Custom saved text (default: "Saved") */
  savedText?: string;
  /** Custom error text (default: "Failed to save") */
  errorText?: string;
}
