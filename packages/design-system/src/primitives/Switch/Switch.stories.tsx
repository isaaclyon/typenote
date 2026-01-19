import * as React from 'react';
import type { Story } from '@ladle/react';
import { Switch } from './Switch.js';
import { Label } from '../Label/Label.js';

export default {
  title: 'Primitives/Switch',
};

export const Overview: Story = () => {
  const [enabled, setEnabled] = React.useState(false);
  const [notifications, setNotifications] = React.useState(true);

  return (
    <div className="space-y-10 p-6">
      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-gray-600">Variants</h2>
        <div className="flex flex-wrap items-center gap-4">
          <Switch />
          <Switch checked />
          <Switch disabled />
          <Switch checked disabled />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-gray-600">Sizes</h2>
        <div className="flex items-center gap-4">
          <Switch size="sm" />
          <Switch size="sm" checked />
          <Switch size="md" />
          <Switch size="md" checked />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-gray-600">Interactive</h2>
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <Switch checked={enabled} onCheckedChange={setEnabled} />
            <Label>Dark mode</Label>
          </div>
          <div className="flex items-center gap-3">
            <Switch checked={notifications} onCheckedChange={setNotifications} />
            <Label>Enable notifications</Label>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-gray-600">With Description</h2>
        <div className="flex items-start gap-3">
          <Switch checked={enabled} onCheckedChange={setEnabled} className="mt-0.5" />
          <div className="flex flex-col gap-1">
            <Label>Airplane mode</Label>
            <span className="text-sm text-gray-500">Disable all wireless connections</span>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-gray-600">Settings List</h2>
        <div className="w-80 divide-y divide-gray-200 rounded-lg border border-gray-200">
          <SettingRow label="Auto-save" description="Save changes automatically" defaultChecked />
          <SettingRow label="Spell check" description="Check spelling as you type" defaultChecked />
          <SettingRow label="Developer mode" description="Show advanced options" />
        </div>
      </section>
    </div>
  );
};

function SettingRow({
  label,
  description,
  defaultChecked = false,
}: {
  label: string;
  description: string;
  defaultChecked?: boolean;
}) {
  const [checked, setChecked] = React.useState(defaultChecked);

  return (
    <div className="flex items-center justify-between px-4 py-3">
      <div className="flex flex-col gap-0.5">
        <Label>{label}</Label>
        <span className="text-xs text-gray-500">{description}</span>
      </div>
      <Switch checked={checked} onCheckedChange={setChecked} size="sm" />
    </div>
  );
}
