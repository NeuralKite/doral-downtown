-- Create categories and tags for news articles
CREATE TABLE IF NOT EXISTS news_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS news_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS news_article_tags (
  article_id uuid REFERENCES news_articles(id) ON DELETE CASCADE,
  tag_id uuid REFERENCES news_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (article_id, tag_id)
);

ALTER TABLE news_articles ADD COLUMN IF NOT EXISTS category_id uuid REFERENCES news_categories(id);
ALTER TABLE news_articles ADD COLUMN IF NOT EXISTS tags text[];

CREATE INDEX IF NOT EXISTS idx_news_articles_category_id ON news_articles(category_id);

-- Enable RLS
ALTER TABLE news_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_article_tags ENABLE ROW LEVEL SECURITY;

-- Policies for categories
CREATE POLICY "Public read categories" ON news_categories FOR SELECT USING (true);
CREATE POLICY "Admins manage categories" ON news_categories FOR ALL TO authenticated USING (
  EXISTS (
    SELECT 1 FROM user_profiles WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Policies for tags
CREATE POLICY "Public read tags" ON news_tags FOR SELECT USING (true);
CREATE POLICY "Admins manage tags" ON news_tags FOR ALL TO authenticated USING (
  EXISTS (
    SELECT 1 FROM user_profiles WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Policies for article tags
CREATE POLICY "Public read article tags" ON news_article_tags FOR SELECT USING (true);
CREATE POLICY "Authors manage article tags" ON news_article_tags FOR ALL TO authenticated USING (
  EXISTS (
    SELECT 1 FROM news_articles a
    JOIN user_profiles u ON a.author_id = u.id
    WHERE a.id = news_article_tags.article_id AND (u.user_id = auth.uid() OR u.role = 'admin')
  )
);
