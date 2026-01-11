import type { Story } from '@ladle/react';
import { useState } from 'react';
import { Tag } from './Tag.js';

export default {
  title: 'Components/Tag',
};

export const AllVariants: Story = () => (
  <div className="flex flex-col gap-6">
    <section>
      <h2 className="text-lg font-semibold mb-4">Static Tags</h2>
      <div className="flex flex-wrap gap-2">
        <Tag variant="default">Design</Tag>
        <Tag variant="primary">Feature</Tag>
      </div>
    </section>

    <section>
      <h2 className="text-lg font-semibold mb-4">Clickable (Navigation)</h2>
      <div className="flex flex-wrap gap-2">
        <Tag onClick={() => alert('Navigate to #project')}>project</Tag>
        <Tag onClick={() => alert('Navigate to #backend')}>backend</Tag>
        <Tag onClick={() => alert('Navigate to #architecture')}>architecture</Tag>
      </div>
      <p className="text-xs text-gray-500 mt-2">Click to navigate • Keyboard accessible</p>
    </section>

    <section>
      <h2 className="text-lg font-semibold mb-4">Removable Only</h2>
      <div className="flex flex-wrap gap-2">
        <Tag variant="default" onRemove={() => alert('Removed!')}>
          Removable
        </Tag>
        <Tag variant="primary" onRemove={() => alert('Removed!')}>
          Click X
        </Tag>
      </div>
    </section>

    <section>
      <h2 className="text-lg font-semibold mb-4">Interactive (Click + Remove)</h2>
      <div className="flex flex-wrap gap-2">
        <Tag
          onClick={() => alert('Navigate to #project')}
          onRemove={() => alert('Remove #project')}
        >
          project
        </Tag>
        <Tag
          onClick={() => alert('Navigate to #backend')}
          onRemove={() => alert('Remove #backend')}
        >
          backend
        </Tag>
        <Tag onClick={() => alert('Navigate to #ui')} onRemove={() => alert('Remove #ui')}>
          ui
        </Tag>
      </div>
      <p className="text-xs text-gray-500 mt-2">Click tag to navigate • Click X to remove</p>
    </section>
  </div>
);

export const Default: Story = () => <Tag>Tag</Tag>;
export const Primary: Story = () => <Tag variant="primary">Primary Tag</Tag>;
export const Clickable: Story = () => <Tag onClick={() => alert('Clicked!')}>Clickable Tag</Tag>;
export const Removable: Story = () => <Tag onRemove={() => alert('Removed!')}>Removable</Tag>;

export const Interactive: Story = () => {
  const [tags, setTags] = useState([
    { id: 1, label: 'project' },
    { id: 2, label: 'backend' },
    { id: 3, label: 'architecture' },
    { id: 4, label: 'design' },
  ]);

  const handleRemove = (id: number) => {
    setTags(tags.filter((tag) => tag.id !== id));
  };

  const handleClick = (label: string) => {
    alert(`Navigate to filtered view: #${label}`);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <Tag
            key={tag.id}
            onClick={() => handleClick(tag.label)}
            onRemove={() => handleRemove(tag.id)}
          >
            {tag.label}
          </Tag>
        ))}
      </div>
      {tags.length === 0 && <p className="text-sm text-gray-400">No tags yet</p>}
    </div>
  );
};
