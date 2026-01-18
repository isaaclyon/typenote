import type { Story } from '@ladle/react';
import { Skeleton } from './Skeleton.js';

export const Overview: Story = () => (
  <div className="space-y-10 p-6">
    <section className="space-y-4">
      <h2 className="text-sm font-semibold text-gray-600">Lines</h2>
      <div className="space-y-3">
        <Skeleton className="h-4 w-64" />
        <Skeleton className="h-4 w-56" />
        <Skeleton className="h-4 w-72" />
      </div>
    </section>

    <section className="space-y-4">
      <h2 className="text-sm font-semibold text-gray-600">Cards</h2>
      <div className="space-y-4">
        <div className="space-y-3 rounded-lg border border-gray-200 p-4">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-5/6" />
        </div>
        <div className="space-y-3 rounded-lg border border-gray-200 p-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-2/3" />
        </div>
      </div>
    </section>

    <section className="space-y-4">
      <h2 className="text-sm font-semibold text-gray-600">Avatar</h2>
      <div className="flex items-center gap-4">
        <Skeleton rounded="full" className="h-10 w-10" />
        <div className="space-y-2">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-3 w-40" />
        </div>
      </div>
    </section>

    <section className="space-y-4">
      <h2 className="text-sm font-semibold text-gray-600">Rounded Variants</h2>
      <div className="flex flex-wrap items-center gap-3">
        <Skeleton rounded="sm" className="h-6 w-24" />
        <Skeleton rounded="md" className="h-6 w-24" />
        <Skeleton rounded="full" className="h-6 w-24" />
      </div>
    </section>
  </div>
);
