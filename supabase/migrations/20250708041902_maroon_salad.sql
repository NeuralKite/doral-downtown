/*
  # Fix RLS policies and enable proper security

  1. Security
    - Enable RLS on all tables
    - Create proper policies for each table
    - Allow public read access for published content
    - Restrict write access based on user roles

  2. Fixes
    - Remove conflicting policies
    - Add proper INSERT policies
    - Ensure all tables have correct RLS setup
*/

-- Asegurar que RLS esté habilitado en todas las tablas
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Eliminar todas las políticas existentes para evitar conflictos
DROP POLICY IF EXISTS "Allow profile creation during signup" ON user_profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Admins can read all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can insert user profiles" ON user_profiles;

DROP POLICY IF EXISTS "Anyone can read active businesses" ON businesses;
DROP POLICY IF EXISTS "Business owners can manage their businesses" ON businesses;
DROP POLICY IF EXISTS "Admins can manage all businesses" ON businesses;
DROP POLICY IF EXISTS "Business users can create businesses" ON businesses;
DROP POLICY IF EXISTS "Admins can insert any business" ON businesses;
DROP POLICY IF EXISTS "Public can read active businesses" ON businesses;

DROP POLICY IF EXISTS "Anyone can read published articles" ON news_articles;
DROP POLICY IF EXISTS "Authors can manage their articles" ON news_articles;
DROP POLICY IF EXISTS "Admins can manage all articles" ON news_articles;
DROP POLICY IF EXISTS "Admins can create articles" ON news_articles;
DROP POLICY IF EXISTS "Authenticated users can read published articles" ON news_articles;
DROP POLICY IF EXISTS "Public can read published articles" ON news_articles;

DROP POLICY IF EXISTS "Anyone can read active events" ON events;
DROP POLICY IF EXISTS "Organizers can manage their events" ON events;
DROP POLICY IF EXISTS "Admins can manage all events" ON events;
DROP POLICY IF EXISTS "Business users and admins can create events" ON events;
DROP POLICY IF EXISTS "Authenticated users can read active events" ON events;
DROP POLICY IF EXISTS "Admins can insert any event" ON events;
DROP POLICY IF EXISTS "Public can read active events" ON events;

-- Políticas para user_profiles
CREATE POLICY "Users can read own profile"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Allow profile creation during signup"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can read all profiles"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles user_profiles_1
      WHERE user_profiles_1.user_id = auth.uid() AND user_profiles_1.role = 'admin'
    )
  );

CREATE POLICY "Admins can update all profiles"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles user_profiles_1
      WHERE user_profiles_1.user_id = auth.uid() AND user_profiles_1.role = 'admin'
    )
  );

CREATE POLICY "Admins can insert user profiles"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles user_profiles_1
      WHERE user_profiles_1.user_id = auth.uid() AND user_profiles_1.role = 'admin'
    )
  );

-- Políticas para businesses
CREATE POLICY "Public can read active businesses"
  ON businesses
  FOR SELECT
  TO anon
  USING (is_active = true);

CREATE POLICY "Anyone can read active businesses"
  ON businesses
  FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Business owners can manage their businesses"
  ON businesses
  FOR ALL
  TO authenticated
  USING (
    owner_id IN (
      SELECT id FROM user_profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Business users can create businesses"
  ON businesses
  FOR INSERT
  TO authenticated
  WITH CHECK (
    owner_id IN (
      SELECT id FROM user_profiles 
      WHERE user_id = auth.uid() AND role = 'business'
    )
  );

CREATE POLICY "Admins can manage all businesses"
  ON businesses
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can insert any business"
  ON businesses
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Políticas para news_articles
CREATE POLICY "Public can read published articles"
  ON news_articles
  FOR SELECT
  TO anon
  USING (is_published = true);

CREATE POLICY "Authenticated users can read published articles"
  ON news_articles
  FOR SELECT
  TO authenticated
  USING (is_published = true);

CREATE POLICY "Authors can manage their articles"
  ON news_articles
  FOR ALL
  TO authenticated
  USING (
    author_id IN (
      SELECT id FROM user_profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all articles"
  ON news_articles
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can create articles"
  ON news_articles
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Políticas para events
CREATE POLICY "Public can read active events"
  ON events
  FOR SELECT
  TO anon
  USING (is_active = true);

CREATE POLICY "Authenticated users can read active events"
  ON events
  FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Organizers can manage their events"
  ON events
  FOR ALL
  TO authenticated
  USING (
    organizer_id IN (
      SELECT id FROM user_profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Business users and admins can create events"
  ON events
  FOR INSERT
  TO authenticated
  WITH CHECK (
    organizer_id IN (
      SELECT id FROM user_profiles 
      WHERE user_id = auth.uid() AND role IN ('business', 'admin')
    )
  );

CREATE POLICY "Admins can manage all events"
  ON events
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can insert any event"
  ON events
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );