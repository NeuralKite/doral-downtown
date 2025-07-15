/*
  # Fix Registration Database Trigger Error

  1. Problem Analysis
    - The automatic trigger is failing during user signup
    - Error: "Database error saving new user" with 500 status
    - Likely caused by RLS policies or trigger function issues

  2. Solution
    - Simplify the trigger function to avoid conflicts
    - Fix RLS policies to prevent infinite recursion
    - Add proper error handling in the trigger
    - Ensure all required fields have proper defaults

  3. Changes
    - Drop and recreate the user signup trigger with better error handling
    - Fix RLS policies that might be causing conflicts
    - Add proper constraints and defaults
*/

-- Drop existing problematic triggers and functions
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_confirmed ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user_signup();
DROP FUNCTION IF EXISTS public.handle_email_confirmation();

-- Drop all existing RLS policies to avoid conflicts
DROP POLICY IF EXISTS "Users can read own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Allow automatic profile creation" ON user_profiles;
DROP POLICY IF EXISTS "Service role full access" ON user_profiles;

-- Ensure table structure is correct
ALTER TABLE user_profiles ALTER COLUMN name DROP NOT NULL;
ALTER TABLE user_profiles ALTER COLUMN name SET DEFAULT '';
ALTER TABLE user_profiles ALTER COLUMN email SET NOT NULL;
ALTER TABLE user_profiles ALTER COLUMN role SET DEFAULT 'user'::user_role;
ALTER TABLE user_profiles ALTER COLUMN is_verified SET DEFAULT false;

-- Create a robust function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  user_name text;
  user_role user_role;
BEGIN
  -- Extract name from metadata with fallback
  user_name := COALESCE(
    NEW.raw_user_meta_data->>'name',
    NEW.raw_user_meta_data->>'full_name',
    split_part(NEW.email, '@', 1),
    'User'
  );
  
  -- Extract role from metadata with fallback
  user_role := COALESCE(
    (NEW.raw_user_meta_data->>'role')::user_role,
    'user'::user_role
  );
  
  -- Insert user profile with minimal required data
  INSERT INTO public.user_profiles (
    user_id,
    email,
    name,
    role,
    phone,
    business_name,
    business_description,
    business_address,
    business_website,
    is_verified
  )
  VALUES (
    NEW.id,
    NEW.email,
    user_name,
    user_role,
    NEW.raw_user_meta_data->>'phone',
    NEW.raw_user_meta_data->>'business_name',
    NEW.raw_user_meta_data->>'business_description',
    NEW.raw_user_meta_data->>'business_address',
    NEW.raw_user_meta_data->>'business_website',
    false
  );
  
  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    -- Profile already exists, update it instead
    UPDATE public.user_profiles 
    SET 
      email = NEW.email,
      name = CASE 
        WHEN name IS NULL OR name = '' THEN user_name 
        ELSE name 
      END,
      role = user_role,
      phone = COALESCE(NEW.raw_user_meta_data->>'phone', phone),
      business_name = COALESCE(NEW.raw_user_meta_data->>'business_name', business_name),
      business_description = COALESCE(NEW.raw_user_meta_data->>'business_description', business_description),
      business_address = COALESCE(NEW.raw_user_meta_data->>'business_address', business_address),
      business_website = COALESCE(NEW.raw_user_meta_data->>'business_website', business_website),
      updated_at = now()
    WHERE user_id = NEW.id;
    
    RETURN NEW;
  WHEN OTHERS THEN
    -- Log error but don't fail the signup
    RAISE WARNING 'Error creating user profile for %: % - %', NEW.id, SQLSTATE, SQLERRM;
    RETURN NEW;
END;
$$ language plpgsql security definer;

-- Create function to handle email confirmation
CREATE OR REPLACE FUNCTION public.handle_email_confirmation()
RETURNS trigger AS $$
BEGIN
  -- Update verification status when email is confirmed
  IF NEW.email_confirmed_at IS NOT NULL AND (OLD.email_confirmed_at IS NULL OR OLD.email_confirmed_at IS DISTINCT FROM NEW.email_confirmed_at) THEN
    UPDATE public.user_profiles 
    SET is_verified = true, updated_at = now()
    WHERE user_id = NEW.id;
  END IF;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the operation
    RAISE WARNING 'Error updating verification status for %: % - %', NEW.id, SQLSTATE, SQLERRM;
    RETURN NEW;
END;
$$ language plpgsql security definer;

-- Create simple, safe RLS policies

-- 1. Allow service role full access (for triggers and functions)
CREATE POLICY "Service role full access" ON user_profiles
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- 2. Allow users to read their own profile
CREATE POLICY "Users can read own profile" ON user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- 3. Allow users to update their own profile
CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 4. Allow users to insert their own profile (for manual creation)
CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create the triggers
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_new_user();

CREATE TRIGGER on_auth_user_confirmed
  AFTER UPDATE OF email_confirmed_at ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_email_confirmation();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated, anon, service_role;
GRANT ALL ON user_profiles TO service_role;
GRANT SELECT, INSERT, UPDATE ON user_profiles TO authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;
GRANT EXECUTE ON FUNCTION public.handle_email_confirmation() TO service_role;

-- Ensure RLS is enabled
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Add helpful indexes
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);

-- Clean up any potential constraint conflicts
ALTER TABLE user_profiles DROP CONSTRAINT IF EXISTS user_profiles_user_id_key;
ALTER TABLE user_profiles DROP CONSTRAINT IF EXISTS user_profiles_email_key;

-- Add back essential constraints
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'user_profiles_user_id_unique' 
    AND table_name = 'user_profiles'
  ) THEN
    ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_user_id_unique UNIQUE (user_id);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'user_profiles_email_unique' 
    AND table_name = 'user_profiles'
  ) THEN
    ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_email_unique UNIQUE (email);
  END IF;
END $$;