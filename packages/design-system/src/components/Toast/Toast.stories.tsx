import * as React from 'react';
import type { Story } from '@ladle/react';
import { Toast } from './Toast.js';
import { Check, X, AlertTriangle, Info } from 'lucide-react';

export const Default: Story = () => (
  <div className="p-8 bg-gray-100 h-screen flex items-end justify-end">
    <Toast message="Note saved" icon={Check} />
  </div>
);

export const AllVariants: Story = () => (
  <div className="p-8 bg-gray-100 h-screen flex flex-col items-end justify-end gap-3">
    <Toast message="Default toast notification" variant="default" />
    <Toast message="Note saved successfully" variant="success" icon={Check} />
    <Toast message="Failed to save note" variant="error" icon={X} />
    <Toast message="Unsaved changes" variant="warning" icon={AlertTriangle} />
    <Toast message="Feature coming soon" variant="info" icon={Info} />
  </div>
);

export const WithAction: Story = () => (
  <div className="p-8 bg-gray-100 h-screen flex items-end justify-end">
    <Toast
      message="Note deleted"
      icon={Check}
      action={{
        label: 'Undo',
        onClick: () => alert('Undo clicked'),
      }}
    />
  </div>
);

export const LongMessage: Story = () => (
  <div className="p-8 bg-gray-100 h-screen flex items-end justify-end">
    <Toast
      message="This is a longer toast message that might wrap to multiple lines depending on the viewport width"
      icon={Info}
    />
  </div>
);

export const AnimatedSlideIn: Story = () => {
  const [show, setShow] = React.useState(false);

  return (
    <div className="p-8 bg-gray-100 h-screen flex flex-col gap-4">
      <button
        onClick={() => setShow(true)}
        className="px-4 py-2 bg-accent-500 text-white rounded-md hover:bg-accent-600"
      >
        Show Toast
      </button>
      {show && (
        <div className="fixed bottom-4 right-4 animate-[slide-in-from-right_200ms_ease-out]">
          <Toast
            message="Note saved"
            icon={Check}
            action={{
              label: 'Dismiss',
              onClick: () => setShow(false),
            }}
          />
        </div>
      )}
    </div>
  );
};
