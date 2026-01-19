import * as React from 'react';
import type { Story } from '@ladle/react';

import { SwitchField } from './SwitchField.js';

export default {
  title: 'Patterns/SwitchField',
};

// ============================================================================
// Overview
// ============================================================================

export const Overview: Story = () => {
  const [enabled, setEnabled] = React.useState(false);

  return (
    <div className="max-w-sm space-y-6 p-6">
      <SwitchField
        label="Email notifications"
        checked={enabled}
        onCheckedChange={setEnabled}
        help="Receive email updates about your account activity."
      />

      <SwitchField
        label="Marketing emails"
        help="Get notified about new features and promotions."
      />

      <SwitchField label="Dark mode" defaultChecked />
    </div>
  );
};

// ============================================================================
// States
// ============================================================================

export const States: Story = () => (
  <div className="max-w-sm space-y-6 p-6">
    <SwitchField label="Default (off)" />

    <SwitchField label="Default (on)" defaultChecked />

    <SwitchField label="With help text" help="This is optional help text explaining the setting." />

    <SwitchField label="Disabled (off)" disabled />

    <SwitchField label="Disabled (on)" disabled defaultChecked />
  </div>
);

// ============================================================================
// Sizes
// ============================================================================

export const Sizes: Story = () => (
  <div className="max-w-sm space-y-6 p-6">
    <SwitchField label="Small switch" size="sm" help="A smaller switch variant." />

    <SwitchField label="Medium switch (default)" size="md" help="The default switch size." />
  </div>
);

// ============================================================================
// Settings Panel Example
// ============================================================================

export const SettingsExample: Story = () => {
  const [settings, setSettings] = React.useState({
    notifications: true,
    sounds: true,
    autoSave: true,
    analytics: false,
    darkMode: false,
  });

  const toggle = (key: keyof typeof settings) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="max-w-md rounded-lg border border-border p-6">
      <h2 className="mb-6 text-base font-medium">Settings</h2>

      <div className="space-y-5">
        <SwitchField
          label="Push notifications"
          checked={settings.notifications}
          onCheckedChange={() => toggle('notifications')}
          help="Receive push notifications for important updates."
        />

        <SwitchField
          label="Sound effects"
          checked={settings.sounds}
          onCheckedChange={() => toggle('sounds')}
          help="Play sounds for notifications and actions."
        />

        <SwitchField
          label="Auto-save"
          checked={settings.autoSave}
          onCheckedChange={() => toggle('autoSave')}
          help="Automatically save your work every few minutes."
        />

        <div className="my-4 h-px bg-border" />

        <SwitchField
          label="Usage analytics"
          checked={settings.analytics}
          onCheckedChange={() => toggle('analytics')}
          help="Help us improve by sending anonymous usage data."
        />

        <SwitchField
          label="Dark mode"
          checked={settings.darkMode}
          onCheckedChange={() => toggle('darkMode')}
          help="Use dark theme for the interface."
        />
      </div>
    </div>
  );
};

// ============================================================================
// Form Row Layout
// ============================================================================

export const FormRowLayout: Story = () => (
  <div className="max-w-lg p-6">
    <h2 className="mb-4 text-base font-medium">Privacy Settings</h2>
    <div className="space-y-4 rounded-lg border border-border p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">Make profile public</p>
          <p className="text-sm text-muted-foreground">Allow others to see your profile</p>
        </div>
        <SwitchField label="" aria-label="Make profile public" />
      </div>

      <div className="h-px bg-border" />

      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">Show online status</p>
          <p className="text-sm text-muted-foreground">Display when you're active</p>
        </div>
        <SwitchField label="" aria-label="Show online status" defaultChecked />
      </div>

      <div className="h-px bg-border" />

      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">Allow search indexing</p>
          <p className="text-sm text-muted-foreground">Let search engines find your profile</p>
        </div>
        <SwitchField label="" aria-label="Allow search indexing" />
      </div>
    </div>
  </div>
);
