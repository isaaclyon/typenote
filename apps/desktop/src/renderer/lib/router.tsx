import { createHashRouter, Navigate } from 'react-router-dom';
import { NotesView, TypesView, CalendarView } from '../routes/index.js';
import { RootLayout } from '../layouts/RootLayout.js';

/**
 * Application router using HashRouter for Electron compatibility.
 *
 * Routes:
 * - /#/notes         → Empty notes state
 * - /#/notes/:id     → Document editor
 * - /#/types/:key    → Type browser
 * - /#/calendar      → Calendar view
 */
export const router = createHashRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      // Default redirect to notes
      { index: true, element: <Navigate to="/notes" replace /> },
      // Notes routes
      { path: 'notes', element: <NotesView /> },
      { path: 'notes/:objectId', element: <NotesView /> },
      // Types routes
      { path: 'types/:typeKey', element: <TypesView /> },
      // Calendar route
      { path: 'calendar', element: <CalendarView /> },
    ],
  },
]);
