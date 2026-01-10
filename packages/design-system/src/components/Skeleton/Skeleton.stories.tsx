import type { Story } from '@ladle/react';
import { Skeleton } from './Skeleton.js';

export default {
  title: 'Components/Skeleton',
};

export const AllVariants: Story = () => (
  <div className="flex flex-col gap-6">
    <section>
      <h2 className="text-lg font-semibold mb-4">Shapes</h2>
      <div className="flex flex-col gap-3">
        <Skeleton className="h-4 w-64" />
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-12 w-full max-w-md" />
        <Skeleton className="h-32 w-32 rounded-full" />
      </div>
    </section>

    <section>
      <h2 className="text-lg font-semibold mb-4">Card Skeleton</h2>
      <div className="border border-gray-200 rounded-md p-4 max-w-md">
        <div className="flex items-center gap-3 mb-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="flex-1">
            <Skeleton className="h-4 w-32 mb-2" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-5/6" />
      </div>
    </section>
  </div>
);

export const Line: Story = () => <Skeleton className="h-4 w-64" />;
export const Circle: Story = () => <Skeleton className="h-16 w-16 rounded-full" />;
export const Block: Story = () => <Skeleton className="h-32 w-64" />;
