-- Enforce uniqueness of DailyNote date_key using a BEFORE INSERT trigger
-- SQLite doesn't allow subqueries in partial index WHERE clauses,
-- so we use a trigger instead.

CREATE TRIGGER IF NOT EXISTS daily_note_date_key_unique_insert
BEFORE INSERT ON objects
WHEN json_extract(NEW.properties, '$.date_key') IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM object_types WHERE id = NEW.type_id AND key = 'DailyNote'
  )
BEGIN
  SELECT RAISE(ABORT, 'UNIQUE constraint failed: daily_note.date_key')
  WHERE EXISTS (
    SELECT 1 FROM objects
    WHERE type_id = NEW.type_id
      AND json_extract(properties, '$.date_key') = json_extract(NEW.properties, '$.date_key')
      AND deleted_at IS NULL
  );
END;
