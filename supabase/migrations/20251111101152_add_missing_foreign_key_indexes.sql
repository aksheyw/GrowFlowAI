/*
  # Add Missing Foreign Key Indexes

  1. Performance Improvements
    - Add index on `notes.user_id` for foreign key lookup performance
    - Add index on `notifications.task_id` for foreign key lookup performance  
    - Add index on `task_details.task_id` for foreign key lookup performance
    - Add index on `tasks.note_id` for foreign key lookup performance
    
  2. Notes
    - Foreign keys without indexes can cause significant performance degradation
    - These indexes improve JOIN performance and foreign key constraint checking
*/

-- Add index for notes.user_id foreign key
CREATE INDEX IF NOT EXISTS idx_notes_user_id ON public.notes(user_id);

-- Add index for notifications.task_id foreign key  
CREATE INDEX IF NOT EXISTS idx_notifications_task_id ON public.notifications(task_id);

-- Add index for task_details.task_id foreign key
CREATE INDEX IF NOT EXISTS idx_task_details_task_id ON public.task_details(task_id);

-- Add index for tasks.note_id foreign key
CREATE INDEX IF NOT EXISTS idx_tasks_note_id ON public.tasks(note_id);
