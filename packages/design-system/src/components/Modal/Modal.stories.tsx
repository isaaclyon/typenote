import * as React from 'react';
import type { Story } from '@ladle/react';
import { Modal } from './Modal.js';
import { ModalHeader } from './ModalHeader.js';
import { ModalContent } from './ModalContent.js';
import { ModalFooter } from './ModalFooter.js';
import { Button } from '../Button/Button.js';

export const Default: Story = () => {
  const [open, setOpen] = React.useState(false);

  return (
    <div className="p-8">
      <Button onClick={() => setOpen(true)}>Open Modal</Button>

      <Modal open={open} onClose={() => setOpen(false)}>
        <ModalHeader title="Modal Title" />
        <ModalContent>This is the modal content. You can put anything here.</ModalContent>
        <ModalFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={() => setOpen(false)}>Confirm</Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export const DeleteConfirmation: Story = () => {
  const [open, setOpen] = React.useState(false);

  return (
    <div className="p-8">
      <Button variant="destructive" onClick={() => setOpen(true)}>
        Delete Note
      </Button>

      <Modal open={open} onClose={() => setOpen(false)}>
        <ModalHeader title="Delete note?" />
        <ModalContent>This cannot be undone.</ModalContent>
        <ModalFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={() => setOpen(false)}>
            Delete
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export const WithSubtitle: Story = () => {
  const [open, setOpen] = React.useState(false);

  return (
    <div className="p-8">
      <Button onClick={() => setOpen(true)}>Open Modal</Button>

      <Modal open={open} onClose={() => setOpen(false)}>
        <ModalHeader title="Create new project" subtitle="Enter details for your new project" />
        <ModalContent>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Project name</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-200 rounded-md focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 outline-none"
                placeholder="My Project"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                className="w-full px-3 py-2 border border-gray-200 rounded-md focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 outline-none"
                rows={3}
                placeholder="Optional description"
              />
            </div>
          </div>
        </ModalContent>
        <ModalFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={() => setOpen(false)}>Create</Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export const LongContent: Story = () => {
  const [open, setOpen] = React.useState(false);

  return (
    <div className="p-8">
      <Button onClick={() => setOpen(true)}>Open Modal</Button>

      <Modal open={open} onClose={() => setOpen(false)}>
        <ModalHeader title="Terms of Service" />
        <ModalContent className="max-h-96 overflow-y-auto">
          <p className="mb-3">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor
            incididunt ut labore et dolore magna aliqua.
          </p>
          <p className="mb-3">
            Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea
            commodo consequat.
          </p>
          <p className="mb-3">
            Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat
            nulla pariatur.
          </p>
          <p className="mb-3">
            Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt
            mollit anim id est laborum.
          </p>
          <p className="mb-3">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor
            incididunt ut labore et dolore magna aliqua.
          </p>
          <p>
            Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea
            commodo consequat.
          </p>
        </ModalContent>
        <ModalFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Decline
          </Button>
          <Button onClick={() => setOpen(false)}>Accept</Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};
