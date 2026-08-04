-- Phase 2: Campaign-level UTM defaults
-- Stores default UTM fields applied to links when assigned to a campaign.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'campaigns' AND column_name = 'utm_defaults'
  ) THEN
    ALTER TABLE campaigns
      ADD COLUMN utm_defaults JSONB DEFAULT '{}'::jsonb;
  END IF;
END $$;

COMMENT ON COLUMN campaigns.utm_defaults IS
  'Default UTM parameters (utm_source, utm_medium, utm_campaign, utm_term, utm_content) merged into links assigned to this campaign. Link-specific values win.';
