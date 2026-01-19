import * as React from 'react';
import type { Story } from '@ladle/react';
import { Textarea } from './Textarea.js';
import { Label } from '../Label/Label.js';

export default {
  title: 'Primitives/Textarea',
};

export const Overview: Story = () => {
  const [value, setValue] = React.useState('');

  return (
    <div className="space-y-10 p-6 max-w-md">
      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-gray-600">Default</h2>
        <Textarea placeholder="Write something..." />
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-gray-600">Variants</h2>
        <div className="space-y-3">
          <Textarea variant="default" placeholder="Default variant" />
          <Textarea variant="subtle" placeholder="Subtle variant" />
          <Textarea variant="error" placeholder="Error variant" />
          <Textarea variant="success" placeholder="Success variant" />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-gray-600">Sizes</h2>
        <div className="space-y-3">
          <Textarea size="sm" placeholder="Small textarea" />
          <Textarea size="md" placeholder="Medium textarea" />
          <Textarea size="lg" placeholder="Large textarea" />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-gray-600">With Label</h2>
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            placeholder="Enter a description..."
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
          <p className="text-xs text-gray-500">{value.length} characters</p>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-gray-600">Disabled</h2>
        <Textarea disabled placeholder="This textarea is disabled" />
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-gray-600">With Content</h2>
        <Textarea defaultValue="This is some pre-filled content that demonstrates how the textarea looks with actual text inside it. You can resize this by dragging the corner." />
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-gray-600">Non-Resizable</h2>
        <Textarea placeholder="This textarea cannot be resized" className="resize-none" />
      </section>
    </div>
  );
};
