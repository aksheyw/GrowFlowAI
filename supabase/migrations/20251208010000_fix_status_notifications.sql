-- Create trigger function for task status updates
CREATE OR REPLACE FUNCTION handle_task_status_update()
RETURNS TRIGGER AS $$
DECLARE
  actor_uuid uuid;
BEGIN
  -- Try to get the current user ID. If called by service role without impersonation, might be null.
  -- In client-side calls, this works.
  actor_uuid := auth.uid();
  
  -- If actor is null (e.g. service role), we might default to system or skip. 
  -- For now, if null, we assume it's a system update and maybe use the task creator or just handle gracefully.
  IF actor_uuid IS NULL THEN
     -- Fallback: Use the record's user_id as actor if unknown, or handle specific service role logic
     -- But typically client updates have auth.uid().
     actor_uuid := OLD.user_id; 
  END IF;

  -- Check if status has changed
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    
    -- Case 1: Task Completed (Done)
    IF NEW.status = 'Done' THEN
       -- Notify Creator if they are not the one who completed it
       IF NEW.user_id != actor_uuid THEN
         INSERT INTO notifications (recipient_id, actor_id, type, task_id, message, read)
         VALUES (NEW.user_id, actor_uuid, 'completed', NEW.id, 'Task completed: ' || COALESCE(NEW.description, 'Task'), false);
       END IF;

       -- Notify Assignee if they are not the one who completed it AND not the creator (avoid duplicate if creator=assignee)
       IF NEW.assignee_id != actor_uuid AND NEW.assignee_id != NEW.user_id THEN
         INSERT INTO notifications (recipient_id, actor_id, type, task_id, message, read)
         VALUES (NEW.assignee_id, actor_uuid, 'completed', NEW.id, 'Task completed: ' || COALESCE(NEW.description, 'Task'), false);
       END IF;

    -- Case 2: Status Updated (but not Done)
    ELSE 
       -- Notify Assignee if they are not the actor
       IF NEW.assignee_id != actor_uuid THEN
          INSERT INTO notifications (recipient_id, actor_id, type, task_id, message, read)
          VALUES (NEW.assignee_id, actor_uuid, 'updated', NEW.id, 'Task status updated to ' || NEW.status || ': ' || COALESCE(NEW.description, 'Task'), false);
       END IF;

       -- Notify Creator if they are not the actor and not the assignee
       IF NEW.user_id != actor_uuid AND NEW.user_id != NEW.assignee_id THEN
          INSERT INTO notifications (recipient_id, actor_id, type, task_id, message, read)
          VALUES (NEW.user_id, actor_uuid, 'updated', NEW.id, 'Task status updated to ' || NEW.status || ': ' || COALESCE(NEW.description, 'Task'), false);
       END IF;
    END IF;

  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_task_status_update ON tasks;

-- Create trigger
CREATE TRIGGER on_task_status_update
  AFTER UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION handle_task_status_update();
