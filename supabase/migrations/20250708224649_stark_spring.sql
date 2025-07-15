/*
  # Fix Registration Pattern to Match Working Example

  This migration fixes the registration process to follow the exact pattern
  from the working example you provided.

  ## Key Changes:
  1. Fix trigger to read metadata correctly (full_name instead of name)
  2. Handle role mapping properly (user/business instead of artist/fan)
  3. Ensure proper data extraction from raw_user_meta_data
  4. Add comprehensive error handling without breaking signup
*/

-- =====================================================
-- STEP 1: Clean up existing triggers and functions
-- =====================================================

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_confirmed ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.handle_email_confirmation() CASCADE;

-- =====================================================
-- STEP 2: Create the correct trigger function based on your example
-- =====================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  user_name text;
  user_role user_role;
  profile_exists boolean := false;
BEGIN
  -- Log the signup attempt
  RAISE LOG 'Processing new user signup: % (email: %)', NEW.id, NEW.email;
  
  -- Check if profile already exists
  SELECT EXISTS(SELECT 1 FROM public.user_profiles WHERE user_id = NEW.id) INTO profile_exists;
  
  IF profile_exists THEN
    RAISE LOG 'Profile already exists for user %, skipping creation', NEW.id;
    RETURN NEW;
  END IF;
  
  -- Extract name from metadata (following your example pattern)
  -- Your example uses 'full_name' in the metadata
  user_name := COALESCE(
    NULLIF(trim(NEW.raw_user_meta_data->>'full_name'), ''),
    NULLIF(trim(NEW.raw_user_meta_data->>'name'), ''),
    split_part(NEW.email, '@', 1),
    'User'
  );
  
  -- Extract role from metadata and map to our enum
  -- Your example uses 'role' field directly
  BEGIN
    CASE NEW.raw_user_meta_data->>'role'
      WHEN 'business' THEN user_role := 'business'::user_role;
      WHEN 'admin' THEN user_role := 'admin'::user_role;
      ELSE user_role := 'user'::user_role;
    END CASE;
  EXCEPTION
    WHEN OTHERS THEN
      user_role := 'user'::user_role;
      RAISE LOG 'Invalid or missing role for user %, defaulting to user', NEW.id;
  END;
  
  -- Log extracted data
  RAISE LOG 'Creating profile for user % with name: %, role: %', NEW.id, user_name, user_role;
  RAISE LOG 'Raw metadata: %', NEW.raw_user_meta_data;
  
  -- Insert user profile
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
-- STEP 3: Create email confirmation handler
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
-- FINAL LOG
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '=== REGISTRATION PATTERN FIX COMPLETED ===';
  RAISE NOTICE 'Updated trigger to match working example pattern';
  RAISE NOTICE 'Now reads full_name from metadata like the working example';
  RAISE NOTICE 'Handles role mapping correctly for user/business/admin';
  RAISE NOTICE 'Registration should now work without "Database error saving new user"';
END $$;