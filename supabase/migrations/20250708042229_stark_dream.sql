/*
  # Fix email confirmation template

  1. Updates
    - Fix email confirmation template syntax
    - Ensure proper URL generation for email verification
    - Update email settings for production use

  2. Security
    - Maintain existing RLS policies
    - Ensure secure email verification flow
*/

-- Update the email confirmation template with correct syntax
-- This needs to be done in the Supabase dashboard, but we can document the correct template here

-- The correct email template should be:
-- Subject: Confirm Your Signup
-- Body:
-- <h2>Confirm your signup</h2>
-- <p>Follow this link to confirm your user:</p>
-- <p><a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email">Confirm your mail</a></p>

-- For now, let's ensure our auth flow works with the default template
-- and update our verification handling to work with Supabase's token system

-- Make sure we have the proper function to handle email confirmation
CREATE OR REPLACE FUNCTION public.handle_email_confirmation()
RETURNS trigger AS $$
BEGIN
  -- Update user profile when email is confirmed
  UPDATE public.user_profiles 
  SET is_verified = true, updated_at = now()
  WHERE user_id = NEW.id AND NEW.email_confirmed_at IS NOT NULL;
  
  RETURN NEW;
END;
$$ language plpgsql security definer;

-- Create trigger for email confirmation
DROP TRIGGER IF EXISTS on_auth_user_confirmed ON auth.users;
CREATE TRIGGER on_auth_user_confirmed
  AFTER UPDATE OF email_confirmed_at ON auth.users
  FOR EACH ROW 
  WHEN (OLD.email_confirmed_at IS NULL AND NEW.email_confirmed_at IS NOT NULL)
  EXECUTE FUNCTION public.handle_email_confirmation();