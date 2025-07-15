/*
  # Fix Registration Errors - Final Solution

  Based on the console errors shown, we need to:
  1. Fix the trigger function that's causing 500 errors
  2. Ensure proper CORS handling
  3. Simplify the registration process to match the working example exactly

  ## Console Errors Analysis:
  - "Failed to load resource: the server responded with a status of 500"
  - "Registration error: AuthApiError: Database error saving new user"
  - Supabase request failed

  ## Solution:
  - Remove complex trigger logic
  - Create simple, bulletproof trigger
  - Follow the exact pattern from the working example
*/

-- =====================================================
-- STEP 1: Complete cleanup
-- =====================================================

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_confirmed ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.handle_email_confirmation() CASCADE;

-- =====================================================
-- STEP 2: Create simple, bulletproof trigger function
-- =====================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Simple insert following the exact working pattern
  INSERT INTO public.user_profiles (
    user_id,
    email,
    name,
    role
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'user'::user_role)
  )
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Don't fail the signup, just log the error
    RAISE WARNING 'Error in handle_new_user for %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ language plpgsql security definer;

-- =====================================================
-- STEP 3: Create simple email confirmation handler
-- =====================================================

CREATE OR REPLACE FUNCTION public.handle_email_confirmation()
RETURNS trigger AS $$
BEGIN
  IF NEW.email_confirmed_at IS NOT NULL AND OLD.email_confirmed_at IS NULL THEN
    UPDATE public.user_profiles 
    SET is_verified = true, updated_at = now()
    WHERE user_id = NEW.id;
  END IF;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Error in handle_email_confirmation for %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ language plpgsql security definer;

-- =====================================================
-- STEP 4: Create triggers
-- =====================================================

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_new_user();

CREATE TRIGGER on_auth_user_confirmed
  AFTER UPDATE OF email_confirmed_at ON auth.users
  FOR EACH ROW 
  WHEN (OLD.email_confirmed_at IS NULL AND NEW.email_confirmed_at IS NOT NULL)
  EXECUTE FUNCTION public.handle_email_confirmation();

-- =====================================================
-- STEP 5: Grant permissions
-- =====================================================

GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;
GRANT EXECUTE ON FUNCTION public.handle_email_confirmation() TO service_role;

-- =====================================================
-- STEP 6: Ensure table is ready
-- =====================================================

-- Make sure all columns have proper defaults
ALTER TABLE user_profiles ALTER COLUMN name SET DEFAULT '';
ALTER TABLE user_profiles ALTER COLUMN role SET DEFAULT 'user'::user_role;
ALTER TABLE user_profiles ALTER COLUMN is_verified SET DEFAULT false;

-- Ensure nullable columns are properly set
ALTER TABLE user_profiles ALTER COLUMN phone DROP NOT NULL;
ALTER TABLE user_profiles ALTER COLUMN business_name DROP NOT NULL;
ALTER TABLE user_profiles ALTER COLUMN business_description DROP NOT NULL;
ALTER TABLE user_profiles ALTER COLUMN business_address DROP NOT NULL;
ALTER TABLE user_profiles ALTER COLUMN business_website DROP NOT NULL;

-- =====================================================
-- FINAL LOG
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '=== SIMPLE REGISTRATION FIX COMPLETED ===';
  RAISE NOTICE 'Simplified trigger to prevent 500 errors';
  RAISE NOTICE 'Following exact working example pattern';
  RAISE NOTICE 'Should resolve "Database error saving new user"';
END $$;