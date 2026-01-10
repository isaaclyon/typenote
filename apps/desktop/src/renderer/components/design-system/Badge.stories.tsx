import type { Story } from '@ladle/react';
import { Badge } from '@typenote/design-system';

export default {
  title: 'Design System/Badge',
};

export const AllVariants: Story = () => (
  <div className="flex flex-col gap-6">
    <section>
      <h2 className="text-sm font-medium text-gray-500 mb-3">Status Variants</h2>
      <div className="flex flex-wrap gap-3">
        <Badge variant="default">Default</Badge>
        <Badge variant="secondary">Secondary</Badge>
        <Badge variant="outline">Outline</Badge>
        <Badge variant="error">Destructive</Badge>
      </div>
    </section>

    <section>
      <h2 className="text-sm font-medium text-gray-500 mb-3">Semantic Variants</h2>
      <div className="flex flex-wrap gap-3">
        <Badge variant="success">Success</Badge>
        <Badge variant="warning">Warning</Badge>
      </div>
    </section>

    <section>
      <h2 className="text-sm font-medium text-gray-500 mb-3">Use Cases</h2>
      <div className="flex flex-wrap gap-3">
        <Badge variant="default">New</Badge>
        <Badge variant="secondary">Draft</Badge>
        <Badge variant="success">Published</Badge>
        <Badge variant="warning">Pending Review</Badge>
        <Badge variant="error">Archived</Badge>
        <Badge variant="outline">v1.0.0</Badge>
      </div>
    </section>
  </div>
);

export const Default: Story = () => <Badge>Default</Badge>;
export const Secondary: Story = () => <Badge variant="secondary">Secondary</Badge>;
export const Outline: Story = () => <Badge variant="outline">Outline</Badge>;
export const Destructive: Story = () => <Badge variant="error">Destructive</Badge>;
export const Success: Story = () => <Badge variant="success">Success</Badge>;
export const Warning: Story = () => <Badge variant="warning">Warning</Badge>;
