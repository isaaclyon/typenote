import type { Story } from '@ladle/react';
import { Spinner } from './Spinner.js';
import { Button } from '../Button/Button.js';

export default {
  title: 'Primitives/Spinner',
};

export const Overview: Story = () => {
  return (
    <div className="space-y-10 p-6">
      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-gray-600">Sizes</h2>
        <div className="flex items-center gap-4">
          <Spinner size="sm" />
          <Spinner size="md" />
          <Spinner size="lg" />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-gray-600">Colors (inherits text color)</h2>
        <div className="flex items-center gap-4">
          <Spinner className="text-gray-400" />
          <Spinner className="text-gray-600" />
          <Spinner className="text-accent-500" />
          <Spinner className="text-error" />
          <Spinner className="text-success" />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-gray-600">In Button</h2>
        <div className="flex items-center gap-4">
          <Button disabled>
            <Spinner size="sm" className="text-white" />
            <span>Loading...</span>
          </Button>
          <Button variant="outline" disabled>
            <Spinner size="sm" />
            <span>Please wait</span>
          </Button>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-gray-600">Standalone</h2>
        <div className="flex h-32 w-full items-center justify-center rounded-lg border border-gray-200 bg-gray-50">
          <Spinner size="lg" className="text-accent-500" />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-gray-600">With Text</h2>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Spinner size="sm" />
          <span>Saving changes...</span>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-gray-600">On Dark Background</h2>
        <div className="flex h-20 w-full items-center justify-center gap-4 rounded-lg bg-gray-800">
          <Spinner className="text-white" />
          <Spinner className="text-accent-400" />
        </div>
      </section>
    </div>
  );
};
