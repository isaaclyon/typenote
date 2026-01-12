import * as React from 'react';
import type { Story } from '@ladle/react';
import { Select } from './Select.js';

export default {
  title: 'Components/Select',
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
 * Default select with placeholder
 */
export const Default: Story = () => (
  <Select options={colorModeOptions} placeholder="Select theme..." />
);

/**
 * With a selected value
 */
export const WithValue: Story = () => <Select options={colorModeOptions} value="dark" />;

/**
 * Interactive example
 */
export const Interactive: Story = () => {
  const [value, setValue] = React.useState('system');

  return (
    <div className="flex flex-col gap-2">
      <Select options={colorModeOptions} value={value} onChange={setValue} />
      <span className="text-sm text-gray-500">Selected: {value}</span>
    </div>
  );
};

/**
 * Disabled state
 */
export const Disabled: Story = () => (
  <div className="flex flex-col gap-4">
    <Select options={colorModeOptions} disabled placeholder="Disabled empty" />
    <Select options={colorModeOptions} disabled value="dark" />
  </div>
);

/**
 * With longer labels
 */
export const LongLabels: Story = () => {
  const [value, setValue] = React.useState('iso');

  return <Select options={dateFormatOptions} value={value} onChange={setValue} />;
};

/**
 * Multiple selects in a settings layout
 */
export const SettingsExample: Story = () => {
  const [settings, setSettings] = React.useState({
    colorMode: 'system',
    weekStart: 'sunday',
    dateFormat: 'iso',
    timeFormat: '12h',
  });

  const update = <K extends keyof typeof settings>(key: K, value: (typeof settings)[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="w-96 divide-y divide-gray-200 border border-gray-200 rounded-lg">
      <div className="flex items-center justify-between px-4 py-3">
        <span className="text-sm text-gray-700">Color mode</span>
        <Select
          options={colorModeOptions}
          value={settings.colorMode}
          onChange={(v) => update('colorMode', v)}
        />
      </div>
      <div className="flex items-center justify-between px-4 py-3">
        <span className="text-sm text-gray-700">Week starts on</span>
        <Select
          options={weekStartOptions}
          value={settings.weekStart}
          onChange={(v) => update('weekStart', v)}
        />
      </div>
      <div className="flex items-center justify-between px-4 py-3">
        <span className="text-sm text-gray-700">Date format</span>
        <Select
          options={dateFormatOptions}
          value={settings.dateFormat}
          onChange={(v) => update('dateFormat', v)}
        />
      </div>
      <div className="flex items-center justify-between px-4 py-3">
        <span className="text-sm text-gray-700">Time format</span>
        <Select
          options={timeFormatOptions}
          value={settings.timeFormat}
          onChange={(v) => update('timeFormat', v)}
        />
      </div>
    </div>
  );
};

/**
 * Wide variant
 */
export const FullWidth: Story = () => {
  const [value, setValue] = React.useState('system');

  return (
    <div className="w-64">
      <Select options={colorModeOptions} value={value} onChange={setValue} className="w-full" />
    </div>
  );
};
