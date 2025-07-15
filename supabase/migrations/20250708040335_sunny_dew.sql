/*
  # Create user profiles and related tables

  1. New Tables
    - `user_profiles`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `email` (text, unique)
      - `name` (text)
      - `role` (enum: user, business, admin)
      - `avatar_url` (text, optional)
      - `phone` (text, optional)
      - `business_name` (text, optional for business users)
      - `business_description` (text, optional)
      - `business_address` (text, optional)
      - `business_website` (text, optional)
      - `is_verified` (boolean, default false)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `businesses`
      - `id` (uuid, primary key)
      - `owner_id` (uuid, references user_profiles)
      - `name` (text)
      - `description` (text)
      - `category` (text)
      - `subcategory` (text)
      - `address` (text)
      - `phone` (text, optional)
      - `website` (text, optional)
      - `hours` (text, optional)
      - `image_url` (text, optional)
      - `gallery` (text array, optional)
      - `rating` (decimal, optional)
      - `review_count` (integer, default 0)
      - `coordinates` (point, optional)
      - `social_media` (jsonb, optional)
      - `is_featured` (boolean, default false)
      - `is_active` (boolean, default true)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `news_articles`
      - `id` (uuid, primary key)
      - `author_id` (uuid, references user_profiles)
      - `title` (text)
      - `excerpt` (text)
      - `content` (text)
      - `image_url` (text, optional)
      - `category` (text)
      - `slug` (text, unique)
      - `is_published` (boolean, default false)
      - `published_at` (timestamp, optional)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `events`
      - `id` (uuid, primary key)
      - `organizer_id` (uuid, references user_profiles)
      - `title` (text)
      - `description` (text)
      - `event_date` (date)
      - `event_time` (time)
      - `location` (text)
      - `image_url` (text, optional)
      - `category` (text)
      - `price` (text, optional)
      - `max_attendees` (integer, optional)
      - `current_attendees` (integer, default 0)
      - `is_active` (boolean, default true)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Add policies for admins to manage all data
    - Add policies for public read access where appropriate

  3. Functions
    - Trigger to automatically create user profile on auth signup
    - Function to update updated_at timestamps
*/

-- Create custom types
CREATE TYPE user_role AS ENUM ('user', 'business', 'admin');

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  role user_role NOT NULL DEFAULT 'user',
  avatar_url text,
  phone text,
  business_name text,
  business_description text,
  business_address text,
  business_website text,
  is_verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create businesses table
CREATE TABLE IF NOT EXISTS businesses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text NOT NULL,
  category text NOT NULL,
  subcategory text NOT NULL,
  address text NOT NULL,
  phone text,
  website text,
  hours text,
  image_url text,
  gallery text[],
  rating decimal(3,2),
  review_count integer DEFAULT 0,
  coordinates point,
  social_media jsonb,
  is_featured boolean DEFAULT false,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create news_articles table
CREATE TABLE IF NOT EXISTS news_articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  excerpt text NOT NULL,
  content text NOT NULL,
  image_url text,
  category text NOT NULL,
  slug text UNIQUE NOT NULL,
  is_published boolean DEFAULT false,
  published_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create events table
CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organizer_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  event_date date NOT NULL,
  event_time time NOT NULL,
  location text NOT NULL,
  image_url text,
  category text NOT NULL,
  price text,
  max_attendees integer,
  current_attendees integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_businesses_updated_at BEFORE UPDATE ON businesses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_news_articles_updated_at BEFORE UPDATE ON news_articles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id, email, name, role)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'name', new.email),
    COALESCE((new.raw_user_meta_data->>'role')::user_role, 'user'::user_role)
  );
  RETURN new;
END;
$$ language plpgsql security definer;

-- Trigger to create profile on signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Policies for user_profiles
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

CREATE POLICY "Admins can read all profiles"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update all profiles"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Policies for businesses
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

-- Policies for news_articles
CREATE POLICY "Anyone can read published articles"
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

-- Policies for events
CREATE POLICY "Anyone can read active events"
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_businesses_owner_id ON businesses(owner_id);
CREATE INDEX IF NOT EXISTS idx_businesses_category ON businesses(category);
CREATE INDEX IF NOT EXISTS idx_businesses_subcategory ON businesses(subcategory);
CREATE INDEX IF NOT EXISTS idx_businesses_is_active ON businesses(is_active);
CREATE INDEX IF NOT EXISTS idx_news_articles_author_id ON news_articles(author_id);
CREATE INDEX IF NOT EXISTS idx_news_articles_is_published ON news_articles(is_published);
CREATE INDEX IF NOT EXISTS idx_news_articles_slug ON news_articles(slug);
CREATE INDEX IF NOT EXISTS idx_events_organizer_id ON events(organizer_id);
CREATE INDEX IF NOT EXISTS idx_events_event_date ON events(event_date);
CREATE INDEX IF NOT EXISTS idx_events_is_active ON events(is_active);