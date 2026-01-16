/**
 * TypesRoute Component
 *
 * Route component for displaying the TypeBrowser view.
 * Gets the typeKey from URL params and renders TypeBrowserView.
 */

import type { ReactElement } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { TypeBrowserView } from '../components/TypeBrowserView.js';

export function TypesRoute(): ReactElement {
  const { typeKey } = useParams<{ typeKey: string }>();
  const navigate = useNavigate();

  // Navigate to notes view when opening an object
  const handleOpenObject = (objectId: string) => {
    navigate(`/notes/${objectId}`);
  };

  // No type selected - show placeholder
  if (!typeKey) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        Select a type to view
      </div>
    );
  }

  return <TypeBrowserView typeKey={typeKey} onOpenObject={handleOpenObject} />;
}
