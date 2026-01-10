import type { Story } from '@ladle/react';
import { Checkbox } from './Checkbox.js';

export default {
  title: 'Components/Checkbox',
};

export const AllVariants: Story = () => (
  <div className="flex flex-col gap-6">
    <section>
      <h2 className="text-lg font-semibold mb-4">States</h2>
      <div className="flex flex-col gap-3">
        <label className="flex items-center gap-2">
          <Checkbox />
          <span>Unchecked</span>
        </label>
        <label className="flex items-center gap-2">
          <Checkbox defaultChecked />
          <span>Checked</span>
        </label>
        <label className="flex items-center gap-2">
          <Checkbox indeterminate />
          <span>Indeterminate</span>
        </label>
        <label className="flex items-center gap-2">
          <Checkbox disabled />
          <span>Disabled</span>
        </label>
        <label className="flex items-center gap-2">
          <Checkbox disabled defaultChecked />
          <span>Disabled Checked</span>
        </label>
      </div>
    </section>
  </div>
);

export const Default: Story = () => <Checkbox />;
export const Checked: Story = () => <Checkbox defaultChecked />;
export const Indeterminate: Story = () => <Checkbox indeterminate />;
export const Disabled: Story = () => <Checkbox disabled />;
