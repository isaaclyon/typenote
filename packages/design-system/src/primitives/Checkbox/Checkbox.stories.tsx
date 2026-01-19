import * as React from 'react';
import type { Story } from '@ladle/react';
import { Checkbox } from './Checkbox.js';
import { Label } from '../Label/Label.js';
import { CheckboxField } from '../../patterns/CheckboxField/CheckboxField.js';

export default {
  title: 'Primitives/Checkbox',
};

export const Overview: Story = () => {
  const [checked, setChecked] = React.useState(false);
  const [indeterminate, setIndeterminate] = React.useState<boolean | 'indeterminate'>(
    'indeterminate'
  );

  const [fieldChecked, setFieldChecked] = React.useState(false);

  return (
    <div className="space-y-10 p-6">
      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-gray-600">Variants</h2>
        <div className="flex flex-wrap gap-4">
          <Checkbox />
          <Checkbox checked />
          <Checkbox checked="indeterminate" />
          <Checkbox disabled />
          <Checkbox checked disabled />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-gray-600">Sizes</h2>
        <div className="flex items-center gap-4">
          <Checkbox size="sm" />
          <Checkbox size="md" />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-gray-600">Interactive</h2>
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <Checkbox
              checked={checked}
              onCheckedChange={(nextChecked) => {
                setChecked(nextChecked === true);
              }}
            />
            <Label>Remember this choice</Label>
          </div>
          <div className="flex items-center gap-3">
            <Checkbox checked={indeterminate} onCheckedChange={setIndeterminate} />
            <Label>Partially selected items</Label>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-gray-600">With Label + Help</h2>
        <CheckboxField
          label="Share with team"
          description="Anyone in the workspace can view this note."
          checked={fieldChecked}
          onCheckedChange={(nextChecked) => {
            setFieldChecked(nextChecked === true);
          }}
        />
      </section>
    </div>
  );
};
