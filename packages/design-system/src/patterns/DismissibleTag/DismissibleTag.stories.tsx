import * as React from 'react';
import type { Story } from '@ladle/react';

import { DismissibleTag } from './DismissibleTag.js';

export default {
  title: 'Patterns/DismissibleTag',
};

export const Default: Story = () => {
  const [tags, setTags] = React.useState(['Project Roadmap', 'Meeting Notes', 'John Smith']);

  const removeTag = (tag: string) => {
    setTags((prev) => prev.filter((t) => t !== tag));
  };

  return (
    <div className="space-y-4 p-6">
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <DismissibleTag key={tag} label={tag} onRemove={() => removeTag(tag)} />
        ))}
      </div>
      <p className="text-sm text-muted-foreground">Click X or focus and press Backspace/Delete</p>
    </div>
  );
};

export const Variants: Story = () => (
  <div className="space-y-4 p-6">
    <div className="flex flex-wrap gap-2">
      <DismissibleTag label="Solid (default)" onRemove={() => {}} />
      <DismissibleTag label="Outline" variant="outline" onRemove={() => {}} />
    </div>
  </div>
);

export const Sizes: Story = () => (
  <div className="space-y-4 p-6">
    <div className="flex flex-wrap items-center gap-2">
      <DismissibleTag label="Small" size="sm" onRemove={() => {}} />
      <DismissibleTag label="Medium (default)" size="md" onRemove={() => {}} />
    </div>
  </div>
);

export const CustomColors: Story = () => (
  <div className="space-y-4 p-6">
    <div className="flex flex-wrap gap-2">
      <DismissibleTag label="Blue" color="#3B82F6" onRemove={() => {}} />
      <DismissibleTag label="Green" color="#22C55E" onRemove={() => {}} />
      <DismissibleTag label="Purple" color="#8B5CF6" onRemove={() => {}} />
      <DismissibleTag label="Orange" color="#F97316" onRemove={() => {}} />
    </div>
  </div>
);

export const Disabled: Story = () => (
  <div className="p-6">
    <DismissibleTag label="Cannot remove" disabled onRemove={() => {}} />
  </div>
);

export const LongLabels: Story = () => (
  <div className="p-6">
    <DismissibleTag
      label="This is a very long tag label that should truncate"
      onRemove={() => {}}
    />
  </div>
);

export const WithoutRemove: Story = () => (
  <div className="p-6">
    <DismissibleTag label="Read only tag" />
  </div>
);
