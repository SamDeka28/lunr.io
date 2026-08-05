-- Full campaign ops: creators, spend, conversions, default destination

ALTER TABLE campaigns
  ADD COLUMN IF NOT EXISTS default_destination_url TEXT;

-- Creators / influencers on a campaign
CREATE TABLE IF NOT EXISTS campaign_creators (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name VARCHAR(255) NOT NULL,
  handle VARCHAR(255),
  platform VARCHAR(50) NOT NULL DEFAULT 'other',
  profile_url TEXT,
  status VARCHAR(50) NOT NULL DEFAULT 'invited',
  fee_amount DECIMAL(12, 2),
  fee_currency VARCHAR(10) NOT NULL DEFAULT 'USD',
  deliverable_notes TEXT,
  due_at TIMESTAMP WITH TIME ZONE,
  posted_at TIMESTAMP WITH TIME ZONE,
  link_id UUID REFERENCES links(id) ON DELETE SET NULL,
  utm_source VARCHAR(255),
  utm_content VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  CONSTRAINT campaign_creators_platform_check CHECK (
    platform IN ('instagram', 'tiktok', 'youtube', 'twitter', 'linkedin', 'other')
  ),
  CONSTRAINT campaign_creators_status_check CHECK (
    status IN ('invited', 'accepted', 'content_submitted', 'posted', 'paid', 'dropped')
  )
);

CREATE INDEX IF NOT EXISTS idx_campaign_creators_campaign_id ON campaign_creators(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_creators_user_id ON campaign_creators(user_id);
CREATE INDEX IF NOT EXISTS idx_campaign_creators_link_id ON campaign_creators(link_id);

ALTER TABLE campaign_creators ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own campaign creators"
  ON campaign_creators FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own campaign creators"
  ON campaign_creators FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own campaign creators"
  ON campaign_creators FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users delete own campaign creators"
  ON campaign_creators FOR DELETE
  USING (auth.uid() = user_id);

-- Manual spend / fees
CREATE TABLE IF NOT EXISTS campaign_spend_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  campaign_creator_id UUID REFERENCES campaign_creators(id) ON DELETE SET NULL,
  amount DECIMAL(12, 2) NOT NULL,
  currency VARCHAR(10) NOT NULL DEFAULT 'USD',
  spent_on DATE NOT NULL DEFAULT CURRENT_DATE,
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_campaign_spend_campaign_id ON campaign_spend_entries(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_spend_user_id ON campaign_spend_entries(user_id);

ALTER TABLE campaign_spend_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own campaign spend"
  ON campaign_spend_entries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own campaign spend"
  ON campaign_spend_entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own campaign spend"
  ON campaign_spend_entries FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users delete own campaign spend"
  ON campaign_spend_entries FOR DELETE
  USING (auth.uid() = user_id);

-- Conversion / goal events
CREATE TABLE IF NOT EXISTS conversion_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,
  link_id UUID REFERENCES links(id) ON DELETE SET NULL,
  campaign_creator_id UUID REFERENCES campaign_creators(id) ON DELETE SET NULL,
  short_code VARCHAR(20),
  event_name VARCHAR(100) NOT NULL DEFAULT 'conversion',
  value DECIMAL(12, 2),
  currency VARCHAR(10),
  metadata JSONB DEFAULT '{}'::jsonb,
  occurred_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  idempotency_key VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_conversion_events_idempotency
  ON conversion_events(user_id, idempotency_key)
  WHERE idempotency_key IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_conversion_events_campaign_id ON conversion_events(campaign_id);
CREATE INDEX IF NOT EXISTS idx_conversion_events_link_id ON conversion_events(link_id);
CREATE INDEX IF NOT EXISTS idx_conversion_events_user_id ON conversion_events(user_id);
CREATE INDEX IF NOT EXISTS idx_conversion_events_occurred_at ON conversion_events(occurred_at);

ALTER TABLE conversion_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own conversions"
  ON conversion_events FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own conversions"
  ON conversion_events FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Service role / API inserts also need a permissive insert for authenticated;
-- track endpoint uses service role.
