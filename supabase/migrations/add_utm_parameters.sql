-- Migration: Add utm_parameters column to links table
-- Run this in Supabase SQL Editor if the column doesn't exist

-- Add utm_parameters column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'links' AND column_name = 'utm_parameters'
  ) THEN
    ALTER TABLE links ADD COLUMN utm_parameters JSONB DEFAULT '{}'::jsonb;
  END IF;
END $$;

