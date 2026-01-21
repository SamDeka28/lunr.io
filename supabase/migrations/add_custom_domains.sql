-- Add custom_domains table for page custom domain support
CREATE TABLE IF NOT EXISTS custom_domains (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  page_id UUID NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
  domain VARCHAR(255) NOT NULL UNIQUE,
  verification_token VARCHAR(64) NOT NULL,
  verification_status VARCHAR(20) DEFAULT 'pending' NOT NULL,
  -- 'pending', 'verified', 'failed'
  verified_at TIMESTAMP WITH TIME ZONE,
  ssl_status VARCHAR(20) DEFAULT 'pending',
  -- 'pending', 'active', 'failed'
  ssl_certificate TEXT,
  dns_records JSONB DEFAULT '[]'::jsonb,
  -- Store DNS configuration instructions
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  CONSTRAINT domain_format CHECK (domain ~ '^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)*\.[a-z]{2,}$'),
  CONSTRAINT verification_status_check CHECK (verification_status IN ('pending', 'verified', 'failed')),
  CONSTRAINT ssl_status_check CHECK (ssl_status IN ('pending', 'active', 'failed'))
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_custom_domains_page_id ON custom_domains(page_id);
CREATE INDEX IF NOT EXISTS idx_custom_domains_domain ON custom_domains(domain);
CREATE INDEX IF NOT EXISTS idx_custom_domains_verification_status ON custom_domains(verification_status);

-- Add custom_domain_id to pages table (optional, for quick lookup)
ALTER TABLE pages ADD COLUMN IF NOT EXISTS custom_domain_id UUID REFERENCES custom_domains(id) ON DELETE SET NULL;

-- Create index for custom_domain_id
CREATE INDEX IF NOT EXISTS idx_pages_custom_domain_id ON pages(custom_domain_id);

