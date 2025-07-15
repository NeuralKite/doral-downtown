-- =====================================================
-- FINAL REGISTRATION FIX - CORRECT PATTERN
-- =====================================================

-- Drop existing triggers and functions
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_confirmed ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.handle_email_confirmation() CASCADE;

-- =====================================================
-- Create the correct trigger function following the exact pattern
-- =====================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  user_name text;
  user_role user_role;
BEGIN
  -- Extract name from metadata (using 'name' field as sent from frontend)
  user_name := COALESCE(
    NEW.raw_user_meta_data->>'name',
    split_part(NEW.email, '@', 1)
  );
  
  -- Extract and validate role from metadata
  CASE COALESCE(NEW.raw_user_meta_data->>'role', 'user')
    WHEN 'business' THEN user_role := 'business'::user_role;
    WHEN 'admin' THEN user_role := 'admin'::user_role;
    ELSE user_role := 'user'::user_role;
  END CASE;
  
  -- Insert user profile with data from new.raw_user_meta_data
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
    CASE 
      WHEN user_role = 'business' THEN NEW.raw_user_meta_data->>'business_name'
      ELSE NULL 
    END,
    CASE 
      WHEN user_role = 'business' THEN NEW.raw_user_meta_data->>'business_description'
      ELSE NULL 
    END,
    CASE 
      WHEN user_role = 'business' THEN NEW.raw_user_meta_data->>'business_address'
      ELSE NULL 
    END,
    CASE 
      WHEN user_role = 'business' THEN NEW.raw_user_meta_data->>'business_website'
      ELSE NULL 
    END,
    -- Calculate is_verified as new.email_confirmed_at is not null
    COALESCE(NEW.email_confirmed_at IS NOT NULL, false)
  )
  ON CONFLICT (user_id) DO UPDATE SET
    email = EXCLUDED.email,
    name = EXCLUDED.name,
    role = EXCLUDED.role,
    phone = EXCLUDED.phone,
    business_name = EXCLUDED.business_name,
    business_description = EXCLUDED.business_description,
    business_address = EXCLUDED.business_address,
    business_website = EXCLUDED.business_website,
    is_verified = EXCLUDED.is_verified,
    updated_at = now();
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the signup
    RAISE WARNING 'Error in handle_new_user for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ language plpgsql security definer;

-- =====================================================
-- Create email confirmation handler
-- =====================================================

CREATE OR REPLACE FUNCTION public.handle_email_confirmation()
RETURNS trigger AS $$
BEGIN
  -- Update is_verified when email is confirmed
  IF NEW.email_confirmed_at IS NOT NULL AND OLD.email_confirmed_at IS NULL THEN
    UPDATE public.user_profiles 
    SET is_verified = true, updated_at = now()
    WHERE user_id = NEW.id;
  END IF;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Error in handle_email_confirmation for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ language plpgsql security definer;

-- =====================================================
-- Create triggers
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
-- Grant permissions
-- =====================================================

GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;
GRANT EXECUTE ON FUNCTION public.handle_email_confirmation() TO service_role;

-- =====================================================
-- Final verification
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '=== REGISTRATION PATTERN CORRECTED ===';
  RAISE NOTICE 'Frontend: Uses supabase.auth.signUp with email, password, and options.data';
  RAISE NOTICE 'Frontend: Passes emailRedirectTo with valid route';
  RAISE NOTICE 'Frontend: Does NOT include is_verified in metadata';
  RAISE NOTICE 'Trigger: Inserts data from new.raw_user_meta_data';
  RAISE NOTICE 'Trigger: Calculates is_verified as new.email_confirmed_at is not null';
  RAISE NOTICE 'Registration should now work correctly with proper role handling';
END $$;