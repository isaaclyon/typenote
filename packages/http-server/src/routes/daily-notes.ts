import { Hono } from 'hono';
import { getOrCreateTodayDailyNote, getOrCreateDailyNoteByDate } from '@typenote/storage';
import type { ServerContext } from '../types.js';

const dailyNotes = new Hono<ServerContext>();

// POST /daily-notes/today - Get or create today's daily note
dailyNotes.post('/today', (c) => {
  const result = getOrCreateTodayDailyNote(c.var.db);
  return c.json({ success: true, data: result }, result.created ? 201 : 200);
});

// POST /daily-notes/:dateKey - Get or create daily note for specific date
dailyNotes.post('/:dateKey', (c) => {
  const dateKey = c.req.param('dateKey');
  const result = getOrCreateDailyNoteByDate(c.var.db, dateKey);
  return c.json({ success: true, data: result }, result.created ? 201 : 200);
});

export { dailyNotes };
