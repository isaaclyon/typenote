/**
 * Editor - Media stories
 *
 * Images, links, and other media content.
 */

import * as React from 'react';
import type { Story } from '@ladle/react';
import type { JSONContent } from '@tiptap/core';

import { Editor } from '../Editor.js';

export default {
  title: 'Features / Editor / Media',
};

// ============================================================================
// Content Samples
// ============================================================================

const linkContent: JSONContent = {
  type: 'doc',
  content: [
    {
      type: 'heading',
      attrs: { level: 2 },
      content: [{ type: 'text', text: 'Links and Autolink' }],
    },
    {
      type: 'paragraph',
      content: [
        { type: 'text', text: 'Standard Markdown links render as: ' },
        {
          type: 'text',
          marks: [{ type: 'link', attrs: { href: 'https://typenote.app', target: '_blank' } }],
          text: 'TypeNote website',
        },
        { type: 'text', text: '.' },
      ],
    },
    {
      type: 'paragraph',
      content: [
        { type: 'text', text: 'Paste or type a URL to autolink: ' },
        {
          type: 'text',
          marks: [{ type: 'link', attrs: { href: 'https://github.com', target: '_blank' } }],
          text: 'https://github.com',
        },
      ],
    },
  ],
};

const imageContent: JSONContent = {
  type: 'doc',
  content: [
    {
      type: 'heading',
      attrs: { level: 2 },
      content: [{ type: 'text', text: 'Resizable Images' }],
    },
    {
      type: 'paragraph',
      content: [
        {
          type: 'text',
          text: 'Click an image to select it. Drag the handles on the sides to resize:',
        },
      ],
    },
    {
      type: 'image',
      attrs: {
        src: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop',
        alt: 'Mountain landscape with snow-capped peaks',
        width: 400,
      },
    },
    {
      type: 'paragraph',
      content: [{ type: 'text', text: 'Images maintain aspect ratio while resizing:' }],
    },
    {
      type: 'image',
      attrs: {
        src: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800&h=300&fit=crop',
        alt: 'Forest aerial view',
        width: 500,
      },
    },
    {
      type: 'paragraph',
      content: [
        { type: 'text', text: 'The ' },
        { type: 'text', marks: [{ type: 'code' }], text: '![alt](url)' },
        { type: 'text', text: ' Markdown syntax works too.' },
      ],
    },
  ],
};

// ============================================================================
// Stories
// ============================================================================

export const Links: Story = () => (
  <div className="space-y-4 p-6">
    <Editor content={linkContent} />
    <div className="text-xs text-muted-foreground space-y-1">
      <p>Markdown links render as clickable anchors.</p>
      <p>Try typing or pasting a URL to see autolink in action.</p>
    </div>
  </div>
);

export const Images: Story = () => (
  <div className="space-y-4 p-6">
    <Editor content={imageContent} />
    <div className="text-xs text-muted-foreground space-y-1">
      <p>Click an image to select it. Drag the handles on the left/right edges to resize.</p>
      <p>Images maintain aspect ratio while resizing. Width is stored in the document.</p>
      <p>Minimum width: 100px. Maximum: container width (650px).</p>
    </div>
  </div>
);

export const ImageResize: Story = () => {
  const [content, setContent] = React.useState<JSONContent>({
    type: 'doc',
    content: [
      {
        type: 'heading',
        attrs: { level: 2 },
        content: [{ type: 'text', text: 'Image Resize Demo' }],
      },
      {
        type: 'paragraph',
        content: [{ type: 'text', text: 'Try resizing this image by dragging the handles:' }],
      },
      {
        type: 'image',
        attrs: {
          src: 'https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?w=800&h=600&fit=crop',
          alt: 'Sample landscape for resizing',
          width: 350,
        },
      },
      {
        type: 'paragraph',
        content: [{ type: 'text', text: 'Check the JSON below to see width changes:' }],
      },
    ],
  });

  return (
    <div className="space-y-4 p-6">
      <Editor content={content} onChange={setContent} />
      <details className="text-xs">
        <summary className="cursor-pointer text-muted-foreground">
          View JSON (width updates)
        </summary>
        <pre className="mt-2 max-h-40 overflow-auto rounded bg-muted p-2 text-[10px]">
          {JSON.stringify(content, null, 2)}
        </pre>
      </details>
    </div>
  );
};

ImageResize.storyName = 'Image Resize';
