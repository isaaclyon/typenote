export interface EditableTitleProps {
  /** The title value to display */
  value: string;
  /** Called when title is edited (blur or Enter) */
  onChange: (value: string) => void;
  /** Placeholder text when title is empty */
  placeholder?: string;
  /** Disable editing (for immutable titles like Daily Notes) */
  disabled?: boolean;
}

export interface DocumentHeaderProps {
  /** The document title */
  title: string;
  /** Type label shown above title (e.g., "Page", "Task", or "Thursday" for daily notes) */
  typeLabel: string;
  /** Called when title is edited. If not provided, title is read-only. */
  onTitleChange?: (title: string) => void;
  /** For Daily Notes: the date_key in YYYY-MM-DD format. Renders immutable formatted date. */
  dailyNoteDateKey?: string;
  /** Additional CSS classes */
  className?: string;
}
