-- Lead capture studio: JSON config + dynamic responses
ALTER TABLE links
  ADD COLUMN IF NOT EXISTS lead_capture_config JSONB DEFAULT '{}'::jsonb NOT NULL;

ALTER TABLE link_email_captures
  ADD COLUMN IF NOT EXISTS responses JSONB DEFAULT '{}'::jsonb NOT NULL;

-- Backfill config from legacy heading/button columns when present
UPDATE links
SET lead_capture_config = jsonb_build_object(
  'heading', COALESCE(NULLIF(TRIM(lead_capture_heading), ''), 'Enter your email to continue'),
  'description', 'Share your email to unlock this link.',
  'buttonText', COALESCE(NULLIF(TRIM(lead_capture_button_text), ''), 'Continue'),
  'fields', jsonb_build_array(
    jsonb_build_object(
      'id', 'email',
      'type', 'email',
      'label', 'Email',
      'placeholder', 'you@example.com',
      'required', true
    ),
    jsonb_build_object(
      'id', 'name',
      'type', 'text',
      'label', 'Name',
      'placeholder', 'Your name',
      'required', false
    )
  ),
  'style', jsonb_build_object(
    'accentColor', '#4F46E5',
    'backgroundColor', '#F5F5F5',
    'backgroundStyle', 'gradient',
    'cardStyle', 'elevated'
  )
)
WHERE lead_capture_enabled = true
  AND (
    lead_capture_config IS NULL
    OR lead_capture_config = '{}'::jsonb
    OR NOT (lead_capture_config ? 'fields')
  );

ALTER TABLE links DROP COLUMN IF EXISTS lead_capture_heading;
ALTER TABLE links DROP COLUMN IF EXISTS lead_capture_button_text;
