-- Use full_name and handle optional fields in handle_new_user
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  user_name text;
  user_role user_role;
BEGIN
  -- Extract name from metadata (using 'full_name' field as sent from frontend)
  user_name := COALESCE(
    NULLIF(trim(NEW.raw_user_meta_data->>'full_name'), ''),
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
    NULLIF(trim(NEW.raw_user_meta_data->>'phone'), ''),
    CASE
      WHEN user_role = 'business' THEN NULLIF(trim(NEW.raw_user_meta_data->>'business_name'), '')
      ELSE NULL
    END,
    CASE
      WHEN user_role = 'business' THEN NULLIF(trim(NEW.raw_user_meta_data->>'business_description'), '')
      ELSE NULL
    END,
    CASE
      WHEN user_role = 'business' THEN NULLIF(trim(NEW.raw_user_meta_data->>'business_address'), '')
      ELSE NULL
    END,
    CASE
      WHEN user_role = 'business' THEN NULLIF(trim(NEW.raw_user_meta_data->>'business_website'), '')
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;
