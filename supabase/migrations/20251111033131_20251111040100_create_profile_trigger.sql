/*
  # Create Profile Trigger

  1. Changes
    - Add trigger function to automatically create profile when user signs up
    - Add trigger on auth.users table to call function on INSERT
    
  2. Benefits
    - Ensures profiles are always created for new users
    - Eliminates RLS policy violations during signup
    - Uses metadata from auth.users.raw_user_meta_data
*/

-- Create function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();