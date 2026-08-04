-- Phase 2: Analytics maturity
-- Adds device/browser/OS/bot columns, indexes, and get_link_analytics_stats RPC.

-- 1) Enrich analytics rows
ALTER TABLE analytics
  ADD COLUMN IF NOT EXISTS device_type VARCHAR(50),
  ADD COLUMN IF NOT EXISTS browser VARCHAR(100),
  ADD COLUMN IF NOT EXISTS os VARCHAR(100),
  ADD COLUMN IF NOT EXISTS is_bot BOOLEAN DEFAULT false NOT NULL;

-- Ensure UTM columns exist (idempotent with add_utm_to_analytics.sql)
ALTER TABLE analytics
  ADD COLUMN IF NOT EXISTS utm_source VARCHAR(255),
  ADD COLUMN IF NOT EXISTS utm_medium VARCHAR(255),
  ADD COLUMN IF NOT EXISTS utm_campaign VARCHAR(255),
  ADD COLUMN IF NOT EXISTS utm_term VARCHAR(255),
  ADD COLUMN IF NOT EXISTS utm_content VARCHAR(255);

CREATE INDEX IF NOT EXISTS idx_analytics_is_bot ON analytics(is_bot);
CREATE INDEX IF NOT EXISTS idx_analytics_device_type ON analytics(device_type);
CREATE INDEX IF NOT EXISTS idx_analytics_browser ON analytics(browser);
CREATE INDEX IF NOT EXISTS idx_analytics_os ON analytics(os);
CREATE INDEX IF NOT EXISTS idx_analytics_link_clicked_at
  ON analytics(link_id, clicked_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_utm_source ON analytics(utm_source);
CREATE INDEX IF NOT EXISTS idx_analytics_utm_medium ON analytics(utm_medium);
CREATE INDEX IF NOT EXISTS idx_analytics_utm_campaign ON analytics(utm_campaign);

-- 2) Aggregated stats RPC
-- Unique clicks = distinct IP within a 24h calendar-day window (UTC) per link.
-- Bot rows (is_bot = true) are excluded from all aggregates.
-- p_days < 0 means unlimited retention window.
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
      -- Unique: distinct IP per UTC calendar day (24h window) per link
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

GRANT EXECUTE ON FUNCTION get_link_analytics_stats(uuid, int) TO authenticated;
GRANT EXECUTE ON FUNCTION get_link_analytics_stats(uuid, int) TO anon;
GRANT EXECUTE ON FUNCTION get_link_analytics_stats(uuid, int) TO service_role;
