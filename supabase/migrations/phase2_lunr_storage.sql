-- Phase 2: Lunr storage bucket + RLS policies
--
-- Assumed object path structure (first folder = prefix, second = auth user id):
--   pages/{userId}/...
--   avatars/{userId}/...
--   qr/{userId}/...
--
-- Policies grant:
--   - public READ on all objects in the lunr bucket
--   - authenticated INSERT / UPDATE / DELETE only when the second path
--     segment equals auth.uid()::text

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'lunr',
  'lunr',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Public read
DROP POLICY IF EXISTS "Public read lunr objects" ON storage.objects;
CREATE POLICY "Public read lunr objects"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'lunr');

-- Authenticated insert under own user folder
-- path: {prefix}/{userId}/filename  →  (storage.foldername(name))[2] = userId
DROP POLICY IF EXISTS "Users insert own lunr objects" ON storage.objects;
CREATE POLICY "Users insert own lunr objects"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'lunr'
    AND (storage.foldername(name))[1] IN ('pages', 'avatars', 'qr')
    AND (storage.foldername(name))[2] = auth.uid()::text
  );

-- Authenticated update under own user folder
DROP POLICY IF EXISTS "Users update own lunr objects" ON storage.objects;
CREATE POLICY "Users update own lunr objects"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'lunr'
    AND (storage.foldername(name))[2] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'lunr'
    AND (storage.foldername(name))[2] = auth.uid()::text
  );

-- Authenticated delete under own user folder
DROP POLICY IF EXISTS "Users delete own lunr objects" ON storage.objects;
CREATE POLICY "Users delete own lunr objects"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'lunr'
    AND (storage.foldername(name))[2] = auth.uid()::text
  );
