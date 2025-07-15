-- =====================================================
-- STEP 1: Clean up any existing sample data
-- =====================================================

-- Delete existing sample data (in reverse order of dependencies)
DELETE FROM events WHERE organizer_id IN (
  SELECT id FROM user_profiles WHERE email IN (
    'admin@doraldowntown.com',
    'carlos@bullagastrobar.com',
    'sofia@cityplacedoral.com',
    'miguel@doralspa.com',
    'ana@gmail.com',
    'ricardo@gmail.com',
    'lucia@gmail.com'
  )
);

DELETE FROM news_articles WHERE author_id IN (
  SELECT id FROM user_profiles WHERE email IN (
    'admin@doraldowntown.com',
    'carlos@bullagastrobar.com',
    'sofia@cityplacedoral.com',
    'miguel@doralspa.com',
    'ana@gmail.com',
    'ricardo@gmail.com',
    'lucia@gmail.com'
  )
);

DELETE FROM businesses WHERE owner_id IN (
  SELECT id FROM user_profiles WHERE email IN (
    'admin@doraldowntown.com',
    'carlos@bullagastrobar.com',
    'sofia@cityplacedoral.com',
    'miguel@doralspa.com',
    'ana@gmail.com',
    'ricardo@gmail.com',
    'lucia@gmail.com'
  )
);

-- Delete user profiles
DELETE FROM user_profiles WHERE email IN (
  'admin@doraldowntown.com',
  'carlos@bullagastrobar.com',
  'sofia@cityplacedoral.com',
  'miguel@doralspa.com',
  'ana@gmail.com',
  'ricardo@gmail.com',
  'lucia@gmail.com'
);

-- Delete auth users (if they exist)
DELETE FROM auth.users WHERE email IN (
  'admin@doraldowntown.com',
  'carlos@bullagastrobar.com',
  'sofia@cityplacedoral.com',
  'miguel@doralspa.com',
  'ana@gmail.com',
  'ricardo@gmail.com',
  'lucia@gmail.com'
);

-- =====================================================
-- STEP 2: Create function to safely insert users
-- =====================================================

CREATE OR REPLACE FUNCTION create_sample_user(
  user_email text,
  user_name text,
  user_role user_role,
  user_phone text DEFAULT NULL,
  user_business_name text DEFAULT NULL,
  user_business_description text DEFAULT NULL,
  user_business_address text DEFAULT NULL,
  user_business_website text DEFAULT NULL,
  user_avatar_url text DEFAULT NULL
)
RETURNS uuid AS $$
DECLARE
  new_user_id uuid;
  profile_id uuid;
BEGIN
  -- Generate a new UUID for the user
  new_user_id := gen_random_uuid();
  
  -- Check if user already exists in auth.users
  IF EXISTS (SELECT 1 FROM auth.users WHERE email = user_email) THEN
    -- Get existing user ID
    SELECT id INTO new_user_id FROM auth.users WHERE email = user_email;
    RAISE NOTICE 'User % already exists in auth.users with ID %', user_email, new_user_id;
  ELSE
    -- Insert into auth.users (simulating the auth signup process)
    INSERT INTO auth.users (
      id,
      email,
      encrypted_password,
      email_confirmed_at,
      created_at,
      updated_at,
      raw_user_meta_data,
      is_super_admin,
      role
    ) VALUES (
      new_user_id,
      user_email,
      crypt('password123', gen_salt('bf')), -- Default password for all sample users
      now(), -- Email confirmed
      now(),
      now(),
      jsonb_build_object(
        'name', user_name,
        'role', user_role::text,
        'phone', user_phone,
        'business_name', user_business_name,
        'business_description', user_business_description,
        'business_address', user_business_address,
        'business_website', user_business_website
      ),
      CASE WHEN user_role = 'admin' THEN true ELSE false END,
      'authenticated'
    );
    RAISE NOTICE 'Created auth.users entry for % with ID %', user_email, new_user_id;
  END IF;
  
  -- Check if profile already exists and get its ID
  SELECT id INTO profile_id FROM user_profiles WHERE user_id = new_user_id OR email = user_email;
  
  IF profile_id IS NOT NULL THEN
    -- Update existing profile
    UPDATE user_profiles SET
      user_id = new_user_id,
      email = user_email,
      name = user_name,
      role = user_role,
      phone = user_phone,
      business_name = user_business_name,
      business_description = user_business_description,
      business_address = user_business_address,
      business_website = user_business_website,
      is_verified = true,
      avatar_url = user_avatar_url,
      updated_at = now()
    WHERE id = profile_id;
    RAISE NOTICE 'Updated existing user_profiles entry for % with profile ID %', user_email, profile_id;
    RETURN profile_id;
  ELSE
    -- Insert new profile and return the profile ID
    INSERT INTO user_profiles (
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
      avatar_url,
      created_at,
      updated_at
    ) VALUES (
      new_user_id,
      user_email,
      user_name,
      user_role,
      user_phone,
      user_business_name,
      user_business_description,
      user_business_address,
      user_business_website,
      true, -- All sample users are verified
      user_avatar_url,
      now(),
      now()
    ) RETURNING id INTO profile_id;
    
    RAISE NOTICE 'Created new user_profiles entry for % with profile ID %', user_email, profile_id;
    RETURN profile_id;
  END IF;
END;
$$ language plpgsql security definer;

-- =====================================================
-- STEP 3: Create sample users and related data
-- =====================================================

DO $$
DECLARE
  admin_profile_id uuid;
  carlos_profile_id uuid;
  sofia_profile_id uuid;
  miguel_profile_id uuid;
  ana_profile_id uuid;
  ricardo_profile_id uuid;
  lucia_profile_id uuid;
BEGIN
  RAISE NOTICE 'Starting sample data creation...';

  -- Create admin user
  admin_profile_id := create_sample_user(
    'admin@doraldowntown.com',
    'Maria Rodriguez',
    'admin',
    '(305) 555-0001',
    NULL,
    NULL,
    NULL,
    NULL,
    'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1'
  );

  -- Create business users
  carlos_profile_id := create_sample_user(
    'carlos@bullagastrobar.com',
    'Carlos Mendez',
    'business',
    '(305) 555-0002',
    'Bulla Gastrobar',
    'Contemporary Spanish cuisine with modern tapas',
    '5335 NW 87th Ave, Doral, FL 33178',
    'https://bullagastrobar.com',
    'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1'
  );

  sofia_profile_id := create_sample_user(
    'sofia@cityplacedoral.com',
    'Sofia Gutierrez',
    'business',
    '(305) 555-0003',
    'CityPlace Doral',
    'Premier shopping destination in Doral',
    '8300 NW 36th St, Doral, FL 33166',
    'https://cityplacedoral.com',
    'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1'
  );

  miguel_profile_id := create_sample_user(
    'miguel@doralspa.com',
    'Miguel Santos',
    'business',
    '(305) 555-0004',
    'Doral Spa & Wellness',
    'Full-service spa and wellness center',
    '8320 NW 36th St, Doral, FL 33166',
    'https://doralspa.com',
    'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1'
  );

  -- Create regular users
  ana_profile_id := create_sample_user(
    'ana@gmail.com',
    'Ana Fernandez',
    'user',
    '(305) 555-0005',
    NULL,
    NULL,
    NULL,
    NULL,
    'https://images.pexels.com/photos/1181424/pexels-photo-1181424.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1'
  );

  ricardo_profile_id := create_sample_user(
    'ricardo@gmail.com',
    'Ricardo Silva',
    'user',
    '(305) 555-0006',
    NULL,
    NULL,
    NULL,
    NULL,
    'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1'
  );

  lucia_profile_id := create_sample_user(
    'lucia@gmail.com',
    'Lucia Martinez',
    'user',
    '(305) 555-0007',
    NULL,
    NULL,
    NULL,
    NULL,
    NULL
  );

  RAISE NOTICE 'All users created successfully. Profile IDs: admin=%, carlos=%, sofia=%, miguel=%', 
    admin_profile_id, carlos_profile_id, sofia_profile_id, miguel_profile_id;

  -- Verify that all profile IDs exist before creating businesses
  IF carlos_profile_id IS NULL OR sofia_profile_id IS NULL OR miguel_profile_id IS NULL THEN
    RAISE EXCEPTION 'One or more business user profiles were not created successfully';
  END IF;

  -- Double-check that the profiles exist in the database
  IF NOT EXISTS (SELECT 1 FROM user_profiles WHERE id = carlos_profile_id) THEN
    RAISE EXCEPTION 'Carlos profile ID % does not exist in user_profiles table', carlos_profile_id;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM user_profiles WHERE id = sofia_profile_id) THEN
    RAISE EXCEPTION 'Sofia profile ID % does not exist in user_profiles table', sofia_profile_id;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM user_profiles WHERE id = miguel_profile_id) THEN
    RAISE EXCEPTION 'Miguel profile ID % does not exist in user_profiles table', miguel_profile_id;
  END IF;

  RAISE NOTICE 'All profile IDs verified. Creating businesses...';

  -- Insert sample businesses using the business user profile IDs
  INSERT INTO businesses (
    owner_id,
    name,
    description,
    category,
    subcategory,
    address,
    phone,
    website,
    hours,
    image_url,
    gallery,
    rating,
    review_count,
    coordinates,
    social_media,
    is_featured,
    is_active
  ) VALUES
  -- Bulla Gastrobar
  (
    carlos_profile_id,
    'Bulla Gastrobar',
    'Contemporary Spanish cuisine with modern tapas and an extensive wine selection in an elegant atmosphere.',
    'dining',
    'restaurants',
    '5335 NW 87th Ave, Doral, FL 33178',
    '(305) 441-0107',
    'https://bullagastrobar.com',
    '11:30 AM - 12:00 AM',
    'https://images.pexels.com/photos/2814828/pexels-photo-2814828.jpeg',
    ARRAY[
      'https://images.pexels.com/photos/2814828/pexels-photo-2814828.jpeg',
      'https://images.pexels.com/photos/1579739/pexels-photo-1579739.jpeg',
      'https://images.pexels.com/photos/941861/pexels-photo-941861.jpeg'
    ],
    4.5,
    342,
    POINT(25.8267, -80.3573),
    '{"facebook": "https://facebook.com/bullagastrobar", "instagram": "https://instagram.com/bullagastrobar"}',
    true,
    true
  ),
  -- CityPlace Doral
  (
    sofia_profile_id,
    'CityPlace Doral',
    'Premier shopping destination featuring luxury brands, dining, and entertainment in the heart of Doral.',
    'shopping',
    'stores',
    '8300 NW 36th St, Doral, FL 33166',
    '(305) 593-6000',
    'https://cityplacedoral.com',
    '10:00 AM - 10:00 PM',
    'https://images.pexels.com/photos/264507/pexels-photo-264507.jpeg',
    ARRAY[
      'https://images.pexels.com/photos/264507/pexels-photo-264507.jpeg',
      'https://images.pexels.com/photos/1005638/pexels-photo-1005638.jpeg',
      'https://images.pexels.com/photos/1884581/pexels-photo-1884581.jpeg'
    ],
    4.3,
    892,
    POINT(25.8078, -80.3420),
    '{"facebook": "https://facebook.com/cityplacedoral", "instagram": "https://instagram.com/cityplacedoral"}',
    true,
    true
  ),
  -- Doral Spa & Wellness
  (
    miguel_profile_id,
    'Doral Spa & Wellness',
    'Full-service spa offering rejuvenating treatments, massages, and wellness services in a tranquil setting.',
    'shopping',
    'beauty',
    '8320 NW 36th St, Doral, FL 33166',
    '(305) 591-7772',
    'https://doralspa.com',
    '9:00 AM - 7:00 PM',
    'https://images.pexels.com/photos/3757942/pexels-photo-3757942.jpeg',
    ARRAY[
      'https://images.pexels.com/photos/3757942/pexels-photo-3757942.jpeg',
      'https://images.pexels.com/photos/3865711/pexels-photo-3865711.jpeg'
    ],
    4.8,
    267,
    POINT(25.8076, -80.3418),
    '{"facebook": "https://facebook.com/doralspa", "instagram": "https://instagram.com/doralspa"}',
    false,
    true
  );

  RAISE NOTICE 'Businesses created successfully. Creating news articles...';

  -- Insert sample news articles
  INSERT INTO news_articles (
    author_id,
    title,
    excerpt,
    content,
    image_url,
    category,
    slug,
    is_published,
    published_at
  ) VALUES
  (
    admin_profile_id,
    'New Luxury Shopping District Opens in Doral',
    'CityPlace Doral expands with new high-end retailers and dining options, bringing world-class shopping to the community.',
    '<p>Doral continues to establish itself as a premier destination for luxury shopping and dining with the grand opening of the newest expansion at CityPlace Doral. This exciting development brings together world-class retailers, innovative dining concepts, and entertainment options that cater to the sophisticated tastes of our growing community.</p><p>The new district features over 50 premium brands, including several flagship stores making their South Florida debut. Visitors can explore everything from high-end fashion boutiques to cutting-edge technology stores, all within a beautifully designed outdoor shopping environment.</p>',
    'https://images.pexels.com/photos/1884581/pexels-photo-1884581.jpeg',
    'Shopping',
    'new-luxury-shopping-district-opens',
    true,
    now() - interval '2 days'
  ),
  (
    admin_profile_id,
    'Doral Cultural Festival Returns This Spring',
    'The annual celebration of arts, music, and culture promises to be bigger than ever with international performers.',
    '<p>The annual Doral Cultural Festival is back with an exciting lineup of international performers and local artists. This year''s festival will feature three days of non-stop entertainment, including live music, dance performances, art exhibitions, and cultural workshops.</p><p>The festival celebrates the rich diversity of our community and showcases the talents of both established and emerging artists from around the world.</p>',
    'https://images.pexels.com/photos/1190297/pexels-photo-1190297.jpeg',
    'Events',
    'doral-cultural-festival-returns',
    true,
    now() - interval '5 days'
  ),
  (
    admin_profile_id,
    'Best New Restaurants to Try in Doral',
    'Discover the latest culinary hotspots that are redefining the dining scene in our vibrant community.',
    '<p>Doral''s culinary scene continues to evolve with exciting new restaurants opening their doors to food enthusiasts. From innovative fusion cuisine to traditional family recipes, these new establishments are adding flavor and diversity to our local dining options.</p><p>Each restaurant brings its own unique atmosphere and culinary philosophy, contributing to Doral''s reputation as a premier dining destination in South Florida.</p>',
    'https://images.pexels.com/photos/2814828/pexels-photo-2814828.jpeg',
    'Dining',
    'best-new-restaurants-doral',
    true,
    now() - interval '7 days'
  );

  RAISE NOTICE 'News articles created successfully. Creating events...';

  -- Insert sample events
  INSERT INTO events (
    organizer_id,
    title,
    description,
    event_date,
    event_time,
    location,
    image_url,
    category,
    price,
    max_attendees,
    current_attendees,
    is_active
  ) VALUES
  (
    carlos_profile_id,
    'Doral Food & Wine Festival',
    'A celebration of culinary excellence featuring local and international chefs, wine tastings, and live entertainment. Join us for an unforgettable evening of gourmet food, premium wines, and exceptional company.',
    current_date + interval '30 days',
    '18:00:00',
    'CityPlace Doral',
    'https://images.pexels.com/photos/1267320/pexels-photo-1267320.jpeg',
    'Food & Drink',
    '$45 - $85',
    500,
    127,
    true
  ),
  (
    admin_profile_id,
    'Family Fun Day at the Park',
    'Join us for a day of family activities, games, food trucks, and live music in beautiful Doral Central Park. Perfect for families with children of all ages.',
    current_date + interval '15 days',
    '10:00:00',
    'Doral Central Park',
    'https://images.pexels.com/photos/1128318/pexels-photo-1128318.jpeg',
    'Family',
    'Free',
    1000,
    234,
    true
  ),
  (
    sofia_profile_id,
    'Art Gallery Opening Night',
    'Discover emerging local artists and enjoy an evening of art, culture, and networking in downtown Doral. Wine and appetizers will be served.',
    current_date + interval '45 days',
    '19:00:00',
    'Doral Cultural Arts Center',
    'https://images.pexels.com/photos/1839919/pexels-photo-1839919.jpeg',
    'Arts & Culture',
    '$15',
    200,
    67,
    true
  );

  RAISE NOTICE '=== SAMPLE DATA INSERTED SUCCESSFULLY ===';
  RAISE NOTICE 'Created sample users with proper auth.users entries:';
  RAISE NOTICE '- Admin: admin@doraldowntown.com (password: password123)';
  RAISE NOTICE '- Business: carlos@bullagastrobar.com (password: password123)';
  RAISE NOTICE '- Business: sofia@cityplacedoral.com (password: password123)';
  RAISE NOTICE '- Business: miguel@doralspa.com (password: password123)';
  RAISE NOTICE '- User: ana@gmail.com (password: password123)';
  RAISE NOTICE '- User: ricardo@gmail.com (password: password123)';
  RAISE NOTICE '- User: lucia@gmail.com (password: password123)';
  RAISE NOTICE 'Created 3 sample businesses with full data';
  RAISE NOTICE 'Created 3 sample news articles';
  RAISE NOTICE 'Created 3 sample events';
  RAISE NOTICE 'All users can login with password: password123';
END $$;

-- =====================================================
-- STEP 4: Clean up and grant permissions
-- =====================================================

-- Clean up the helper function
DROP FUNCTION IF EXISTS create_sample_user(text, text, user_role, text, text, text, text, text, text);

-- Grant necessary permissions for the sample data
GRANT SELECT ON auth.users TO authenticated;
GRANT SELECT ON user_profiles TO authenticated;
GRANT SELECT ON businesses TO authenticated;
GRANT SELECT ON news_articles TO authenticated;
GRANT SELECT ON events TO authenticated;

-- =====================================================
-- FINAL VERIFICATION
-- =====================================================

DO $$
DECLARE
  user_count integer;
  business_count integer;
  article_count integer;
  event_count integer;
BEGIN
  SELECT COUNT(*) INTO user_count FROM user_profiles WHERE email LIKE '%@doraldowntown.com' OR email LIKE '%@bullagastrobar.com' OR email LIKE '%@cityplacedoral.com' OR email LIKE '%@doralspa.com' OR email LIKE '%@gmail.com';
  SELECT COUNT(*) INTO business_count FROM businesses WHERE name IN ('Bulla Gastrobar', 'CityPlace Doral', 'Doral Spa & Wellness');
  SELECT COUNT(*) INTO article_count FROM news_articles WHERE slug LIKE '%doral%' OR slug LIKE '%luxury%';
  SELECT COUNT(*) INTO event_count FROM events WHERE title LIKE '%Doral%' OR title LIKE '%Family%' OR title LIKE '%Art%';
  
  RAISE NOTICE '=== VERIFICATION COMPLETE ===';
  RAISE NOTICE 'Sample users created: %', user_count;
  RAISE NOTICE 'Sample businesses created: %', business_count;
  RAISE NOTICE 'Sample articles created: %', article_count;
  RAISE NOTICE 'Sample events created: %', event_count;
  
  IF user_count >= 7 AND business_count >= 3 AND article_count >= 3 AND event_count >= 3 THEN
    RAISE NOTICE 'SUCCESS: All sample data created successfully!';
  ELSE
    RAISE WARNING 'WARNING: Some sample data may be missing!';
  END IF;
END $$;