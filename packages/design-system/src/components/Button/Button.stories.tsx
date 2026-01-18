import type { Story } from '@ladle/react';
import { Button } from './Button.js';

export const Overview: Story = () => (
  <div className="space-y-10 p-6">
    <section className="space-y-4">
      <h2 className="text-sm font-semibold text-gray-600">Variants</h2>
      <div className="flex flex-wrap gap-3">
        <Button variant="primary">Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="neutral">Neutral</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="success">Success</Button>
        <Button variant="destructive">Destructive</Button>
      </div>
    </section>

    <section className="space-y-4">
      <h2 className="text-sm font-semibold text-gray-600">Sizes</h2>
      <div className="flex flex-wrap items-center gap-3">
        <Button size="sm">Small</Button>
        <Button size="md">Medium</Button>
        <Button size="lg">Large</Button>
        <Button size="icon" aria-label="Icon button">
          <span className="text-base">+</span>
        </Button>
      </div>
    </section>

    <section className="space-y-4">
      <h2 className="text-sm font-semibold text-gray-600">States</h2>
      <div className="flex flex-wrap gap-3">
        <Button disabled>Disabled</Button>
        <Button loading>Loading</Button>
        <Button variant="outline" loading>
          Loading outline
        </Button>
        <Button variant="ghost" disabled>
          Ghost disabled
        </Button>
      </div>
    </section>

    <section className="space-y-4">
      <h2 className="text-sm font-semibold text-gray-600">Icon Leading</h2>
      <div className="flex flex-wrap gap-3">
        <Button>
          <span className="text-base">★</span>
          Starred
        </Button>
        <Button variant="secondary">
          <span className="text-base">✓</span>
          Approved
        </Button>
      </div>
    </section>

    <section className="space-y-4">
      <h2 className="text-sm font-semibold text-gray-600">Full Width</h2>
      <div className="space-y-3">
        <Button fullWidth>Primary action</Button>
        <Button variant="secondary" fullWidth>
          Secondary action
        </Button>
      </div>
    </section>
  </div>
);
