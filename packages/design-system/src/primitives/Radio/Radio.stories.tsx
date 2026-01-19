import * as React from 'react';
import type { Story } from '@ladle/react';
import { RadioGroup, RadioItem } from './Radio.js';
import { Label } from '../Label/Label.js';

export default {
  title: 'Primitives/Radio',
};

export const Overview: Story = () => {
  const [view, setView] = React.useState('list');
  const [size, setSize] = React.useState('medium');

  return (
    <div className="space-y-10 p-6">
      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-gray-600">Basic</h2>
        <RadioGroup name="view" value={view} onValueChange={setView}>
          <div className="flex items-center gap-3">
            <RadioItem value="list" />
            <Label>List view</Label>
          </div>
          <div className="flex items-center gap-3">
            <RadioItem value="grid" />
            <Label>Grid view</Label>
          </div>
          <div className="flex items-center gap-3">
            <RadioItem value="board" />
            <Label>Board view</Label>
          </div>
        </RadioGroup>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-gray-600">Sizes</h2>
        <div className="flex gap-8">
          <RadioGroup name="size-sm" defaultValue="a" size="sm">
            <div className="flex items-center gap-2">
              <RadioItem value="a" />
              <Label size="sm">Small A</Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioItem value="b" />
              <Label size="sm">Small B</Label>
            </div>
          </RadioGroup>

          <RadioGroup name="size-md" defaultValue="a" size="md">
            <div className="flex items-center gap-3">
              <RadioItem value="a" />
              <Label>Medium A</Label>
            </div>
            <div className="flex items-center gap-3">
              <RadioItem value="b" />
              <Label>Medium B</Label>
            </div>
          </RadioGroup>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-gray-600">Disabled</h2>
        <RadioGroup name="disabled" defaultValue="enabled" disabled>
          <div className="flex items-center gap-3">
            <RadioItem value="enabled" />
            <Label className="opacity-50">Option A (disabled group)</Label>
          </div>
          <div className="flex items-center gap-3">
            <RadioItem value="disabled" />
            <Label className="opacity-50">Option B (disabled group)</Label>
          </div>
        </RadioGroup>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-gray-600">With Descriptions</h2>
        <RadioGroup name="plan" value={size} onValueChange={setSize}>
          <RadioOption value="small" label="Small" description="Good for personal use" />
          <RadioOption value="medium" label="Medium" description="Good for small teams" />
          <RadioOption value="large" label="Large" description="Good for organizations" />
        </RadioGroup>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-gray-600">Horizontal</h2>
        <RadioGroup name="alignment" defaultValue="left" className="flex-row gap-6">
          <div className="flex items-center gap-2">
            <RadioItem value="left" />
            <Label>Left</Label>
          </div>
          <div className="flex items-center gap-2">
            <RadioItem value="center" />
            <Label>Center</Label>
          </div>
          <div className="flex items-center gap-2">
            <RadioItem value="right" />
            <Label>Right</Label>
          </div>
        </RadioGroup>
      </section>
    </div>
  );
};

function RadioOption({
  value,
  label,
  description,
}: {
  value: string;
  label: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <RadioItem value={value} className="mt-0.5" />
      <div className="flex flex-col gap-0.5">
        <Label>{label}</Label>
        <span className="text-sm text-gray-500">{description}</span>
      </div>
    </div>
  );
}
