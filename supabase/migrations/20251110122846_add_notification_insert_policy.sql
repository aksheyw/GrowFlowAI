/*
  # Add Insert Policy for Notifications

  1. Changes
    - Add policy to allow authenticated users to insert notifications
    - This enables users to send test notifications and create notifications for other users
    
  2. Security
    - Only authenticated users can insert notifications
    - Users can create notifications for any recipient (needed for test notifications and task assignments)
*/

CREATE POLICY "Authenticated users can insert notifications"
  ON notifications FOR INSERT
  TO authenticated
  WITH CHECK (true);
