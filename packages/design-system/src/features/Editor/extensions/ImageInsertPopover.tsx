/**
 * ImageInsertPopover Component
 *
 * Simple chooser UI for inserting images via upload or URL.
 */

import * as React from 'react';

import { cn } from '../../../lib/utils.js';
import { getImageUploadWarning, isValidImageUrl, normalizeImageMeta } from './image-utils.js';

export interface ImageInsertPopoverProps {
  mode: 'upload' | 'url';
  onModeChange: (mode: 'upload' | 'url') => void;
  onUploadFile: (file: File, meta: { alt?: string | null; caption?: string | null }) => void;
  onInsertUrl: (url: string, meta: { alt?: string | null; caption?: string | null }) => void;
  onClose: () => void;
  warning?: string | null;
}

const IMAGE_ACCEPT = 'image/png,image/jpeg,image/webp,image/gif';

export function ImageInsertPopover({
  mode,
  onModeChange,
  onUploadFile,
  onInsertUrl,
  onClose,
  warning,
}: ImageInsertPopoverProps) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [urlValue, setUrlValue] = React.useState('');
  const [urlError, setUrlError] = React.useState<string | null>(null);
  const [altValue, setAltValue] = React.useState('');
  const [captionValue, setCaptionValue] = React.useState('');
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    event.target.value = '';
    setSelectedFile(file);
  };

  const handleUploadClick = () => {
    if (!selectedFile) return;
    onUploadFile(selectedFile, normalizeImageMeta({ alt: altValue, caption: captionValue }));
  };

  const handleInsertUrl = () => {
    const trimmed = urlValue.trim();
    if (!trimmed) {
      setUrlError('Enter an image URL.');
      return;
    }
    if (!isValidImageUrl(trimmed)) {
      setUrlError('Enter a valid URL.');
      return;
    }
    setUrlError(null);
    onInsertUrl(trimmed, normalizeImageMeta({ alt: altValue, caption: captionValue }));
  };

  const handleUrlKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleInsertUrl();
    }
  };

  const warningText =
    warning ?? (mode === 'upload' && selectedFile ? getImageUploadWarning(selectedFile) : null);

  return (
    <div
      className={cn(
        'w-[280px] rounded-md border border-border bg-popover p-3 shadow-md',
        'flex flex-col gap-3'
      )}
    >
      <div className="flex items-center gap-1 rounded-md bg-muted p-1">
        <button
          type="button"
          onClick={() => onModeChange('upload')}
          className={cn(
            'flex-1 rounded px-2 py-1 text-xs font-medium',
            mode === 'upload'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          Upload file
        </button>
        <button
          type="button"
          onClick={() => onModeChange('url')}
          className={cn(
            'flex-1 rounded px-2 py-1 text-xs font-medium',
            mode === 'url'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          Insert URL
        </button>
      </div>

      {mode === 'upload' ? (
        <div className="space-y-2">
          <input
            ref={fileInputRef}
            type="file"
            accept={IMAGE_ACCEPT}
            onChange={handleFileChange}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              'w-full rounded-md border border-border px-3 py-2 text-sm',
              'bg-background text-foreground hover:bg-muted'
            )}
          >
            Choose file
          </button>
          {selectedFile && (
            <p className="text-xs text-muted-foreground">Selected: {selectedFile.name}</p>
          )}
          <p className="text-xs text-muted-foreground">PNG, JPG, GIF, WebP</p>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Image URL</label>
            <input
              type="url"
              value={urlValue}
              onChange={(event) => {
                setUrlValue(event.target.value);
                setUrlError(null);
              }}
              onKeyDown={handleUrlKeyDown}
              placeholder="https://..."
              className={cn(
                'w-full rounded-md border border-border bg-background px-2 py-1.5 text-xs',
                'text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-accent-500'
              )}
            />
            {urlError && <p className="text-xs text-amber-700">{urlError}</p>}
          </div>
        </div>
      )}

      <div className="space-y-2">
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Alt text (optional)</label>
          <input
            type="text"
            value={altValue}
            onChange={(event) => setAltValue(event.target.value)}
            placeholder="Describe the image"
            className={cn(
              'w-full rounded-md border border-border bg-background px-2 py-1.5 text-xs',
              'text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-accent-500'
            )}
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Caption (optional)</label>
          <input
            type="text"
            value={captionValue}
            onChange={(event) => setCaptionValue(event.target.value)}
            placeholder="Add a caption"
            className={cn(
              'w-full rounded-md border border-border bg-background px-2 py-1.5 text-xs',
              'text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-accent-500'
            )}
          />
        </div>
      </div>

      {warningText && <p className="text-xs text-amber-700">{warningText}</p>}

      <div className="flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={onClose}
          className={cn(
            'rounded-md px-2 py-1 text-xs text-muted-foreground',
            'hover:text-foreground hover:bg-muted'
          )}
        >
          Cancel
        </button>
        {mode === 'upload' && (
          <button
            type="button"
            onClick={handleUploadClick}
            disabled={!selectedFile}
            className={cn(
              'rounded-md px-3 py-1 text-xs font-medium',
              selectedFile
                ? 'bg-accent text-accent-foreground hover:bg-accent/90'
                : 'bg-muted text-muted-foreground'
            )}
          >
            Upload
          </button>
        )}
        {mode === 'url' && (
          <button
            type="button"
            onClick={handleInsertUrl}
            className={cn(
              'rounded-md px-3 py-1 text-xs font-medium',
              'bg-accent text-accent-foreground hover:bg-accent/90'
            )}
          >
            Insert
          </button>
        )}
      </div>
    </div>
  );
}

ImageInsertPopover.displayName = 'ImageInsertPopover';
