import * as React from 'react';
import { Button } from '../Button/Button.js';
import { Plus } from 'lucide-react';

export interface TagAddButtonProps {
  onClick?: () => void;
  disabled?: boolean;
}

const TagAddButton = React.forwardRef<HTMLButtonElement, TagAddButtonProps>(
  ({ onClick, disabled }, ref) => {
    return (
      <Button
        ref={ref}
        variant="ghost"
        size="sm"
        onClick={onClick}
        disabled={disabled}
        className="text-muted-foreground hover:text-foreground"
      >
        <Plus className="w-3 h-3 mr-1" />
        Add tag
      </Button>
    );
  }
);

TagAddButton.displayName = 'TagAddButton';

export { TagAddButton };
