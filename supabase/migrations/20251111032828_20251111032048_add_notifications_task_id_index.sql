/*
  # Add index for notifications task_id

  1. Performance Optimization
    - Add index on notifications.task_id to speed up CASCADE deletes
    - Improves task deletion performance significantly
  
  2. Technical Details
    - When a task is deleted, the database needs to find all related notifications
    - Without an index, this requires a full table scan
    - With an index, lookups are nearly instant
*/

CREATE INDEX IF NOT EXISTS idx_notifications_task_id 
ON notifications(task_id);