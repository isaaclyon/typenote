export interface SettingsSectionProps {
  /** Section title */
  title: string;
  /** Section content */
  children: React.ReactNode;
}

export interface SettingsRowProps {
  /** Setting label */
  label: string;
  /** Optional description */
  description?: string;
  /** The control element (Switch, Select, etc.) */
  children: React.ReactNode;
}

export interface SettingsModalProps {
  /** Whether the modal is open */
  open: boolean;
  /** Callback when modal should close */
  onClose: () => void;
  /** Modal content */
  children: React.ReactNode;
}
