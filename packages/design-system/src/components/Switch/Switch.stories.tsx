import * as React from 'react';
import type { Story } from '@ladle/react';
import { Switch } from './Switch.js';

export default {
  title: 'Components/Switch',
};

/**
 * Default unchecked state
 */
export const Default: Story = () => <Switch />;

/**
 * Checked state
 */
export const Checked: Story = () => <Switch checked />;

/**
 * Interactive example with state
 */
export const Interactive: Story = () => {
  const [checked, setChecked] = React.useState(false);

  return (
    <div className="flex items-center gap-3">
      <Switch checked={checked} onCheckedChange={setChecked} />
      <span className="text-sm text-gray-600">{checked ? 'On' : 'Off'}</span>
    </div>
  );
};

/**
 * Disabled states
 */
export const Disabled: Story = () => (
  <div className="flex flex-col gap-4">
    <div className="flex items-center gap-3">
      <Switch disabled />
      <span className="text-sm text-gray-500">Disabled (off)</span>
    </div>
    <div className="flex items-center gap-3">
      <Switch checked disabled />
      <span className="text-sm text-gray-500">Disabled (on)</span>
    </div>
  </div>
);

/**
 * With label - typical settings row usage
 */
export const WithLabel: Story = () => {
  const [spellcheck, setSpellcheck] = React.useState(true);

  return (
    <div className="flex items-center justify-between w-64 py-2">
      <span className="text-sm text-gray-700">Spellcheck</span>
      <Switch checked={spellcheck} onCheckedChange={setSpellcheck} />
    </div>
  );
};

/**
 * Multiple switches in a settings-like layout
 */
export const SettingsExample: Story = () => {
  const [settings, setSettings] = React.useState({
    spellcheck: true,
    notifications: false,
    darkMode: false,
  });

  const toggle = (key: keyof typeof settings) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="w-80 divide-y divide-gray-200 border border-gray-200 rounded-lg">
      <div className="flex items-center justify-between px-4 py-3">
        <span className="text-sm text-gray-700">Spellcheck</span>
        <Switch checked={settings.spellcheck} onCheckedChange={() => toggle('spellcheck')} />
      </div>
      <div className="flex items-center justify-between px-4 py-3">
        <span className="text-sm text-gray-700">Notifications</span>
        <Switch checked={settings.notifications} onCheckedChange={() => toggle('notifications')} />
      </div>
      <div className="flex items-center justify-between px-4 py-3">
        <span className="text-sm text-gray-700">Dark mode</span>
        <Switch checked={settings.darkMode} onCheckedChange={() => toggle('darkMode')} />
      </div>
    </div>
  );
};
