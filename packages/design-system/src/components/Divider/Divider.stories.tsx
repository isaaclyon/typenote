import type { Story } from '@ladle/react';
import { Divider } from './Divider.js';

export const Overview: Story = () => (
  <div className="space-y-10 p-6">
    <section className="space-y-4">
      <h2 className="text-sm font-semibold text-gray-600">Horizontal</h2>
      <div className="space-y-4">
        <div className="space-y-3">
          <p className="text-sm text-gray-600">Section one</p>
          <Divider />
          <p className="text-sm text-gray-600">Section two</p>
        </div>
        <div className="space-y-3">
          <p className="text-sm text-gray-500">Muted divider</p>
          <Divider tone="subtle" />
          <p className="text-sm text-gray-500">Secondary content</p>
        </div>
      </div>
    </section>

    <section className="space-y-4">
      <h2 className="text-sm font-semibold text-gray-600">Vertical</h2>
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-600">Left</span>
        <Divider orientation="vertical" className="h-6" />
        <span className="text-sm text-gray-600">Right</span>
      </div>
    </section>
  </div>
);
