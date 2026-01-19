import * as React from 'react';
import type { Story } from '@ladle/react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
} from './DropdownMenu.js';
import { Button } from '../Button/index.js';
import { Plus } from '@phosphor-icons/react/dist/ssr/Plus';
import { Trash } from '@phosphor-icons/react/dist/ssr/Trash';
import { Copy } from '@phosphor-icons/react/dist/ssr/Copy';
import { PencilSimple } from '@phosphor-icons/react/dist/ssr/PencilSimple';
import { Gear } from '@phosphor-icons/react/dist/ssr/Gear';
import { User } from '@phosphor-icons/react/dist/ssr/User';
import { SignOut } from '@phosphor-icons/react/dist/ssr/SignOut';
import { Star } from '@phosphor-icons/react/dist/ssr/Star';

export default {
  title: 'Primitives / DropdownMenu',
};

// ============================================================================
// Default
// ============================================================================

export const Default: Story = () => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="outline">Open Menu</Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent className="w-56">
      <DropdownMenuLabel>My Account</DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuGroup>
        <DropdownMenuItem>
          <User className="h-4 w-4" />
          Profile
          <DropdownMenuShortcut>Shift+P</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Gear className="h-4 w-4" />
          Settings
          <DropdownMenuShortcut>Cmd+,</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuGroup>
      <DropdownMenuSeparator />
      <DropdownMenuItem>
        <SignOut className="h-4 w-4" />
        Log out
        <DropdownMenuShortcut>Shift+Q</DropdownMenuShortcut>
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
);

// ============================================================================
// With Icons
// ============================================================================

export const WithIcons: Story = () => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="outline">Actions</Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent className="w-48">
      <DropdownMenuItem>
        <Plus className="h-4 w-4" />
        New Item
      </DropdownMenuItem>
      <DropdownMenuItem>
        <Copy className="h-4 w-4" />
        Duplicate
      </DropdownMenuItem>
      <DropdownMenuItem>
        <PencilSimple className="h-4 w-4" />
        Edit
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem destructive>
        <Trash className="h-4 w-4" />
        Delete
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
);

// ============================================================================
// With Checkboxes
// ============================================================================

export const WithCheckboxes: Story = () => {
  const [showStatusBar, setShowStatusBar] = React.useState(true);
  const [showPanel, setShowPanel] = React.useState(false);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">View Options</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-48">
        <DropdownMenuLabel>Appearance</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuCheckboxItem checked={showStatusBar} onCheckedChange={setShowStatusBar}>
          Status Bar
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem checked={showPanel} onCheckedChange={setShowPanel}>
          Panel
        </DropdownMenuCheckboxItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

// ============================================================================
// With Radio Items
// ============================================================================

export const WithRadioItems: Story = () => {
  const [position, setPosition] = React.useState('bottom');

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">Panel Position</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-48">
        <DropdownMenuLabel>Position</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup value={position} onValueChange={setPosition}>
          <DropdownMenuRadioItem value="top">Top</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="bottom">Bottom</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="right">Right</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

// ============================================================================
// With Submenu
// ============================================================================

export const WithSubmenu: Story = () => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="outline">More Options</Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent className="w-56">
      <DropdownMenuItem>
        <Plus className="h-4 w-4" />
        New Item
      </DropdownMenuItem>
      <DropdownMenuSub>
        <DropdownMenuSubTrigger>
          <Star className="h-4 w-4" />
          Favorites
        </DropdownMenuSubTrigger>
        <DropdownMenuSubContent>
          <DropdownMenuItem>Save to Favorites</DropdownMenuItem>
          <DropdownMenuItem>Remove from Favorites</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Manage Favorites</DropdownMenuItem>
        </DropdownMenuSubContent>
      </DropdownMenuSub>
      <DropdownMenuSeparator />
      <DropdownMenuItem>
        <Gear className="h-4 w-4" />
        Settings
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
);

// ============================================================================
// Disabled Items
// ============================================================================

export const DisabledItems: Story = () => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="outline">With Disabled</Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent className="w-48">
      <DropdownMenuItem>Available Action</DropdownMenuItem>
      <DropdownMenuItem disabled>Disabled Action</DropdownMenuItem>
      <DropdownMenuItem>Another Action</DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem disabled>
        <Trash className="h-4 w-4" />
        Cannot Delete
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
);

// ============================================================================
// Destructive Item
// ============================================================================

export const DestructiveItem: Story = () => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="outline">Danger Zone</Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent className="w-48">
      <DropdownMenuItem>Edit</DropdownMenuItem>
      <DropdownMenuItem>Duplicate</DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem destructive>
        <Trash className="h-4 w-4" />
        Delete permanently
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
);
