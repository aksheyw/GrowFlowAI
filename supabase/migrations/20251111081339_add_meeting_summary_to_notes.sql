/*
  # Add Meeting Summary to Notes Table

  1. Changes
    - Add `meeting_summary` (text, nullable) - 2-3 sentence summary of the meeting
    
  2. Purpose
    - Enable meeting drawer to display a concise summary of what was discussed
    - Help users quickly understand meeting context without reading full notes
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'notes' AND column_name = 'meeting_summary'
  ) THEN
    ALTER TABLE notes ADD COLUMN meeting_summary text;
  END IF;
END $$;
