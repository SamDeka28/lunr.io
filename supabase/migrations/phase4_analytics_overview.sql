-- Phase 4: analytics overview rollups + spike alert settings

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

DROP POLICY IF EXISTS "Users can view own analytics_daily" ON analytics_daily;
CREATE POLICY "Users can view own analytics_daily"
  ON analytics_daily FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can upsert own analytics_daily" ON analytics_daily;
CREATE POLICY "Users can upsert own analytics_daily"
  ON analytics_daily FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own analytics_daily" ON analytics_daily;
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

DROP POLICY IF EXISTS "Users manage own alert settings" ON analytics_alert_settings;
CREATE POLICY "Users manage own alert settings"
  ON analytics_alert_settings FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
