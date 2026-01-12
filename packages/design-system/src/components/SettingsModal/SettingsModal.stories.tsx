import * as React from 'react';
import type { Story } from '@ladle/react';
import { SettingsModal } from './SettingsModal.js';
import { SettingsSection } from './SettingsSection.js';
import { SettingsRow } from './SettingsRow.js';
import { SettingsLink } from './SettingsLink.js';
import { Switch } from '../Switch/index.js';
import { Select } from '../Select/index.js';
import { Button } from '../Button/index.js';

export default {
  title: 'Components/SettingsModal',
};

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

/**
 * Individual SettingsSection
 */
export const Section: Story = () => (
  <div className="w-96 border border-gray-200 rounded-lg p-4">
    <SettingsSection title="Appearance">
      <SettingsRow label="Color mode">
        <Select options={colorModeOptions} value="system" />
      </SettingsRow>
    </SettingsSection>
  </div>
);

/**
 * Individual SettingsRow variants
 */
export const Rows: Story = () => (
  <div className="w-96 border border-gray-200 rounded-lg p-4 space-y-2">
    <SettingsRow label="Simple label">
      <Switch checked />
    </SettingsRow>
    <SettingsRow label="With description" description="This setting does something important">
      <Switch />
    </SettingsRow>
    <SettingsRow label="With Select">
      <Select options={colorModeOptions} value="dark" />
    </SettingsRow>
  </div>
);

/**
 * SettingsLink for navigation
 */
export const Links: Story = () => (
  <div className="w-96 border border-gray-200 rounded-lg p-4">
    <SettingsLink
      label="Manage Object Types"
      description="Create and configure custom types"
      onClick={() => alert('Navigate to types manager')}
    />
    <SettingsLink label="Export Data" onClick={() => alert('Navigate to export')} />
  </div>
);

/**
 * Full settings modal (closed by default, click button to open)
 */
export const FullExample: Story = () => {
  const [open, setOpen] = React.useState(false);
  const [settings, setSettings] = React.useState({
    colorMode: 'system',
    weekStartDay: 'sunday',
    spellcheck: true,
    dateFormat: 'iso',
    timeFormat: '12h',
  });

  const updateSetting = <K extends keyof typeof settings>(key: K, value: (typeof settings)[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <>
      <Button onClick={() => setOpen(true)}>Open Settings</Button>

      <SettingsModal open={open} onClose={() => setOpen(false)}>
        <SettingsSection title="Appearance">
          <SettingsRow label="Color mode">
            <Select
              options={colorModeOptions}
              value={settings.colorMode}
              onChange={(v) => updateSetting('colorMode', v)}
            />
          </SettingsRow>
        </SettingsSection>

        <SettingsSection title="Calendar">
          <SettingsRow label="Week starts on">
            <Select
              options={weekStartOptions}
              value={settings.weekStartDay}
              onChange={(v) => updateSetting('weekStartDay', v)}
            />
          </SettingsRow>
        </SettingsSection>

        <SettingsSection title="Editor">
          <SettingsRow label="Spellcheck">
            <Switch
              checked={settings.spellcheck}
              onCheckedChange={(v) => updateSetting('spellcheck', v)}
            />
          </SettingsRow>
        </SettingsSection>

        <SettingsSection title="Display">
          <SettingsRow label="Date format">
            <Select
              options={dateFormatOptions}
              value={settings.dateFormat}
              onChange={(v) => updateSetting('dateFormat', v)}
            />
          </SettingsRow>
          <SettingsRow label="Time format">
            <Select
              options={timeFormatOptions}
              value={settings.timeFormat}
              onChange={(v) => updateSetting('timeFormat', v)}
            />
          </SettingsRow>
        </SettingsSection>

        <div className="pt-4 mt-2 border-t border-gray-200">
          <SettingsLink
            label="Manage Object Types"
            description="Create and configure custom types"
            onClick={() => {
              setOpen(false);
              alert('Navigate to /settings/types');
            }}
          />
        </div>
      </SettingsModal>
    </>
  );
};

/**
 * Modal already open for visual testing
 */
export const OpenByDefault: Story = () => {
  const [open, setOpen] = React.useState(true);

  return (
    <SettingsModal open={open} onClose={() => setOpen(false)}>
      <SettingsSection title="Appearance">
        <SettingsRow label="Color mode">
          <Select options={colorModeOptions} value="system" />
        </SettingsRow>
      </SettingsSection>

      <SettingsSection title="Calendar">
        <SettingsRow label="Week starts on">
          <Select options={weekStartOptions} value="sunday" />
        </SettingsRow>
      </SettingsSection>

      <SettingsSection title="Editor">
        <SettingsRow label="Spellcheck">
          <Switch checked />
        </SettingsRow>
      </SettingsSection>

      <SettingsSection title="Display">
        <SettingsRow label="Date format">
          <Select options={dateFormatOptions} value="iso" />
        </SettingsRow>
        <SettingsRow label="Time format">
          <Select options={timeFormatOptions} value="12h" />
        </SettingsRow>
      </SettingsSection>

      <div className="pt-4 mt-2 border-t border-gray-200">
        <SettingsLink label="Manage Object Types" description="Create and configure custom types" />
      </div>
    </SettingsModal>
  );
};
