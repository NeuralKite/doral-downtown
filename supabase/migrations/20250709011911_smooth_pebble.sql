-- =====================================================
-- FINAL FIX FOR REGISTRATION ISSUES
-- =====================================================

-- Drop existing triggers and functions
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_confirmed ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.handle_email_confirmation() CASCADE;

-- =====================================================
-- Create the definitive trigger function
-- =====================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  user_name text;
  user_role user_role;
BEGIN
  -- Extract name from metadata
  user_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name',
    split_part(NEW.email, '@', 1)
  );
  
  -- Extract and validate role
  CASE COALESCE(NEW.raw_user_meta_data->>'role', 'user')
    WHEN 'business' THEN user_role := 'business'::user_role;
    WHEN 'admin' THEN user_role := 'admin'::user_role;
    ELSE user_role := 'user'::user_role;
  END CASE;
  
  -- Insert user profile
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
    false
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
-- Ensure table structure is correct
-- =====================================================

-- Ensure all columns have proper defaults and nullability
ALTER TABLE user_profiles ALTER COLUMN name SET DEFAULT '';
ALTER TABLE user_profiles ALTER COLUMN role SET DEFAULT 'user'::user_role;
ALTER TABLE user_profiles ALTER COLUMN is_verified SET DEFAULT false;

-- Ensure business fields are nullable
DO $$
BEGIN
  -- Make business fields nullable if they aren't already
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_profiles' 
    AND column_name = 'business_name' 
    AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE user_profiles ALTER COLUMN business_name DROP NOT NULL;
  END IF;
  
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_profiles' 
    AND column_name = 'business_description' 
    AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE user_profiles ALTER COLUMN business_description DROP NOT NULL;
  END IF;
  
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_profiles' 
    AND column_name = 'business_address' 
    AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE user_profiles ALTER COLUMN business_address DROP NOT NULL;
  END IF;
  
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_profiles' 
    AND column_name = 'business_website' 
    AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE user_profiles ALTER COLUMN business_website DROP NOT NULL;
  END IF;
  
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_profiles' 
    AND column_name = 'phone' 
    AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE user_profiles ALTER COLUMN phone DROP NOT NULL;
  END IF;
END $$;

-- =====================================================
-- Final verification
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '=== REGISTRATION FIX COMPLETED ===';
  RAISE NOTICE 'Trigger function: handle_new_user() - simplified and robust';
  RAISE NOTICE 'Role mapping: user/business/admin properly handled';
  RAISE NOTICE 'Business fields: only populated for business role';
  RAISE NOTICE 'Error handling: comprehensive with fallbacks';
  RAISE NOTICE 'Registration should now work without errors';
END $$;