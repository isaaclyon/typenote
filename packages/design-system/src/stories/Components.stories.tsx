import type { Story } from '@ladle/react';
import { useState } from 'react';
import { Button } from '../components/ui/button.js';
import { Input } from '../components/ui/input.js';
import { Checkbox } from '../components/ui/checkbox.js';
import { Switch } from '../components/ui/switch.js';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '../components/ui/card.js';
import { Badge } from '../components/ui/badge.js';
import { Skeleton } from '../components/ui/skeleton.js';
import { Label } from '../components/ui/label.js';
import { Separator } from '../components/ui/separator.js';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../components/ui/dialog.js';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu.js';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../components/ui/tooltip.js';
import { ScrollArea } from '../components/ui/scroll-area.js';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '../components/ui/command.js';

export default {
  title: 'UI/All Components',
};

export const Inputs: Story = () => (
  <div className="space-y-4 p-4 max-w-md">
    <div className="space-y-2">
      <Label htmlFor="email">Email</Label>
      <Input id="email" type="email" placeholder="Enter your email" />
    </div>
    <div className="space-y-2">
      <Label htmlFor="disabled">Disabled</Label>
      <Input id="disabled" disabled placeholder="Disabled input" />
    </div>
  </div>
);

export const CheckboxAndSwitch: Story = () => {
  const [checked, setChecked] = useState(false);
  const [enabled, setEnabled] = useState(false);

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center gap-2">
        <Checkbox checked={checked} onCheckedChange={setChecked} />
        <Label>Checkbox: {checked ? 'Checked' : 'Unchecked'}</Label>
      </div>
      <div className="flex items-center gap-2">
        <Switch checked={enabled} onCheckedChange={setEnabled} />
        <Label>Switch: {enabled ? 'On' : 'Off'}</Label>
      </div>
    </div>
  );
};

export const Cards: Story = () => (
  <div className="p-4 max-w-md">
    <Card>
      <CardHeader>
        <CardTitle>Card Title</CardTitle>
        <CardDescription>Card description with supporting text.</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Card content goes here. This is a basic card component.</p>
      </CardContent>
    </Card>
  </div>
);

export const Badges: Story = () => (
  <div className="flex gap-2 p-4">
    <Badge>Default</Badge>
    <Badge variant="secondary">Secondary</Badge>
    <Badge variant="outline">Outline</Badge>
    <Badge variant="destructive">Destructive</Badge>
  </div>
);

export const Skeletons: Story = () => (
  <div className="space-y-3 p-4 max-w-md">
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-3/4" />
    <Skeleton className="h-4 w-1/2" />
    <div className="flex items-center gap-3">
      <Skeleton className="h-10 w-10 rounded-full" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-24" />
      </div>
    </div>
  </div>
);

export const DialogExample: Story = () => (
  <Dialog>
    <DialogTrigger asChild>
      <Button>Open Dialog</Button>
    </DialogTrigger>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Dialog Title</DialogTitle>
        <DialogDescription>
          This is a dialog description. Dialogs are used for important confirmations or forms.
        </DialogDescription>
      </DialogHeader>
      <div className="py-4">
        <Input placeholder="Type something..." />
      </div>
    </DialogContent>
  </Dialog>
);

export const DropdownExample: Story = () => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="outline">Open Menu</Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent>
      <DropdownMenuLabel>My Account</DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuItem>Profile</DropdownMenuItem>
      <DropdownMenuItem>Settings</DropdownMenuItem>
      <DropdownMenuItem>Logout</DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
);

export const TooltipExample: Story = () => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="outline">Hover me</Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>This is a tooltip</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

export const ScrollAreaExample: Story = () => (
  <ScrollArea className="h-48 w-64 rounded-md border p-4">
    <div className="space-y-4">
      {Array.from({ length: 20 }).map((_, i) => (
        <div key={i} className="text-sm">
          Scroll item {i + 1}
        </div>
      ))}
    </div>
  </ScrollArea>
);

export const CommandExample: Story = () => (
  <Command className="rounded-lg border shadow-md max-w-md">
    <CommandInput placeholder="Type a command or search..." />
    <CommandList>
      <CommandEmpty>No results found.</CommandEmpty>
      <CommandGroup heading="Suggestions">
        <CommandItem>Calendar</CommandItem>
        <CommandItem>Search</CommandItem>
        <CommandItem>Settings</CommandItem>
      </CommandGroup>
    </CommandList>
  </Command>
);

export const SeparatorExample: Story = () => (
  <div className="p-4 max-w-md space-y-4">
    <div>
      <h4 className="font-medium">Section One</h4>
      <p className="text-sm text-muted-foreground">Content for section one.</p>
    </div>
    <Separator />
    <div>
      <h4 className="font-medium">Section Two</h4>
      <p className="text-sm text-muted-foreground">Content for section two.</p>
    </div>
  </div>
);
