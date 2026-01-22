import * as React from 'react';
import type { Story } from '@ladle/react';

import { Popover, PopoverTrigger, PopoverContent, PopoverClose } from './Popover.js';
import { Button } from '../Button/Button.js';
import { Input } from '../Input/Input.js';
import { Label } from '../Label/Label.js';

export default {
  title: 'Primitives/Popover',
};

export const Default: Story = () => (
  <div className="flex min-h-[200px] items-center justify-center p-6">
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">Open popover</Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Dimensions</h4>
            <p className="text-sm text-muted-foreground">Set the dimensions for the layer.</p>
          </div>
          <div className="grid gap-2">
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="width">Width</Label>
              <Input id="width" defaultValue="100%" className="col-span-2 h-8" />
            </div>
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="height">Height</Label>
              <Input id="height" defaultValue="25px" className="col-span-2 h-8" />
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  </div>
);

export const Positions: Story = () => (
  <div className="flex min-h-[300px] flex-wrap items-center justify-center gap-4 p-6">
    {(['top', 'right', 'bottom', 'left'] as const).map((side) => (
      <Popover key={side}>
        <PopoverTrigger asChild>
          <Button variant="outline">{side}</Button>
        </PopoverTrigger>
        <PopoverContent side={side} className="w-40">
          <p className="text-sm">Popover on {side}</p>
        </PopoverContent>
      </Popover>
    ))}
  </div>
);

export const Controlled: Story = () => {
  const [open, setOpen] = React.useState(false);

  return (
    <div className="flex min-h-[200px] flex-col items-center justify-center gap-4 p-6">
      <p className="text-sm text-muted-foreground">Open: {open ? 'true' : 'false'}</p>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline">Controlled popover</Button>
        </PopoverTrigger>
        <PopoverContent className="w-60">
          <p className="text-sm">This popover is controlled.</p>
          <PopoverClose asChild>
            <Button size="sm" className="mt-2 w-full">
              Close
            </Button>
          </PopoverClose>
        </PopoverContent>
      </Popover>
    </div>
  );
};
