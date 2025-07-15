/*
  # Fix Authentication and RLS Policies

  1. Remove problematic policies that cause infinite recursion
  2. Create simple, safe policies for user profiles
  3. Fix the signup trigger to work properly
  4. Ensure proper permissions for all operations
*/

-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Users can read own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Allow profile creation during signup" ON user_profiles;
DROP POLICY IF EXISTS "Allow signup profile creation" ON user_profiles;
DROP POLICY IF EXISTS "Service role can manage all profiles" ON user_profiles;

-- Drop existing triggers and functions
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_confirmed ON auth.users;
DROP TRIGGER IF EXISTS sync_display_name ON user_profiles;

DROP FUNCTION IF EXISTS public.handle_new_user_signup();
DROP FUNCTION IF EXISTS public.handle_email_confirmation();
DROP FUNCTION IF EXISTS public.sync_user_display_name();

-- Create a simple, safe function for handling new user signups
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Insert user profile with basic information
  INSERT INTO public.user_profiles (
    user_id,
    email,
    name,
    role,
    is_verified
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'name',
      NEW.raw_user_meta_data->>'full_name',
      split_part(NEW.email, '@', 1)
    ),
    COALESCE(
      (NEW.raw_user_meta_data->>'role')::user_role,
      'user'::user_role
    ),
    COALESCE(NEW.email_confirmed_at IS NOT NULL, false)
  )
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ language plpgsql security definer;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_new_user();

-- Create function to handle email confirmation
CREATE OR REPLACE FUNCTION public.handle_email_confirmation()
RETURNS trigger AS $$
BEGIN
  -- Update verification status when email is confirmed
  IF NEW.email_confirmed_at IS NOT NULL AND OLD.email_confirmed_at IS NULL THEN
    UPDATE public.user_profiles 
    SET is_verified = true, updated_at = now()
    WHERE user_id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ language plpgsql security definer;

-- Create trigger for email confirmation
CREATE TRIGGER on_auth_user_confirmed
  AFTER UPDATE OF email_confirmed_at ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_email_confirmation();

-- Create simple, safe RLS policies

-- 1. Allow users to read their own profile
CREATE POLICY "Users can read own profile" ON user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- 2. Allow users to update their own profile  
CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 3. Allow authenticated users to create their own profile
CREATE POLICY "Users can create own profile" ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- 4. Allow service role full access
CREATE POLICY "Service role full access" ON user_profiles
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated, anon;
GRANT ALL ON user_profiles TO authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.handle_email_confirmation() TO authenticated, anon;

-- Ensure RLS is enabled
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;