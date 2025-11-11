/*
  # Create Task Details Table

  1. New Tables
    - `task_details`
      - `id` (uuid, primary key)
      - `task_id` (uuid, references tasks)
      - `content` (text)
      - `order_index` (integer) - for maintaining order of details
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
  
  2. Security
    - Enable RLS on `task_details` table
    - Users can view details for tasks they have access to
    - Users can manage details for tasks they created or are assigned to
*/

CREATE TABLE IF NOT EXISTS task_details (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  content text NOT NULL,
  order_index integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE task_details ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view task details for accessible tasks"
  ON task_details FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tasks
      WHERE tasks.id = task_details.task_id
      AND (tasks.user_id = auth.uid() OR tasks.assignee_id = auth.uid())
    )
  );

CREATE POLICY "Users can insert task details for accessible tasks"
  ON task_details FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM tasks
      WHERE tasks.id = task_details.task_id
      AND (tasks.user_id = auth.uid() OR tasks.assignee_id = auth.uid())
    )
  );

CREATE POLICY "Users can update task details for accessible tasks"
  ON task_details FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tasks
      WHERE tasks.id = task_details.task_id
      AND (tasks.user_id = auth.uid() OR tasks.assignee_id = auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM tasks
      WHERE tasks.id = task_details.task_id
      AND (tasks.user_id = auth.uid() OR tasks.assignee_id = auth.uid())
    )
  );

CREATE POLICY "Users can delete task details for accessible tasks"
  ON task_details FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tasks
      WHERE tasks.id = task_details.task_id
      AND (tasks.user_id = auth.uid() OR tasks.assignee_id = auth.uid())
    )
  );

CREATE INDEX IF NOT EXISTS idx_task_details_task_id ON task_details(task_id);
CREATE INDEX IF NOT EXISTS idx_task_details_order ON task_details(task_id, order_index);