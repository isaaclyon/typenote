/**
 * Router Configuration
 *
 * Defines the route structure for the TypeNote desktop app.
 * Uses HashRouter because Electron loads via file:// protocol which doesn't support HTML5 history API.
 *
 * Route structure:
 * /#/                        -> Default (redirect to notes)
 * /#/notes                   -> Notes view (no object selected)
 * /#/notes/:objectId         -> Document editor for specific object
 * /#/types/:typeKey          -> TypeBrowser for specific type
 * /#/calendar                -> Calendar view
 */

import { createHashRouter, Navigate } from 'react-router-dom';
import { AppLayout } from '../layouts/AppLayout.js';
import { NotesRoute } from './NotesRoute.js';
import { TypesRoute } from './TypesRoute.js';
import { CalendarRoute } from './CalendarRoute.js';

export const router = createHashRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      {
        // Default route - redirect to /notes
        index: true,
        element: <Navigate to="/notes" replace />,
      },
      {
        // Notes view without object selected
        path: 'notes',
        element: <NotesRoute />,
      },
      {
        // Notes view with specific object
        path: 'notes/:objectId',
        element: <NotesRoute />,
      },
      {
        // Type browser view
        path: 'types/:typeKey',
        element: <TypesRoute />,
      },
      {
        // Calendar view
        path: 'calendar',
        element: <CalendarRoute />,
      },
    ],
  },
]);
