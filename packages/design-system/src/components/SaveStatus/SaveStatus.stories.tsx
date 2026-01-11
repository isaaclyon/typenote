import * as React from 'react';
import type { Story } from '@ladle/react';
import { SaveStatus } from './SaveStatus.js';
import type { SaveState } from './types.js';

export const AllStates: Story = () => (
  <div className="p-8 space-y-4">
    <div className="flex items-center gap-4">
      <span className="font-medium text-sm">Idle:</span>
      <SaveStatus state="idle" />
      <span className="text-xs text-gray-400">(nothing shown)</span>
    </div>

    <div className="flex items-center gap-4">
      <span className="font-medium text-sm">Saving:</span>
      <SaveStatus state="saving" />
    </div>

    <div className="flex items-center gap-4">
      <span className="font-medium text-sm">Saved:</span>
      <SaveStatus state="saved" />
    </div>

    <div className="flex items-center gap-4">
      <span className="font-medium text-sm">Error:</span>
      <SaveStatus state="error" />
    </div>
  </div>
);

export const InlineWithContent: Story = () => (
  <div className="p-8 max-w-2xl">
    <div className="border border-gray-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-semibold text-gray-800">Note title here</h2>
        <SaveStatus state="saved" />
      </div>
      <p className="text-sm text-gray-600">
        This is an example of how the save status indicator appears inline with content, typically
        near the document title or in a header area.
      </p>
    </div>
  </div>
);

export const AutomaticStateTransition: Story = () => {
  const [state, setState] = React.useState<SaveState>('idle');

  const simulateSave = () => {
    setState('saving');

    // Simulate save delay
    setTimeout(() => {
      setState('saved');

      // Clear saved state after 2 seconds
      setTimeout(() => {
        setState('idle');
      }, 2000);
    }, 1500);
  };

  const simulateError = () => {
    setState('saving');

    // Simulate save delay then error
    setTimeout(() => {
      setState('error');

      // Clear error state after 3 seconds
      setTimeout(() => {
        setState('idle');
      }, 3000);
    }, 1500);
  };

  return (
    <div className="p-8 space-y-4">
      <div className="flex items-center gap-4">
        <button
          onClick={simulateSave}
          className="px-4 py-2 bg-accent-500 text-white rounded-md hover:bg-accent-600 text-sm font-medium"
        >
          Simulate Save
        </button>
        <button
          onClick={simulateError}
          className="px-4 py-2 bg-error text-white rounded-md hover:bg-error/90 text-sm font-medium"
        >
          Simulate Error
        </button>
        <SaveStatus state={state} />
      </div>

      <div className="text-xs text-gray-500">
        Click a button to see the status transition. The saved/error states will automatically clear
        after a few seconds.
      </div>
    </div>
  );
};

export const CustomText: Story = () => (
  <div className="p-8 space-y-4">
    <div className="flex items-center gap-4">
      <span className="font-medium text-sm">Custom saving:</span>
      <SaveStatus state="saving" savingText="Syncing to cloud..." />
    </div>

    <div className="flex items-center gap-4">
      <span className="font-medium text-sm">Custom saved:</span>
      <SaveStatus state="saved" savedText="All changes saved" />
    </div>

    <div className="flex items-center gap-4">
      <span className="font-medium text-sm">Custom error:</span>
      <SaveStatus state="error" errorText="Sync failed" />
    </div>
  </div>
);
