import { Image } from 'lucide-react';
import { cn } from '../../utils/cn.js';

interface AttachmentNodeProps {
  src?: string;
  alt?: string;
  selected?: boolean;
  className?: string;
}

/**
 * AttachmentNode preview - image with optional selection state.
 */
export function AttachmentNode({
  src,
  alt = '',
  selected = false,
  className,
}: AttachmentNodeProps) {
  if (!src) {
    // Placeholder
    return (
      <div className="my-2">
        <div
          className={cn(
            'h-32 w-full rounded-lg border-2 border-dashed border-gray-300',
            'bg-gray-50 flex items-center justify-center',
            selected && 'ring-2 ring-accent-500',
            className
          )}
        >
          <Image className="h-8 w-8 text-gray-400" />
        </div>
      </div>
    );
  }

  // With image
  return (
    <div className="my-2">
      <div className={cn('relative inline-block rounded', className)}>
        <img
          src={src}
          alt={alt}
          className={cn('max-w-full rounded', selected && 'ring-2 ring-accent-500')}
        />
      </div>
    </div>
  );
}
