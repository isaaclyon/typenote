import { createHashRouter, createBrowserRouter, Navigate } from 'react-router-dom';
import { NotesView, TypesView, CalendarView } from '../routes/index.js';
import { RootLayout } from '../layouts/RootLayout.js';

// Detect if running in Electron or web browser
const isElectron = typeof window !== 'undefined' && 'typenoteAPI' in window;

/**
 * Application router.
 *
 * - Electron: Uses HashRouter (required for file:// protocol)
 * - Web: Uses BrowserRouter (supports clean URLs)
 *
 * Routes:
 * - /notes         → Empty notes state
 * - /notes/:id     → Document editor
 * - /types/:key    → Type browser
 * - /calendar      → Calendar view
 */
const routes = [
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
];

export const router = isElectron ? createHashRouter(routes) : createBrowserRouter(routes);
