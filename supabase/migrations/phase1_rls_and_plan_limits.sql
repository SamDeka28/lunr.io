-- Phase 1: Harden RLS + enforce plan limits at the database layer

-- 1) Remove anonymous public link INSERT (open abuse vector)
DROP POLICY IF EXISTS "Allow public insert to links" ON links;

-- 2) Analytics: only service role / authenticated owners can read;
--    inserts still need to work from redirect (use service role in app, or
--    allow insert only when the link exists and is active — still public insert
--    for click tracking but scoped via SECURITY DEFINER function preferred).
--    Tighten SELECT so random clients cannot dump all analytics.
DROP POLICY IF EXISTS "Allow public read access to analytics" ON analytics;
DROP POLICY IF EXISTS "Allow public insert to analytics" ON analytics;

-- Authenticated users can read analytics for their own links
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

-- Allow inserts from anon/authenticated for click tracking (redirect path).
-- Application should prefer service-role inserts; this keeps redirects working
-- with the anon client while preventing cross-tenant SELECT.
CREATE POLICY "Allow insert analytics for active links"
  ON analytics FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM links
      WHERE links.id = analytics.link_id
        AND links.is_active = true
    )
  );

-- 3) Enforce plan limits on links INSERT via trigger
CREATE OR REPLACE FUNCTION enforce_link_plan_limit()
RETURNS TRIGGER AS $$
DECLARE
  max_allowed INTEGER;
  current_count INTEGER;
BEGIN
  IF NEW.user_id IS NULL THEN
    RAISE EXCEPTION 'Anonymous link creation is not allowed';
  END IF;

  SELECT COALESCE(p.max_links, 2) INTO max_allowed
  FROM profiles pr
  LEFT JOIN plans p ON p.id = pr.plan_id
  WHERE pr.id = NEW.user_id;

  IF max_allowed IS NULL THEN
    max_allowed := 2;
  END IF;

  -- -1 means unlimited
  IF max_allowed = -1 THEN
    RETURN NEW;
  END IF;

  SELECT COUNT(*) INTO current_count
  FROM links
  WHERE user_id = NEW.user_id
    AND is_active = true;

  IF current_count >= max_allowed THEN
    RAISE EXCEPTION 'Link plan limit reached (% of %)', current_count, max_allowed
      USING ERRCODE = 'P0001';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_enforce_link_plan_limit ON links;
CREATE TRIGGER trg_enforce_link_plan_limit
  BEFORE INSERT ON links
  FOR EACH ROW
  EXECUTE FUNCTION enforce_link_plan_limit();

-- 4) Enforce plan limits on qr_codes INSERT
CREATE OR REPLACE FUNCTION enforce_qr_plan_limit()
RETURNS TRIGGER AS $$
DECLARE
  max_allowed INTEGER;
  current_count INTEGER;
BEGIN
  IF NEW.user_id IS NULL THEN
    RAISE EXCEPTION 'Anonymous QR creation is not allowed';
  END IF;

  SELECT COALESCE(p.max_qr_codes, 2) INTO max_allowed
  FROM profiles pr
  LEFT JOIN plans p ON p.id = pr.plan_id
  WHERE pr.id = NEW.user_id;

  IF max_allowed IS NULL THEN
    max_allowed := 2;
  END IF;

  IF max_allowed = -1 THEN
    RETURN NEW;
  END IF;

  SELECT COUNT(*) INTO current_count
  FROM qr_codes
  WHERE user_id = NEW.user_id
    AND is_active = true;

  IF current_count >= max_allowed THEN
    RAISE EXCEPTION 'QR plan limit reached (% of %)', current_count, max_allowed
      USING ERRCODE = 'P0001';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_enforce_qr_plan_limit ON qr_codes;
CREATE TRIGGER trg_enforce_qr_plan_limit
  BEFORE INSERT ON qr_codes
  FOR EACH ROW
  EXECUTE FUNCTION enforce_qr_plan_limit();

-- 5) Enforce plan limits on pages INSERT
CREATE OR REPLACE FUNCTION enforce_page_plan_limit()
RETURNS TRIGGER AS $$
DECLARE
  max_allowed INTEGER;
  current_count INTEGER;
  has_pages_feature BOOLEAN;
BEGIN
  IF NEW.user_id IS NULL THEN
    RAISE EXCEPTION 'Anonymous page creation is not allowed';
  END IF;

  SELECT
    COALESCE(p.max_pages, 0),
    COALESCE((p.features->>'pages')::boolean, false)
  INTO max_allowed, has_pages_feature
  FROM profiles pr
  LEFT JOIN plans p ON p.id = pr.plan_id
  WHERE pr.id = NEW.user_id;

  IF max_allowed IS NULL THEN
    max_allowed := 0;
  END IF;

  IF NOT has_pages_feature AND max_allowed = 0 THEN
    RAISE EXCEPTION 'Pages are not available on your plan'
      USING ERRCODE = 'P0001';
  END IF;

  IF max_allowed = -1 THEN
    RETURN NEW;
  END IF;

  SELECT COUNT(*) INTO current_count
  FROM pages
  WHERE user_id = NEW.user_id
    AND is_active = true;

  IF current_count >= max_allowed THEN
    RAISE EXCEPTION 'Page plan limit reached (% of %)', current_count, max_allowed
      USING ERRCODE = 'P0001';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_enforce_page_plan_limit ON pages;
CREATE TRIGGER trg_enforce_page_plan_limit
  BEFORE INSERT ON pages
  FOR EACH ROW
  EXECUTE FUNCTION enforce_page_plan_limit();

-- 6) Update plan features to include password_protection + api_access clarity
UPDATE plans
SET features = features || '{"password_protection": false}'::jsonb
WHERE name = 'free';

UPDATE plans
SET features = features || '{"password_protection": true}'::jsonb
WHERE name IN ('pro', 'business', 'enterprise');
