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
  title TEXT,
  utm_parameters JSONB DEFAULT '{}'::jsonb,
  CONSTRAINT short_code_length CHECK (char_length(short_code) >= 2 AND char_length(short_code) <= 20)
);

-- Create qr_codes table
CREATE TABLE IF NOT EXISTS qr_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  link_id UUID REFERENCES links(id) ON DELETE SET NULL,
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
  CONSTRAINT link_id_fk FOREIGN KEY (link_id) REFERENCES links(id) ON DELETE CASCADE
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

CREATE POLICY "Allow public insert to links"
  ON links FOR INSERT
  WITH CHECK (user_id IS NULL);

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
CREATE POLICY "Allow public insert to analytics"
  ON analytics FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public read access to analytics"
  ON analytics FOR SELECT
  USING (true);

-- Insert default plans
INSERT INTO plans (name, display_name, description, price_monthly, price_yearly, max_links, max_qr_codes, max_pages, features) VALUES
  ('free', 'Free', 'Perfect for getting started', 0, 0, 2, 2, 0, '{"custom_back_half": false, "analytics": true, "qr_codes": true, "expiration": false, "pages": false}'::jsonb),
  ('pro', 'Pro', 'For professionals and small teams', 9.99, 99.99, 100, 100, 5, '{"custom_back_half": true, "analytics": true, "qr_codes": true, "expiration": true, "utm_parameters": true, "custom_domains": false, "pages": true}'::jsonb),
  ('business', 'Business', 'For growing businesses', 29.99, 299.99, 1000, 1000, 50, '{"custom_back_half": true, "analytics": true, "qr_codes": true, "expiration": true, "utm_parameters": true, "custom_domains": true, "team_collaboration": true, "pages": true}'::jsonb),
  ('enterprise', 'Enterprise', 'For large organizations', 99.99, 999.99, -1, -1, -1, '{"custom_back_half": true, "analytics": true, "qr_codes": true, "expiration": true, "utm_parameters": true, "custom_domains": true, "team_collaboration": true, "api_access": true, "priority_support": true, "pages": true}'::jsonb)
ON CONFLICT (name) DO UPDATE SET
  max_pages = EXCLUDED.max_pages,
  features = EXCLUDED.features;
