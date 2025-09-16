-- Restore API keys table for license validation authentication

CREATE TABLE IF NOT EXISTS api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key_name VARCHAR(255) NOT NULL,
  api_key VARCHAR(255) UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add some sample API keys for testing
INSERT INTO api_keys (key_name, api_key, is_active) VALUES 
('Test API Key', 'test-api-key-12345', true),
('Production API Key', 'prod-api-key-67890', true)
ON CONFLICT (api_key) DO NOTHING;