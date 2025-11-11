/*
  # Auto-confirm new users

  1. Changes
    - Update trigger to automatically confirm email for new users
    - Sets email_confirmed_at timestamp on user creation
    
  2. Benefits
    - Users can sign in immediately without email confirmation
    - Simplifies signup flow for development/testing
*/

-- Update the handle_new_user function to auto-confirm email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Create profile
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  
  -- Auto-confirm email by updating auth.users
  UPDATE auth.users
  SET email_confirmed_at = NOW()
  WHERE id = NEW.id AND email_confirmed_at IS NULL;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;