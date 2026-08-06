-- Lead capture gate on short links (email before redirect)
ALTER TABLE links
  ADD COLUMN IF NOT EXISTS lead_capture_enabled BOOLEAN DEFAULT false NOT NULL,
  ADD COLUMN IF NOT EXISTS lead_capture_heading TEXT,
  ADD COLUMN IF NOT EXISTS lead_capture_button_text TEXT;

CREATE TABLE IF NOT EXISTS link_email_captures (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  link_id UUID NOT NULL REFERENCES links(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_link_email_captures_link_email
  ON link_email_captures (link_id, lower(email));

CREATE INDEX IF NOT EXISTS idx_link_email_captures_link_id
  ON link_email_captures (link_id);

CREATE INDEX IF NOT EXISTS idx_link_email_captures_created_at
  ON link_email_captures (created_at DESC);

ALTER TABLE link_email_captures ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own link email captures" ON link_email_captures;
CREATE POLICY "Users can view own link email captures"
  ON link_email_captures FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM links
      WHERE links.id = link_email_captures.link_id
        AND links.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Anyone can insert captures for active lead-gated links" ON link_email_captures;
CREATE POLICY "Anyone can insert captures for active lead-gated links"
  ON link_email_captures FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM links
      WHERE links.id = link_email_captures.link_id
        AND links.is_active = true
        AND links.lead_capture_enabled = true
    )
  );

UPDATE plans
SET features = COALESCE(features, '{}'::jsonb) || jsonb_build_object('lead_capture', true)
WHERE name IN ('pro', 'business', 'enterprise');

UPDATE plans
SET features = COALESCE(features, '{}'::jsonb) || jsonb_build_object('lead_capture', false)
WHERE name = 'free';
