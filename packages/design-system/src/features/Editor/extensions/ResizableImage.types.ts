export type ImageUploadStatus = 'uploading' | 'error' | null;

export interface ImageNodeAttributes {
  src: string;
  alt?: string | null;
  title?: string | null;
  width?: number | null;
  height?: number | null;
  caption?: string | null;
  uploadId?: string | null;
  uploadStatus?: ImageUploadStatus;
  uploadProgress?: number | null;
  errorMessage?: string | null;
}

export interface ResizableImageOptions {
  /**
   * Whether to allow inline images (false = block-level only).
   * @default false
   */
  inline?: boolean;

  /**
   * HTML attributes to add to the image element.
   */
  HTMLAttributes?: Record<string, unknown>;

  /**
   * Optional retry handler for failed uploads.
   */
  onRetryUpload?: (file: File, uploadId: string | null) => void;

  /**
   * Optional hook for cleaning up image resources on removal.
   */
  onRemoveImage?: (uploadId: string | null) => void;
}
