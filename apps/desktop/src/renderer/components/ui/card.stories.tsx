import type { Story } from '@ladle/react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './card.js';
import { Button } from './button.js';

export const Default: Story = () => (
  <Card className="w-[350px]">
    <CardHeader>
      <CardTitle>Card Title</CardTitle>
      <CardDescription>Card description goes here.</CardDescription>
    </CardHeader>
    <CardContent>
      <p>This is the card content area where you can put any content.</p>
    </CardContent>
    <CardFooter className="flex justify-between">
      <Button variant="outline">Cancel</Button>
      <Button>Submit</Button>
    </CardFooter>
  </Card>
);

export const Simple: Story = () => (
  <Card className="w-[350px] p-6">
    <p>A simple card with just content.</p>
  </Card>
);

export const MultipleCards: Story = () => (
  <div className="grid grid-cols-2 gap-4 max-w-[720px]">
    <Card>
      <CardHeader>
        <CardTitle>Note 1</CardTitle>
        <CardDescription>Created today</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm">Some note content here...</p>
      </CardContent>
    </Card>
    <Card>
      <CardHeader>
        <CardTitle>Note 2</CardTitle>
        <CardDescription>Created yesterday</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm">Another note with different content...</p>
      </CardContent>
    </Card>
  </div>
);
