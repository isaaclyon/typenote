/**
 * SettingsModalWrapper Component
 *
 * Wraps the design-system SettingsModal with app-specific settings state and IPC wiring.
 * Uses useSettings hook for optimistic updates with backend persistence.
 */

import { useSettings } from '../hooks/useSettings.js';
import {
  SettingsModal,
  SettingsSection,
  SettingsRow,
  Select,
  Switch,
} from '@typenote/design-system';

// Option definitions matching the Zod schemas in @typenote/api
const colorModeOptions = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'system', label: 'System' },
];

const weekStartOptions = [
  { value: 'sunday', label: 'Sunday' },
  { value: 'monday', label: 'Monday' },
];

const dateFormatOptions = [
  { value: 'iso', label: 'ISO (2024-01-15)' },
  { value: 'us', label: 'US (01/15/2024)' },
  { value: 'eu', label: 'EU (15/01/2024)' },
];

const timeFormatOptions = [
  { value: '12h', label: '12-hour' },
  { value: '24h', label: '24-hour' },
];

interface SettingsModalWrapperProps {
  open: boolean;
  onClose: () => void;
}

export function SettingsModalWrapper({ open, onClose }: SettingsModalWrapperProps) {
  const { settings, updateSettings, isLoading, error } = useSettings();

  return (
    <SettingsModal open={open} onClose={onClose}>
      {isLoading ? (
        <div className="py-8 text-center text-sm text-gray-500">Loading settings...</div>
      ) : error !== null ? (
        <div className="py-8 text-center text-sm text-red-500">Error: {error}</div>
      ) : (
        <>
          <SettingsSection title="Appearance">
            <SettingsRow label="Color mode" description="Choose your preferred theme">
              <Select
                options={colorModeOptions}
                value={settings.colorMode}
                onChange={(value) =>
                  void updateSettings({ colorMode: value as 'light' | 'dark' | 'system' })
                }
                size="sm"
              />
            </SettingsRow>
          </SettingsSection>

          <SettingsSection title="Calendar">
            <SettingsRow label="Week starts on">
              <Select
                options={weekStartOptions}
                value={settings.weekStartDay}
                onChange={(value) =>
                  void updateSettings({ weekStartDay: value as 'sunday' | 'monday' })
                }
                size="sm"
              />
            </SettingsRow>
          </SettingsSection>

          <SettingsSection title="Editor">
            <SettingsRow label="Spellcheck" description="Enable browser spellchecking">
              <Switch
                checked={settings.spellcheck}
                onCheckedChange={(checked) => void updateSettings({ spellcheck: checked })}
              />
            </SettingsRow>
          </SettingsSection>

          <SettingsSection title="Display">
            <SettingsRow label="Date format">
              <Select
                options={dateFormatOptions}
                value={settings.dateFormat}
                onChange={(value) =>
                  void updateSettings({ dateFormat: value as 'iso' | 'us' | 'eu' })
                }
                size="sm"
              />
            </SettingsRow>
            <SettingsRow label="Time format">
              <Select
                options={timeFormatOptions}
                value={settings.timeFormat}
                onChange={(value) => void updateSettings({ timeFormat: value as '12h' | '24h' })}
                size="sm"
              />
            </SettingsRow>
          </SettingsSection>
        </>
      )}
    </SettingsModal>
  );
}
