/*
  # Fix Registration Issues

  1. Database Schema Fixes
    - Ensure proper constraints and defaults
    - Fix trigger functions that might be causing 500 errors
    - Simplify RLS policies to avoid conflicts

  2. Auth Flow Improvements
    - Remove problematic triggers
    - Ensure proper user profile creation
    - Fix email verification flow
*/

-- Drop all existing triggers and functions that might be causing issues
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_confirmed ON auth.users;
DROP TRIGGER IF EXISTS sync_display_name ON user_profiles;

DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.handle_new_user_signup();
DROP FUNCTION IF EXISTS public.handle_email_confirmation();
DROP FUNCTION IF EXISTS public.sync_user_display_name();
DROP FUNCTION IF EXISTS public.fix_existing_user_mappings();
DROP FUNCTION IF EXISTS public.update_auth_display_name(uuid, text);

-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Users can read own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can create own profile" ON user_profiles;
DROP POLICY IF EXISTS "Allow profile creation during signup" ON user_profiles;
DROP POLICY IF EXISTS "Allow signup profile creation" ON user_profiles;
DROP POLICY IF EXISTS "Service role full access" ON user_profiles;
DROP POLICY IF EXISTS "Service role can manage all profiles" ON user_profiles;

-- Ensure the user_profiles table has the correct structure
ALTER TABLE user_profiles ALTER COLUMN name DROP NOT NULL;
ALTER TABLE user_profiles ALTER COLUMN name SET DEFAULT '';

-- Make sure email has a proper default
ALTER TABLE user_profiles ALTER COLUMN email SET NOT NULL;

-- Ensure role has proper default
ALTER TABLE user_profiles ALTER COLUMN role SET DEFAULT 'user'::user_role;

-- Ensure is_verified has proper default
ALTER TABLE user_profiles ALTER COLUMN is_verified SET DEFAULT false;

-- Create a simple function to handle new user creation
-- This will be called manually from the application, not automatically
CREATE OR REPLACE FUNCTION public.create_user_profile(
  user_uuid uuid,
  user_email text,
  user_name text DEFAULT '',
  user_role user_role DEFAULT 'user'::user_role
)
RETURNS uuid AS $$
DECLARE
  profile_id uuid;
BEGIN
  INSERT INTO public.user_profiles (
    user_id,
    email,
    name,
    role,
    is_verified
  )
  VALUES (
    user_uuid,
    user_email,
    COALESCE(user_name, split_part(user_email, '@', 1)),
    user_role,
    false
  )
  ON CONFLICT (user_id) DO UPDATE SET
    email = EXCLUDED.email,
    name = CASE 
      WHEN user_profiles.name = '' OR user_profiles.name IS NULL 
      THEN EXCLUDED.name 
      ELSE user_profiles.name 
    END,
    updated_at = now()
  RETURNING id INTO profile_id;
  
  RETURN profile_id;
END;
$$ language plpgsql security definer;

-- Create a function to update verification status
CREATE OR REPLACE FUNCTION public.update_user_verification(
  user_uuid uuid,
  verified boolean DEFAULT true
)
RETURNS boolean AS $$
BEGIN
  UPDATE public.user_profiles 
  SET is_verified = verified, updated_at = now()
  WHERE user_id = user_uuid;
  
  RETURN FOUND;
END;
$$ language plpgsql security definer;

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

-- 3. Allow users to insert their own profile during signup
CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- 4. Allow service role full access (for functions)
CREATE POLICY "Service role full access" ON user_profiles
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated, anon, service_role;
GRANT ALL ON user_profiles TO service_role;
GRANT SELECT, INSERT, UPDATE ON user_profiles TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_user_profile(uuid, text, text, user_role) TO authenticated, anon, service_role;
GRANT EXECUTE ON FUNCTION public.update_user_verification(uuid, boolean) TO authenticated, anon, service_role;

-- Ensure RLS is enabled
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id_unique ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email_unique ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_verification ON user_profiles(user_id, is_verified);

-- Remove any duplicate or conflicting constraints
ALTER TABLE user_profiles DROP CONSTRAINT IF EXISTS user_profiles_user_id_key;
ALTER TABLE user_profiles DROP CONSTRAINT IF EXISTS user_profiles_email_key;

-- Add back the essential unique constraints
ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_user_id_unique UNIQUE (user_id);
ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_email_unique UNIQUE (email);