-- Optional identity fields so QR codes can be named and found in lists
ALTER TABLE qr_codes
  ADD COLUMN IF NOT EXISTS title VARCHAR(255),
  ADD COLUMN IF NOT EXISTS description TEXT;
