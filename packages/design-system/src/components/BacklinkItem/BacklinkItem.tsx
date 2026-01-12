import * as React from 'react';
import * as LucideIcons from 'lucide-react';
import { cn } from '../../utils/cn.js';

export interface BacklinkItemProps {
  title: string;
  snippet?: string;
  highlightText?: string; // Text to highlight within the snippet
  onClick?: () => void;
  className?: string;
  typeIcon?: string | null;
  typeColor?: string | null;
}

const BacklinkItem = React.forwardRef<HTMLDivElement, BacklinkItemProps>(
  ({ title, snippet, highlightText, onClick, className, typeIcon, typeColor }, ref) => {
    // Render type icon if available
    const renderTypeIcon = () => {
      if (!typeIcon) return null;

      // Dynamically get icon component from Lucide
      const iconsRecord = LucideIcons as unknown as Record<
        string,
        React.ComponentType<{ className?: string }>
      >;
      const IconComponent = iconsRecord[typeIcon];
      if (!IconComponent) return null;

      return (
        <div className="flex-shrink-0" style={{ color: typeColor || '#78716c' }}>
          <IconComponent className="w-4 h-4" />
        </div>
      );
    };

    // Highlight matching text in snippet
    const renderSnippet = () => {
      if (!snippet) return null;

      if (highlightText && snippet.includes(highlightText)) {
        const parts = snippet.split(highlightText);
        return (
          <p className="text-xs text-gray-600 italic truncate">
            {parts.map((part, index) => (
              <React.Fragment key={index}>
                {part}
                {index < parts.length - 1 && (
                  <span className="text-accent-600 font-medium">{highlightText}</span>
                )}
              </React.Fragment>
            ))}
          </p>
        );
      }

      return <p className="text-xs text-gray-600 italic truncate">{snippet}</p>;
    };

    return (
      <div
        ref={ref}
        className={cn(
          'p-2 rounded border border-gray-100 transition-colors duration-150',
          onClick && 'cursor-pointer hover:bg-gray-50 hover:border-gray-200',
          className
        )}
        onClick={onClick}
        role={onClick ? 'button' : undefined}
        tabIndex={onClick ? 0 : undefined}
        onKeyDown={
          onClick
            ? (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onClick();
                }
              }
            : undefined
        }
      >
        <div className="flex items-start gap-2">
          {renderTypeIcon()}
          <div className="flex flex-col gap-1 flex-1 min-w-0">
            <h4 className="text-sm font-medium text-gray-900 truncate">{title}</h4>
            {renderSnippet()}
          </div>
        </div>
      </div>
    );
  }
);

BacklinkItem.displayName = 'BacklinkItem';

export { BacklinkItem };
