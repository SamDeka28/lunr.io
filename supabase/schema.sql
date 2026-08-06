-- Supabase Database Schema for Lunr

-- Create plans table
CREATE TABLE IF NOT EXISTS plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  display_name VARCHAR(100) NOT NULL,
  description TEXT,
  price_monthly DECIMAL(10, 2) DEFAULT 0,
  price_yearly DECIMAL(10, 2) DEFAULT 0,
  max_links INTEGER DEFAULT 0,
  max_qr_codes INTEGER DEFAULT 0,
  max_pages INTEGER DEFAULT 0,
  features JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create profiles table (extends auth.users)
-- Note: auth.users is the base user table managed by Supabase Auth
-- This profiles table extends it with additional user data
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255),
  full_name VARCHAR(255),
  avatar_url TEXT,
  company_name VARCHAR(255),
  -- Current plan subscription (active plan)
  plan_id UUID REFERENCES plans(id),
  plan_started_at TIMESTAMP WITH TIME ZONE,
  plan_expires_at TIMESTAMP WITH TIME ZONE,
  -- Stripe integration fields
  stripe_customer_id VARCHAR(255),
  stripe_subscription_id VARCHAR(255),
  -- Usage tracking (automatically updated by triggers)
  usage_links INTEGER DEFAULT 0 NOT NULL,
  usage_qr_codes INTEGER DEFAULT 0 NOT NULL,
  usage_pages INTEGER DEFAULT 0 NOT NULL,
  usage_reset_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '1 month'),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create subscriptions table for detailed subscription history
-- This tracks all subscription changes and history
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES plans(id),
  status VARCHAR(50) NOT NULL DEFAULT 'active', -- active, cancelled, expired, trial
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  stripe_subscription_id VARCHAR(255),
  stripe_price_id VARCHAR(255),
  billing_cycle VARCHAR(20), -- monthly, yearly
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create campaigns table
CREATE TABLE IF NOT EXISTS campaigns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  campaign_type VARCHAR(50), -- e.g., 'product_launch', 'seasonal_promo', 'email_marketing'
  tags TEXT[], -- Array of tags
  target_clicks INTEGER DEFAULT 0,
  budget DECIMAL(10, 2) DEFAULT 0,
  currency VARCHAR(10) NOT NULL DEFAULT 'USD',
  utm_defaults JSONB DEFAULT '{}'::jsonb,
  default_destination_url TEXT,
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create links table
CREATE TABLE IF NOT EXISTS links (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  short_code VARCHAR(20) UNIQUE NOT NULL,
  original_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT true NOT NULL,
  click_count INTEGER DEFAULT 0 NOT NULL,
  password_hash TEXT,
  lead_capture_enabled BOOLEAN DEFAULT false NOT NULL,
  lead_capture_config JSONB DEFAULT '{}'::jsonb NOT NULL,
  title TEXT,
  description TEXT,
  og_image_url TEXT,
  utm_parameters JSONB DEFAULT '{}'::jsonb,
  CONSTRAINT short_code_length CHECK (char_length(short_code) >= 2 AND char_length(short_code) <= 20)
);

-- Create qr_codes table
CREATE TABLE IF NOT EXISTS qr_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  link_id UUID REFERENCES links(id) ON DELETE SET NULL,
  title VARCHAR(255),
  description TEXT,
  qr_data TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  is_active BOOLEAN DEFAULT true NOT NULL
);

-- Create pages table
CREATE TABLE IF NOT EXISTS pages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  content JSONB DEFAULT '{}'::jsonb,
  -- Design settings
  background_color VARCHAR(7) DEFAULT '#FFFFFF',
  text_color VARCHAR(7) DEFAULT '#000000',
  button_color VARCHAR(7) DEFAULT '#3B82F6',
  button_text_color VARCHAR(7) DEFAULT '#FFFFFF',
  -- Links on the page
  links JSONB DEFAULT '[]'::jsonb,
  -- Social links
  social_links JSONB DEFAULT '{}'::jsonb,
  -- Analytics
  view_count INTEGER DEFAULT 0 NOT NULL,
  click_count INTEGER DEFAULT 0 NOT NULL,
  -- Metadata
  is_active BOOLEAN DEFAULT true NOT NULL,
  is_public BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  CONSTRAINT slug_length CHECK (char_length(slug) >= 2 AND char_length(slug) <= 100),
  CONSTRAINT slug_format CHECK (slug ~ '^[a-z0-9-]+$')
);

-- Create analytics table
CREATE TABLE IF NOT EXISTS analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  link_id UUID NOT NULL REFERENCES links(id) ON DELETE CASCADE,
  clicked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  ip_address INET,
  user_agent TEXT,
  referrer TEXT,
  country VARCHAR(2),
  device_type VARCHAR(50),
  browser VARCHAR(100),
  os VARCHAR(100),
  is_bot BOOLEAN DEFAULT false NOT NULL,
  utm_source VARCHAR(255),
  utm_medium VARCHAR(255),
  utm_campaign VARCHAR(255),
  utm_term VARCHAR(255),
  utm_content VARCHAR(255),
  CONSTRAINT link_id_fk FOREIGN KEY (link_id) REFERENCES links(id) ON DELETE CASCADE
);

-- Page analytics (views + per-link clicks)
CREATE TABLE IF NOT EXISTS page_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  page_id UUID NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
  link_id TEXT,
  event_type VARCHAR(20) NOT NULL CHECK (event_type IN ('view', 'click')),
  referrer TEXT,
  country VARCHAR(2),
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Email captures from page email_capture blocks
CREATE TABLE IF NOT EXISTS page_email_captures (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  page_id UUID NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  block_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Email captures from link lead-capture gate
CREATE TABLE IF NOT EXISTS link_email_captures (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  link_id UUID NOT NULL REFERENCES links(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  name TEXT,
  responses JSONB DEFAULT '{}'::jsonb NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_campaigns_user_id ON campaigns(user_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_created_at ON campaigns(created_at);
CREATE INDEX IF NOT EXISTS idx_links_short_code ON links(short_code);
CREATE INDEX IF NOT EXISTS idx_links_user_id ON links(user_id);
CREATE INDEX IF NOT EXISTS idx_links_campaign_id ON links(campaign_id);
CREATE INDEX IF NOT EXISTS idx_links_created_at ON links(created_at);
CREATE INDEX IF NOT EXISTS idx_qr_codes_user_id ON qr_codes(user_id);
CREATE INDEX IF NOT EXISTS idx_qr_codes_link_id ON qr_codes(link_id);
CREATE INDEX IF NOT EXISTS idx_pages_user_id ON pages(user_id);
CREATE INDEX IF NOT EXISTS idx_pages_slug ON pages(slug);
CREATE INDEX IF NOT EXISTS idx_pages_created_at ON pages(created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_link_id ON analytics(link_id);
CREATE INDEX IF NOT EXISTS idx_analytics_clicked_at ON analytics(clicked_at);
CREATE INDEX IF NOT EXISTS idx_analytics_is_bot ON analytics(is_bot);
CREATE INDEX IF NOT EXISTS idx_analytics_device_type ON analytics(device_type);
CREATE INDEX IF NOT EXISTS idx_analytics_browser ON analytics(browser);
CREATE INDEX IF NOT EXISTS idx_analytics_os ON analytics(os);
CREATE INDEX IF NOT EXISTS idx_analytics_link_clicked_at ON analytics(link_id, clicked_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_utm_source ON analytics(utm_source);
CREATE INDEX IF NOT EXISTS idx_analytics_utm_medium ON analytics(utm_medium);
CREATE INDEX IF NOT EXISTS idx_analytics_utm_campaign ON analytics(utm_campaign);
CREATE INDEX IF NOT EXISTS idx_page_analytics_page_id ON page_analytics(page_id);
CREATE INDEX IF NOT EXISTS idx_page_analytics_created_at ON page_analytics(created_at);
CREATE INDEX IF NOT EXISTS idx_page_analytics_event_type ON page_analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_page_email_captures_page_id ON page_email_captures(page_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_page_email_captures_unique ON page_email_captures(page_id, lower(email));
CREATE INDEX IF NOT EXISTS idx_link_email_captures_link_id ON link_email_captures(link_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_link_email_captures_unique ON link_email_captures(link_id, lower(email));
CREATE INDEX IF NOT EXISTS idx_link_email_captures_created_at ON link_email_captures(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_plan_id ON profiles(plan_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_plan_id ON subscriptions(plan_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);

-- Create function to increment click count
CREATE OR REPLACE FUNCTION increment_click_count(link_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE links
  SET click_count = click_count + 1
  WHERE id = link_id;
END;
$$ LANGUAGE plpgsql;

-- Aggregated link analytics stats RPC
-- Unique clicks = distinct IP within a 24h calendar-day window (UTC) per link.
-- Bot rows are excluded. p_days < 0 means unlimited retention.
CREATE OR REPLACE FUNCTION get_link_analytics_stats(
  p_link_id uuid,
  p_days int DEFAULT 30
)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  v_since timestamptz;
  v_result jsonb;
BEGIN
  IF p_days IS NULL OR p_days < 0 THEN
    v_since := NULL;
  ELSE
    v_since := NOW() - make_interval(days => p_days);
  END IF;

  WITH filtered AS (
    SELECT *
    FROM analytics
    WHERE link_id = p_link_id
      AND COALESCE(is_bot, false) = false
      AND (v_since IS NULL OR clicked_at >= v_since)
  ),
  totals AS (
    SELECT
      COUNT(*)::int AS total_clicks,
      COUNT(
        DISTINCT (
          host(ip_address)::text || '|' ||
          ((clicked_at AT TIME ZONE 'UTC')::date)::text
        )
      ) FILTER (WHERE ip_address IS NOT NULL)::int AS unique_clicks
    FROM filtered
  ),
  by_day AS (
    SELECT COALESCE(
      jsonb_agg(
        jsonb_build_object('date', day, 'count', cnt)
        ORDER BY day
      ),
      '[]'::jsonb
    ) AS data
    FROM (
      SELECT
        ((clicked_at AT TIME ZONE 'UTC')::date)::text AS day,
        COUNT(*)::int AS cnt
      FROM filtered
      GROUP BY 1
    ) s
  ),
  by_country AS (
    SELECT COALESCE(
      jsonb_agg(
        jsonb_build_object('country', country, 'count', cnt)
        ORDER BY cnt DESC
      ),
      '[]'::jsonb
    ) AS data
    FROM (
      SELECT country, COUNT(*)::int AS cnt
      FROM filtered
      WHERE country IS NOT NULL
      GROUP BY country
      ORDER BY cnt DESC
      LIMIT 50
    ) s
  ),
  by_referrer AS (
    SELECT COALESCE(
      jsonb_agg(
        jsonb_build_object('referrer', referrer, 'count', cnt)
        ORDER BY cnt DESC
      ),
      '[]'::jsonb
    ) AS data
    FROM (
      SELECT COALESCE(NULLIF(referrer, ''), 'Direct') AS referrer, COUNT(*)::int AS cnt
      FROM filtered
      GROUP BY 1
      ORDER BY cnt DESC
      LIMIT 50
    ) s
  ),
  by_device AS (
    SELECT COALESCE(
      jsonb_agg(
        jsonb_build_object('device', device, 'count', cnt)
        ORDER BY cnt DESC
      ),
      '[]'::jsonb
    ) AS data
    FROM (
      SELECT COALESCE(device_type, 'unknown') AS device, COUNT(*)::int AS cnt
      FROM filtered
      GROUP BY 1
      ORDER BY cnt DESC
      LIMIT 20
    ) s
  ),
  by_browser AS (
    SELECT COALESCE(
      jsonb_agg(
        jsonb_build_object('browser', browser, 'count', cnt)
        ORDER BY cnt DESC
      ),
      '[]'::jsonb
    ) AS data
    FROM (
      SELECT COALESCE(browser, 'unknown') AS browser, COUNT(*)::int AS cnt
      FROM filtered
      GROUP BY 1
      ORDER BY cnt DESC
      LIMIT 20
    ) s
  ),
  by_os AS (
    SELECT COALESCE(
      jsonb_agg(
        jsonb_build_object('os', os, 'count', cnt)
        ORDER BY cnt DESC
      ),
      '[]'::jsonb
    ) AS data
    FROM (
      SELECT COALESCE(os, 'unknown') AS os, COUNT(*)::int AS cnt
      FROM filtered
      GROUP BY 1
      ORDER BY cnt DESC
      LIMIT 20
    ) s
  )
  SELECT jsonb_build_object(
    'total_clicks', (SELECT total_clicks FROM totals),
    'unique_clicks', (SELECT unique_clicks FROM totals),
    'clicks_by_day', (SELECT data FROM by_day),
    'clicks_by_country', (SELECT data FROM by_country),
    'clicks_by_referrer', (SELECT data FROM by_referrer),
    'clicks_by_device', (SELECT data FROM by_device),
    'clicks_by_browser', (SELECT data FROM by_browser),
    'clicks_by_os', (SELECT data FROM by_os)
  )
  INTO v_result;

  RETURN COALESCE(v_result, '{}'::jsonb);
END;
$$;

-- Create function to update usage when link is created
CREATE OR REPLACE FUNCTION update_link_usage()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.user_id IS NOT NULL THEN
    UPDATE profiles
    SET usage_links = usage_links + 1,
        updated_at = NOW()
    WHERE id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create function to update usage when link is deleted
CREATE OR REPLACE FUNCTION update_link_usage_on_delete()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.user_id IS NOT NULL AND OLD.is_active = true THEN
    UPDATE profiles
    SET usage_links = GREATEST(0, usage_links - 1),
        updated_at = NOW()
    WHERE id = OLD.user_id;
  END IF;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Create function to update QR code usage
CREATE OR REPLACE FUNCTION update_qr_usage()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.user_id IS NOT NULL THEN
    UPDATE profiles
    SET usage_qr_codes = usage_qr_codes + 1,
        updated_at = NOW()
    WHERE id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create function to update QR code usage on delete
CREATE OR REPLACE FUNCTION update_qr_usage_on_delete()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.user_id IS NOT NULL AND OLD.is_active = true THEN
    UPDATE profiles
    SET usage_qr_codes = GREATEST(0, usage_qr_codes - 1),
        updated_at = NOW()
    WHERE id = OLD.user_id;
  END IF;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Create function to update page usage
CREATE OR REPLACE FUNCTION update_page_usage()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.user_id IS NOT NULL THEN
    UPDATE profiles
    SET usage_pages = usage_pages + 1,
        updated_at = NOW()
    WHERE id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create function to update page usage on delete
CREATE OR REPLACE FUNCTION update_page_usage_on_delete()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.user_id IS NOT NULL AND OLD.is_active = true THEN
    UPDATE profiles
    SET usage_pages = GREATEST(0, usage_pages - 1),
        updated_at = NOW()
    WHERE id = OLD.user_id;
  END IF;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for usage tracking
CREATE TRIGGER trigger_update_link_usage
  AFTER INSERT ON links
  FOR EACH ROW
  EXECUTE FUNCTION update_link_usage();

CREATE TRIGGER trigger_update_link_usage_on_delete
  AFTER UPDATE ON links
  FOR EACH ROW
  WHEN (OLD.is_active = true AND NEW.is_active = false)
  EXECUTE FUNCTION update_link_usage_on_delete();

CREATE TRIGGER trigger_update_qr_usage
  AFTER INSERT ON qr_codes
  FOR EACH ROW
  EXECUTE FUNCTION update_qr_usage();

CREATE TRIGGER trigger_update_qr_usage_on_delete
  AFTER UPDATE ON qr_codes
  FOR EACH ROW
  WHEN (OLD.is_active = true AND NEW.is_active = false)
  EXECUTE FUNCTION update_qr_usage_on_delete();

CREATE TRIGGER trigger_update_page_usage
  AFTER INSERT ON pages
  FOR EACH ROW
  EXECUTE FUNCTION update_page_usage();

CREATE TRIGGER trigger_update_page_usage_on_delete
  AFTER UPDATE ON pages
  FOR EACH ROW
  WHEN (OLD.is_active = true AND NEW.is_active = false)
  EXECUTE FUNCTION update_page_usage_on_delete();

-- Create function to sync profile on user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  free_plan_id UUID;
BEGIN
  -- Get the free plan ID
  SELECT id INTO free_plan_id FROM plans WHERE name = 'free' LIMIT 1;
  
  -- Create profile with free plan
  INSERT INTO profiles (id, email, plan_id, plan_started_at)
  VALUES (
    NEW.id,
    NEW.email,
    free_plan_id,
    NOW()
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user profile creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Enable Row Level Security (RLS)
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE links ENABLE ROW LEVEL SECURITY;
ALTER TABLE qr_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE link_email_captures ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for plans (public read)
CREATE POLICY "Allow public read access to active plans"
  ON plans FOR SELECT
  USING (is_active = true);

-- RLS Policies for profiles
CREATE POLICY "Allow users to read their own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Allow users to insert their own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Allow users to update their own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- RLS Policies for subscriptions
CREATE POLICY "Allow users to read their own subscriptions"
  ON subscriptions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Note: Service role operations bypass RLS, so no policy needed for service role
-- Subscriptions are typically managed via API routes using service role client

-- RLS Policies for campaigns
CREATE POLICY "Allow users to read their own campaigns"
  ON campaigns FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Allow users to insert their own campaigns"
  ON campaigns FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow users to update their own campaigns"
  ON campaigns FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow users to delete their own campaigns"
  ON campaigns FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for links
CREATE POLICY "Allow public read access to active links"
  ON links FOR SELECT
  USING (is_active = true);

CREATE POLICY "Allow authenticated users to insert links"
  ON links FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow users to read their own links"
  ON links FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Allow users to update their own links"
  ON links FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow users to delete their own links"
  ON links FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own link email captures"
  ON link_email_captures FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM links
      WHERE links.id = link_email_captures.link_id
        AND links.user_id = auth.uid()
    )
  );

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

-- RLS Policies for qr_codes
CREATE POLICY "Allow users to read their own QR codes"
  ON qr_codes FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Allow users to insert their own QR codes"
  ON qr_codes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow users to update their own QR codes"
  ON qr_codes FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for pages
CREATE POLICY "Allow public read access to active public pages"
  ON pages FOR SELECT
  USING (is_active = true AND is_public = true);

CREATE POLICY "Allow users to read their own pages"
  ON pages FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Allow users to insert their own pages"
  ON pages FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow users to update their own pages"
  ON pages FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for analytics
CREATE POLICY "Allow users to read analytics for their links"
  ON analytics FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM links
      WHERE links.id = analytics.link_id
        AND links.user_id = auth.uid()
    )
  );

CREATE POLICY "Allow insert analytics for active links"
  ON analytics FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM links
      WHERE links.id = analytics.link_id
        AND links.is_active = true
    )
  );

-- Insert default plans
INSERT INTO plans (name, display_name, description, price_monthly, price_yearly, max_links, max_qr_codes, max_pages, features) VALUES
  ('free', 'Free', 'Perfect for getting started', 0, 0, 2, 2, 0, '{"custom_back_half": false, "analytics": true, "qr_codes": true, "expiration": false, "pages": false, "password_protection": false, "lead_capture": false}'::jsonb),
  ('pro', 'Pro', 'For professionals and small teams', 9.99, 99.99, 100, 100, 5, '{"custom_back_half": true, "analytics": true, "qr_codes": true, "expiration": true, "utm_parameters": true, "custom_domains": false, "pages": true, "password_protection": true, "lead_capture": true}'::jsonb),
  ('business', 'Business', 'For growing businesses', 29.99, 299.99, 1000, 1000, 50, '{"custom_back_half": true, "analytics": true, "qr_codes": true, "expiration": true, "utm_parameters": true, "custom_domains": true, "team_collaboration": true, "pages": true, "password_protection": true, "lead_capture": true}'::jsonb),
  ('enterprise', 'Enterprise', 'For large organizations', 99.99, 999.99, -1, -1, -1, '{"custom_back_half": true, "analytics": true, "qr_codes": true, "expiration": true, "utm_parameters": true, "custom_domains": true, "team_collaboration": true, "api_access": true, "priority_support": true, "pages": true, "password_protection": true, "lead_capture": true}'::jsonb)
ON CONFLICT (name) DO UPDATE SET
  max_pages = EXCLUDED.max_pages,
  features = EXCLUDED.features;

-- Analytics daily rollups (overview charts)
CREATE TABLE IF NOT EXISTS analytics_daily (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  day DATE NOT NULL,
  source VARCHAR(20) NOT NULL CHECK (source IN ('link', 'qr', 'page_view', 'page_click')),
  clicks INTEGER NOT NULL DEFAULT 0,
  unique_clicks INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  PRIMARY KEY (user_id, day, source)
);

CREATE INDEX IF NOT EXISTS idx_analytics_daily_user_day
  ON analytics_daily(user_id, day DESC);

ALTER TABLE analytics_daily ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own analytics_daily"
  ON analytics_daily FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can upsert own analytics_daily"
  ON analytics_daily FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own analytics_daily"
  ON analytics_daily FOR UPDATE
  USING (auth.uid() = user_id);

-- Spike alert preferences
CREATE TABLE IF NOT EXISTS analytics_alert_settings (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  enabled BOOLEAN NOT NULL DEFAULT true,
  spike_multiplier NUMERIC(4,2) NOT NULL DEFAULT 2.0,
  last_triggered_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

ALTER TABLE analytics_alert_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own alert settings"
  ON analytics_alert_settings FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
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

-- Campaign-level currency for budget, fees, and spend display

ALTER TABLE campaigns
  ADD COLUMN IF NOT EXISTS currency VARCHAR(10) NOT NULL DEFAULT 'USD';
