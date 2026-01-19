import type { Story } from '@ladle/react';
import { Plus, Star, X } from '@phosphor-icons/react/ssr';
import { IconButton } from './IconButton.js';

const sizeIconMap = {
  sm: 'h-3.5 w-3.5',
  md: 'h-4 w-4',
  lg: 'h-5 w-5',
};

export const Overview: Story = () => (
  <div className="space-y-10 p-6">
    <section className="space-y-4">
      <h2 className="text-sm font-semibold text-gray-600">Variants</h2>
      <div className="flex flex-wrap gap-3">
        <IconButton aria-label="Add" variant="primary">
          <Plus className={sizeIconMap.md} weight="bold" />
        </IconButton>
        <IconButton aria-label="Close" variant="secondary">
          <X className={sizeIconMap.md} weight="bold" />
        </IconButton>
        <IconButton aria-label="Star" variant="neutral">
          <Star className={sizeIconMap.md} weight="fill" />
        </IconButton>
        <IconButton aria-label="Close" variant="outline">
          <X className={sizeIconMap.md} weight="bold" />
        </IconButton>
        <IconButton aria-label="Star" variant="ghost">
          <Star className={sizeIconMap.md} weight="fill" />
        </IconButton>
        <IconButton aria-label="Delete" variant="destructive">
          <X className={sizeIconMap.md} weight="bold" />
        </IconButton>
        <IconButton aria-label="Confirm" variant="success">
          <Plus className={sizeIconMap.md} weight="bold" />
        </IconButton>
      </div>
    </section>

    <section className="space-y-4">
      <h2 className="text-sm font-semibold text-gray-600">Sizes</h2>
      <div className="flex flex-wrap items-center gap-3">
        <IconButton aria-label="Small add" size="sm" variant="secondary">
          <Plus className={sizeIconMap.sm} weight="bold" />
        </IconButton>
        <IconButton aria-label="Medium add" size="md" variant="secondary">
          <Plus className={sizeIconMap.md} weight="bold" />
        </IconButton>
        <IconButton aria-label="Large add" size="lg" variant="secondary">
          <Plus className={sizeIconMap.lg} weight="bold" />
        </IconButton>
      </div>
    </section>

    <section className="space-y-4">
      <h2 className="text-sm font-semibold text-gray-600">States</h2>
      <div className="flex flex-wrap items-center gap-3">
        <IconButton aria-label="Disabled" variant="outline" disabled>
          <X className={sizeIconMap.md} weight="bold" />
        </IconButton>
        <IconButton aria-label="Disabled" variant="ghost" disabled>
          <Star className={sizeIconMap.md} weight="fill" />
        </IconButton>
      </div>
    </section>
  </div>
);
