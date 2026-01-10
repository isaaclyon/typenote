import type { Story } from '@ladle/react';
import { Tag } from './Tag.js';

export default {
  title: 'Components/Tag',
};

export const AllVariants: Story = () => (
  <div className="flex flex-col gap-6">
    <section>
      <h2 className="text-lg font-semibold mb-4">Variants</h2>
      <div className="flex flex-wrap gap-2">
        <Tag variant="default">Design</Tag>
        <Tag variant="primary">Feature</Tag>
      </div>
    </section>

    <section>
      <h2 className="text-lg font-semibold mb-4">Removable</h2>
      <div className="flex flex-wrap gap-2">
        <Tag variant="default" onRemove={() => alert('Removed!')}>
          Removable
        </Tag>
        <Tag variant="primary" onRemove={() => alert('Removed!')}>
          Click X
        </Tag>
      </div>
    </section>
  </div>
);

export const Default: Story = () => <Tag>Tag</Tag>;
export const Primary: Story = () => <Tag variant="primary">Primary Tag</Tag>;
export const Removable: Story = () => (
  <Tag onRemove={() => alert('Removed!')}>Removable</Tag>
);
