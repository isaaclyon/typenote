import type { Story } from '@ladle/react';
import { Input } from './Input.js';

export const Overview: Story = () => (
  <div className="space-y-10 p-6">
    <section className="space-y-4">
      <h2 className="text-sm font-semibold text-gray-600">Variants</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        <Input placeholder="Default input" />
        <Input variant="subtle" placeholder="Subtle input" />
        <Input variant="success" placeholder="Success input" defaultValue="Looks good" />
        <Input variant="error" placeholder="Error input" defaultValue="Needs attention" />
      </div>
    </section>

    <section className="space-y-4">
      <h2 className="text-sm font-semibold text-gray-600">Sizes</h2>
      <div className="grid gap-3">
        <Input size="sm" placeholder="Small input" />
        <Input size="md" placeholder="Medium input" />
        <Input size="lg" placeholder="Large input" />
      </div>
    </section>

    <section className="space-y-4">
      <h2 className="text-sm font-semibold text-gray-600">States</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        <Input disabled placeholder="Disabled input" />
        <Input placeholder="With placeholder" />
      </div>
    </section>
  </div>
);
