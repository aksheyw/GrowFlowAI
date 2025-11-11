/*
  # Add Missing Foreign Key Indexes
  
  1. Performance Improvements
    - Add index on `notifications.actor_id` for foreign key `notifications_actor_id_fkey`
    - Add index on `notifications.task_id` for foreign key `notifications_task_id_fkey`
    - Add index on `tasks.note_id` for foreign key `tasks_note_id_fkey`
  
  2. Notes
    - These indexes improve query performance when joining tables via foreign keys
    - Without these indexes, PostgreSQL must perform full table scans for foreign key lookups
    - Each index covers a single foreign key column to optimize join operations
*/

-- Add index for notifications.actor_id foreign key
CREATE INDEX IF NOT EXISTS idx_notifications_actor_id ON notifications(actor_id);

-- Add index for notifications.task_id foreign key
CREATE INDEX IF NOT EXISTS idx_notifications_task_id ON notifications(task_id);

-- Add index for tasks.note_id foreign key
CREATE INDEX IF NOT EXISTS idx_tasks_note_id ON tasks(note_id);
