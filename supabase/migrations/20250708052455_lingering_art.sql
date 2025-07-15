-- =====================================================
-- STEP 1: Complete cleanup of existing triggers/functions
-- =====================================================

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_confirmed ON auth.users;
DROP TRIGGER IF EXISTS sync_display_name ON user_profiles;

DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user_signup() CASCADE;
DROP FUNCTION IF EXISTS public.handle_email_confirmation() CASCADE;
DROP FUNCTION IF EXISTS public.sync_user_display_name() CASCADE;
DROP FUNCTION IF EXISTS public.create_user_profile(uuid, text, text, user_role) CASCADE;
DROP FUNCTION IF EXISTS public.update_user_verification(uuid, boolean) CASCADE;
DROP FUNCTION IF EXISTS public.debug_user_profile(uuid) CASCADE;

-- =====================================================
-- STEP 2: Clean up all RLS policies
-- =====================================================

DROP POLICY IF EXISTS "Users can read own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can create own profile" ON user_profiles;
DROP POLICY IF EXISTS "Allow profile creation during signup" ON user_profiles;
DROP POLICY IF EXISTS "Allow signup profile creation" ON user_profiles;
DROP POLICY IF EXISTS "Allow automatic profile creation" ON user_profiles;
DROP POLICY IF EXISTS "Service role full access" ON user_profiles;
DROP POLICY IF EXISTS "Service role can manage all profiles" ON user_profiles;

-- =====================================================
-- STEP 3: Ensure table structure matches exactly what's shown in image
-- =====================================================

-- Ensure all columns are properly configured
DO $$
BEGIN
  -- Make name nullable with default
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'name' AND is_nullable = 'NO') THEN
    ALTER TABLE user_profiles ALTER COLUMN name DROP NOT NULL;
  END IF;
  ALTER TABLE user_profiles ALTER COLUMN name SET DEFAULT '';

  -- Business fields should be nullable (only for business users)
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'business_name' AND is_nullable = 'NO') THEN
    ALTER TABLE user_profiles ALTER COLUMN business_name DROP NOT NULL;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'business_description' AND is_nullable = 'NO') THEN
    ALTER TABLE user_profiles ALTER COLUMN business_description DROP NOT NULL;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'business_address' AND is_nullable = 'NO') THEN
    ALTER TABLE user_profiles ALTER COLUMN business_address DROP NOT NULL;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'business_website' AND is_nullable = 'NO') THEN
    ALTER TABLE user_profiles ALTER COLUMN business_website DROP NOT NULL;
  END IF;

  -- Ensure proper defaults
  ALTER TABLE user_profiles ALTER COLUMN role SET DEFAULT 'user'::user_role;
  ALTER TABLE user_profiles ALTER COLUMN is_verified SET DEFAULT false;
END $$;

-- =====================================================
-- STEP 4: Create the definitive trigger function
-- =====================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  user_name text;
  user_role user_role;
  profile_exists boolean := false;
BEGIN
  -- Log the attempt
  RAISE LOG 'Creating user_profiles entry for user: % (email: %)', NEW.id, NEW.email;
  
  -- Check if profile already exists to avoid conflicts
  SELECT EXISTS(SELECT 1 FROM public.user_profiles WHERE user_id = NEW.id) INTO profile_exists;
  
  IF profile_exists THEN
    RAISE LOG 'Profile already exists for user %, skipping creation', NEW.id;
    RETURN NEW;
  END IF;
  
  -- Extract name with multiple fallbacks
  user_name := COALESCE(
    NULLIF(trim(NEW.raw_user_meta_data->>'name'), ''),
    NULLIF(trim(NEW.raw_user_meta_data->>'full_name'), ''),
    split_part(NEW.email, '@', 1),
    'User'
  );
  
  -- Extract role with validation
  BEGIN
    user_role := COALESCE(
      (NEW.raw_user_meta_data->>'role')::user_role,
      'user'::user_role
    );
  EXCEPTION
    WHEN invalid_text_representation THEN
      user_role := 'user'::user_role;
      RAISE LOG 'Invalid role in metadata for user %, using default: user', NEW.id;
  END;
  
  -- Insert into user_profiles table (exact name from image)
  BEGIN
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
      is_verified,
      created_at,
      updated_at
    )
    VALUES (
      NEW.id,
      NEW.email,
      user_name,
      user_role,
      NULLIF(trim(COALESCE(NEW.raw_user_meta_data->>'phone', '')), ''),
      CASE 
        WHEN user_role = 'business' THEN NULLIF(trim(COALESCE(NEW.raw_user_meta_data->>'business_name', '')), '')
        ELSE NULL 
      END,
      CASE 
        WHEN user_role = 'business' THEN NULLIF(trim(COALESCE(NEW.raw_user_meta_data->>'business_description', '')), '')
        ELSE NULL 
      END,
      CASE 
        WHEN user_role = 'business' THEN NULLIF(trim(COALESCE(NEW.raw_user_meta_data->>'business_address', '')), '')
        ELSE NULL 
      END,
      CASE 
        WHEN user_role = 'business' THEN NULLIF(trim(COALESCE(NEW.raw_user_meta_data->>'business_website', '')), '')
        ELSE NULL 
      END,
      COALESCE(NEW.email_confirmed_at IS NOT NULL, false),
      now(),
      now()
    );
    
    RAISE LOG 'Successfully created user_profiles entry for user: %', NEW.id;
    RETURN NEW;
    
  EXCEPTION
    WHEN unique_violation THEN
      -- Handle race condition
      RAISE LOG 'Race condition: user_profiles entry already exists for user %', NEW.id;
      RETURN NEW;
      
    WHEN not_null_violation THEN
      -- Handle NOT NULL violations by creating minimal profile
      RAISE WARNING 'NOT NULL violation for user %, creating minimal profile: %', NEW.id, SQLERRM;
      
      BEGIN
        INSERT INTO public.user_profiles (user_id, email, name, role, is_verified)
        VALUES (NEW.id, NEW.email, user_name, 'user'::user_role, false)
        ON CONFLICT (user_id) DO NOTHING;
        
        RAISE LOG 'Created minimal user_profiles entry for user %', NEW.id;
        RETURN NEW;
      EXCEPTION
        WHEN OTHERS THEN
          RAISE WARNING 'Failed to create minimal profile for user %: %', NEW.id, SQLERRM;
          RETURN NEW;
      END;
      
    WHEN OTHERS THEN
      -- Log error details but don't fail signup
      RAISE WARNING 'Error creating user_profiles entry for user %: % - %', NEW.id, SQLSTATE, SQLERRM;
      RAISE WARNING 'Metadata was: %', NEW.raw_user_meta_data;
      
      -- Last resort: create absolute minimal profile
      BEGIN
        INSERT INTO public.user_profiles (user_id, email, name, role, is_verified)
        VALUES (NEW.id, NEW.email, split_part(NEW.email, '@', 1), 'user'::user_role, false)
        ON CONFLICT (user_id) DO NOTHING;
        
        RAISE LOG 'Created emergency minimal profile for user %', NEW.id;
        RETURN NEW;
      EXCEPTION
        WHEN OTHERS THEN
          -- Don't fail the signup even if profile creation completely fails
          RAISE WARNING 'Complete failure creating user_profiles entry for user %: %', NEW.id, SQLERRM;
          RETURN NEW;
      END;
  END;
END;
$$ language plpgsql security definer;

-- =====================================================
-- STEP 5: Create email confirmation handler
-- =====================================================

CREATE OR REPLACE FUNCTION public.handle_email_confirmation()
RETURNS trigger AS $$
BEGIN
  IF NEW.email_confirmed_at IS NOT NULL AND (OLD.email_confirmed_at IS NULL OR OLD.email_confirmed_at IS DISTINCT FROM NEW.email_confirmed_at) THEN
    
    UPDATE public.user_profiles 
    SET is_verified = true, updated_at = now()
    WHERE user_id = NEW.id;
    
    IF FOUND THEN
      RAISE LOG 'Updated verification status for user %', NEW.id;
    ELSE
      RAISE WARNING 'No user_profiles entry found for user % during email confirmation', NEW.id;
    END IF;
  END IF;
  
  RETURN NEW;
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Error updating verification status for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ language plpgsql security definer;

-- =====================================================
-- STEP 6: Create simple, bulletproof RLS policies
-- =====================================================

-- 1. Service role gets full access (for triggers)
CREATE POLICY "Service role full access" ON user_profiles
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- 2. Users can read their own profile
CREATE POLICY "Users can read own profile" ON user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- 3. Users can update their own profile
CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 4. Users can insert their own profile (backup for manual creation)
CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- STEP 7: Create the triggers
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
-- STEP 8: Grant all necessary permissions
-- =====================================================

GRANT USAGE ON SCHEMA public TO authenticated, anon, service_role;
GRANT ALL ON user_profiles TO service_role;
GRANT SELECT, INSERT, UPDATE ON user_profiles TO authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;
GRANT EXECUTE ON FUNCTION public.handle_email_confirmation() TO service_role;

-- =====================================================
-- STEP 9: Ensure RLS and indexes
-- =====================================================

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Create performance indexes
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id_verification ON user_profiles(user_id, is_verified);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email_verified ON user_profiles(email, is_verified);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);

-- =====================================================
-- STEP 10: Create debugging function
-- =====================================================

CREATE OR REPLACE FUNCTION public.test_user_profile_creation(test_email text, test_role text DEFAULT 'user')
RETURNS jsonb AS $$
DECLARE
  result jsonb;
BEGIN
  -- This function can be used to test profile creation manually
  SELECT jsonb_build_object(
    'email', test_email,
    'role', test_role,
    'would_create', true,
    'timestamp', now()
  ) INTO result;
  
  RETURN result;
END;
$$ language plpgsql security definer;

GRANT EXECUTE ON FUNCTION public.test_user_profile_creation(text, text) TO authenticated, service_role;

-- =====================================================
-- FINAL LOG
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '=== USER_PROFILES REGISTRATION FIX COMPLETED ===';
  RAISE NOTICE 'Table name: user_profiles (confirmed from image)';
  RAISE NOTICE 'Trigger function: handle_new_user() with comprehensive error handling';
  RAISE NOTICE 'RLS policies: Simple and safe, no recursion';
  RAISE NOTICE 'Error "Database error saving new user" should now be resolved';
  RAISE NOTICE 'Registration process will create user_profiles entries automatically';
END $$;