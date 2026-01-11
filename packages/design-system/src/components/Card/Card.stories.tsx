import type { Story } from '@ladle/react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './Card.js';
import { Button } from '../Button/index.js';
import { Badge } from '../Badge/index.js';
import { Text } from '../Text/index.js';

export default {
  title: 'Components/Card',
};

export const AllVariants: Story = () => (
  <div className="grid gap-6 max-w-2xl">
    <Card>
      <CardHeader>
        <CardTitle>Simple Card</CardTitle>
        <CardDescription>A basic card with header and content</CardDescription>
      </CardHeader>
      <CardContent>
        <Text>This is the main content area of the card. It can contain any content you need.</Text>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Card with Badge</CardTitle>
          <Badge variant="success">Active</Badge>
        </div>
        <CardDescription>Cards can have inline elements in the header</CardDescription>
      </CardHeader>
      <CardContent>
        <Text>Content with additional context provided by the badge.</Text>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle>Card with Footer</CardTitle>
        <CardDescription>Complete card with all sections</CardDescription>
      </CardHeader>
      <CardContent>
        <Text>
          This card demonstrates the full structure with header, content, and footer sections.
        </Text>
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        <Button variant="outline">Cancel</Button>
        <Button>Save Changes</Button>
      </CardFooter>
    </Card>
  </div>
);

export const Simple: Story = () => (
  <Card className="max-w-md">
    <CardHeader>
      <CardTitle>Card Title</CardTitle>
    </CardHeader>
    <CardContent>
      <Text>Simple card content</Text>
    </CardContent>
  </Card>
);

export const WithDescription: Story = () => (
  <Card className="max-w-md">
    <CardHeader>
      <CardTitle>Card Title</CardTitle>
      <CardDescription>This is a helpful description</CardDescription>
    </CardHeader>
    <CardContent>
      <Text>Card content goes here</Text>
    </CardContent>
  </Card>
);

export const WithFooter: Story = () => (
  <Card className="max-w-md">
    <CardHeader>
      <CardTitle>Confirm Action</CardTitle>
      <CardDescription>Are you sure you want to proceed?</CardDescription>
    </CardHeader>
    <CardContent>
      <Text>This action cannot be undone.</Text>
    </CardContent>
    <CardFooter className="flex justify-end gap-2">
      <Button variant="outline">Cancel</Button>
      <Button variant="destructive">Delete</Button>
    </CardFooter>
  </Card>
);
