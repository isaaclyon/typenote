import type { Story } from '@ladle/react';
import { Button } from '../components/ui/button.js';

export default {
  title: 'UI/Button',
};

export const Default: Story = () => <Button>Default Button</Button>;

export const Variants: Story = () => (
  <div className="flex flex-wrap gap-4">
    <Button variant="default">Default</Button>
    <Button variant="secondary">Secondary</Button>
    <Button variant="outline">Outline</Button>
    <Button variant="ghost">Ghost</Button>
    <Button variant="link">Link</Button>
    <Button variant="destructive">Destructive</Button>
  </div>
);

export const Sizes: Story = () => (
  <div className="flex items-center gap-4">
    <Button size="sm">Small</Button>
    <Button size="default">Default</Button>
    <Button size="lg">Large</Button>
    <Button size="icon">🔥</Button>
  </div>
);

export const Disabled: Story = () => (
  <div className="flex gap-4">
    <Button disabled>Disabled Default</Button>
    <Button variant="outline" disabled>
      Disabled Outline
    </Button>
  </div>
);
