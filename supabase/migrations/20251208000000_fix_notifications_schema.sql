-- Drop the constraint to ensure we can recreate it correctly
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_type_check;

-- Re-add the constraint with verified allowed values
ALTER TABLE notifications ADD CONSTRAINT notifications_type_check 
  CHECK (type IN ('assigned', 'updated', 'completed', 'task_assigned'));

-- Update the notification trigger function to use 'assigned'
CREATE OR REPLACE FUNCTION handle_new_task_notification()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create notification if assignee is different from creator (optional, but good practice)
  -- But for now, let's keep it simple and notify regardless (or based on your requirement)
  -- The previous issue was likely the string concatenation or type mismatch.
  
  INSERT INTO notifications (recipient_id, actor_id, type, task_id, message, read)
  VALUES (
    NEW.assignee_id, 
    NEW.user_id, 
    'assigned', 
    NEW.id, 
    'You have been assigned a new task: ' || COALESCE(NEW.description, 'New Task'),
    false
  );
  
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Log error but don't fail the task creation
  RAISE WARNING 'Failed to create notification for task %: %', NEW.id, SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure trigger exists
DROP TRIGGER IF EXISTS on_task_created ON tasks;
CREATE TRIGGER on_task_created
  AFTER INSERT ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_task_notification();
