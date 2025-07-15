/*
  # Create automatic user profile trigger

  1. New Functions
    - `handle_new_user_signup()` - Automatically creates user profile when user signs up
    - `handle_email_confirmation()` - Updates verification status when email is confirmed
    
  2. Triggers
    - Automatic profile creation on auth.users INSERT
    - Automatic verification update on email confirmation
    
  3. Security
    - Proper RLS policies for automatic operations
    - Safe error handling to prevent signup failures
*/

-- Drop existing triggers to avoid conflicts
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_confirmed ON auth.users;

-- Create function to automatically handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user_signup()
RETURNS trigger AS $$
DECLARE
  user_name text;
  user_role user_role;
  user_phone text;
  business_name text;
  business_description text;
  business_address text;
  business_website text;
BEGIN
  -- Extract data from metadata
  user_name := COALESCE(
    NEW.raw_user_meta_data->>'name',
    NEW.raw_user_meta_data->>'full_name',
    split_part(NEW.email, '@', 1)
  );
  
  user_role := COALESCE(
    (NEW.raw_user_meta_data->>'role')::user_role,
    'user'::user_role
  );
  
  user_phone := NEW.raw_user_meta_data->>'phone';
  business_name := NEW.raw_user_meta_data->>'business_name';
  business_description := NEW.raw_user_meta_data->>'business_description';
  business_address := NEW.raw_user_meta_data->>'business_address';
  business_website := NEW.raw_user_meta_data->>'business_website';
  
  -- Insert user profile with all available data
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
    user_phone,
    business_name,
    business_description,
    business_address,
    business_website,
    COALESCE(NEW.email_confirmed_at IS NOT NULL, false)
  )
  ON CONFLICT (user_id) DO UPDATE SET
    email = EXCLUDED.email,
    name = CASE 
      WHEN user_profiles.name = '' OR user_profiles.name IS NULL 
      THEN EXCLUDED.name 
      ELSE user_profiles.name 
    END,
    role = EXCLUDED.role,
    phone = COALESCE(EXCLUDED.phone, user_profiles.phone),
    business_name = COALESCE(EXCLUDED.business_name, user_profiles.business_name),
    business_description = COALESCE(EXCLUDED.business_description, user_profiles.business_description),
    business_address = COALESCE(EXCLUDED.business_address, user_profiles.business_address),
    business_website = COALESCE(EXCLUDED.business_website, user_profiles.business_website),
    updated_at = now();
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the signup
    RAISE WARNING 'Error creating user profile for %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ language plpgsql security definer;

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
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the operation
    RAISE WARNING 'Error updating verification status for %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ language plpgsql security definer;

-- Create triggers
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_new_user_signup();

CREATE TRIGGER on_auth_user_confirmed
  AFTER UPDATE OF email_confirmed_at ON auth.users
  FOR EACH ROW 
  WHEN (OLD.email_confirmed_at IS NULL AND NEW.email_confirmed_at IS NOT NULL)
  EXECUTE FUNCTION public.handle_email_confirmation();

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.handle_new_user_signup() TO authenticated, anon, service_role;
GRANT EXECUTE ON FUNCTION public.handle_email_confirmation() TO authenticated, anon, service_role;

-- Add a policy to allow the trigger to insert profiles
CREATE POLICY "Allow automatic profile creation" ON user_profiles
  FOR INSERT
  TO service_role
  WITH CHECK (true);