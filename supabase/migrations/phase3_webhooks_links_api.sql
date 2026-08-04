-- Phase 3: webhook delivery logs + link tags/folders/max_clicks targeting

-- Webhook delivery log
CREATE TABLE IF NOT EXISTS webhook_deliveries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  webhook_id UUID NOT NULL REFERENCES webhooks(id) ON DELETE CASCADE,
  event TEXT NOT NULL,
  payload JSONB NOT NULL,
  status_code INTEGER,
  success BOOLEAN NOT NULL DEFAULT false,
  attempt INTEGER NOT NULL DEFAULT 1,
  error TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_webhook_id ON webhook_deliveries(webhook_id);
CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_created_at ON webhook_deliveries(created_at);

ALTER TABLE webhook_deliveries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow users to read their webhook deliveries"
  ON webhook_deliveries FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM webhooks
      WHERE webhooks.id = webhook_deliveries.webhook_id
        AND webhooks.user_id = auth.uid()
    )
  );

-- Link tags + folders + click-count expiry + targeting
ALTER TABLE links ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';
ALTER TABLE links ADD COLUMN IF NOT EXISTS folder TEXT;
ALTER TABLE links ADD COLUMN IF NOT EXISTS max_clicks INTEGER;
ALTER TABLE links ADD COLUMN IF NOT EXISTS targeting JSONB DEFAULT '{}'::jsonb;

CREATE INDEX IF NOT EXISTS idx_links_tags ON links USING GIN (tags);
CREATE INDEX IF NOT EXISTS idx_links_folder ON links(folder);

-- API key scopes
ALTER TABLE api_keys ADD COLUMN IF NOT EXISTS scopes TEXT[] DEFAULT ARRAY['links:read', 'links:write', 'analytics:read']::TEXT[];
