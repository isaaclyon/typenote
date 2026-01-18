import * as React from 'react';
import type { Story } from '@ladle/react';

import { CheckboxField } from './CheckboxField.js';

export const Overview: Story = () => {
  const [checked, setChecked] = React.useState(false);

  return (
    <div className="space-y-6 p-6">
      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-gray-600">Default</h2>
        <CheckboxField
          label="Share with team"
          description="Anyone in the workspace can view this note."
        />
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-gray-600">Interactive</h2>
        <CheckboxField
          label="Remember this choice"
          checked={checked}
          onCheckedChange={(nextChecked) => {
            setChecked(nextChecked === true);
          }}
        />
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-gray-600">Disabled</h2>
        <CheckboxField
          label="Sync over cellular"
          description="Requires a paid plan."
          checked
          disabled
        />
      </section>
    </div>
  );
};
