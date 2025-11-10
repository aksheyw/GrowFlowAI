/*
  # Fix Database Performance and Security Issues

  ## Changes Made
  
  1. **Add Missing Index**
     - `idx_notes_user_id` - Index for notes.user_id foreign key to improve join performance
  
  2. **Remove Unused Indexes**
     - `idx_notifications_actor_id` - Not being used by queries
     - `idx_notifications_task_id` - Not being used by queries  
     - `idx_tasks_note_id` - Not being used by queries
  
  3. **Important Notes**
     - The notes.user_id foreign key needs an index for optimal query performance
     - Unused indexes consume space and slow down write operations
     - Leaked password protection must be enabled through Supabase Dashboard > Authentication > Policies
  
  ## Performance Impact
  - Improved query performance for notes table joins
  - Reduced index maintenance overhead on notifications and tasks tables
  - Better overall database performance
*/

-- Add missing index for notes.user_id foreign key
CREATE INDEX IF NOT EXISTS idx_notes_user_id ON notes(user_id);

-- Remove unused indexes to reduce maintenance overhead
DROP INDEX IF EXISTS idx_notifications_actor_id;
DROP INDEX IF EXISTS idx_notifications_task_id;
DROP INDEX IF EXISTS idx_tasks_note_id;
