import type { Story } from '@ladle/react';
import { Pencil, Copy, Trash, MoreHorizontal, FileText, Settings, LogOut } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from './index.js';

export const Default: Story = () => (
  <div className="p-8">
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="inline-flex h-8 items-center justify-center gap-2 rounded-sm border border-gray-300 bg-white px-3 text-sm font-medium hover:bg-gray-50">
          <MoreHorizontal className="h-4 w-4" />
          Actions
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onSelect={() => console.log('Edit clicked')}>
          <Pencil className="mr-2 h-4 w-4" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => console.log('Duplicate clicked')}>
          <Copy className="mr-2 h-4 w-4" />
          Duplicate
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem destructive onSelect={() => console.log('Delete clicked')}>
          <Trash className="mr-2 h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
);

Default.storyName = 'Default Usage';

export const AllVariants: Story = () => (
  <div className="p-8 space-y-8">
    <div>
      <h3 className="mb-4 text-sm font-semibold text-gray-700">Default Items</h3>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="inline-flex h-8 items-center justify-center rounded-sm border border-gray-300 bg-white px-3 text-sm font-medium hover:bg-gray-50">
            Default Menu
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>
            <FileText className="mr-2 h-4 w-4" />
            New Document
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>

    <div>
      <h3 className="mb-4 text-sm font-semibold text-gray-700">Destructive Item</h3>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="inline-flex h-8 items-center justify-center rounded-sm border border-gray-300 bg-white px-3 text-sm font-medium hover:bg-gray-50">
            Destructive Action
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem destructive>
            <Trash className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
          <DropdownMenuItem destructive>
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>

    <div>
      <h3 className="mb-4 text-sm font-semibold text-gray-700">Mixed Items</h3>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="inline-flex h-8 items-center justify-center rounded-sm border border-gray-300 bg-white px-3 text-sm font-medium hover:bg-gray-50">
            Mixed Menu
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Copy className="mr-2 h-4 w-4" />
            Duplicate
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem destructive>
            <Trash className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  </div>
);

AllVariants.storyName = 'All Variants';

export const IconButton: Story = () => (
  <div className="p-8">
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="inline-flex h-6 w-6 items-center justify-center rounded-sm hover:bg-gray-100">
          <MoreHorizontal className="h-3.5 w-3.5" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>
          <Pencil className="mr-2 h-4 w-4" />
          Edit Type
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem destructive>
          <Trash className="mr-2 h-4 w-4" />
          Delete Type
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
);

IconButton.storyName = 'Icon Button Trigger';

export const LongList: Story = () => (
  <div className="p-8">
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="inline-flex h-8 items-center justify-center rounded-sm border border-gray-300 bg-white px-3 text-sm font-medium hover:bg-gray-50">
          Many Items
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {Array.from({ length: 10 }).map((_, i) => (
          <DropdownMenuItem key={i}>
            <FileText className="mr-2 h-4 w-4" />
            Item {i + 1}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem destructive>
          <Trash className="mr-2 h-4 w-4" />
          Delete All
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
);

LongList.storyName = 'Long List';

export const NoIcons: Story = () => (
  <div className="p-8">
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="inline-flex h-8 items-center justify-center rounded-sm border border-gray-300 bg-white px-3 text-sm font-medium hover:bg-gray-50">
          Text Only
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>Edit</DropdownMenuItem>
        <DropdownMenuItem>Duplicate</DropdownMenuItem>
        <DropdownMenuItem>Share</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem destructive>Delete</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
);

NoIcons.storyName = 'No Icons';

export const Disabled: Story = () => (
  <div className="p-8">
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="inline-flex h-8 items-center justify-center rounded-sm border border-gray-300 bg-white px-3 text-sm font-medium hover:bg-gray-50">
          With Disabled Items
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>
          <Pencil className="mr-2 h-4 w-4" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem disabled>
          <Copy className="mr-2 h-4 w-4" />
          Duplicate (disabled)
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem destructive disabled>
          <Trash className="mr-2 h-4 w-4" />
          Delete (disabled)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
);

Disabled.storyName = 'Disabled Items';
