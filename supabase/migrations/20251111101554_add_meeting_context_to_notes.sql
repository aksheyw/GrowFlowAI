/*
  # Add Meeting Context to Notes Table

  1. Changes
    - Add `meeting_title` (text, nullable) - Title of the meeting
    - Add `meeting_date` (date, nullable) - Date when meeting occurred
    - Add `meeting_participants` (text array, nullable) - List of participant names
    - Add `meeting_location` (text, nullable) - Where the meeting took place (e.g., "Zoom", "Office")
    
  2. Purpose
    - Enable tasks to display which meeting they originated from
    - Allow users to track meeting context for better task management
    - Support filtering and searching tasks by meeting
*/

-- Add meeting metadata columns to notes table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'notes' AND column_name = 'meeting_title'
  ) THEN
    ALTER TABLE notes ADD COLUMN meeting_title text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'notes' AND column_name = 'meeting_date'
  ) THEN
    ALTER TABLE notes ADD COLUMN meeting_date date;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'notes' AND column_name = 'meeting_participants'
  ) THEN
    ALTER TABLE notes ADD COLUMN meeting_participants text[];
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'notes' AND column_name = 'meeting_location'
  ) THEN
    ALTER TABLE notes ADD COLUMN meeting_location text;
  END IF;
END $$;

-- Create index for meeting date queries
CREATE INDEX IF NOT EXISTS idx_notes_meeting_date ON notes(meeting_date DESC);
