-- Phase 2: Page analytics + email capture

-- Per-event page analytics (views + link clicks)
CREATE TABLE IF NOT EXISTS page_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  page_id UUID NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
  link_id TEXT, -- nullable; page link id (may be custom-*, not always a links.id UUID)
  event_type VARCHAR(20) NOT NULL CHECK (event_type IN ('view', 'click')),
  referrer TEXT,
  country VARCHAR(2),
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_page_analytics_page_id ON page_analytics(page_id);
CREATE INDEX IF NOT EXISTS idx_page_analytics_created_at ON page_analytics(created_at);
CREATE INDEX IF NOT EXISTS idx_page_analytics_event_type ON page_analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_page_analytics_link_id ON page_analytics(link_id);

-- Email captures from page email_capture blocks
CREATE TABLE IF NOT EXISTS page_email_captures (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  page_id UUID NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  block_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_page_email_captures_page_id ON page_email_captures(page_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_page_email_captures_unique
  ON page_email_captures(page_id, lower(email));

-- RLS
ALTER TABLE page_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_email_captures ENABLE ROW LEVEL SECURITY;

-- Owners can read their page analytics
DROP POLICY IF EXISTS "Users read own page analytics" ON page_analytics;
CREATE POLICY "Users read own page analytics"
  ON page_analytics FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM pages
      WHERE pages.id = page_analytics.page_id
        AND pages.user_id = auth.uid()
    )
  );

-- Anyone can insert analytics for active public pages (view/click tracking)
DROP POLICY IF EXISTS "Insert page analytics for public pages" ON page_analytics;
CREATE POLICY "Insert page analytics for public pages"
  ON page_analytics FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM pages
      WHERE pages.id = page_analytics.page_id
        AND pages.is_active = true
        AND pages.is_public = true
    )
  );

-- Owners can read email captures
DROP POLICY IF EXISTS "Users read own page email captures" ON page_email_captures;
CREATE POLICY "Users read own page email captures"
  ON page_email_captures FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM pages
      WHERE pages.id = page_email_captures.page_id
        AND pages.user_id = auth.uid()
    )
  );

-- Public can insert email captures on active public pages
DROP POLICY IF EXISTS "Insert email captures for public pages" ON page_email_captures;
CREATE POLICY "Insert email captures for public pages"
  ON page_email_captures FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM pages
      WHERE pages.id = page_email_captures.page_id
        AND pages.is_active = true
        AND pages.is_public = true
    )
  );
