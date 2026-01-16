import * as React from 'react';
import type { Story } from '@ladle/react';
import { Toast } from './Toast.js';
import { Toaster } from './Toaster.js';
import { toast } from 'sonner';
import { Check, X, AlertTriangle, Info } from 'lucide-react';

export const Default: Story = () => (
  <div className="p-8 bg-white h-screen flex items-end justify-end">
    <Toast message="Default toast notification" variant="default" />
  </div>
);

export const AllVariants: Story = () => (
  <div className="p-8 bg-white h-screen flex flex-col items-end justify-end gap-3">
    <Toast message="Default toast notification" variant="default" />
    <Toast message="Note saved successfully" variant="success" icon={Check} />
    <Toast message="Failed to save note" variant="error" icon={X} />
    <Toast message="Unsaved changes" variant="warning" icon={AlertTriangle} />
    <Toast message="Feature coming soon" variant="info" icon={Info} />
  </div>
);

export const WithAction: Story = () => (
  <div className="p-8 bg-white h-screen flex items-end justify-end">
    <Toast
      message="Note deleted"
      variant="success"
      icon={Check}
      action={{
        label: 'Undo',
        onClick: () => alert('Undo clicked'),
      }}
    />
  </div>
);

export const LongMessage: Story = () => (
  <div className="p-8 bg-white h-screen flex items-end justify-end">
    <Toast
      message="This is a longer toast message that might wrap to multiple lines depending on the viewport width"
      variant="info"
      icon={Info}
    />
  </div>
);

export const AnimatedSlideIn: Story = () => {
  const [show, setShow] = React.useState(false);

  return (
    <div className="p-8 bg-white h-screen flex flex-col gap-4">
      <button
        onClick={() => setShow(true)}
        className="px-4 py-2 bg-accent-500 text-white rounded-md hover:bg-accent-600"
      >
        Show Toast
      </button>
      {show && (
        <div className="fixed bottom-4 right-4 animate-[slide-in-from-right_200ms_ease-out]">
          <Toast
            message="Note saved successfully"
            variant="success"
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

/**
 * Interactive demo using Sonner's toast system.
 * Click buttons to trigger real toast notifications.
 */
export const ToasterDemo: Story = () => {
  return (
    <div className="p-8 bg-white min-h-screen">
      <h2 className="text-lg font-semibold mb-4">Toaster Demo (Sonner)</h2>
      <p className="text-sm text-gray-500 mb-6">
        Click buttons to trigger toast notifications (bottom-right)
      </p>

      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => toast('Default notification')}
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-sm font-medium transition-colors"
        >
          Default
        </button>

        <button
          onClick={() => toast.success('Operation completed successfully')}
          className="px-4 py-2 bg-green-100 hover:bg-green-200 text-green-800 rounded-md text-sm font-medium transition-colors"
        >
          Success
        </button>

        <button
          onClick={() => toast.error('Something went wrong')}
          className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-800 rounded-md text-sm font-medium transition-colors"
        >
          Error
        </button>

        <button
          onClick={() => toast.warning?.('Please review before continuing')}
          className="px-4 py-2 bg-yellow-100 hover:bg-yellow-200 text-yellow-800 rounded-md text-sm font-medium transition-colors"
        >
          Warning
        </button>

        <button
          onClick={() => toast.info?.('Here is some information')}
          className="px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-md text-sm font-medium transition-colors"
        >
          Info
        </button>

        <button
          onClick={() =>
            toast('With description', {
              description: 'Additional context below the title.',
            })
          }
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-sm font-medium transition-colors"
        >
          With Description
        </button>
      </div>

      <Toaster />
    </div>
  );
};
