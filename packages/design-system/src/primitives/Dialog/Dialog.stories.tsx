import * as React from 'react';
import type { Story } from '@ladle/react';

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from './Dialog.js';
import { Button } from '../Button/Button.js';
import { Input } from '../Input/Input.js';
import { Label } from '../Label/Label.js';

export default {
  title: 'Primitives/Dialog',
};

const SizeDialog = ({ size }: { size: 'sm' | 'md' | 'lg' }) => (
  <Dialog>
    <DialogTrigger asChild>
      <Button variant="outline">Open {size}</Button>
    </DialogTrigger>
    <DialogContent size={size}>
      <DialogHeader>
        <DialogTitle>Share object</DialogTitle>
        <DialogDescription>Invite collaborators and manage access.</DialogDescription>
      </DialogHeader>
      <div className="text-sm text-muted-foreground">
        This dialog demonstrates the {size} content width.
      </div>
      <DialogFooter>
        <DialogClose asChild>
          <Button variant="outline">Cancel</Button>
        </DialogClose>
        <Button>Continue</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

const FormDialog = () => (
  <Dialog>
    <DialogTrigger asChild>
      <Button variant="outline">Edit profile</Button>
    </DialogTrigger>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Edit profile</DialogTitle>
        <DialogDescription>Update how your profile appears in search.</DialogDescription>
      </DialogHeader>
      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="dialog-name">Name</Label>
          <Input id="dialog-name" defaultValue="Isaac Lyon" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="dialog-email">Email</Label>
          <Input id="dialog-email" type="email" defaultValue="isaac@typenote.app" />
        </div>
      </div>
      <DialogFooter>
        <DialogClose asChild>
          <Button variant="outline">Cancel</Button>
        </DialogClose>
        <Button>Save changes</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

const ScrollDialog = () => (
  <Dialog>
    <DialogTrigger asChild>
      <Button variant="outline">View change log</Button>
    </DialogTrigger>
    <DialogContent size="lg">
      <DialogHeader>
        <DialogTitle>Change log</DialogTitle>
        <DialogDescription>Recent updates across your workspace.</DialogDescription>
      </DialogHeader>
      <div className="max-h-60 space-y-3 overflow-y-auto pr-2 text-sm text-muted-foreground">
        <p>Added new editor embeds and improved reference suggestions.</p>
        <p>Introduced image uploads with progress tracking and retry UX.</p>
        <p>Expanded block-level formatting options for headings and callouts.</p>
        <p>Improved paste handling for markdown tables and task lists.</p>
        <p>Refined sidebar navigation with updated spacing and typography.</p>
        <p>Shipped new table primitives with hover/selection states.</p>
        <p>Updated object detail layouts to support upcoming properties.</p>
        <p>Hardened export/import pipelines with additional schema checks.</p>
        <p>Fine-tuned typography tokens for long-form writing.</p>
      </div>
      <DialogFooter>
        <DialogClose asChild>
          <Button variant="outline">Close</Button>
        </DialogClose>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

export const Overview: Story = () => (
  <div className="space-y-10 p-6">
    <section className="space-y-4">
      <h2 className="text-sm font-semibold text-gray-600">Sizes</h2>
      <div className="flex flex-wrap gap-3">
        <SizeDialog size="sm" />
        <SizeDialog size="md" />
        <SizeDialog size="lg" />
      </div>
    </section>

    <section className="space-y-4">
      <h2 className="text-sm font-semibold text-gray-600">Form</h2>
      <FormDialog />
    </section>

    <section className="space-y-4">
      <h2 className="text-sm font-semibold text-gray-600">Scrollable Content</h2>
      <ScrollDialog />
    </section>
  </div>
);

export const Controlled: Story = () => {
  const [open, setOpen] = React.useState(false);

  return (
    <div className="space-y-4 p-6">
      <div className="text-sm text-muted-foreground">
        This dialog is controlled by parent state.
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline">Open controlled</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Controlled dialog</DialogTitle>
            <DialogDescription>State lives in the parent component.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
