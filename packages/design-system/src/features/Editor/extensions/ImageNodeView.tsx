/**
 * ImageNodeView - Custom NodeView for images with resize handles.
 *
 * Features:
 * - Displays image from URL or local path
 * - Drag handles for resizing (width-based, maintains aspect ratio)
 * - Selection state with outline
 * - Stores width in node attributes
 */

import * as React from 'react';
import { NodeViewWrapper } from '@tiptap/react';
import type { NodeViewProps } from '@tiptap/react';

import { cn } from '../../../lib/utils.js';
import type { ImageNodeAttributes, ResizableImageOptions } from './ResizableImage.types.js';

// Minimum width for images
const MIN_WIDTH = 100;
// Maximum width (relative to container)
const MAX_WIDTH_PERCENT = 100;

export function ImageNodeView({
  node,
  updateAttributes,
  selected,
  editor,
  extension,
  getPos,
}: NodeViewProps) {
  const { src, alt, width, title, caption, uploadStatus, uploadProgress, errorMessage, uploadId } =
    node.attrs as ImageNodeAttributes;

  const options = extension.options as ResizableImageOptions;

  const containerRef = React.useRef<HTMLDivElement>(null);
  const imageRef = React.useRef<HTMLImageElement>(null);
  const [isResizing, setIsResizing] = React.useState(false);
  const [aspectRatio, setAspectRatio] = React.useState<number | null>(null);
  const [captionValue, setCaptionValue] = React.useState(caption ?? '');
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Capture aspect ratio when image loads
  const handleImageLoad = React.useCallback(() => {
    if (imageRef.current) {
      const { naturalWidth, naturalHeight } = imageRef.current;
      if (naturalWidth && naturalHeight) {
        setAspectRatio(naturalWidth / naturalHeight);
      }
    }
  }, []);

  React.useEffect(() => {
    setCaptionValue(caption ?? '');
  }, [caption]);

  // Handle resize drag
  const handleResizeStart = React.useCallback(
    (e: React.MouseEvent, corner: 'left' | 'right') => {
      e.preventDefault();
      e.stopPropagation();

      if (!imageRef.current || !containerRef.current) return;

      setIsResizing(true);

      const startX = e.clientX;
      const startWidth = imageRef.current.offsetWidth;
      const containerWidth = containerRef.current.parentElement?.offsetWidth ?? 650;
      const isLeftHandle = corner === 'left';

      const handleMouseMove = (moveEvent: MouseEvent) => {
        const deltaX = moveEvent.clientX - startX;
        // Left handle: dragging left increases size, right decreases
        // Right handle: dragging right increases size, left decreases
        const newWidth = isLeftHandle ? startWidth - deltaX : startWidth + deltaX;

        // Clamp width between min and max
        const clampedWidth = Math.max(
          MIN_WIDTH,
          Math.min(newWidth, containerWidth * (MAX_WIDTH_PERCENT / 100))
        );

        updateAttributes({ width: Math.round(clampedWidth) });
      };

      const handleMouseUp = () => {
        setIsResizing(false);
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    },
    [updateAttributes]
  );

  // Calculate height based on aspect ratio (for proper sizing during resize)
  const calculatedHeight = width && aspectRatio ? Math.round(width / aspectRatio) : undefined;
  const isEditable = editor?.isEditable ?? false;
  const showCaption = Boolean(captionValue) || (selected && isEditable);
  const isUploading = uploadStatus === 'uploading';
  const isError = uploadStatus === 'error';
  const progressValue =
    typeof uploadProgress === 'number' && !Number.isNaN(uploadProgress)
      ? Math.max(0, Math.min(100, uploadProgress))
      : null;
  const errorText = errorMessage ?? 'Upload failed';
  const canRetry = Boolean(options.onRetryUpload && isEditable);
  const canRemove = isEditable;

  const handleCaptionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextValue = event.target.value;
    setCaptionValue(nextValue);
    updateAttributes({ caption: nextValue.trim().length > 0 ? nextValue : null });
  };

  const handleRetryClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (!options.onRetryUpload) return;
    fileInputRef.current?.click();
  };

  const handleRemoveClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();

    if (!editor || !editor.isEditable || typeof getPos !== 'function') return;
    options.onRemoveImage?.(uploadId ?? null);
    const pos = getPos();
    if (typeof pos !== 'number') return;
    editor
      .chain()
      .focus()
      .deleteRange({ from: pos, to: pos + node.nodeSize })
      .run();
  };

  const handleRetryFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    event.target.value = '';
    options.onRetryUpload?.(file, uploadId ?? null);
  };

  return (
    <NodeViewWrapper className="image-node-wrapper my-3" contentEditable={false}>
      <div
        ref={containerRef}
        className={cn(
          'image-node relative inline-block',
          selected && 'ring-2 ring-accent-500 ring-offset-2 ring-offset-background',
          isResizing && 'cursor-ew-resize'
        )}
        data-drag-handle
        contentEditable={false}
      >
        {/* The image */}
        <img
          ref={imageRef}
          src={src}
          alt={alt ?? ''}
          title={title ?? undefined}
          onLoad={handleImageLoad}
          className={cn(
            'rounded-md block',
            'max-w-full h-auto',
            isResizing && 'pointer-events-none select-none',
            isError && 'opacity-40'
          )}
          style={{
            width: width ? `${width}px` : undefined,
            height: calculatedHeight ? `${calculatedHeight}px` : undefined,
          }}
          draggable={false}
        />

        {isUploading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-md bg-background/70 text-xs text-muted-foreground">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
            <span>
              {progressValue !== null ? `Uploading ${Math.round(progressValue)}%` : 'Uploading'}
            </span>
          </div>
        )}

        {isError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-md border border-amber-200 bg-amber-50/80 px-3 text-center text-xs text-amber-800">
            <span className="font-medium">{errorText}</span>
            <div className="flex items-center gap-2">
              {canRetry && (
                <button
                  type="button"
                  onClick={handleRetryClick}
                  className="rounded border border-amber-200 bg-white px-2 py-1 text-[11px] text-amber-800 hover:bg-amber-100"
                >
                  Retry
                </button>
              )}
              {canRemove && (
                <button
                  type="button"
                  onClick={handleRemoveClick}
                  className="rounded border border-amber-200 bg-white px-2 py-1 text-[11px] text-amber-800 hover:bg-amber-100"
                >
                  Remove
                </button>
              )}
            </div>
          </div>
        )}

        {/* Resize handles - only show when selected */}
        {selected && (
          <>
            {/* Left resize handle */}
            <div
              className={cn(
                'image-resize-handle image-resize-handle-left',
                'absolute top-0 left-0 w-3 h-full',
                'cursor-ew-resize',
                'flex items-center justify-center'
              )}
              onMouseDown={(e) => handleResizeStart(e, 'left')}
            >
              <div
                className={cn(
                  'w-1 h-8 rounded-full',
                  'bg-accent-500 opacity-0 transition-opacity duration-150',
                  'group-hover:opacity-100',
                  selected && 'opacity-70 hover:opacity-100'
                )}
              />
            </div>

            {/* Right resize handle */}
            <div
              className={cn(
                'image-resize-handle image-resize-handle-right',
                'absolute top-0 right-0 w-3 h-full',
                'cursor-ew-resize',
                'flex items-center justify-center'
              )}
              onMouseDown={(e) => handleResizeStart(e, 'right')}
            >
              <div
                className={cn(
                  'w-1 h-8 rounded-full',
                  'bg-accent-500 opacity-0 transition-opacity duration-150',
                  'group-hover:opacity-100',
                  selected && 'opacity-70 hover:opacity-100'
                )}
              />
            </div>
          </>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        className="hidden"
        onChange={handleRetryFileChange}
      />

      {showCaption && (
        <div className="mt-2 w-full">
          {isEditable ? (
            <input
              type="text"
              value={captionValue}
              onChange={handleCaptionChange}
              onMouseDown={(event) => event.stopPropagation()}
              onClick={(event) => event.stopPropagation()}
              placeholder="Add caption"
              className={cn(
                'w-full rounded-md border border-transparent bg-transparent px-2 py-1 text-xs text-muted-foreground',
                'placeholder:text-muted-foreground/60 focus:border-accent-500 focus:text-foreground focus:outline-none'
              )}
            />
          ) : (
            <p className="px-2 py-1 text-xs text-muted-foreground">{captionValue}</p>
          )}
        </div>
      )}
    </NodeViewWrapper>
  );
}

ImageNodeView.displayName = 'ImageNodeView';
