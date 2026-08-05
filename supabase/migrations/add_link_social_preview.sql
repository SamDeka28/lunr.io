-- Social share preview fields for short links
ALTER TABLE public.links
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS og_image_url TEXT;

COMMENT ON COLUMN public.links.description IS 'Social share description (Open Graph / Twitter cards)';
COMMENT ON COLUMN public.links.og_image_url IS 'Public URL for social share preview image';
