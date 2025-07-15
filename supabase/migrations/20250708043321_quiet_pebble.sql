/*
  # Fix registration errors

  1. Remove automatic trigger that's causing conflicts
  2. Simplify user profile creation
  3. Fix RLS policies for proper access
*/

-- Remove the automatic trigger that's causing conflicts
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Simplify the user profile creation process
-- Remove the automatic profile creation and let the app handle it manually

-- Update RLS policies to allow initial profile creation
DROP POLICY IF EXISTS "Allow profile creation during signup" ON user_profiles;

-- Create a more permissive policy for initial signup
CREATE POLICY "Allow profile creation during signup"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
  );

-- Also allow unauthenticated profile creation for the signup process
CREATE POLICY "Allow signup profile creation"
  ON user_profiles
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Ensure the email confirmation trigger works properly
CREATE OR REPLACE FUNCTION public.handle_email_confirmation()
RETURNS trigger AS $$
BEGIN
  -- Update user profile when email is confirmed
  IF NEW.email_confirmed_at IS NOT NULL AND OLD.email_confirmed_at IS NULL THEN
    UPDATE public.user_profiles 
    SET is_verified = true, updated_at = now()
    WHERE user_id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ language plpgsql security definer;

-- Recreate the email confirmation trigger
DROP TRIGGER IF EXISTS on_auth_user_confirmed ON auth.users;
CREATE TRIGGER on_auth_user_confirmed
  AFTER UPDATE OF email_confirmed_at ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_email_confirmation();