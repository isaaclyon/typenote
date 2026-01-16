/**
 * CalendarRoute Component
 *
 * Route component for displaying the calendar view.
 */

import type { ReactElement } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarView } from '../components/calendar/index.js';

export function CalendarRoute(): ReactElement {
  const navigate = useNavigate();

  // Navigate to notes view when clicking an event
  const handleNavigate = (objectId: string) => {
    navigate(`/notes/${objectId}`);
  };

  return <CalendarView onNavigate={handleNavigate} />;
}
