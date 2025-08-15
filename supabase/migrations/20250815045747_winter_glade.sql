@@ .. @@
 CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger AS $$
 DECLARE
   user_name text;
   user_role user_role;
 BEGIN
-  -- Extract name from metadata (using 'name' field as sent from frontend)
+  -- Extract name from metadata (using 'full_name' field as sent from frontend)
   user_name := COALESCE(
-    NEW.raw_user_meta_data->>'name',
+    NULLIF(trim(NEW.raw_user_meta_data->>'full_name'), ''),
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
-    NEW.raw_user_meta_data->>'phone',
+    NULLIF(trim(NEW.raw_user_meta_data->>'phone'), ''),
     CASE 
-      WHEN user_role = 'business' THEN NEW.raw_user_meta_data->>'business_name'
+      WHEN user_role = 'business' THEN NULLIF(trim(NEW.raw_user_meta_data->>'business_name'), '')
       ELSE NULL 
     END,
     CASE 
-      WHEN user_role = 'business' THEN NEW.raw_user_meta_data->>'business_description'
+      WHEN user_role = 'business' THEN NULLIF(trim(NEW.raw_user_meta_data->>'business_description'), '')
       ELSE NULL 
     END,
     CASE 
-      WHEN user_role = 'business' THEN NEW.raw_user_meta_data->>'business_address'
+      WHEN user_role = 'business' THEN NULLIF(trim(NEW.raw_user_meta_data->>'business_address'), '')
       ELSE NULL 
     END,
     CASE 
-      WHEN user_role = 'business' THEN NEW.raw_user_meta_data->>'business_website'
+      WHEN user_role = 'business' THEN NULLIF(trim(NEW.raw_user_meta_data->>'business_website'), '')
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