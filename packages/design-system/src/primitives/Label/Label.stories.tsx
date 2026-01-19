import type { Story } from '@ladle/react';
import { Label } from './Label.js';

export const Overview: Story = () => (
  <div className="space-y-8 p-6">
    <section className="space-y-3">
      <h2 className="text-sm font-semibold text-gray-600">Sizes</h2>
      <div className="space-y-2">
        <Label size="sm">Small label</Label>
        <Label size="md">Medium label</Label>
      </div>
    </section>

    <section className="space-y-3">
      <h2 className="text-sm font-semibold text-gray-600">Tones</h2>
      <div className="space-y-2">
        <Label>Default tone</Label>
        <Label tone="muted">Muted tone</Label>
      </div>
    </section>

    <section className="space-y-3">
      <h2 className="text-sm font-semibold text-gray-600">Required</h2>
      <div className="space-y-2">
        <Label required>Project name</Label>
      </div>
    </section>
  </div>
);
