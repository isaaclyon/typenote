import type { Story } from '@ladle/react';
import { Button } from '@typenote/design-system';

export default {
  title: 'Design System/Button',
};

export const AllVariants: Story = () => (
  <div className="flex flex-col gap-8">
    <section>
      <h2 className="text-lg font-semibold mb-4">Variants</h2>
      <div className="flex flex-wrap gap-4">
        <Button variant="default">Default</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="destructive">Destructive</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="link">Link</Button>
      </div>
    </section>

    <section>
      <h2 className="text-lg font-semibold mb-4">Sizes</h2>
      <div className="flex flex-wrap items-center gap-4">
        <Button size="lg">Large</Button>
        <Button size="default">Default</Button>
        <Button size="sm">Small</Button>
        <Button size="icon">🔔</Button>
      </div>
    </section>

    <section>
      <h2 className="text-lg font-semibold mb-4">States</h2>
      <div className="flex flex-wrap gap-4">
        <Button>Normal</Button>
        <Button disabled>Disabled</Button>
      </div>
    </section>
  </div>
);

export const Default: Story = () => <Button>Click me</Button>;
export const Secondary: Story = () => <Button variant="secondary">Secondary</Button>;
export const Destructive: Story = () => <Button variant="destructive">Delete</Button>;
export const Outline: Story = () => <Button variant="outline">Outline</Button>;
export const Ghost: Story = () => <Button variant="ghost">Ghost</Button>;
export const Link: Story = () => <Button variant="link">Link Style</Button>;
export const Disabled: Story = () => <Button disabled>Disabled</Button>;
