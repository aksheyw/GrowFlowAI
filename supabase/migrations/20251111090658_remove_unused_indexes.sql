/*
  # Remove Unused Indexes
  
  1. Performance Improvements
    - Remove index `idx_notes_user_id` - unused and redundant with foreign key index
    - Remove index `idx_tasks_status` - not being used by queries
    - Remove index `idx_notes_meeting_date` - not being used by queries
    - Remove index `idx_notifications_recipient_id` - unused and redundant with foreign key index
    - Remove index `idx_notifications_read_status` - not being used by queries
  
  2. Notes
    - Unused indexes consume disk space and slow down write operations
    - Foreign key indexes (like idx_notifications_task_id) are kept as they improve join performance
    - These specific indexes showed no query usage in database analytics
*/

-- Remove unused indexes
DROP INDEX IF EXISTS idx_notes_user_id;
DROP INDEX IF EXISTS idx_tasks_status;
DROP INDEX IF EXISTS idx_notes_meeting_date;
DROP INDEX IF EXISTS idx_notifications_recipient_id;
DROP INDEX IF EXISTS idx_notifications_read_status;
