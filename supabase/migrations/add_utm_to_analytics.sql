-- Migration: Add UTM parameter tracking to analytics table
-- This allows tracking which UTM parameters were used for each click

-- Add utm_source, utm_medium, utm_campaign, utm_term, utm_content columns
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'analytics' AND column_name = 'utm_source'
  ) THEN
    ALTER TABLE analytics 
    ADD COLUMN utm_source VARCHAR(255),
    ADD COLUMN utm_medium VARCHAR(255),
    ADD COLUMN utm_campaign VARCHAR(255),
    ADD COLUMN utm_term VARCHAR(255),
    ADD COLUMN utm_content VARCHAR(255);
  END IF;
END $$;

-- Create index for UTM queries
CREATE INDEX IF NOT EXISTS idx_analytics_utm_source ON analytics(utm_source);
CREATE INDEX IF NOT EXISTS idx_analytics_utm_medium ON analytics(utm_medium);
CREATE INDEX IF NOT EXISTS idx_analytics_utm_campaign ON analytics(utm_campaign);

