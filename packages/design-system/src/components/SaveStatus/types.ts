export type SaveState = 'idle' | 'saving' | 'saved' | 'error';

export interface SaveStatusProps {
  /** Current save state */
  state: SaveState;
  /** Custom className */
  className?: string | undefined;
  /** Custom saving text (default: "Saving...") */
  savingText?: string | undefined;
  /** Custom saved text (default: "Saved") */
  savedText?: string | undefined;
  /** Custom error text (default: "Failed to save") */
  errorText?: string | undefined;
  /** Auto-dismiss duration in ms for 'saved' state (default: 2000, set to 0 to disable) */
  autoDismissMs?: number | undefined;
}
