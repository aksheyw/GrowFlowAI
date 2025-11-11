/*
  # Remove Unused Index

  1. Changes
    - Drop idx_notifications_actor_id index as it's not being used
    - This frees up storage and reduces maintenance overhead
    
  2. Notes
    - Unused indexes consume disk space and slow down write operations
    - Can always be recreated if needed in the future
*/

DROP INDEX IF EXISTS public.idx_notifications_actor_id;
