-- Campaign-level currency for budget, fees, and spend display

ALTER TABLE campaigns
  ADD COLUMN IF NOT EXISTS currency VARCHAR(10) NOT NULL DEFAULT 'USD';
