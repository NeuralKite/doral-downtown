-- Fix existing user roles based on metadata
UPDATE public.user_profiles up
SET role = CASE COALESCE(au.raw_user_meta_data->>'role', 'user')
  WHEN 'business' THEN 'business'::user_role
  WHEN 'admin' THEN 'admin'::user_role
  ELSE 'user'::user_role
END
FROM auth.users au
WHERE up.user_id = au.id;
