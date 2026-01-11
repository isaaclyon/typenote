import type { Story } from '@ladle/react';
import { useState } from 'react';
import { TagAddButton } from './TagAddButton.js';
import { Tag } from '../Tag/Tag.js';

export default {
  title: 'Components/TagAddButton',
};

export const Default: Story = () => <TagAddButton onClick={() => alert('Add tag clicked!')} />;

export const Disabled: Story = () => <TagAddButton disabled />;

export const WithTags: Story = () => {
  const [tags, setTags] = useState([
    { id: 1, label: 'project' },
    { id: 2, label: 'backend' },
  ]);

  const handleAdd = () => {
    const newTag = prompt('Enter tag name:');
    if (newTag) {
      setTags([...tags, { id: Date.now(), label: newTag }]);
    }
  };

  const handleRemove = (id: number) => {
    setTags(tags.filter((tag) => tag.id !== id));
  };

  return (
    <div className="flex flex-col gap-2 w-64">
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <Tag key={tag.id} onRemove={() => handleRemove(tag.id)}>
            {tag.label}
          </Tag>
        ))}
      </div>
      <TagAddButton onClick={handleAdd} />
    </div>
  );
};

export const InContext: Story = () => {
  return (
    <div className="w-64 p-4 border border-gray-200 rounded-md">
      <h3 className="text-sm font-medium text-gray-900 mb-3">Tags</h3>
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap gap-2">
          <Tag onRemove={() => alert('Remove')}>design</Tag>
          <Tag onRemove={() => alert('Remove')}>architecture</Tag>
          <Tag onRemove={() => alert('Remove')}>frontend</Tag>
        </div>
        <TagAddButton onClick={() => alert('Add tag')} />
      </div>
    </div>
  );
};
