import * as React from 'react';
import type { Story } from '@ladle/react';
import {
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectLabel,
} from './Select.js';
import { Label } from '../Label/Label.js';

export default {
  title: 'Primitives/Select',
};

export const Overview: Story = () => {
  const [fruit, setFruit] = React.useState<string | null>(null);
  const [status, setStatus] = React.useState<string | null>('active');
  const [showFruitDropdown, setShowFruitDropdown] = React.useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = React.useState(false);

  const fruits = ['Apple', 'Banana', 'Cherry', 'Dragon Fruit', 'Elderberry'];
  const statuses = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'pending', label: 'Pending' },
  ];

  return (
    <div className="space-y-10 p-6">
      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-gray-600">Trigger Only</h2>
        <p className="text-xs text-gray-500">
          SelectTrigger is a primitive that renders the button. Pair with a popover library for the
          dropdown.
        </p>
        <div className="flex gap-4">
          <SelectTrigger placeholder="Select a fruit" className="w-48">
            {fruit}
          </SelectTrigger>
          <SelectTrigger placeholder="Choose..." className="w-32" size="sm" />
          <SelectTrigger placeholder="Large" className="w-32" size="lg" />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-gray-600">Sizes</h2>
        <div className="flex items-center gap-4">
          <SelectTrigger size="sm" className="w-32">
            Small
          </SelectTrigger>
          <SelectTrigger size="md" className="w-32">
            Medium
          </SelectTrigger>
          <SelectTrigger size="lg" className="w-32">
            Large
          </SelectTrigger>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-gray-600">Variants</h2>
        <div className="flex items-center gap-4">
          <SelectTrigger variant="default" className="w-32">
            Default
          </SelectTrigger>
          <SelectTrigger variant="error" className="w-32">
            Error
          </SelectTrigger>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-gray-600">States</h2>
        <div className="flex items-center gap-4">
          <SelectTrigger placeholder="Placeholder" className="w-40" />
          <SelectTrigger className="w-40">With Value</SelectTrigger>
          <SelectTrigger disabled className="w-40">
            Disabled
          </SelectTrigger>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-gray-600">Interactive Demo</h2>
        <p className="text-xs text-gray-500">Click trigger to show dropdown simulation</p>

        <div className="relative">
          <SelectTrigger
            placeholder="Select a fruit"
            className="w-48"
            onClick={() => setShowFruitDropdown(!showFruitDropdown)}
          >
            {fruit}
          </SelectTrigger>

          {showFruitDropdown && (
            <SelectContent className="absolute top-full mt-1 w-48">
              {fruits.map((f) => (
                <SelectItem
                  key={f}
                  value={f}
                  selected={fruit === f}
                  onClick={() => {
                    setFruit(f);
                    setShowFruitDropdown(false);
                  }}
                >
                  {f}
                </SelectItem>
              ))}
            </SelectContent>
          )}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-gray-600">With Groups</h2>

        <div className="relative">
          <SelectTrigger
            placeholder="Select status"
            className="w-48"
            onClick={() => setShowStatusDropdown(!showStatusDropdown)}
          >
            {status && statuses.find((s) => s.value === status)?.label}
          </SelectTrigger>

          {showStatusDropdown && (
            <SelectContent className="absolute top-full mt-1 w-48">
              <SelectLabel>Status</SelectLabel>
              {statuses.map((s) => (
                <SelectItem
                  key={s.value}
                  value={s.value}
                  selected={status === s.value}
                  onClick={() => {
                    setStatus(s.value);
                    setShowStatusDropdown(false);
                  }}
                >
                  {s.label}
                </SelectItem>
              ))}
              <SelectSeparator />
              <SelectItem
                value="clear"
                onClick={() => {
                  setStatus(null);
                  setShowStatusDropdown(false);
                }}
              >
                Clear selection
              </SelectItem>
            </SelectContent>
          )}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-gray-600">Content Parts</h2>
        <p className="text-xs text-gray-500">
          All dropdown parts rendered statically for reference
        </p>

        <SelectContent className="w-56">
          <SelectLabel>Fruits</SelectLabel>
          <SelectItem value="apple" selected>
            Apple
          </SelectItem>
          <SelectItem value="banana">Banana</SelectItem>
          <SelectItem value="cherry">Cherry</SelectItem>
          <SelectSeparator />
          <SelectLabel>Vegetables</SelectLabel>
          <SelectItem value="carrot">Carrot</SelectItem>
          <SelectItem value="broccoli" disabled>
            Broccoli (sold out)
          </SelectItem>
          <SelectItem value="spinach">Spinach</SelectItem>
        </SelectContent>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-gray-600">With Label</h2>
        <div className="space-y-2">
          <Label>Category</Label>
          <SelectTrigger placeholder="Select category" className="w-48" />
        </div>
      </section>
    </div>
  );
};
